-- ============================================================
-- KuechenWert Migration 002
-- Erweitert das initiale Schema (001) um:
--   * Funnel-A Pflichtfelder (Wohnsituation)
--   * Funnel-B Felder (Angebot vergleichen / Reverse-Auktion)
--   * Stammdaten-Tabellen (Hersteller, Materialien, Marken)
--   * Lead-Pricing-Matrix (Budget x Tier konfigurierbar)
--   * Provisions-Staffel (CPA) konfigurierbar
--   * Penalty-Tracking (verbindliche Auktion, 299 EUR Abbruch)
--   * Maskierte Lead-View (Haendler sieht ohne PII bis Lead-Kauf)
--   * Tracking lead_views (Audit fuer Haendler-Einsichten)
-- ============================================================

-- ============================================================
-- 1) LEADS - neue Spalten
-- ============================================================
alter table public.leads
  add column if not exists funnel_type text not null default 'a'
    check (funnel_type in ('a', 'b')),
  add column if not exists housing_type text
    check (housing_type in ('rent', 'own', 'unknown')),
  add column if not exists address_line text,
  add column if not exists city text,
  add column if not exists existing_offer_price_cents integer,
  add column if not exists existing_offer_studio text,
  add column if not exists payment_down_payment_percent numeric(5,2),
  add column if not exists payment_financing text
    check (payment_financing in ('none', 'zero_interest', 'with_interest', 'unknown')),
  add column if not exists payment_financing_apr numeric(5,2),
  add column if not exists payment_financing_months integer,
  add column if not exists delivery_mode text
    check (delivery_mode in ('delivery_assembly', 'delivery_only', 'pickup', 'unknown')),
  add column if not exists desired_delivery_at date,
  add column if not exists waste_separation_system boolean;

-- ============================================================
-- 2) AUCTIONS - Funnel-B-spezifische Felder
-- ============================================================
alter table public.auctions
  add column if not exists offer_price_eur numeric(10,2),
  add column if not exists duration_hours integer not null default 72,
  add column if not exists won_bid_id uuid,
  add column if not exists penalty_state text not null default 'none'
    check (penalty_state in ('none', 'consumer_cancelled', 'dealer_cancelled', 'paid', 'waived')),
  add column if not exists is_published boolean not null default false,
  add column if not exists published_at timestamptz;

-- Constraint nachtraeglich (won_bid_id -> bids)
do $$ begin
  alter table public.auctions
    add constraint auctions_won_bid_fkey foreign key (won_bid_id) references public.bids(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3) BIDS - erweitern um Lieferung/Zahlung-Details
-- ============================================================
alter table public.bids
  add column if not exists warranty_months integer,
  add column if not exists payment_terms jsonb default '{}',
  add column if not exists is_winning boolean not null default false;

-- ============================================================
-- 4) LEAD_FILES - Kategorien fuer Funnel-B-Uploads erweitern
-- ============================================================
do $$ begin
  alter table public.lead_files
    drop constraint if exists lead_files_category_check;
  alter table public.lead_files
    add constraint lead_files_category_check check (
      category in ('grundriss', 'angebot', 'rendering', 'kueche_bild', 'sonstiges')
    );
exception when others then null; end $$;

-- ============================================================
-- 5) STAMMDATEN: Kuechenhersteller
-- ============================================================
create table if not exists public.catalog_kitchen_brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  segment text check (segment in ('budget', 'mittel', 'premium', 'luxus')),
  country text default 'DE',
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6) STAMMDATEN: Frontmaterialien
-- ============================================================
create table if not exists public.catalog_front_materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in (
    'kunststoff', 'lack', 'echtholz', 'glas', 'metall', 'beton', 'sonstiges'
  )),
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  unique (name, category)
);

-- ============================================================
-- 7) STAMMDATEN: Grifftypen
-- ============================================================
create table if not exists public.catalog_handle_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

