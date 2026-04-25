/**
 * POST /api/planner/save-contact
 *
 * Lead-Gate fuer den Traumkueche-Funnel. Wird aufgerufen, sobald der User
 * nach dem ersten Render seinen Kontakt abgibt.
 *
 * Flow:
 *   1. Rate-Limit by IP (100/h) und sessionToken (3/h)
 *   2. Session finden (muss existieren - sonst 404)
 *   3. Lead anlegen mit funnel_type='traumkueche'
 *   4. planner_session.lead_id setzen + contact_captured_at
 *   5. Alle success-Renders als lead_files (category='rendering') registrieren
 *   6. Consent-Records schreiben
 *   7. Bei hotter/qualified Tier und phone gesetzt: dealer notifications triggern
 */

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { scoreLead } from "@/config/scoring-rules";
import { getRegionByPlz } from "@/config/regions";
import { recordConsents, getClientIp } from "@/lib/consent";
import { notifyDealersOfNewLead } from "@/lib/dealer-notifications";
import {
  getRendersForSession,
  getSessionByToken,
  saveContactOnSession,
} from "@/lib/planner/session";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/planner/rate-limit";
import { summarizeSpec } from "@/lib/planner/prompt-builder";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SaveContactBody {
  sessionToken: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  plz: string;
  consentDatenschutz: boolean;
  consentAi: boolean;
  consentCallback: boolean;
  consentMarketing?: boolean;
}

