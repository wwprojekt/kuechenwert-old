-- =====================================================================
-- 007_post_pay_lead_purchase.sql
--
-- Umstellung des Zahlungsmodells: Stripe/Wallet raus, reine Post-Pay-
-- Rechnung per SEPA-Überweisung.
--
--   Alt (006_security_hardening.sql):
--     purchase_lead_atomic() zog priceCents vom Wallet ab und erzeugte
--     eine bereits bezahlte payments-Row. Wallet-Topups liefen über
--     Stripe Checkout + Webhook.
--
--   Neu (ab Migration 007):
--     purchase_lead_atomic() überspringt den Wallet-Check komplett.
--     Nach Advisory-Lock + Race-Check wird nur noch der match_candidate
--     angelegt und eine 'pending'-Zahlung registriert. Die eigentliche
--     Rechnungserstellung (14 Tage Zahlungsziel) erfolgt im API-Layer
--     über createInvoice() mit mark_paid_immediately=false. Bezahlt wird
--     via SEPA-Überweisung; fällige Rechnungen werden vom bestehenden
--     Dunning-Cron eingetrieben.
--
-- Rückwärtskompatibel für den API-Code in src/app/api/dealer/leads/[id]/buy.
-- Die Rückgabesignatur bleibt identisch (match_candidate_id, payment_id,
-- wallet_balance_cents_after), wobei wallet_balance_cents_after jetzt
-- konstant 0 zurückgibt, damit keine UI-Abhängigkeit bricht.
-- =====================================================================

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
  v_dealer_active boolean;
  v_mc_id uuid;
  v_payment_id uuid;
begin
  -- a) Advisory-Lock
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

  -- d) Dealer muss existieren und nicht gesperrt sein
  select is_active into v_dealer_active
  from public.dealers
  where id = p_dealer_id
  for update;

  if v_dealer_active is null then
    raise exception 'dealer_not_found' using errcode = 'P0006';
  end if;
  if v_dealer_active is false then
    raise exception 'dealer_suspended' using errcode = 'P0008';
  end if;

  -- e) match_candidate
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

  -- f) Lead-Status auf 'sold'
  update public.leads
  set status = 'sold', updated_at = now()
  where id = p_lead_id;

  -- g) Payment-Record als 'pending' (wird durch Rechnung + Überweisung beglichen)
  insert into public.payments (
    dealer_id, type, amount_cents, description, status
  )
  values (
    p_dealer_id,
    'lead_purchase',
    p_price_cents,
    'Lead-Kauf #' || substr(p_lead_id::text, 1, 8),
    'pending'
  )
  returning id into v_payment_id;

  -- wallet_balance_cents_after wird weiterhin zurückgegeben (historisch),
  -- ist aber nicht mehr relevant. 0 als Platzhalter.
  return query select v_mc_id, v_payment_id, 0::integer;
end;
$$;

-- Die Wallet-Spalte bleibt in der Tabelle, wird aber nicht mehr
-- automatisch bewirtschaftet. Admin kann sie weiterhin manuell setzen
-- (z. B. Gutschriften, Kulanz). Keine Spalten-Drops, um bestehende
-- Test-/Admin-Daten nicht zu verlieren.