-- ============================================================
-- 8) STAMMDATEN: Arbeitsplatten-Materialien + Designs
-- ============================================================
create table if not exists public.catalog_worktop_materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.catalog_worktop_designs (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid references public.catalog_worktop_materials(id) on delete cascade,
  name text not null,
  manufacturer text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  unique (material_id, name)
);

-- ============================================================
-- 9) STAMMDATEN: Geraete-Kategorien + Marken
-- ============================================================
create table if not exists public.catalog_appliance_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.catalog_appliance_brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  segment text check (segment in ('budget', 'mittel', 'premium', 'luxus')),
  is_active boolean not null default true,
  sort_order integer not null default 100
);

-- ============================================================
-- 10) STAMMDATEN: Sanitaer (Spuelen-Marken + Materialien)
-- ============================================================
create table if not exists public.catalog_sink_brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

create table if not exists public.catalog_sink_materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 100
);

-- ============================================================
-- 11) AUCTIONS - Spec-Items (Position-Liste statt jsonb-Blob)
--   Erlaubt Admin im Backend einzelne Positionen zu pflegen.
-- ============================================================
create table if not exists public.auction_spec_items (
  id uuid primary key default uuid_generate_v4(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  category text not null check (category in (
    'fronten', 'griffe', 'arbeitsplatte', 'geraet', 'sanitaer',
    'mülltrennung', 'beleuchtung', 'steckdosen', 'besteckeinsatz', 'sonstiges'
  )),
  label text not null,
  brand text,
  model text,
  material text,
  designation text,
  quantity integer default 1,
  notes text,
  image_url text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create index if not exists idx_spec_items_auction on public.auction_spec_items(auction_id);

-- ============================================================
-- 12) LEAD-PRICING-MATRIX (Funnel A - Lead-Verkauf)
--   Konfigurierbar: Budget-Range x Tier -> Preis (Prozent + Min/Max)
-- ============================================================
create table if not exists public.lead_pricing_rules (
  id uuid primary key default uuid_generate_v4(),
  budget_min_cents integer not null,         -- inclusive
  budget_max_cents integer,                  -- exclusive (NULL = open-ended)
  tier text not null check (tier in ('standard', 'qualified', 'premium', 'hot')),
  percent_of_budget numeric(5,2) not null,   -- z.B. 0.50 = 0.5 %
  min_price_cents integer not null,          -- Floor in Cent
  max_price_cents integer,                   -- Cap in Cent (optional)
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_min_cents, budget_max_cents, tier)
);

create index if not exists idx_lead_pricing_active on public.lead_pricing_rules(is_active);

-- ============================================================
-- 13) PROVISIONS-STAFFEL (CPA - Funnel B Auktionssieger)
-- ============================================================
create table if not exists public.commission_tiers (
  id uuid primary key default uuid_generate_v4(),
  order_value_min_cents integer not null,    -- inclusive
  order_value_max_cents integer,             -- exclusive (NULL = open-ended)
  percent numeric(5,2) not null,             -- z.B. 2.00 = 2 %
  min_cents integer not null,                -- Mindest-Provision
  max_cents integer,                         -- Optional Cap
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_value_min_cents, order_value_max_cents)
);

