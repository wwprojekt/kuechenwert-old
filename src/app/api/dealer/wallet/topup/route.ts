import { NextResponse } from "next/server";
import { requireDealerApi } from "@/lib/supabase/dealer";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { getSiteUrlAscii } from "@/lib/site-url";

export const runtime = "nodejs";

interface TopupInput {
  amount_eur?: number;
}

const PRESETS = [100, 250, 500, 1000, 2500];

export async function POST(req: Request) {
  const guard = await requireDealerApi(true);
  if (!guard.ok) return guard.response;

  const body = (await req.json()) as TopupInput;
  const amountEur = Number(body.amount_eur);
  if (!amountEur || amountEur < 10 || amountEur > 10000) {
    return NextResponse.json({ error: "Betrag muss zwischen 10 und 10.000 € liegen." }, { status: 400 });
  }

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, email, stripe_customer_id")
    .eq("id", guard.dealerId)
    .single();
  if (!dealer) return NextResponse.json({ error: "Dealer nicht gefunden" }, { status: 404 });

  const s = stripe();

  // Stripe-Kunde sicherstellen
  let customerId = dealer.stripe_customer_id;
  if (!customerId) {
    const customer = await s.customers.create({
      email: dealer.email,
      name: dealer.company_name,
      metadata: { dealer_id: dealer.id },
    });
    customerId = customer.id;
    await supabaseAdmin.from("dealers").update({ stripe_customer_id: customerId }).eq("id", dealer.id);
  }

  // Stripe ruft success_url/cancel_url als Browser-Redirect auf — beide
  // Schreibweisen funktionieren, ASCII ist aber kompatibler mit Stripes
  // URL-Parser und vermeidet Probleme bei Status-Tracking.
  const baseUrl = getSiteUrlAscii() || new URL(req.url).origin;

  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          product_data: {
            name: "KüchenWert Wallet-Aufladung",
            description: `Guthaben für Lead-Käufe (${amountEur} €)`,
          },
          unit_amount: Math.round(amountEur * 100),
          tax_behavior: "exclusive",
        },
      },
    ],
    payment_intent_data: {
      metadata: { dealer_id: dealer.id, type: "wallet_topup" },
    },
    metadata: { dealer_id: dealer.id, type: "wallet_topup", amount_eur: String(amountEur) },
    success_url: `${baseUrl}/dealer/wallet?topup=success`,
    cancel_url: `${baseUrl}/dealer/wallet?topup=cancelled`,
  });

  await audit(guard.userId, "wallet.topup.checkout", "dealer", dealer.id, {
    amountEur,
    sessionId: session.id,
  });

  return NextResponse.json({ url: session.url, session_id: session.id, presets: PRESETS });
}
