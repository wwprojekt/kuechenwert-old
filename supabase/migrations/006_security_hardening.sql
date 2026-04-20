-- ============================================================
-- 006: SECURITY HARDENING
--   1) RLS-Lücke auf public.leads schließen
--      (Dealer-SELECT-Policy hat alle Spalten freigegeben, nicht nur PII-frei)
--   2) Atomarer Lead-Kauf via PG-Function + advisory lock
--   3) Partial-Unique-Index gegen Doppel-Verkauf
--   4) Stripe-Idempotenz (unique on stripe_payment_intent_id)
--   5) consent_records Tabelle (DSGVO-Nachweis für Endkunden)
-- ============================================================

-- ============================================================
-- 1) RLS auf public.leads härten
--    Drop der überbreiten "Dealers can read masked leads" Policy.
--    Stattdessen: nur Admins + Service-Role haben SELECT-Zugriff
--    auf die Roh-Tabelle. Dealer nutzen die View leads_masked
--    (PII-frei) ODER haben Lead exklusiv gekauft (existing Policy).
-- ============================================================
do $$ begin
  drop policy if exists "Dealers can read masked leads" on public.leads;
exception when others then null; end $$;

-- View leads_masked muss explizit für authenticated abrufbar sein.
-- security_invoker = false (default) → läuft mit Owner-Rechten,
-- d.h. die Policy "Dealers can read full leads they purchased"
-- greift NICHT auf den View; Owner darf die volle Tabelle lesen
-- und liefert nur die PII-freien Spalten zurück.
grant select on public.leads_masked to authenticated;

-- Wichtig: ABER die View darf nicht jeden authenticated User
-- zeigen lassen. Wir legen eine SECURITY-DEFINER-Funktion an,
-- die nur verifizierten Händlern Daten liefert.
create or replace function public.dealer_leads_masked()
returns setof public.leads_masked
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dealer_id uuid;
begin
  select d.id into v_dealer_id
  from public.dealers d
  where d.user_id = auth.uid()
    and d.is_active = true
    and d.is_verified = true
  limit 1;

  if v_dealer_id is null then
    raise exception 'Not authorized: no active verified dealer for current user';
  end if;

  return query select * from public.leads_masked
    where status in ('new','qualified','matched','sold');
end;
$$;

revoke all on function public.dealer_leads_masked() from public;
grant execute on function public.dealer_leads_masked() to authenticated;

-- Direkter View-Zugriff von authenticated wieder entziehen
-- (Funktion ist die einzige sichere Schnittstelle)
revoke select on public.leads_masked from authenticated;

-- ============================================================
-- 2) Partial-Unique-Index gegen Doppel-Verkauf
--    Es darf NIE mehr als ein match_candidate mit
--    is_purchased = true pro lead_id geben.
-- ============================================================
create unique index if not exists ux_match_candidates_one_purchase_per_lead
  on public.match_candidates (lead_id)
  where is_purchased = true;

-- Zusätzlicher Index für Kauf-Lookups (Performance)
create index if not exists idx_match_candidates_lead_purchased
  on public.match_candidates (lead_id, is_purchased);

