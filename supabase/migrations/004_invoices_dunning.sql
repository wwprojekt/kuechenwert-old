-- ============================================================
-- 004 INVOICING + DUNNING (Mahnwesen)
--   - Fortlaufende Rechnungsnummern (Jahr-prefix)
--   - Empfaenger-Snapshot fuer rechtssichere Nachvollziehbarkeit
--   - Dunning-Levels 1..5 mit Mahngebuehren
--   - PDF/printable URL via signed token
-- ============================================================

-- ------------------------------------------------------------
-- 1) SEQUENCE fuer Rechnungsnummern (jahresweise reset via app)
-- ------------------------------------------------------------
create sequence if not exists public.invoice_seq start 1 increment 1;

-- ------------------------------------------------------------
-- 2) INVOICES
-- ------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  dealer_id uuid not null references public.dealers(id) on delete restrict,
  type text not null check (type in (
    'lead_purchase',
    'cpa_commission',
    'wallet_topup',
    'penalty',
    'subscription'
  )),
  status text not null default 'open' check (status in (
    'draft', 'open', 'paid', 'overdue', 'cancelled', 'in_collection', 'refunded'
  )),

  -- Verknuepfung zur Quelle
  reference_type text check (reference_type in ('lead', 'auction', 'bid', 'wallet', 'manual')),
  reference_id uuid,
  related_payment_id uuid references public.payments(id) on delete set null,

  -- Betraege
  net_amount_cents integer not null default 0,
  vat_rate numeric(5,2) not null default 19.00,
  vat_amount_cents integer not null default 0,
  gross_amount_cents integer not null default 0,
  currency text not null default 'eur',

  -- Faelligkeit
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  payment_method text check (payment_method in ('wallet_balance', 'stripe', 'bank_transfer', 'sepa', 'manual')),

  -- Empfaenger-Snapshot (rechtskonform)
  recipient_company text not null,
  recipient_address text,
  recipient_postal_code text,
  recipient_city text,
  recipient_email text not null,
  recipient_vat_id text,

  -- PDF & Versand
  pdf_url text,
  email_sent boolean not null default false,
  email_sent_at timestamptz,

  -- Mahnwesen
  dunning_level integer not null default 0 check (dunning_level between 0 and 5),
  dunning_last_sent_at timestamptz,
  dunning_fee_cents integer not null default 0,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_dealer on public.invoices(dealer_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due on public.invoices(due_at) where status in ('open', 'overdue');
create index if not exists idx_invoices_type on public.invoices(type);

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 3) INVOICE-ITEMS (Positionen)
-- ------------------------------------------------------------
create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 1,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price_cents integer not null,
  net_total_cents integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);

-- ------------------------------------------------------------
-- 4) DUNNING-LOG (jede Mahnstufe einzeln nachvollziehbar)
-- ------------------------------------------------------------
create table if not exists public.dunning_logs (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  level integer not null check (level between 1 and 5),
  fee_added_cents integer not null default 0,
  email_sent boolean not null default false,
  email_sent_at timestamptz,
  triggered_by text check (triggered_by in ('cron', 'admin', 'system')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_dunning_invoice on public.dunning_logs(invoice_id);

-- ------------------------------------------------------------
-- 5) RLS
-- ------------------------------------------------------------
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.dunning_logs enable row level security;

-- Dealer: liest seine eigenen Rechnungen
do $$ begin
  create policy "Dealers read own invoices"
    on public.invoices for select using (
      dealer_id in (select id from public.dealers where user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Dealers read own invoice items"
    on public.invoice_items for select using (
      invoice_id in (
        select i.id from public.invoices i
        join public.dealers d on d.id = i.dealer_id
        where d.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Dealers read own dunning logs"
    on public.dunning_logs for select using (
      invoice_id in (
        select i.id from public.invoices i
        join public.dealers d on d.id = i.dealer_id
        where d.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- Admins: full access
do $$ begin
  create policy "Admins full access invoices"
    on public.invoices for all using (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins full access invoice items"
    on public.invoice_items for all using (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Admins full access dunning logs"
    on public.dunning_logs for all using (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 6) HELPER: Rechnungsnummer generieren (YYYY-NNNNNN)
-- ------------------------------------------------------------
create or replace function public.generate_invoice_number()
returns text
language plpgsql
as $$
declare
  v_seq bigint;
  v_year text;
begin
  v_seq := nextval('public.invoice_seq');
  v_year := to_char(now(), 'YYYY');
  return v_year || '-' || lpad(v_seq::text, 6, '0');
end;
$$;