-- ============================================================
-- 14) PENALTY-TRACKING (Verbindlichkeits-Gebuehren)
--   Einer der beiden Parteien (Verbraucher oder Haendler)
--   bricht die verbindliche Auktion ab -> Gebuehr faellig.
-- ============================================================
create table if not exists public.penalty_charges (
  id uuid primary key default uuid_generate_v4(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  party text not null check (party in ('consumer', 'dealer')),
  dealer_id uuid references public.dealers(id),
  amount_cents integer not null default 29900,    -- Default 299 EUR
  status text not null default 'pending'
    check (status in ('pending', 'invoiced', 'paid', 'waived', 'cancelled')),
  reason text,
  stripe_invoice_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

create index if not exists idx_penalty_status on public.penalty_charges(status);

-- ============================================================
-- 15) LEAD-VIEWS (Audit: welcher Haendler hat wann welchen Lead gesehen)
-- ============================================================
create table if not exists public.lead_views (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_lead_views_lead on public.lead_views(lead_id);
create index if not exists idx_lead_views_dealer on public.lead_views(dealer_id);

-- ============================================================
-- 16) MASKIERTE LEAD-VIEW (PII versteckt bis Lead-Kauf)
--   Haendler sieht: PLZ, Region, Form/Stil, Budget, Wohnsituation, Wuensche
--   Haendler sieht NICHT: first_name, last_name, email, phone, address_line, city
--   Wer "is_purchased" via match_candidates -> sieht alles via separater Query
-- ============================================================
create or replace view public.leads_masked as
select
  id,
  status,
  score,
  tier,
  funnel_type,
  postal_code,
  region,
  housing_type,
  kitchen_form,
  kitchen_style,
  purchase_reason,
  special_wishes,
  timeframe_months,
  budget_midpoint,
  has_existing_offer,
  existing_offer_price_cents,
  desired_delivery_at,
  delivery_mode,
  payment_financing,
  waste_separation_system,
  funnel_answers,
  created_at,
  updated_at
from public.leads;

-- RLS auf Views ist nicht direkt moeglich, aber Auswertung laeuft ueber Policies
-- der zugrundeliegenden Tabelle. Wir geben Haendlern zusaetzlich SELECT auf
-- leads_masked, beschraenkt ueber separate Policy auf leads:
do $$ begin
  create policy "Dealers can read masked leads"
    on public.leads for select using (
      exists (
        select 1 from public.dealers d
        where d.user_id = auth.uid() and d.is_active = true and d.is_verified = true
      )
    );
exception when duplicate_object then null; end $$;

-- Volle PII-Sicht nur, wenn dealer_id den Lead gekauft hat
do $$ begin
  create policy "Dealers can read full leads they purchased"
    on public.leads for select using (
      exists (
        select 1 from public.match_candidates mc
        join public.dealers d on d.id = mc.dealer_id
        where mc.lead_id = leads.id
          and d.user_id = auth.uid()
          and mc.is_purchased = true
      )
    );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 17) RLS auf neue Tabellen
-- ============================================================
alter table public.auction_spec_items enable row level security;
alter table public.lead_pricing_rules enable row level security;
alter table public.commission_tiers enable row level security;
alter table public.penalty_charges enable row level security;
alter table public.lead_views enable row level security;
alter table public.catalog_kitchen_brands enable row level security;
alter table public.catalog_front_materials enable row level security;
alter table public.catalog_handle_types enable row level security;
alter table public.catalog_worktop_materials enable row level security;
alter table public.catalog_worktop_designs enable row level security;
alter table public.catalog_appliance_categories enable row level security;
alter table public.catalog_appliance_brands enable row level security;
alter table public.catalog_sink_brands enable row level security;
alter table public.catalog_sink_materials enable row level security;

-- Stammdaten: oeffentlich lesbar (ist_active = true), Admin schreibt
do $$ begin
  create policy "Public can read active brands" on public.catalog_kitchen_brands for select using (is_active = true);
  create policy "Admins manage brands" on public.catalog_kitchen_brands for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read fronts" on public.catalog_front_materials for select using (is_active = true);
  create policy "Admins manage fronts" on public.catalog_front_materials for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read handles" on public.catalog_handle_types for select using (is_active = true);
  create policy "Admins manage handles" on public.catalog_handle_types for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read worktop materials" on public.catalog_worktop_materials for select using (is_active = true);
  create policy "Admins manage worktop materials" on public.catalog_worktop_materials for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read worktop designs" on public.catalog_worktop_designs for select using (is_active = true);
  create policy "Admins manage worktop designs" on public.catalog_worktop_designs for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read appliance categories" on public.catalog_appliance_categories for select using (is_active = true);
  create policy "Admins manage appliance categories" on public.catalog_appliance_categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read appliance brands" on public.catalog_appliance_brands for select using (is_active = true);
  create policy "Admins manage appliance brands" on public.catalog_appliance_brands for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read sink brands" on public.catalog_sink_brands for select using (is_active = true);
  create policy "Admins manage sink brands" on public.catalog_sink_brands for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Public can read sink materials" on public.catalog_sink_materials for select using (is_active = true);
  create policy "Admins manage sink materials" on public.catalog_sink_materials for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

