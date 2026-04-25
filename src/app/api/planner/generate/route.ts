/**
 * POST /api/planner/generate
 *
 * Startet eine KI-Bild-Generierung fuer den Traumkueche-Funnel.
 * Antwortet sofort mit { renderId, sessionId } - der Client pollt dann
 * /api/planner/renders/[id].
 *
 * Die eigentliche Fal.ai-Generation + Storage-Upload laeuft im Hintergrund
 * via void-Promise. Fehler werden in planner_renders persistiert.
 */

import { NextResponse, type NextRequest } from "next/server";
import { buildKitchenPrompt } from "@/lib/planner/prompt-builder";
import { isMockMode } from "@/lib/planner/fal-client";
import {
  createRender,
  updateSessionPriceRange,
  upsertPlannerSession,
} from "@/lib/planner/session";
import { calculatePriceRange } from "@/lib/planner/price-range";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/planner/rate-limit";
import { looksLikeBot, verifyTurnstile } from "@/lib/planner/turnstile";
import { runBackgroundRender } from "@/lib/planner/render-job";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL_SLUG = "fal-ai/flux-pro/v1.1-ultra";

interface GenerateRequestBody {
  sessionToken: string;
  spec: TraumkuecheData;
  turnstileToken?: string;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
}

export async function POST(req: NextRequest) {
  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.sessionToken || typeof body.sessionToken !== "string" || body.sessionToken.length < 8) {
    return NextResponse.json({ error: "sessionToken fehlt oder ungueltig" }, { status: 400 });
  }
  if (!body.spec) {
    return NextResponse.json({ error: "spec fehlt" }, { status: 400 });
  }

  // Minimal-Validierung: Stil + Form muessen gesetzt sein
  if (!body.spec.styleSlug || !body.spec.kitchenForm) {
    return NextResponse.json(
      { error: "styleSlug und kitchenForm sind Pflicht" },
      { status: 400 },
    );
  }

  const ip = clientIpFromHeaders(req.headers);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // Bot-Heuristik (guenstiger Vor-Filter)
  if (looksLikeBot(userAgent)) {
    return NextResponse.json({ error: "Bot-Zugriff blockiert." }, { status: 403 });
  }

  // Turnstile-Validierung (in Production Pflicht, in Dev skip-able)
  const tsResult = await verifyTurnstile(body.turnstileToken, ip);
  if (!tsResult.success && !tsResult.skipped) {
    return NextResponse.json(
      { error: "Bot-Schutz fehlgeschlagen.", errors: tsResult.errors },
      { status: 403 },
    );
  }

  // Rate-Limits - zwei Achsen
  const [ipLimit, sessionLimit] = await Promise.all([
    checkRateLimit(`planner-generate:ip:${ip}`, 3600, 20),
    checkRateLimit(`planner-generate:session:${body.sessionToken}`, 3600, 6),
  ]);
  if (!ipLimit.allowed || !sessionLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, sessionLimit.retryAfterSeconds);
    return NextResponse.json(
      {
        error: "Rate-Limit erreicht. Bitte spaeter erneut versuchen.",
        retryAfterSeconds: retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  try {
    // 1) Session upsert
    const session = await upsertPlannerSession({
      sessionToken: body.sessionToken,
      spec: body.spec,
      ipAddress: ip,
      userAgent,
      utm: body.utm,
    });

    // 2) Prompt bauen
    const { prompt, negativePrompt } = buildKitchenPrompt(body.spec);

    // 3) Render-Row anlegen
    const render = await createRender({
      sessionId: session.id,
      prompt,
      negativePrompt,
      specSnapshot: body.spec as unknown as Record<string, unknown>,
      modelSlug: MODEL_SLUG,
    });

    // 4) Preis-Range asynchron berechnen und persistieren
    //    (DB-Lookup, laeuft parallel zum Rendering)
    void (async () => {
      try {
        const price = await calculatePriceRange(body.spec);
        await updateSessionPriceRange({
          sessionId: session.id,
          minCents: price.range.minCents,
          maxCents: price.range.maxCents,
          expertNote: price.expertNote,
        });
      } catch (e) {
        console.error("[planner/generate] price-range failed:", e);
      }
    })();

    // 5) Generation starten (non-blocking)
    void runBackgroundRender({
      sessionId: session.id,
      renderId: render.id,
      prompt,
      model: MODEL_SLUG,
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionToken: session.session_token,
      renderId: render.id,
      version: render.version,
      status: "pending",
      mock: isMockMode(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[planner/generate] error:", msg);
    return NextResponse.json({ error: "Interner Fehler", detail: msg }, { status: 500 });
  }
}

