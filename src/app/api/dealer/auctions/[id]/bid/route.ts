import { NextResponse } from "next/server";
import { requireDealerApi } from "@/lib/supabase/dealer";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface BidInput {
  price_eur?: number;
  delivery_weeks?: number | null;
  montage_included?: boolean;
  notes?: string | null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await requireDealerApi(true);
  if (!guard.ok) return guard.response;
  const { id: auctionId } = await ctx.params;
  const body = (await req.json()) as BidInput;

  const price = Number(body.price_eur);
  if (!price || price <= 0 || !Number.isFinite(price)) {
    return NextResponse.json({ error: "Preis ungültig" }, { status: 400 });
  }

  // Auction laden + status prüfen
  // ACHTUNG: Schema-Spalte heißt min_bid_eur (nicht min_bid_amount).
  const { data: auction, error: aErr } = await supabaseAdmin
    .from("auctions")
    .select("id, status, ends_at, is_published, offer_price_eur, min_bid_eur")
    .eq("id", auctionId)
    .single();
  if (aErr || !auction) {
    return NextResponse.json({ error: "Auktion nicht gefunden" }, { status: 404 });
  }
  if (!auction.is_published || auction.status !== "active") {
    return NextResponse.json({ error: "Auktion ist nicht aktiv" }, { status: 400 });
  }
  if (auction.ends_at && new Date(auction.ends_at) <= new Date()) {
    return NextResponse.json({ error: "Auktion ist bereits beendet" }, { status: 400 });
  }

  const minStep = Number(auction.min_bid_eur) || 50;

  // Aktuell niedrigstes Gebot
  const { data: lowest } = await supabaseAdmin
    .from("bids")
    .select("price_eur")
    .eq("auction_id", auctionId)
    .order("price_eur", { ascending: true })
    .limit(1)
    .maybeSingle();

  const cap = lowest
    ? Number(lowest.price_eur) - minStep
    : auction.offer_price_eur
      ? Number(auction.offer_price_eur) - minStep
      : Infinity;

  if (price > cap) {
    return NextResponse.json(
      {
        error: lowest
          ? `Ihr Gebot muss mindestens ${minStep} € unter dem aktuell besten (${Number(lowest.price_eur).toLocaleString("de-DE")} €) liegen.`
          : `Ihr Gebot muss unter dem Studio-Preis liegen (max. ${cap.toLocaleString("de-DE")} €).`,
      },
      { status: 400 },
    );
  }
  if (price < 100) {
    return NextResponse.json({ error: "Mindestpreis 100 €" }, { status: 400 });
  }

  // Bid einfügen
  const { data: bid, error: bErr } = await supabaseAdmin
    .from("bids")
    .insert({
      auction_id: auctionId,
      dealer_id: guard.dealerId,
      price_eur: price,
      delivery_weeks: body.delivery_weeks ?? null,
      montage_included: body.montage_included ?? true,
      notes: body.notes ?? null,
    })
    .select("id")
    .single();
  if (bErr) {
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  await audit(guard.userId, "bid.create", "auction", auctionId, {
    bidId: bid.id,
    dealerId: guard.dealerId,
    priceEur: price,
  });

  return NextResponse.json({ ok: true, bid_id: bid.id });
}
