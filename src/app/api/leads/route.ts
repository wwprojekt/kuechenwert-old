import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { scoreLead } from "@/config/scoring-rules";
import { BUDGET_RANGES, TIMEFRAMES } from "@/config/funnel-steps";
import { getRegionByPlz } from "@/config/regions";
import { recordConsents, getClientIp } from "@/lib/consent";

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
  "25k-40k": 32500,
  "ueber-25k": 30000,
  "ueber-40k": 50000,
  "over-25k": 30000,
  unsicher: null,
};

const TIMEFRAME_MONTHS: Record<string, number> = {
  asap: 1,
  "1-3": 2,
  "4-6": 5,
  "7-12": 9,
  "12+": 15,
  spaeter: 18,
  later: 12,
};

/** Erlaubte Werte fuer leads.funnel_type. */
const ALLOWED_FUNNEL_TYPES = new Set(["a", "b"]);

/** Erlaubte Werte fuer leads.housing_type. */
const ALLOWED_HOUSING_TYPES = new Set(["rent", "own", "unknown"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const funnelType = body.funnel_type ?? "legacy";
    const budgetKey = body.budget ?? "";
    const timeframeKey = body.timeframe ?? "";

    // Vom Funnel-A-Slider: `budgetEur` = exakter Wert in €.
    // Fallback: bekannte String-Keys (legacy/Funnel B).
    const budgetMidpoint =
      (typeof body.budgetEur === "number" && Number.isFinite(body.budgetEur)
        ? Math.round(body.budgetEur)
        : null) ??
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

    // funnel_type: nur 'a' oder 'b' fuer DB-Spalte zulassen,
    // ansonsten Standard 'a' (Lead-Generation).
    const dbFunnelType = ALLOWED_FUNNEL_TYPES.has(funnelType) ? funnelType : "a";

    // housing_type: rent / own / unknown (Pflicht in Funnel A).
    const housingTypeRaw = body.housing_type ?? null;
    const housingType =
      housingTypeRaw && ALLOWED_HOUSING_TYPES.has(housingTypeRaw)
        ? housingTypeRaw
        : null;

    // Auto-Qualify Funnel-A-Leads, sobald
    //  - tier >= qualified (kein Spam),
    //  - Pflicht-Kontaktdaten vorhanden,
    //  - housing_type erfasst.
    // Funnel-B bleibt 'new', weil dort der Experte zuerst zurueckruft
    // und das Auction-Sheet manuell vervollstaendigt wird.
    const QUALIFIED_TIERS = new Set(["hot", "premium", "qualified"]);
    const hasMinContact =
      !!body.firstName && !!body.lastName && !!body.email && !!body.phone;
    const autoQualify =
      dbFunnelType === "a" &&
      QUALIFIED_TIERS.has(scoringResult.tier) &&
      !!housingType &&
      hasMinContact;
    const initialStatus = autoQualify ? "qualified" : "new";

    const insertData: Record<string, unknown> = {
      status: initialStatus,
      score: scoringResult.score,
      tier: scoringResult.tier,
      funnel_type: dbFunnelType,
      housing_type: housingType,
      postal_code: body.plz ?? "",
      region: region?.id ?? null,
      city: body.city ?? null,
      address_line: body.addressLine ?? body.address_line ?? null,
      kitchen_form: body.kitchenForm ?? null,
      kitchen_style: body.style ?? body.kitchenStyle ?? null,
      purchase_reason: body.reason ?? body.purchaseReason ?? null,
      special_wishes:
        body.specialWishes ?? body.equipment ?? body.quizPriorities ?? [],
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
      utm_term: body.utm_term ?? null,
      utm_content: body.utm_content ?? null,
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

    // DSGVO-Nachweis: Consent-Records persistieren (best-effort)
    await recordConsents(
      [
        { purpose: "privacy_policy", granted: true },
        { purpose: "marketing_call", granted: !!body.consentCall },
        { purpose: "marketing_email", granted: !!body.consentMarketing },
      ],
      {
        leadId: data.id,
        source: dbFunnelType === "b" ? "funnel_b" : "funnel_a",
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    );

    return NextResponse.json({
      id: data.id,
      score: scoringResult.score,
      tier: scoringResult.tier,
    });
  } catch (err) {
    console.error("[api/leads] error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
