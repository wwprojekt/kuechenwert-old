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

/**
 * Budget midpoint lookup that works across all funnel configs.
 * Falls back to the legacy BUDGET_RANGES for the old funnel.
 */
const BUDGET_MIDPOINTS: Record<string, number | null> = {
  "unter-5k": 3500,
  "under-5k": 3500,
  "5k-10k": 7500,
  "10k-15k": 12500,
  "15k-25k": 20000,
  "ueber-25k": 30000,
  "over-25k": 30000,
  unsicher: null,
};

const TIMEFRAME_MONTHS: Record<string, number> = {
  "1-3": 2,
  "4-6": 5,
  "7-12": 9,
  "12+": 15,
  spaeter: 12,
  later: 12,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const funnelType = body.funnel_type ?? "legacy";
    const budgetKey = body.budget ?? "";
    const timeframeKey = body.timeframe ?? "";

    const budgetMidpoint =
      BUDGET_MIDPOINTS[budgetKey] ??
      BUDGET_RANGES.find((b) => b.id === budgetKey)?.midpoint ??
      null;

    const timeframeMonths =
      TIMEFRAME_MONTHS[timeframeKey] ??
      TIMEFRAMES.find((t) => t.id === timeframeKey)?.months ??
      null;

    const scoringResult = scoreLead({
      hasExistingOffer: body.hasExistingOffer ?? false,
      hasUpload: body.hasExistingOffer ?? !!body.floorPlanFile,
      timeframeMonths,
      budgetEur: budgetMidpoint,
      kitchenForm: body.kitchenForm ?? null,
      kitchenStyle: body.style ?? body.kitchenStyle ?? null,
      reasonForPurchase: body.reason ?? body.purchaseReason ?? null,
      postalCode: body.plz ?? null,
      phoneProvided: !!body.phone,
    });

    const region = getRegionByPlz(body.plz ?? "");

    const insertData: Record<string, unknown> = {
      status: "new",
      score: scoringResult.score,
      tier: scoringResult.tier,
      postal_code: body.plz ?? "",
      region: region?.id ?? null,
      kitchen_form: body.kitchenForm ?? null,
      kitchen_style: body.style ?? body.kitchenStyle ?? null,
      purchase_reason: body.reason ?? body.purchaseReason ?? null,
      special_wishes: body.specialWishes ?? body.equipment ?? body.quizPriorities ?? [],
      timeframe_months: timeframeMonths,
      budget_midpoint: budgetMidpoint,
      has_existing_offer: body.hasExistingOffer ?? false,
      first_name: body.firstName ?? null,
      last_name: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      consent_call: body.consentCall ?? false,
      consent_marketing: body.consentMarketing ?? false,
      funnel_answers: body,
      funnel_variant: funnelType,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
    };

    // Extended fields for planung and quiz funnels
    if (funnelType === "planung") {
      insertData.room_type = body.roomType ?? null;
      insertData.color_preference = body.color ?? null;
      insertData.household_size = body.household ?? null;
      insertData.free_text = body.freeText ?? null;
    }

    if (funnelType === "quiz") {
      insertData.color_preference = body.quizColors?.join(",") ?? null;
      insertData.quiz_result = body.quizResult ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      score: scoringResult.score,
      tier: scoringResult.tier,
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
