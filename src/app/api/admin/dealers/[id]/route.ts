import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EDITABLE = new Set([
  "is_verified",
  "is_active",
  "plan",
  "service_radius_km",
  "wallet_balance_cents",
  "company_name",
  "address",
  "postal_code",
  "city",
  "phone",
  "website",
  "brands",
]);

const PLAN_VALID = new Set(["basic", "professional", "enterprise"]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;

  const body = (await req.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!EDITABLE.has(k)) continue;
    if (k === "plan" && typeof v === "string" && !PLAN_VALID.has(v)) {
      return NextResponse.json({ error: `Plan ungültig: ${v}` }, { status: 400 });
    }
    update[k] = v === "" ? null : v;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("dealers")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await audit(guard.userId, "dealer.update", "dealer", id, { fields: Object.keys(update) });
  return NextResponse.json({ row: data });
}
