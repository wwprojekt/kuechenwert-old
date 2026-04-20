-- ============================================================
-- Migration 005: Cron-Runs Tracking
--   Jeder Aufruf eines Cron-Endpoints schreibt einen Run-Eintrag.
--   Genutzt vom Admin-Cron-Health-Dashboard zur Sichtbarkeit von
--   Status, Dauer, Anzahl verarbeiteter Items, Fehlertext.
-- ============================================================

create table if not exists public.cron_runs (
  id uuid primary key default uuid_generate_v4(),
  job text not null,
  trigger text not null check (trigger in ('vercel_cron', 'manual', 'unknown')),
  status text not null check (status in ('running', 'success', 'error')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  processed integer,
  error_message text,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.cron_runs enable row level security;

do $$ begin
  create policy "Admins read cron_runs"
    on public.cron_runs for select
    using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
exception when duplicate_object then null; end $$;

-- Service-Role kann alles (RLS bypassed via service key, Policy nur fuer Auth-Klienten).

create index if not exists idx_cron_runs_job_started on public.cron_runs(job, started_at desc);
create index if not exists idx_cron_runs_status on public.cron_runs(status);
create index if not exists idx_cron_runs_started on public.cron_runs(started_at desc);
