import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_STATUSES = [
  "new",
  "qualified",
  "disqualified",
  "matched",
  "in_auction",
  "sold",
  "contacted",
  "appointment_set",
  "offer_sent",
  "closed_won",
  "closed_lost",
  "disputed",
];

const ALLOWED_TIERS = ["standard", "qualified", "premium", "hot"];

const EDITABLE = new Set([
  "status",
  "tier",
  "score",
  "first_name",
  "last_name",
  "email",
  "phone",
  "postal_code",
  "city",
  "address_line",
  "kitchen_form",
  "kitchen_style",
  "purchase_reason",
  "timeframe_months",
  "budget_midpoint",
  "housing_type",
  "existing_offer_price_cents",
  "existing_offer_studio",
  "desired_delivery_at",
  "delivery_mode",
  "payment_down_payment_percent",
  "payment_financing",
  "payment_financing_apr",
  "payment_financing_months",
  "waste_separation_system",
  "funnel_answers",
]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!EDITABLE.has(key)) continue;
    if (key === "status" && typeof value === "string" && !ALLOWED_STATUSES.includes(value)) {
      return NextResponse.json({ error: `Status ungültig: ${value}` }, { status: 400 });
    }
    if (key === "tier" && typeof value === "string" && !ALLOWED_TIERS.includes(value)) {
      return NextResponse.json({ error: `Tier ungültig: ${value}` }, { status: 400 });
    }
    update[key] = value === "" ? null : value;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await audit(guard.userId, "lead.update", "lead", id, { fields: Object.keys(update) });
  return NextResponse.json({ row: data });
}
