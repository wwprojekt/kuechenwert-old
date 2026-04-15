import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreLead } from "@/config/scoring-rules";
import { BUDGET_RANGES, TIMEFRAMES } from "@/config/funnel-steps";
import { getRegionByPlz } from "@/config/regions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const budgetEntry = BUDGET_RANGES.find((b) => b.id === body.budget);
    const timeframeEntry = TIMEFRAMES.find((t) => t.id === body.timeframe);

    const scoringResult = scoreLead({
      hasExistingOffer: body.hasExistingOffer ?? false,
      hasUpload: body.hasExistingOffer ?? false,
      timeframeMonths: timeframeEntry?.months ?? null,
      budgetEur: budgetEntry?.midpoint ?? null,
      kitchenForm: body.kitchenForm ?? null,
      kitchenStyle: body.kitchenStyle ?? null,
      reasonForPurchase: body.purchaseReason ?? null,
      postalCode: body.plz ?? null,
      phoneProvided: !!body.phone,
    });

    const region = getRegionByPlz(body.plz ?? "");

    const { data, error } = await supabaseAdmin.from("leads").insert({
      status: "new",
      score: scoringResult.score,
      tier: scoringResult.tier,
      postal_code: body.plz ?? "",
      region: region?.id ?? null,
      kitchen_form: body.kitchenForm ?? null,
      kitchen_style: body.kitchenStyle ?? null,
      purchase_reason: body.purchaseReason ?? null,
      special_wishes: body.specialWishes ?? [],
      timeframe_months: timeframeEntry?.months ?? null,
      budget_midpoint: budgetEntry?.midpoint ?? null,
      has_existing_offer: body.hasExistingOffer ?? false,
      first_name: body.firstName ?? null,
      last_name: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      consent_call: body.consentCall ?? false,
      consent_marketing: body.consentMarketing ?? false,
      funnel_answers: body,
      funnel_variant: "A",
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
    }).select("id").single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, score: scoringResult.score, tier: scoringResult.tier });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
