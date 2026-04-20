import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EDITABLE = new Set([
  "status",
  "offer_price_eur",
  "duration_hours",
  "min_bid_eur",
  "spec_sheet",
  "is_published",
]);

const ALLOWED_STATUSES = ["draft", "active", "completed", "cancelled"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown> & {
    publish?: boolean;
  };

  // Sonderfall: ?action=publish  (publish startet die Auktion sofort)
  if (body.publish === true) {
    const { data: existing, error: getErr } = await supabaseAdmin
      .from("auctions")
      .select("id, lead_id, duration_hours, offer_price_eur, status")
      .eq("id", id)
      .single();
    if (getErr || !existing) {
      return NextResponse.json({ error: "Auktion nicht gefunden" }, { status: 404 });
    }
    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: `Auktion ist bereits im Status „${existing.status}". Nur Drafts können freigegeben werden.` },
        { status: 400 },
      );
    }
    if (!existing.offer_price_eur || Number(existing.offer_price_eur) <= 0) {
      return NextResponse.json({ error: "offer_price_eur fehlt – bitte vorher pflegen" }, { status: 400 });
    }
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + (existing.duration_hours ?? 72) * 3600 * 1000);
    const { data: updated, error: upErr } = await supabaseAdmin
      .from("auctions")
      .update({
        status: "active",
        is_published: true,
        published_at: startsAt.toISOString(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    // Lead status -> in_auction
    await supabaseAdmin
      .from("leads")
      .update({ status: "in_auction" })
      .eq("id", existing.lead_id);

    await audit(guard.userId, "auction.publish", "auction", id, {
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    return NextResponse.json({ row: updated });
  }

  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!EDITABLE.has(k)) continue;
    if (k === "status" && typeof v === "string" && !ALLOWED_STATUSES.includes(v)) {
      return NextResponse.json({ error: `Status ungültig: ${v}` }, { status: 400 });
    }
    update[k] = v === "" ? null : v;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nichts zu aktualisieren" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("auctions")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await audit(guard.userId, "auction.update", "auction", id, { fields: Object.keys(update) });
  return NextResponse.json({ row: data });
}
