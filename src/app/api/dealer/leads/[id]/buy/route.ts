import { NextResponse } from "next/server";
import { requireDealerApi } from "@/lib/supabase/dealer";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { createInvoice } from "@/lib/invoices";

export const runtime = "nodejs";

/**
 * Lead-Kauf — atomar via Postgres-Function `purchase_lead_atomic`.
 *
 * Garantien:
 *  - Race-frei: pg_advisory_xact_lock auf lead_id verhindert konkurrierende Käufe
 *  - Doppel-Verkauf-frei: partial unique index ux_match_candidates_one_purchase_per_lead
 *  - Wallet/Lead/Match/Payment in EINER Transaktion (alles oder nichts)
 *  - Funktion ist SECURITY DEFINER (umgeht RLS innerhalb der TX)
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireDealerApi(true);
  if (!guard.ok) return guard.response;
  const { id: leadId } = await ctx.params;

  // 1) Lead-Basisdaten + Preis bestimmen (read-only, keine Mutation)
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

  // 2) Atomarer Kauf via PG-Function
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
    // Mapping der custom Errors auf HTTP-Status
    if (msg.includes("already_owned")) {
      return NextResponse.json({ ok: true, already_owned: true });
    }
    if (msg.includes("lead_already_sold")) {
      return NextResponse.json(
        { error: "Lead wurde bereits von einem anderen Händler gekauft." },
        { status: 409 },
      );
    }
    if (msg.includes("wallet_insufficient")) {
      return NextResponse.json(
        {
          error: `Wallet zu gering. Benötigt: ${(priceCents / 100).toFixed(2)} €`,
        },
        { status: 402 },
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

  // RPC liefert SETOF, daher Array
  const row = Array.isArray(result) ? result[0] : result;
  const matchCandidateId = row?.match_candidate_id as string | undefined;
  const paymentId = row?.payment_id as string | undefined;

  await audit(guard.userId, "lead.purchase", "lead", leadId, {
    dealerId: guard.dealerId,
    priceCents,
    matchCandidateId,
    paymentId,
  });

  // 3) Rechnung erzeugen + per E-Mail (außerhalb der TX, idempotent über payment_id)
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
      related_payment_id: paymentId,
      mark_paid_immediately: true,
      payment_method: "wallet_balance",
      send_email: true,
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
