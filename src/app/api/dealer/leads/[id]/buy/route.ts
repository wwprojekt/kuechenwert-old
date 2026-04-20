import { NextResponse } from "next/server";
import { requireDealerApi } from "@/lib/supabase/dealer";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { createInvoice } from "@/lib/invoices";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireDealerApi(true);
  if (!guard.ok) return guard.response;
  const { id: leadId } = await ctx.params;

  // Lead laden
  const { data: lead, error: leadErr } = await supabaseAdmin
    .from("leads")
    .select("id, funnel_type, status, tier, budget_midpoint")
    .eq("id", leadId)
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  }
  if (lead.funnel_type !== "a") {
    return NextResponse.json(
      { error: "Funnel-B-Leads laufen als Auktion." },
      { status: 400 },
    );
  }
  if (!["qualified", "matched"].includes(lead.status)) {
    return NextResponse.json(
      { error: `Lead-Status erlaubt keinen Kauf (${lead.status})` },
      { status: 400 },
    );
  }

  // Bereits exklusiv verkauft?
  const { data: existing } = await supabaseAdmin
    .from("match_candidates")
    .select("id, dealer_id, is_purchased")
    .eq("lead_id", leadId)
    .eq("is_purchased", true)
    .maybeSingle();
  if (existing) {
    if (existing.dealer_id === guard.dealerId) {
      return NextResponse.json({ ok: true, already_owned: true });
    }
    return NextResponse.json({ error: "Lead wurde bereits von einem anderen Händler gekauft." }, { status: 409 });
  }

  // Preis bestimmen
  if (!lead.budget_midpoint || !lead.tier) {
    return NextResponse.json({ error: "Preis nicht ermittelbar – Lead unvollständig" }, { status: 400 });
  }
  const { data: priceData, error: priceErr } = await supabaseAdmin.rpc(
    "calculate_lead_price_cents",
    { p_budget_cents: Number(lead.budget_midpoint) * 100, p_tier: lead.tier },
  );
  if (priceErr || priceData == null) {
    return NextResponse.json({ error: "Keine Preisregel für dieses Lead" }, { status: 400 });
  }
  const priceCents = Number(priceData);

  // Wallet check
  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("wallet_balance_cents, company_name")
    .eq("id", guard.dealerId)
    .single();
  if (!dealer) return NextResponse.json({ error: "Dealer nicht gefunden" }, { status: 404 });

  if (dealer.wallet_balance_cents < priceCents) {
    return NextResponse.json(
      {
        error: `Wallet zu gering. Benötigt: ${(priceCents / 100).toFixed(2)} €, vorhanden: ${(dealer.wallet_balance_cents / 100).toFixed(2)} €`,
      },
      { status: 402 },
    );
  }

  // Wallet abbuchen
  const { error: walletErr } = await supabaseAdmin
    .from("dealers")
    .update({ wallet_balance_cents: dealer.wallet_balance_cents - priceCents })
    .eq("id", guard.dealerId);
  if (walletErr) {
    return NextResponse.json({ error: walletErr.message }, { status: 500 });
  }

  // match_candidate upsert (purchase)
  const { data: mc, error: mcErr } = await supabaseAdmin
    .from("match_candidates")
    .upsert(
      {
        lead_id: leadId,
        dealer_id: guard.dealerId,
        is_purchased: true,
        purchased_at: new Date().toISOString(),
        price_cents: priceCents,
      },
      { onConflict: "lead_id,dealer_id" },
    )
    .select("id")
    .single();
  if (mcErr) {
    // Rollback Wallet
    await supabaseAdmin
      .from("dealers")
      .update({ wallet_balance_cents: dealer.wallet_balance_cents })
      .eq("id", guard.dealerId);
    return NextResponse.json({ error: mcErr.message }, { status: 500 });
  }

  // Lead status -> 'sold' (Funnel A: nach Kauf exklusiv)
  await supabaseAdmin.from("leads").update({ status: "sold" }).eq("id", leadId);

  // Payment-Record
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .insert({
      dealer_id: guard.dealerId,
      type: "lead_purchase",
      amount_cents: priceCents,
      description: `Lead-Kauf #${leadId.slice(0, 8)}`,
      status: "completed",
    })
    .select("id")
    .single();

  await audit(guard.userId, "lead.purchase", "lead", leadId, {
    dealerId: guard.dealerId,
    priceCents,
    matchCandidateId: mc.id,
  });

  // Rechnung erzeugen + per E-Mail versenden (sofort 'paid' via Wallet)
  // priceCents = brutto (Wallet-Abbuchung) → Netto rückrechnen
  const netCents = Math.round(priceCents / 1.19);
  let invoiceNumber: string | null = null;
  try {
    const invoice = await createInvoice({
      dealerId: guard.dealerId,
      type: "lead_purchase",
      lines: [
        {
          description: `Lead-Kauf KüchenWert · Lead #${leadId.slice(0, 8)} · Tier ${lead.tier} · PLZ-Region`,
          unit_price_cents: netCents,
        },
      ],
      reference_type: "lead",
      reference_id: leadId,
      related_payment_id: payment?.id,
      mark_paid_immediately: true,
      payment_method: "wallet_balance",
      send_email: true,
    });
    invoiceNumber = invoice.invoice_number;
  } catch (err) {
    console.error("[lead-purchase] invoice creation failed:", err);
  }

  return NextResponse.json({ ok: true, price_cents: priceCents, invoice_number: invoiceNumber });
}
