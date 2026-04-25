-- =====================================================================
-- 009_funnel_traumkueche.sql
--
-- Funnel C ("Traumkueche") - KI-gestuetzter Kuechen-Planer als dritter
-- Lead-Einstiegskanal neben Funnel A (Lead-Gen) und Funnel B (Auktion).
--
-- Schema-Aenderungen:
--   1. leads.funnel_type akzeptiert 'traumkueche' zusaetzlich zu 'a'/'b'
--   2. planner_sessions: serverseitiger Anker fuer Spec + Contact + Price-Range
--   3. planner_renders: generierte FLUX-Bilder mit Status + Kosten-Tracking
--   4. rate_limit_buckets: einfaches Pro-IP/Pro-Session Rate-Limiting
--   5. kitchen_price_brackets: B2C-Preismatrix fuer Nutzer-Range
--      (unabhaengig von lead_pricing_rules, die fuer Dealer-CPA gelten)
--
-- Alle neuen Tabellen mit RLS + Admin-Only-Policies (Writes via service role).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) leads.funnel_type erweitern
-- ---------------------------------------------------------------------
alter table public.leads drop constraint if exists leads_funnel_type_check;
alter table public.leads add constraint leads_funnel_type_check
  check (funnel_type in ('a', 'b', 'traumkueche'));

-- ---------------------------------------------------------------------
-- 2) planner_sessions
-- ---------------------------------------------------------------------
create table if not exists public.planner_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  session_token text unique not null,
  spec jsonb not null default '{}'::jsonb,
  current_render_id uuid,
  price_range_min_cents integer,
  price_range_max_cents integer,
  expert_note text,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  contact_captured_at timestamptz,
  ip_address inet,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_planner_sessions_token on public.planner_sessions(session_token);
create index if not exists idx_planner_sessions_lead on public.planner_sessions(lead_id);
create index if not exists idx_planner_sessions_created on public.planner_sessions(created_at desc);
create index if not exists idx_planner_sessions_status on public.planner_sessions(status);

alter table public.planner_sessions enable row level security;

create policy "Admins full access to planner_sessions"
  on public.planner_sessions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger set_planner_sessions_updated_at
  before update on public.planner_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) planner_renders
-- ---------------------------------------------------------------------
create table if not exists public.planner_renders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.planner_sessions(id) on delete cascade,
  version integer not null default 1,
  prompt text not null,
  negative_prompt text,
  spec_snapshot jsonb not null,
  user_message text,
  image_path text,
  image_width integer,
  image_height integer,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  fal_request_id text,
  model_slug text default 'fal-ai/flux-pro/v1.1-ultra',
  generation_ms integer,
  cost_cents integer,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_planner_renders_session on public.planner_renders(session_id, version desc);
create index if not exists idx_planner_renders_status on public.planner_renders(status);
create index if not exists idx_planner_renders_created on public.planner_renders(created_at desc);

alter table public.planner_renders enable row level security;

create policy "Admins full access to planner_renders"
  on public.planner_renders for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- FK von planner_sessions.current_render_id auf planner_renders
-- (erst jetzt moeglich, weil planner_renders vorher nicht existierte)
alter table public.planner_sessions
  add constraint planner_sessions_current_render_fkey
  foreign key (current_render_id) references public.planner_renders(id) on delete set null;

-- ---------------------------------------------------------------------
-- 4) rate_limit_buckets
-- ---------------------------------------------------------------------
create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;

create policy "Admins full access to rate_limit_buckets"
  on public.rate_limit_buckets for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create trigger set_rate_limit_buckets_updated_at
  before update on public.rate_limit_buckets
  for each row execute function public.set_updated_at();

-- Atomarer Rate-Limit-Check: incrementiert Bucket, liefert neuen Count.
-- Fenster wird automatisch rotiert wenn window_start + window_seconds < now().
create or replace function public.rate_limit_increment(
  p_key text,
  p_window_seconds integer,
  p_limit integer
)
returns table (
  current_count integer,
  allowed boolean,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  insert into public.rate_limit_buckets (bucket_key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (bucket_key) do update
    set count = case
      when rate_limit_buckets.window_start + make_interval(secs => p_window_seconds) < v_now then 1
      else rate_limit_buckets.count + 1
    end,
    window_start = case
      when rate_limit_buckets.window_start + make_interval(secs => p_window_seconds) < v_now then v_now
      else rate_limit_buckets.window_start
    end,
    updated_at = v_now
  returning rate_limit_buckets.count, rate_limit_buckets.window_start
    into v_count, v_window_start;

  return query
    select
      v_count,
      v_count <= p_limit,
      v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

-- Cleanup-Funktion: alte Buckets loeschen (taeglich via Cron aufrufbar)
create or replace function public.cleanup_rate_limit_buckets(p_older_than_hours integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limit_buckets
  where window_start < now() - make_interval(hours => p_older_than_hours);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ---------------------------------------------------------------------
-- 5) kitchen_price_brackets
-- ---------------------------------------------------------------------
create table if not exists public.kitchen_price_brackets (
  id uuid primary key default gen_random_uuid(),
  style_segment text not null
    check (style_segment in ('budget', 'mittel', 'premium', 'luxus')),
  appliance_segment text not null
    check (appliance_segment in ('budget', 'mittel', 'premium', 'luxus')),
  worktop_tier text not null
    check (worktop_tier in ('basic', 'mid', 'premium')),
  kitchen_form text not null
    check (kitchen_form in ('zeile', 'l', 'u', 'insel', 'parallel', 'g')),
  price_min_cents integer not null,
  price_max_cents integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (style_segment, appliance_segment, worktop_tier, kitchen_form)
);

create index if not exists idx_kitchen_price_brackets_lookup
  on public.kitchen_price_brackets (style_segment, appliance_segment, worktop_tier, kitchen_form)
  where active = true;

alter table public.kitchen_price_brackets enable row level security;

create policy "Admins full access to kitchen_price_brackets"
  on public.kitchen_price_brackets for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Public can read active brackets"
  on public.kitchen_price_brackets for select using (active = true);

create trigger set_kitchen_price_brackets_updated_at
  before update on public.kitchen_price_brackets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6) Comments fuer Schema-Doku
-- ---------------------------------------------------------------------
comment on table public.planner_sessions is
  'Funnel C ("Traumkueche"): serverseitige Session mit Spec + Contact + Price-Range.';
comment on table public.planner_renders is
  'FLUX-Bild-Generierungen pro planner_session. Versioniert (v1, v2, ...).';
comment on table public.rate_limit_buckets is
  'Sliding-Window-Rate-Limits fuer /api/planner/* und /api/leads*.';
comment on table public.kitchen_price_brackets is
  'B2C-Preismatrix: zeigt Verbrauchern eine Kuechen-Range (unabhaengig von Dealer-CPA).';
comment on function public.rate_limit_increment(text, integer, integer) is
  'Atomarer Rate-Limit-Check. Gibt (current_count, allowed, reset_at) zurueck.';
