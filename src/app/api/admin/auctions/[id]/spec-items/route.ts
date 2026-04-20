import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_CATEGORIES = [
  "fronten",
  "griffe",
  "arbeitsplatte",
  "geraet",
  "sanitaer",
  "mülltrennung",
  "beleuchtung",
  "steckdosen",
  "besteckeinsatz",
  "sonstiges",
];

interface SpecItemInput {
  category?: string;
  label?: string;
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  designation?: string | null;
  quantity?: number | string | null;
  notes?: string | null;
  sort_order?: number | string | null;
}

function sanitize(body: SpecItemInput, requireCore = true) {
  const values: Record<string, unknown> = {};
  if (body.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(body.category)) {
      return { error: "Kategorie ungültig" } as const;
    }
    values.category = body.category;
  } else if (requireCore) {
    return { error: "Kategorie fehlt" } as const;
  }

  if (body.label !== undefined) {
    if (!body.label || !body.label.trim()) {
      return { error: "Label fehlt" } as const;
    }
    values.label = body.label.trim();
  } else if (requireCore) {
    return { error: "Label fehlt" } as const;
  }

  for (const k of ["brand", "model", "material", "designation", "notes"] as const) {
    if (body[k] !== undefined) values[k] = body[k] === "" ? null : body[k];
  }

  for (const k of ["quantity", "sort_order"] as const) {
    if (body[k] !== undefined && body[k] !== "" && body[k] !== null) {
      values[k] = Number(body[k]);
    } else if (body[k] === "") {
      values[k] = null;
    }
  }

  return { values } as const;
}

// POST: neuer Spec-Item Eintrag für die Auktion
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id: auctionId } = await ctx.params;
  const body = (await req.json()) as SpecItemInput;
  const result = sanitize(body, true);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("auction_spec_items")
    .insert({ ...result.values, auction_id: auctionId })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "spec_item.create", "auction_spec_item", data.id, { auctionId });
  return NextResponse.json({ row: data });
}

// PATCH: Update via ?itemId=
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id: auctionId } = await ctx.params;
  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "Missing ?itemId" }, { status: 400 });

  const body = (await req.json()) as SpecItemInput;
  const result = sanitize(body, false);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("auction_spec_items")
    .update(result.values)
    .eq("id", itemId)
    .eq("auction_id", auctionId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "spec_item.update", "auction_spec_item", itemId, { auctionId });
  return NextResponse.json({ row: data });
}

// DELETE via ?itemId=
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id: auctionId } = await ctx.params;
  const url = new URL(req.url);
  const itemId = url.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "Missing ?itemId" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("auction_spec_items")
    .delete()
    .eq("id", itemId)
    .eq("auction_id", auctionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(guard.userId, "spec_item.delete", "auction_spec_item", itemId, { auctionId });
  return NextResponse.json({ ok: true });
}