-- Pricing-Regeln, Provisions-Staffel, Penalty: Admin only
do $$ begin
  create policy "Admins manage lead pricing" on public.lead_pricing_rules for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
  create policy "Admins manage commission tiers" on public.commission_tiers for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
  create policy "Admins manage penalties" on public.penalty_charges for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

-- Spec-Items: Haendler lesen wenn Auktion aktiv
do $$ begin
  create policy "Dealers read spec items of active auctions"
    on public.auction_spec_items for select using (
      exists (
        select 1 from public.auctions a
        where a.id = auction_spec_items.auction_id
          and a.status = 'active'
      )
    );
  create policy "Admins manage spec items" on public.auction_spec_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null; end $$;

-- Lead-Views: Haendler darf eigene Eintraege schreiben + lesen
do $$ begin
  create policy "Dealers insert own lead views"
    on public.lead_views for insert with check (
      dealer_id in (select id from public.dealers where user_id = auth.uid())
    );
  create policy "Dealers read own lead views"
    on public.lead_views for select using (
      dealer_id in (select id from public.dealers where user_id = auth.uid())
    );
  create policy "Admins read all lead views"
    on public.lead_views for select using (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 18) UPDATED_AT-Trigger fuer neue Tabellen
-- ============================================================
do $$ begin
  create trigger set_lead_pricing_updated_at before update on public.lead_pricing_rules
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_commission_tiers_updated_at before update on public.commission_tiers
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- ============================================================
-- 19) HELPER-FUNCTION: Lead-Preis berechnen
-- ============================================================
create or replace function public.calculate_lead_price_cents(
  p_budget_cents integer,
  p_tier text
) returns integer
language plpgsql stable
as $$
declare
  v_rule public.lead_pricing_rules%rowtype;
  v_calc integer;
begin
  if p_budget_cents is null or p_tier is null then
    return null;
  end if;

  select * into v_rule
  from public.lead_pricing_rules
  where is_active = true
    and tier = p_tier
    and budget_min_cents <= p_budget_cents
    and (budget_max_cents is null or budget_max_cents > p_budget_cents)
  order by budget_min_cents desc
  limit 1;

  if v_rule.id is null then
    return null;
  end if;

  v_calc := round(p_budget_cents * v_rule.percent_of_budget / 100.0);
  v_calc := greatest(v_calc, v_rule.min_price_cents);
  if v_rule.max_price_cents is not null then
    v_calc := least(v_calc, v_rule.max_price_cents);
  end if;
  return v_calc;
end;
$$;

-- ============================================================
-- 20) HELPER-FUNCTION: Provision berechnen (CPA)
-- ============================================================
create or replace function public.calculate_commission_cents(
  p_order_value_cents integer
) returns integer
language plpgsql stable
as $$
declare
  v_tier public.commission_tiers%rowtype;
  v_calc integer;
begin
  if p_order_value_cents is null or p_order_value_cents <= 0 then
    return 0;
  end if;

  select * into v_tier
  from public.commission_tiers
  where is_active = true
    and order_value_min_cents <= p_order_value_cents
    and (order_value_max_cents is null or order_value_max_cents > p_order_value_cents)
  order by order_value_min_cents desc
  limit 1;

  if v_tier.id is null then
    return 0;
  end if;

  v_calc := round(p_order_value_cents * v_tier.percent / 100.0);
  v_calc := greatest(v_calc, v_tier.min_cents);
  if v_tier.max_cents is not null then
    v_calc := least(v_calc, v_tier.max_cents);
  end if;
  return v_calc;
