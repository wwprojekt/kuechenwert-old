import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { createInvoice } from "@/lib/invoices";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe] signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "payment_intent.payment_failed") {
      await audit(null, "stripe.payment_failed", "payment_intent", (event.data.object as Stripe.PaymentIntent).id, {});
    }
  } catch (err) {
    console.error("[stripe] handler error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const dealerId = meta.dealer_id;
  const type = meta.type;
  const amountEur = Number(meta.amount_eur);
  if (!dealerId || type !== "wallet_topup" || !amountEur) return;

  // Doppel-Verarbeitung verhindern
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (piId) {
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", piId)
      .maybeSingle();
    if (existing) return;
  }

  const amountCents = Math.round(amountEur * 100);

  // Wallet aufladen (atomar via update + select)
  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("wallet_balance_cents")
    .eq("id", dealerId)
    .single();
  if (!dealer) throw new Error("dealer not found");

  await supabaseAdmin
    .from("dealers")
    .update({ wallet_balance_cents: dealer.wallet_balance_cents + amountCents })
    .eq("id", dealerId);

  // Payment-Record
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .insert({
      dealer_id: dealerId,
      type: "wallet_topup",
      amount_cents: amountCents,
      stripe_payment_intent_id: piId ?? null,
      description: `Wallet-Aufladung ${amountEur.toFixed(2)} €`,
      status: "completed",
    })
    .select("id")
    .single();

  // Rechnung erstellen + per Mail versenden (Stripe-bezahlt → sofort 'paid')
  await createInvoice({
    dealerId,
    type: "wallet_topup",
    lines: [
      {
        description: `Wallet-Aufladung KüchenWert (${amountEur.toFixed(2)} €)`,
        unit_price_cents: Math.round(amountCents / 1.19), // Brutto -> Netto rückrechnen, da Stripe brutto belastet
      },
    ],
    reference_type: "wallet",
    reference_id: payment?.id,
    related_payment_id: payment?.id,
    mark_paid_immediately: true,
    payment_method: "stripe",
    send_email: true,
    notes: "Online bezahlt via Stripe.",
  });

  await audit(null, "wallet.topup.completed", "dealer", dealerId, {
    amountCents,
    paymentIntentId: piId,
  });
}
