import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { createInvoice } from "@/lib/invoices";
import { runCronJob } from "@/lib/cron-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron-Endpoint zur Auktions-Finalisierung.
 * Wird durch Vercel-Cron aufgerufen (header `x-vercel-cron`) ODER
 * mit Header `authorization: Bearer ${CRON_SECRET}`.
 *
 * vercel.json:
 *   { "crons": [{ "path": "/api/cron/finalize-auctions", "schedule": "*\/5 * * * *" }] }
 *
 * Logik:
 *  - Alle Auctions mit status='active', is_published=true, ends_at <= now()
 *  - Niedrigstes Bid -> is_winning=true, won_bid_id
 *  - Lead -> status='closed_won' (kein Sieger -> 'closed_lost')
 *  - Auction -> status='completed'
 *  - Provision-Rechnung wird automatisch erstellt + per Mail an Sieger geschickt
 *  - Audit-Log + Cron-Run-Eintrag
 */
export async function GET(req: Request) {
  return runCronJob("finalize-auctions", req, runFinalize);
}

export const POST = GET;

async function runFinalize() {
  const now = new Date().toISOString();

  const { data: auctions, error: aErr } = await supabaseAdmin
    .from("auctions")
    .select("id, lead_id, status, ends_at, offer_price_eur")
    .eq("status", "active")
    .eq("is_published", true)
    .lte("ends_at", now);

  if (aErr) throw new Error(`auctions select failed: ${aErr.message}`);
  if (!auctions || auctions.length === 0) {
    return { processed: 0, details: { results: [] } };
  }

  const results: Array<Record<string, unknown>> = [];
  let invoiceErrors = 0;

  for (const auction of auctions) {
    try {
      const { data: bids = [] } = await supabaseAdmin
        .from("bids")
        .select("id, dealer_id, price_eur, created_at")
        .eq("auction_id", auction.id)
        .order("price_eur", { ascending: true })
        .order("created_at", { ascending: true });

      const winning = bids?.[0];

      const auctionUpdate: Record<string, unknown> = {
        status: "completed",
      };
      if (winning) auctionUpdate.won_bid_id = winning.id;
      const { error: aUpdErr } = await supabaseAdmin
        .from("auctions")
        .update(auctionUpdate)
        .eq("id", auction.id);
      if (aUpdErr) throw aUpdErr;

      if (winning) {
        await supabaseAdmin.from("bids").update({ is_winning: true }).eq("id", winning.id);
      }

      const newLeadStatus = winning ? "closed_won" : "closed_lost";
      await supabaseAdmin.from("leads").update({ status: newLeadStatus }).eq("id", auction.lead_id);

      let commissionCents: number | null = null;
      let invoiceNumber: string | null = null;
      if (winning) {
        const { data: cData } = await supabaseAdmin.rpc("calculate_commission_cents", {
          p_order_value_cents: Math.round(Number(winning.price_eur) * 100),
        });
        commissionCents = cData as number | null;
        if (commissionCents != null && commissionCents > 0) {
          const { data: payment } = await supabaseAdmin
            .from("payments")
            .insert({
              dealer_id: winning.dealer_id,
              type: "cpa_commission",
              amount_cents: commissionCents,
              description: `Provision Auktion #${auction.id.slice(0, 8)} – Sieger ${Number(winning.price_eur).toLocaleString("de-DE")} €`,
              status: "pending",
            })
            .select("id")
            .single();

          const netCents = Math.round(commissionCents / 1.19);
          try {
            const inv = await createInvoice({
              dealerId: winning.dealer_id,
              type: "cpa_commission",
              lines: [
                {
                  description: `Erfolgsprovision KüchenWert · Auktion #${auction.id.slice(0, 8)} · Auftragsvolumen ${Number(winning.price_eur).toLocaleString("de-DE")} €`,
                  unit_price_cents: netCents,
                },
              ],
              reference_type: "auction",
              reference_id: auction.id,
              related_payment_id: payment?.id,
              due_in_days: 14,
              send_email: true,
              notes: `Sieger-Gebot: ${Number(winning.price_eur).toLocaleString("de-DE")} € · Studio-Vergleichspreis: ${auction.offer_price_eur ? Number(auction.offer_price_eur).toLocaleString("de-DE") + " €" : "k. A."}`,
            });
            invoiceNumber = inv.invoice_number;
          } catch (err) {
            invoiceErrors++;
            console.error("[cron] commission invoice failed:", err);
          }
        }
      }

      await audit(null, "auction.finalize", "auction", auction.id, {
        winnerBidId: winning?.id ?? null,
        winnerDealerId: winning?.dealer_id ?? null,
        winningPriceEur: winning ? Number(winning.price_eur) : null,
        commissionCents,
        bidsCount: bids?.length ?? 0,
        invoiceNumber,
      });

      results.push({
        auction_id: auction.id,
        bids: bids?.length ?? 0,
        winner_bid_id: winning?.id ?? null,
        winner_price_eur: winning ? Number(winning.price_eur) : null,
        commission_cents: commissionCents,
        invoice_number: invoiceNumber,
      });
    } catch (err) {
      console.error("[cron] auction finalize failed:", auction.id, err);
      results.push({ auction_id: auction.id, error: (err as Error).message });
    }
  }

  return {
    processed: results.length,
    details: { results, invoice_errors: invoiceErrors },
  };
}