end;
$$;

-- ============================================================
-- 21) SEED: Stammdaten - Kuechenhersteller
-- ============================================================
insert into public.catalog_kitchen_brands (name, slug, segment, sort_order) values
  ('Nobilia',          'nobilia',          'mittel',  10),
  ('Häcker',           'haecker',          'mittel',  20),
  ('Schüller',         'schueller',        'mittel',  30),
  ('Nolte',            'nolte',            'mittel',  40),
  ('Pino',             'pino',             'budget',  50),
  ('Bauformat',        'bauformat',        'budget',  60),
  ('Burger',           'burger',           'mittel',  70),
  ('Beckermann',       'beckermann',       'mittel',  80),
  ('Ballerina',        'ballerina',        'mittel',  90),
  ('Rotpunkt',         'rotpunkt',         'mittel',  100),
  ('Störmer',          'stoermer',         'mittel',  110),
  ('Rational',         'rational',         'premium', 120),
  ('Leicht',           'leicht',           'premium', 130),
  ('SieMatic',         'siematic',         'premium', 140),
  ('Bulthaup',         'bulthaup',         'luxus',   150),
  ('Poggenpohl',       'poggenpohl',       'luxus',   160),
  ('Eggersmann',       'eggersmann',       'luxus',   170),
  ('Next125',          'next125',          'premium', 180),
  ('Zeyko',            'zeyko',            'premium', 190),
  ('Allmilmö',         'allmilmoe',        'premium', 200),
  ('Sachsenküchen',    'sachsenkuechen',   'mittel',  210),
  ('Express Küchen',   'express-kuechen',  'budget',  220),
  ('IKEA',             'ikea',             'budget',  230),
  ('XXXLutz',          'xxxlutz',          'budget',  240),
  ('Höffner',          'hoeffner',         'budget',  250),
  ('Sonstiger',        'sonstiger',        null,      999)
on conflict (name) do nothing;

-- ============================================================
-- 22) SEED: Stammdaten - Frontmaterialien
-- ============================================================
insert into public.catalog_front_materials (name, category, description, sort_order) values
  ('Melamin / Schichtstoff',     'kunststoff', 'Folierte Spanplatte mit Melaminharz', 10),
  ('Kunststoff (Polymer/PET)',   'kunststoff', 'Hochwertige Kunststoffbeschichtung',  20),
  ('Acryl',                      'kunststoff', 'Hochglanz-Kunststofffront',            30),
  ('Lack matt',                  'lack',       'MDF mit Mattlack',                    40),
  ('Lack hochglanz',             'lack',       'MDF mit Hochglanzlack',               50),
  ('UV-Lack hochglanz',          'lack',       'UV-gehärteter Lack, sehr widerstandsfähig', 60),
  ('UV-Lack matt',               'lack',       'UV-gehärteter Mattlack', 70),
  ('Lack-Soft (Anti-Fingerprint)', 'lack',     'Soft-Touch matt mit Fingerabdruck-Schutz', 80),
  ('Echtholz furniert',          'echtholz',   'Träger MDF/Spanplatte mit Echtholzfurnier', 90),
  ('Massivholz',                 'echtholz',   'Vollholz-Front', 100),
  ('Glas matt',                  'glas',       'Lackiertes Glas, matt', 110),
  ('Glas hochglanz',             'glas',       'Lackiertes Glas, hochglanz', 120),
  ('Glas satiniert',             'glas',       'Mattiertes Glas', 130),
  ('Edelstahl',                  'metall',     'Echte Edelstahlfront', 140),
  ('Aluminium',                  'metall',     'Aluminium- oder Alurahmen', 150),
  ('Beton-Optik',                'beton',      'Front in Beton-Look', 160),
  ('Keramik',                    'sonstiges',  'Keramikfront (selten)', 170),
  ('Sonstige',                   'sonstiges',  null, 999)
