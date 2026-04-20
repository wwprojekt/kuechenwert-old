import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/admin/auctions
 * Body: { lead_id: string }
 *
 * Erstellt einen Auction-Draft fuer einen (typischerweise Funnel-B) Lead.
 * Eine Auktion pro Lead (Unique-Constraint im Code – DB hat keinen).
 * Status: draft. Wird ueber PATCH /:id { publish: true } live geschaltet.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { lead_id?: string };
  const leadId = body.lead_id;
  if (!leadId) {
    return NextResponse.json({ error: "lead_id fehlt" }, { status: 400 });
  }

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from("leads")
    .select("id, funnel_type, status, existing_offer_price_cents")
    .eq("id", leadId)
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  }

  // Idempotenz: bestehende Auktion fuer diesen Lead?
  const { data: existing } = await supabaseAdmin
    .from("auctions")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Auktion existiert bereits", row: existing },
      { status: 409 },
    );
  }

  const offerPriceEur =
    lead.existing_offer_price_cents != null
      ? Number(lead.existing_offer_price_cents) / 100
      : null;

  const { data: created, error: insErr } = await supabaseAdmin
    .from("auctions")
    .insert({
      lead_id: leadId,
      status: "draft",
      offer_price_eur: offerPriceEur,
      duration_hours: 72,
      is_published: false,
    })
    .select("*")
    .single();
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  await audit(guard.userId, "auction.create", "auction", created.id, {
    lead_id: leadId,
    funnel_type: lead.funnel_type,
  });

  return NextResponse.json({ row: created }, { status: 201 });
}