-- ============================================================
-- 3) Atomarer Lead-Kauf
--    purchase_lead_atomic(p_lead_id, p_dealer_id, p_price_cents)
--    Schritte (alle in einer TX, mit advisory_xact_lock):
--      a) Lead-Lock acquire
--      b) check Lead existiert + funnel_type='a' + status erlaubt
--      c) check kein anderer is_purchased
--      d) check & decrement Wallet
--      e) insert match_candidate (purchased=true)
--      f) update leads.status='sold'
--      g) insert payment row, return payment_id
-- ============================================================
create or replace function public.purchase_lead_atomic(
  p_lead_id uuid,
  p_dealer_id uuid,
  p_price_cents integer
)
returns table (
  match_candidate_id uuid,
  payment_id uuid,
  wallet_balance_cents_after integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lock_key bigint;
  v_lead_status text;
  v_lead_funnel text;
  v_existing_buyer uuid;
  v_wallet integer;
  v_mc_id uuid;
  v_payment_id uuid;
begin
  -- a) Advisory-Lock auf den Lead (verhindert konkurrierende Käufe)
  v_lock_key := ('x' || substr(replace(p_lead_id::text, '-', ''), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  -- b) Lead-Validierung
  select status, funnel_type into v_lead_status, v_lead_funnel
  from public.leads
  where id = p_lead_id
  for update;

  if v_lead_status is null then
    raise exception 'lead_not_found' using errcode = 'P0001';
  end if;
  if v_lead_funnel <> 'a' then
    raise exception 'lead_not_funnel_a' using errcode = 'P0002';
  end if;
  if v_lead_status not in ('qualified', 'matched') then
    raise exception 'lead_status_invalid:%', v_lead_status using errcode = 'P0003';
  end if;

  -- c) Kein anderer Käufer
  select dealer_id into v_existing_buyer
  from public.match_candidates
  where lead_id = p_lead_id
    and is_purchased = true
  limit 1;

  if v_existing_buyer is not null then
    if v_existing_buyer = p_dealer_id then
      raise exception 'already_owned' using errcode = 'P0004';
    else
      raise exception 'lead_already_sold' using errcode = 'P0005';
    end if;
  end if;

  -- d) Wallet check & decrement
  select wallet_balance_cents into v_wallet
  from public.dealers
  where id = p_dealer_id
  for update;

  if v_wallet is null then
    raise exception 'dealer_not_found' using errcode = 'P0006';
  end if;
  if v_wallet < p_price_cents then
    raise exception 'wallet_insufficient:%:%', v_wallet, p_price_cents using errcode = 'P0007';
  end if;

  update public.dealers
  set wallet_balance_cents = wallet_balance_cents - p_price_cents,
      updated_at = now()
  where id = p_dealer_id;

  -- e) match_candidate (idempotent via on conflict)
  insert into public.match_candidates (
    lead_id, dealer_id, is_purchased, purchased_at, price_cents
  )
  values (
    p_lead_id, p_dealer_id, true, now(), p_price_cents
  )
  on conflict (lead_id, dealer_id) do update
    set is_purchased = true,
        purchased_at = excluded.purchased_at,
        price_cents = excluded.price_cents
  returning id into v_mc_id;

  -- f) Lead status auf 'sold'
  update public.leads
  set status = 'sold', updated_at = now()
  where id = p_lead_id;

  -- g) Payment-Record
  insert into public.payments (
    dealer_id, type, amount_cents, description, status
  )
  values (
    p_dealer_id,
    'lead_purchase',
    p_price_cents,
    'Lead-Kauf #' || substr(p_lead_id::text, 1, 8),
    'completed'
  )
  returning id into v_payment_id;

  return query select v_mc_id, v_payment_id, (v_wallet - p_price_cents);
end;
$$;

revoke all on function public.purchase_lead_atomic(uuid, uuid, integer) from public;
grant execute on function public.purchase_lead_atomic(uuid, uuid, integer) to service_role;

-- ============================================================
-- 4) Stripe-Idempotenz: unique auf stripe_payment_intent_id
--    Verhindert doppelte Wallet-Buchung bei Retry-Webhooks.
-- ============================================================
create unique index if not exists ux_payments_stripe_payment_intent
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- ============================================================
-- 5) consent_records: Indexes + Source-Tracking
--    Tabelle existiert bereits aus 001 (id, user_id, lead_id,
--    purpose, granted, text_version, ip_address inet, user_agent,
--    created_at). Wir ergänzen nur Index und optional source.
-- ============================================================
alter table public.consent_records
  add column if not exists source text;     -- 'funnel_a' | 'funnel_b' | 'register_dealer'

create index if not exists idx_consent_records_lead
  on public.consent_records (lead_id) where lead_id is not null;
create index if not exists idx_consent_records_user
  on public.consent_records (user_id) where user_id is not null;
create index if not exists idx_consent_records_created
  on public.consent_records (created_at desc);

-- RLS-Policy für Admin-Lesezugriff (idempotent)
do $$ begin
  create policy "Admins can read consent_records"
    on public.consent_records for select
    using (
      exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    );
exception when duplicate_object then null; end $$;

grant select, insert on public.consent_records to service_role;