on conflict (name, category) do nothing;

-- ============================================================
-- 23) SEED: Stammdaten - Grifftypen
-- ============================================================
insert into public.catalog_handle_types (name, slug, description, sort_order) values
  ('Mit aufgesetztem Griff', 'mit-griff', 'Klassisch montierter Griff (Bügel, Knauf, Stange)', 10),
  ('Grifflos (Push-to-Open)', 'grifflos-push', 'Komplett ohne Griff, mechanisches Öffnen durch Druck', 20),
  ('Grifflos (elektrisch)', 'grifflos-servo', 'Servo-elektrisches Öffnen', 30),
  ('Pseudogrifflos (J-Profil)', 'pseudogrifflos-j', 'Griffleiste in der Front (J-Profil)', 40),
  ('Pseudogrifflos (C-Profil / horizontal)', 'pseudogrifflos-c', 'Horizontale Griffmulde / C-Profil', 50),
  ('Mischvariante', 'mischvariante', 'Verschiedene Grifftypen kombiniert', 60),
  ('Weiß ich nicht', 'unbekannt', null, 999)
on conflict (slug) do nothing;

-- ============================================================
-- 24) SEED: Stammdaten - Arbeitsplatten-Materialien
-- ============================================================
insert into public.catalog_worktop_materials (name, slug, description, sort_order) values
  ('Schichtstoff / HPL',          'schichtstoff',     'Spanplatte mit HPL-Beschichtung, günstig + pflegeleicht', 10),
  ('Massivholz',                  'massivholz',       'Holz-Arbeitsplatte (Eiche, Buche, Nussbaum, ...)', 20),
  ('Naturstein - Granit',         'granit',           'Natürlicher Stein, sehr robust', 30),
  ('Naturstein - Marmor',         'marmor',           'Edel, aber empfindlich', 40),
  ('Quarzkomposit',               'quarzkomposit',    'Silestone, Caesarstone u.ä. (95% Quarz + Harz)', 50),
  ('Keramik (Sinterstein)',       'keramik',          'Neolith, Dekton, Lapitec u.ä.', 60),
  ('Edelstahl',                   'edelstahl',        'Profi-Look, hygienisch, kratzempfindlich', 70),
  ('Beton',                       'beton',            'Roher oder versiegelter Beton', 80),
  ('Glas',                        'glas',             'Glasarbeitsplatte (selten)', 90),
  ('Kunststein (Mineralwerkstoff)', 'mineralwerkstoff', 'Corian, Hi-Macs u.ä.', 100),
  ('Dünnschichtkeramik',          'duennschichtkeramik', 'Reduzierte Bauhöhe, premium', 110),
  ('Sonstige',                    'sonstige',         null, 999)
on conflict (slug) do nothing;

-- ============================================================
-- 25) SEED: Stammdaten - Arbeitsplatten-Designs (Beispiele)
-- ============================================================
insert into public.catalog_worktop_designs (material_id, name, manufacturer, sort_order)
select m.id, d.name, d.manufacturer, d.sort_order
from public.catalog_worktop_materials m
join (values
  ('keramik', 'Calacatta Roma',          'Neolith',     10),
  ('keramik', 'Calacatta Borghini',      'Neolith',     20),
  ('keramik', 'Estatuario',              'Neolith',     30),
  ('keramik', 'Iron Grey',               'Neolith',     40),
  ('keramik', 'Aspen White',             'Dekton',      50),
  ('keramik', 'Kelya',                   'Dekton',      60),
  ('keramik', 'Sirius',                  'Dekton',      70),
  ('keramik', 'Helena',                  'Lapitec',     80),
  ('quarzkomposit', 'Calacatta Gold',    'Silestone',   10),
  ('quarzkomposit', 'Eternal Statuario', 'Silestone',   20),
  ('quarzkomposit', 'Lyra',              'Silestone',   30),
  ('quarzkomposit', 'White Attica',      'Caesarstone', 40),
  ('quarzkomposit', 'Calacatta Nuvo',    'Caesarstone', 50),
  ('granit', 'Star Galaxy',              null,          10),
  ('granit', 'Nero Assoluto',            null,          20),
  ('granit', 'Padang Cristallo TG-34',   null,          30),
  ('granit', 'Black Pearl',              null,          40),
  ('marmor', 'Carrara',                  null,          10),
  ('marmor', 'Calacatta',                null,          20),
  ('marmor', 'Statuario',                null,          30),
  ('mineralwerkstoff', 'Solid Glacier White', 'Corian', 10),
  ('mineralwerkstoff', 'Designer White', 'Hi-Macs',    20),
  ('schichtstoff', 'Beton Optik',        null,          10),
  ('schichtstoff', 'Eiche Sonoma',       null,          20),
  ('schichtstoff', 'Marmor Optik',       null,          30)
) as d(material_slug, name, manufacturer, sort_order) on m.slug = d.material_slug
on conflict (material_id, name) do nothing;