export async function POST(request: NextRequest) {
  let body: SaveContactBody;
  try {
    body = (await request.json()) as SaveContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic validation
  const err = validateBody(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const ip = clientIpFromHeaders(request.headers);

  // Rate-Limits
  const [ipLimit, sessionLimit] = await Promise.all([
    checkRateLimit(`planner-contact:ip:${ip}`, 3600, 30),
    checkRateLimit(`planner-contact:session:${body.sessionToken}`, 3600, 3),
  ]);
  if (!ipLimit.allowed || !sessionLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, sessionLimit.retryAfterSeconds);
    return NextResponse.json(
      { error: "Rate-Limit erreicht.", retryAfterSeconds: retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // Session laden
  const session = await getSessionByToken(body.sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  }

  if (session.lead_id) {
    // Bereits gespeichert: Update zuruecksenden (idempotent)
    return NextResponse.json({
      sessionId: session.id,
      leadId: session.lead_id,
      alreadyCaptured: true,
    });
  }

  const spec = (session.spec ?? {}) as TraumkuecheData;

  // Scoring (ohne Upload, ohne existing-offer)
  const scoring = scoreLead({
    hasExistingOffer: false,
    hasUpload: true,
    timeframeMonths: null,
    budgetEur: estimateBudgetFromSession(session),
    kitchenForm: spec.kitchenForm ?? null,
    kitchenStyle: spec.styleSlug ?? null,
    reasonForPurchase: null,
    postalCode: body.plz,
    phoneProvided: !!body.phone,
  });

  const region = getRegionByPlz(body.plz);

  // Lead einfuegen
  const funnelAnswers = {
    funnel: "traumkueche",
    sessionToken: session.session_token,
    sessionId: session.id,
    spec,
    specSummary: summarizeSpec(spec),
    priceRange:
      session.price_range_min_cents != null && session.price_range_max_cents != null
        ? {
            minCents: session.price_range_min_cents,
            maxCents: session.price_range_max_cents,
          }
        : null,
    expertNote: session.expert_note ?? null,
  };

  const insertData: Record<string, unknown> = {
    status: "new",
    score: scoring.score,
    tier: scoring.tier,
    funnel_type: "traumkueche",
    funnel_variant: "traumkueche",
    postal_code: body.plz,
    region: region?.id ?? null,
    kitchen_form: spec.kitchenForm ?? null,
    kitchen_style: spec.styleSlug ?? null,
    budget_midpoint: estimateBudgetFromSession(session),
    has_existing_offer: false,
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    phone: body.phone ?? null,
    consent_call: !!body.consentCallback,
    consent_marketing: !!body.consentMarketing,
    funnel_answers: funnelAnswers,
    utm_source: session.utm_source,
    utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign,
    utm_content: session.utm_content,
    utm_term: session.utm_term,
    ip_address: ip,
    user_agent: session.user_agent,
    landing_page: "/traumkueche",
  };

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from("leads")
    .insert(insertData)
    .select("id")
    .single();

  if (leadErr || !lead) {
    console.error("[save-contact] lead insert failed:", leadErr);
    return NextResponse.json({ error: "Lead konnte nicht angelegt werden" }, { status: 500 });
  }

  const leadId = (lead as { id: string }).id;

  // Session mit Contact + lead_id aktualisieren
  await saveContactOnSession({
    sessionId: session.id,
    contact: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? null,
      plz: body.plz,
    },
  });
  await supabaseAdmin
    .from("planner_sessions")
    .update({ lead_id: leadId, status: "completed", updated_at: new Date().toISOString() })
    .eq("id", session.id);

  // Successful Renders als lead_files registrieren
  const renders = await getRendersForSession(session.id);
  const successRenders = renders.filter((r) => r.status === "success" && r.image_path);

  if (successRenders.length > 0) {
    const files = successRenders.map((r) => ({
      lead_id: leadId,
      file_url: r.image_path!,
      file_name: `render-v${r.version}.jpg`,
      file_type: "image/jpeg",
      file_size_bytes: null,
      category: "rendering" as const,
      virus_scan_status: "clean" as const,
    }));
    const { error: filesErr } = await supabaseAdmin.from("lead_files").insert(files);
    if (filesErr) {
      console.error("[save-contact] lead_files insert failed:", filesErr);
      // kein Abbruch - Lead ist gespeichert
    }
  }

  // Consent-Records
  await recordConsents(
    [
      { purpose: "privacy_policy", granted: !!body.consentDatenschutz },
      { purpose: "ai_processing", granted: !!body.consentAi },
      { purpose: "marketing_call", granted: !!body.consentCallback },
      { purpose: "marketing_email", granted: !!body.consentMarketing },
    ],
    {
      leadId,
      source: "funnel_traumkueche",
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    },
  );

  // Dealer-Notifications: nur wenn phone gesetzt UND tier >= qualified
  const QUALIFIED_TIERS = new Set(["hot", "premium", "qualified"]);
  if (body.phone && QUALIFIED_TIERS.has(scoring.tier)) {
    void notifyDealersOfNewLead(leadId);
  }

  return NextResponse.json({
    sessionId: session.id,
    leadId,
    score: scoring.score,
    tier: scoring.tier,
  });
}

function validateBody(body: Partial<SaveContactBody>): string | null {
  if (!body.sessionToken || typeof body.sessionToken !== "string") {
    return "sessionToken fehlt";
  }
  if (!body.firstName || body.firstName.trim().length < 2) return "Vorname fehlt";
  if (!body.lastName || body.lastName.trim().length < 2) return "Nachname fehlt";
  if (!body.email || !body.email.includes("@") || !body.email.includes("."))
    return "Gueltige E-Mail fehlt";
  if (!body.plz || !/^\d{5}$/.test(body.plz)) return "Gueltige PLZ fehlt";
  if (!body.consentDatenschutz) return "Datenschutz-Einwilligung erforderlich";
  if (!body.consentAi) return "KI-Einwilligung erforderlich";
  if (body.phone && body.phone.replace(/\D/g, "").length < 6) {
    return "Telefonnummer zu kurz";
  }
  return null;
}

/**
 * Grobe Budget-Schaetzung aus der Price-Range.
 * Der Mittelwert ist gut genug fuer das Scoring (dort wird gegen 10k/20k-Schwellen
 * geprueft).
 */
function estimateBudgetFromSession(session: {
  price_range_min_cents: number | null;
  price_range_max_cents: number | null;
}): number | null {
  if (session.price_range_min_cents != null && session.price_range_max_cents != null) {
    return Math.round(
      (session.price_range_min_cents + session.price_range_max_cents) / 2 / 100,
    );
  }
  return null;
}
