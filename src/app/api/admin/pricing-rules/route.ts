import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_TIERS = ["standard", "qualified", "premium", "hot"];

interface PricingRuleInput {
  budget_min_eur?: number | string;
  budget_max_eur?: number | string | null;
  tier?: string;
  percent_of_budget?: number | string;
  min_price_eur?: number | string;
  max_price_eur?: number | string | null;
  is_active?: boolean;
  notes?: string | null;
}

function toCents(eur: number | string | null | undefined): number | null {
  if (eur === null || eur === undefined || eur === "") return null;
  const n = typeof eur === "string" ? parseFloat(eur) : eur;
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function sanitize(body: PricingRuleInput) {
  if (!body.tier || !ALLOWED_TIERS.includes(body.tier)) {
    return { error: "Tier ungültig" } as const;
  }
  const minCents = toCents(body.budget_min_eur);
  if (minCents === null) return { error: "budget_min_eur fehlt" } as const;
  const percent = body.percent_of_budget !== undefined ? Number(body.percent_of_budget) : NaN;
  if (!Number.isFinite(percent) || percent < 0) return { error: "percent_of_budget ungültig" } as const;
  const minPrice = toCents(body.min_price_eur);
  if (minPrice === null || minPrice < 0) return { error: "min_price_eur ungültig" } as const;

  return {
    values: {
      budget_min_cents: minCents,
      budget_max_cents: toCents(body.budget_max_eur),
      tier: body.tier,
      percent_of_budget: percent,
      min_price_cents: minPrice,
      max_price_cents: toCents(body.max_price_eur),
      is_active: body.is_active ?? true,
      notes: body.notes ?? null,
    },
  } as const;
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { data, error } = await supabaseAdmin
    .from("lead_pricing_rules")
    .select("*")
    .order("budget_min_cents", { ascending: true })
    .order("tier", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = (await req.json()) as PricingRuleInput;
  const result = sanitize(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("lead_pricing_rules")
    .insert(result.values)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "pricing_rule.create", "lead_pricing_rules", data.id, { values: result.values });
  return NextResponse.json({ row: data });
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });
  const body = (await req.json()) as PricingRuleInput;
  const result = sanitize(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("lead_pricing_rules")
    .update(result.values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "pricing_rule.update", "lead_pricing_rules", id, { values: result.values });
  return NextResponse.json({ row: data });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("lead_pricing_rules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "pricing_rule.delete", "lead_pricing_rules", id, {});
  return NextResponse.json({ ok: true });
}