-- ============================================================
-- 26) SEED: Stammdaten - Geraete-Kategorien
-- ============================================================
insert into public.catalog_appliance_categories (name, slug, sort_order) values
  ('Backofen',              'backofen',           10),
  ('Herd / Kochfeld',       'kochfeld',           20),
  ('Dunstabzugshaube',      'dunstabzug',         30),
  ('Muldenlüftung',         'muldenlueftung',     35),
  ('Geschirrspüler',        'geschirrspueler',    40),
  ('Kühlschrank',           'kuehlschrank',       50),
  ('Gefrierschrank',        'gefrierschrank',     60),
  ('Mikrowelle',            'mikrowelle',         70),
  ('Dampfgarer',            'dampfgarer',         80),
  ('Kaffeevollautomat',     'kaffeevollautomat',  90),
  ('Weinkühlschrank',       'weinkuehler',        100),
  ('Wärmeschublade',        'waermeschublade',    110)
on conflict (slug) do nothing;

-- ============================================================
-- 27) SEED: Stammdaten - Geraete-Marken
-- ============================================================
insert into public.catalog_appliance_brands (name, slug, segment, sort_order) values
  ('Bosch',         'bosch',         'mittel',  10),
  ('Siemens',       'siemens',       'mittel',  20),
  ('Neff',          'neff',          'mittel',  30),
  ('Miele',         'miele',         'premium', 40),
  ('AEG',           'aeg',           'mittel',  50),
  ('Bauknecht',     'bauknecht',     'budget',  60),
  ('Liebherr',      'liebherr',      'premium', 70),
  ('Gaggenau',      'gaggenau',      'luxus',   80),
  ('V-Zug',         'v-zug',         'premium', 90),
  ('Beko',          'beko',          'budget',  100),
  ('Privileg',      'privileg',      'budget',  110),
  ('Constructa',    'constructa',    'budget',  120),
  ('Whirlpool',     'whirlpool',     'budget',  130),
  ('Samsung',       'samsung',       'mittel',  140),
  ('LG',            'lg',            'mittel',  150),
  ('Smeg',          'smeg',          'premium', 160),
  ('Electrolux',    'electrolux',    'mittel',  170),
  ('De Dietrich',   'de-dietrich',   'premium', 180),
  ('Küppersbusch',  'kueppersbusch', 'premium', 190),
  ('Sonstige',      'sonstige',      null,      999)
on conflict (slug) do nothing;

-- ============================================================
-- 28) SEED: Stammdaten - Spuelen-Marken + Materialien
-- ============================================================
insert into public.catalog_sink_brands (name, slug, sort_order) values
  ('Blanco',        'blanco',        10),
  ('Franke',        'franke',        20),
  ('Schock',        'schock',        30),
  ('Villeroy & Boch', 'villeroy-boch', 40),
  ('Naber',         'naber',         50),
  ('Reginox',       'reginox',       60),
  ('Systemceram',   'systemceram',   70),
  ('Pyramis',       'pyramis',       80),
  ('Bosch',         'bosch-sink',    90),
  ('IKEA',          'ikea-sink',     100),
  ('Sonstige',      'sonstige-sink', 999)
