import { NextResponse } from "next/server";
import { requireDealerApi } from "@/lib/supabase/dealer";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { createInvoice } from "@/lib/invoices";

export const runtime = "nodejs";

/**
 * Lead-Kauf (Post-Pay).
 *
 * Ablauf:
 *  1. Lead laden, Preis berechnen (calculate_lead_price_cents).
 *  2. Atomarer Kauf via Postgres-Function `purchase_lead_atomic` — legt
 *     match_candidate an, setzt Lead-Status auf 'sold', erzeugt eine
 *     payments-Row mit status='pending'.
 *  3. Rechnung auf dem API-Layer erzeugen (mark_paid_immediately=false,
 *     Fälligkeit 14 Tage) und per Mail an den Händler versenden.
 *     Eingang der Zahlung wird später manuell im Admin-Backend
 *     (/admin/invoices/[id]) als "bezahlt" markiert, alternativ greift
 *     das bestehende Dunning nach 7 Tagen.
 *
 * Kein Wallet mehr — der Händler erhält eine Rechnung mit Überweisungsdaten.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireDealerApi(true);
  if (!guard.ok) return guard.response;
  const { id: leadId } = await ctx.params;

  // 1) Lead + Preis
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
  if (!lead.budget_midpoint || !lead.tier) {
    return NextResponse.json(
      { error: "Preis nicht ermittelbar – Lead unvollständig" },
      { status: 400 },
    );
  }

  const { data: priceData, error: priceErr } = await supabaseAdmin.rpc(
    "calculate_lead_price_cents",
    { p_budget_cents: Number(lead.budget_midpoint) * 100, p_tier: lead.tier },
  );
  if (priceErr || priceData == null) {
    return NextResponse.json(
      { error: "Keine Preisregel für dieses Lead" },
      { status: 400 },
    );
  }
  const priceCents = Number(priceData);

  // 2) Atomarer Kauf
  const { data: result, error: rpcErr } = await supabaseAdmin.rpc(
    "purchase_lead_atomic",
    {
      p_lead_id: leadId,
      p_dealer_id: guard.dealerId,
      p_price_cents: priceCents,
    },
  );

  if (rpcErr) {
    const msg = rpcErr.message || "";
    if (msg.includes("already_owned")) {
      return NextResponse.json({ ok: true, already_owned: true });
    }
    if (msg.includes("lead_already_sold")) {
      return NextResponse.json(
        { error: "Lead wurde bereits von einem anderen Händler gekauft." },
        { status: 409 },
      );
    }
    if (msg.includes("dealer_suspended")) {
      return NextResponse.json(
        { error: "Händler-Account ist gesperrt. Bitte offene Rechnungen begleichen." },
        { status: 403 },
      );
    }
    if (msg.includes("lead_not_found") || msg.includes("dealer_not_found")) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    if (
      msg.includes("lead_not_funnel_a") ||
      msg.includes("lead_status_invalid")
    ) {
      return NextResponse.json(
        { error: "Lead-Status erlaubt keinen Kauf" },
        { status: 400 },
      );
    }
    console.error("[lead-purchase] purchase_lead_atomic failed:", rpcErr);
    return NextResponse.json(
      { error: "Lead-Kauf fehlgeschlagen" },
      { status: 500 },
    );
  }

  const row = Array.isArray(result) ? result[0] : result;
  const matchCandidateId = row?.match_candidate_id as string | undefined;
  const paymentId = row?.payment_id as string | undefined;

  await audit(guard.userId, "lead.purchase", "lead", leadId, {
    dealerId: guard.dealerId,
    priceCents,
    matchCandidateId,
    paymentId,
  });

  // 3) Rechnung erzeugen (14 Tage Zahlungsziel, Überweisung)
  const netCents = Math.round(priceCents / 1.19);
  let invoiceNumber: string | null = null;
  try {
    const invoice = await createInvoice({
      dealerId: guard.dealerId,
      type: "lead_purchase",
      lines: [
        {
          description: `Lead-Kauf KüchenWert · Lead #${leadId.slice(0, 8)} · Tier ${lead.tier}`,
          unit_price_cents: netCents,
        },
      ],
      reference_type: "lead",
      reference_id: leadId,
      related_payment_id: paymentId,
      mark_paid_immediately: false,
      payment_method: "bank_transfer",
      due_in_days: 14,
      send_email: true,
      notes:
        "Zahlbar binnen 14 Tagen per SEPA-Überweisung auf das unten genannte Konto. Bitte Rechnungsnummer als Verwendungszweck angeben.",
    });
    invoiceNumber = invoice.invoice_number;
  } catch (err) {
    console.error("[lead-purchase] invoice creation failed:", err);
  }

  return NextResponse.json({
    ok: true,
    price_cents: priceCents,
    invoice_number: invoiceNumber,
  });
}
