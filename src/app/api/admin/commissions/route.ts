import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface CommissionInput {
  order_value_min_eur?: number | string;
  order_value_max_eur?: number | string | null;
  percent?: number | string;
  min_eur?: number | string;
  max_eur?: number | string | null;
  is_active?: boolean;
  notes?: string | null;
}

function toCents(eur: number | string | null | undefined): number | null {
  if (eur === null || eur === undefined || eur === "") return null;
  const n = typeof eur === "string" ? parseFloat(eur) : eur;
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function sanitize(body: CommissionInput) {
  const minCents = toCents(body.order_value_min_eur);
  if (minCents === null) return { error: "order_value_min_eur fehlt" } as const;
  const percent = body.percent !== undefined ? Number(body.percent) : NaN;
  if (!Number.isFinite(percent) || percent < 0) return { error: "percent ungültig" } as const;
  const min = toCents(body.min_eur);
  if (min === null || min < 0) return { error: "min_eur ungültig" } as const;

  return {
    values: {
      order_value_min_cents: minCents,
      order_value_max_cents: toCents(body.order_value_max_eur),
      percent,
      min_cents: min,
      max_cents: toCents(body.max_eur),
      is_active: body.is_active ?? true,
      notes: body.notes ?? null,
    },
  } as const;
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { data, error } = await supabaseAdmin
    .from("commission_tiers")
    .select("*")
    .order("order_value_min_cents", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = (await req.json()) as CommissionInput;
  const result = sanitize(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("commission_tiers")
    .insert(result.values)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "commission_tier.create", "commission_tiers", data.id, { values: result.values });
  return NextResponse.json({ row: data });
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });
  const body = (await req.json()) as CommissionInput;
  const result = sanitize(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("commission_tiers")
    .update(result.values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "commission_tier.update", "commission_tiers", id, { values: result.values });
  return NextResponse.json({ row: data });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("commission_tiers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "commission_tier.delete", "commission_tiers", id, {});
  return NextResponse.json({ ok: true });
}