on conflict (slug) do nothing;

insert into public.catalog_sink_materials (name, slug, sort_order) values
  ('Edelstahl',                 'edelstahl-sink', 10),
  ('Granit-Komposit (Silgranit/Cristadur)', 'granit-komposit', 20),
  ('Keramik',                   'keramik-sink',  30),
  ('Tectonite (Faser)',         'tectonite',     40),
  ('Mineralguss (Mineralwerkstoff)', 'mineralguss', 50),
  ('Kupfer / Messing',          'kupfer',        60),
  ('Sonstige',                  'sonstige-sink-mat', 999)
on conflict (slug) do nothing;

-- ============================================================
-- 29) SEED: Lead-Pricing-Defaults (kann Admin spaeter anpassen)
--   Beispiel-Logik: Prozent vom Budget mit Mindestpreis je Tier.
-- ============================================================
insert into public.lead_pricing_rules
  (budget_min_cents, budget_max_cents, tier, percent_of_budget, min_price_cents, notes) values
  -- Bis 10.000 EUR
  (0, 1000000, 'standard',   0.30,  3500, 'Bis 10k - Standard'),
  (0, 1000000, 'qualified',  0.50,  4500, 'Bis 10k - Qualifiziert'),
  (0, 1000000, 'premium',    0.85,  6000, 'Bis 10k - Premium'),
  (0, 1000000, 'hot',        1.20,  8000, 'Bis 10k - Hot'),
  -- 10.000 - 15.000 EUR
  (1000000, 1500000, 'standard',  0.35, 4500, '10-15k - Standard'),
  (1000000, 1500000, 'qualified', 0.50, 5500, '10-15k - Qualifiziert'),
  (1000000, 1500000, 'premium',   0.70, 7500, '10-15k - Premium'),
  (1000000, 1500000, 'hot',       0.95, 10000, '10-15k - Hot'),
  -- 15.000 - 25.000 EUR
  (1500000, 2500000, 'standard',  0.30, 5500, '15-25k - Standard'),
  (1500000, 2500000, 'qualified', 0.45, 7500, '15-25k - Qualifiziert'),
  (1500000, 2500000, 'premium',   0.60, 10000, '15-25k - Premium'),
  (1500000, 2500000, 'hot',       0.85, 13000, '15-25k - Hot'),
  -- ueber 25.000 EUR
  (2500000, null, 'standard',  0.25, 7500, '>25k - Standard'),
  (2500000, null, 'qualified', 0.35, 10000, '>25k - Qualifiziert'),
  (2500000, null, 'premium',   0.50, 13000, '>25k - Premium'),
  (2500000, null, 'hot',       0.70, 17000, '>25k - Hot')
on conflict (budget_min_cents, budget_max_cents, tier) do nothing;

-- ============================================================
-- 30) SEED: Provisions-Staffel-Defaults (CPA Funnel-B-Sieger)
-- ============================================================
insert into public.commission_tiers
  (order_value_min_cents, order_value_max_cents, percent, min_cents, notes) values
  (0,        1000000, 2.00, 20000, '0-10k EUR -> 2% mind. 200 EUR'),
  (1000000,  1500000, 1.80, 25000, '10-15k EUR -> 1.8% mind. 250 EUR'),
  (1500000,  2500000, 1.60, 30000, '15-25k EUR -> 1.6% mind. 300 EUR'),
  (2500000,  4000000, 1.40, 40000, '25-40k EUR -> 1.4% mind. 400 EUR'),
  (4000000,  null,    1.20, 60000, '>40k EUR -> 1.2% mind. 600 EUR')
on conflict (order_value_min_cents, order_value_max_cents) do nothing;
