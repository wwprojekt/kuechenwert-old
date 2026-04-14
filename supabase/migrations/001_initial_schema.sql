-- KüchenWert: Complete initial database schema
-- Roles: consumer (BC), dealer (BB), admin

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'consumer' check (role in ('consumer', 'dealer', 'admin')),
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'consumer'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DEALERS
-- ============================================================
create table public.dealers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  gallery_urls text[] default '{}',
  address text not null,
  postal_code text not null,
  city text not null,
  phone text,
  email text not null,
  website text,
  opening_hours jsonb,
  brands text[] default '{}',
  service_radius_km integer not null default 50,
  plan text not null default 'basic' check (plan in ('basic', 'professional', 'enterprise')),
  stripe_customer_id text,
  wallet_balance_cents integer not null default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dealers enable row level security;

create policy "Dealers can read own record"
  on public.dealers for select using (user_id = auth.uid());
create policy "Dealers can update own record"
  on public.dealers for update using (user_id = auth.uid());
create policy "Public can read active dealers"
  on public.dealers for select using (is_active = true and is_verified = true);
create policy "Admins full access to dealers"
  on public.dealers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- LEADS
-- ============================================================
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  status text not null default 'new' check (status in (
    'new', 'qualified', 'disqualified', 'matched', 'in_auction',
    'sold', 'contacted', 'appointment_set', 'offer_sent',
    'closed_won', 'closed_lost', 'disputed'
  )),
  score integer not null default 0,
  tier text not null default 'standard' check (tier in ('standard', 'qualified', 'premium', 'hot')),
  postal_code text not null,
  region text,
  kitchen_form text,
  kitchen_style text,
  purchase_reason text,
  special_wishes text[] default '{}',
  timeframe_months integer,
  budget_midpoint integer,
  has_existing_offer boolean not null default false,
  first_name text,
  last_name text,
  email text,
  phone text,
  consent_call boolean not null default false,
  consent_marketing boolean not null default false,
  funnel_answers jsonb default '{}',
  funnel_variant text default 'A',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Consumers can read own leads"
  on public.leads for select using (user_id = auth.uid());
create policy "Admins full access to leads"
  on public.leads for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create index idx_leads_status on public.leads(status);
create index idx_leads_tier on public.leads(tier);
create index idx_leads_postal_code on public.leads(postal_code);
create index idx_leads_created_at on public.leads(created_at desc);

-- ============================================================
-- LEAD FILES (uploads: Grundriss, Angebote, Renderings)
-- ============================================================
create table public.lead_files (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  file_size_bytes integer,
  category text not null check (category in ('grundriss', 'angebot', 'rendering', 'sonstiges')),
  virus_scan_status text default 'pending' check (virus_scan_status in ('pending', 'clean', 'infected')),
  created_at timestamptz not null default now()
);

alter table public.lead_files enable row level security;

create policy "Admins full access to lead_files"
  on public.lead_files for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- QUALIFICATION CALLS
-- ============================================================
create table public.qualification_calls (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid references public.profiles(id),
  outcome text not null check (outcome in ('qualified', 'disqualified', 'callback', 'no_answer', 'invalid')),
  notes text,
  missing_data text[] default '{}',
  duration_seconds integer,
  created_at timestamptz not null default now()
);

alter table public.qualification_calls enable row level security;

create policy "Admins full access to calls"
  on public.qualification_calls for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- MATCH CANDIDATES (which dealers see which leads)
-- ============================================================
create table public.match_candidates (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  price_cents integer,
  created_at timestamptz not null default now(),
  unique(lead_id, dealer_id)
);

alter table public.match_candidates enable row level security;

create policy "Dealers can see their matches"
  on public.match_candidates for select using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );
create policy "Admins full access to matches"
  on public.match_candidates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- AUCTIONS & BIDS
-- ============================================================
create table public.auctions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  spec_sheet jsonb default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  min_bid_eur numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bids (
  id uuid primary key default uuid_generate_v4(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  price_eur numeric(10,2) not null,
  delivery_weeks integer,
  montage_included boolean default true,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.auctions enable row level security;
alter table public.bids enable row level security;

create policy "Admins full access to auctions"
  on public.auctions for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Dealers can read active auctions"
  on public.auctions for select using (status = 'active');
create policy "Dealers can insert bids"
  on public.bids for insert with check (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );
create policy "Dealers can read own bids"
  on public.bids for select using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );

-- ============================================================
-- PAYMENTS / INVOICES
-- ============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  dealer_id uuid not null references public.dealers(id),
  type text not null check (type in ('lead_purchase', 'subscription', 'musterkueche_highlight', 'cpa_commission', 'wallet_topup')),
  amount_cents integer not null,
  currency text not null default 'eur',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Dealers can read own payments"
  on public.payments for select using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );
create policy "Admins full access to payments"
  on public.payments for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  lead_id uuid references public.leads(id),
  author_name text,
  rating integer not null check (rating between 1 and 5),
  text text,
  photos text[] default '{}',
  reply text,
  replied_at timestamptz,
  is_verified boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Public can read approved reviews"
  on public.reviews for select using (moderation_status = 'approved');
create policy "Dealers can reply to reviews"
  on public.reviews for update using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );
create policy "Admins full access to reviews"
  on public.reviews for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- MUSTERKÜCHEN
-- ============================================================
create table public.musterkuechen (
  id uuid primary key default uuid_generate_v4(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  title text not null,
  description text,
  original_price_eur numeric(10,2) not null,
  sale_price_eur numeric(10,2) not null,
  images text[] default '{}',
  condition text not null default 'ausstellung' check (condition in ('ausstellung', 'neuwertig', 'gebraucht')),
  brand text,
  is_available boolean not null default true,
  is_highlighted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.musterkuechen enable row level security;

create policy "Public can read available musterkuechen"
  on public.musterkuechen for select using (is_available = true);
create policy "Dealers can manage own musterkuechen"
  on public.musterkuechen for all using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );

-- ============================================================
-- CONSENT RECORDS (DSGVO)
-- ============================================================
create table public.consent_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  lead_id uuid references public.leads(id),
  purpose text not null,
  granted boolean not null,
  text_version text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.consent_records enable row level security;

create policy "Users can read own consent"
  on public.consent_records for select using (user_id = auth.uid());
create policy "Admins full access to consent"
  on public.consent_records for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}',
  ip_address inet,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "Admins can read audit log"
  on public.audit_log for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create index idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_log_created_at on public.audit_log(created_at desc);

-- ============================================================
-- DISPUTES
-- ============================================================
create table public.disputes (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id),
  dealer_id uuid not null references public.dealers(id),
  type text not null check (type in ('cpa_dispute', 'lead_quality', 'penalty')),
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved_for_dealer', 'resolved_for_platform', 'escalated')),
  reason text not null,
  resolution text,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.disputes enable row level security;

create policy "Dealers can read own disputes"
  on public.disputes for select using (
    dealer_id in (select id from public.dealers where user_id = auth.uid())
  );
create policy "Admins full access to disputes"
  on public.disputes for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_dealers_updated_at before update on public.dealers for each row execute function public.set_updated_at();
create trigger set_leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger set_auctions_updated_at before update on public.auctions for each row execute function public.set_updated_at();
create trigger set_musterkuechen_updated_at before update on public.musterkuechen for each row execute function public.set_updated_at();
