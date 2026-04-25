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
import {
  DEFAULT_IMAGE_COST_CENTS,
  getFluxResult,
  getFluxStatus,
  isMockMode,
  submitFluxJob,
} from "@/lib/planner/fal-client";
import {
  createRender,
  markRenderFailed,
  markRenderRunning,
  markRenderSuccess,
  updateSessionPriceRange,
  upsertPlannerSession,
} from "@/lib/planner/session";
import { calculatePriceRange } from "@/lib/planner/price-range";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/planner/rate-limit";
import { looksLikeBot, verifyTurnstile } from "@/lib/planner/turnstile";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
    void runGeneration({
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

/**
 * Hintergrundjob: Fal.ai submit, pollt, laedt Bild in Storage, updated DB.
 */
async function runGeneration(params: {
  sessionId: string;
  renderId: string;
  prompt: string;
  model: string;
}) {
  const startedAt = Date.now();
  try {
    // Submit Job
    const { requestId } = await submitFluxJob({
      prompt: params.prompt,
      aspectRatio: "16:9",
      numImages: 1,
      model: params.model,
    });

    await markRenderRunning(params.renderId, requestId);

    // Poll
    const timeoutMs = 90_000;
    const intervalMs = 1_500;
    let result;
    while (Date.now() - startedAt < timeoutMs) {
      const status = await getFluxStatus(requestId, params.model);
      if (status.status === "COMPLETED") {
        result = await getFluxResult(requestId, params.model);
        break;
      }
      if (status.status === "FAILED") {
        throw new Error(`FLUX status FAILED: ${status.error ?? "unknown"}`);
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    if (!result) {
      throw new Error(`FLUX timeout nach ${timeoutMs}ms`);
    }

    // Bild herunterladen + Supabase Storage upload
    const imagePath = `planner/${params.sessionId}/v${Date.now()}.jpg`;
    const uploadSuccess = isMockMode()
      ? await uploadMockImage(imagePath)
      : await downloadAndStoreImage(result.imageUrl, imagePath);
    if (!uploadSuccess) {
      throw new Error("Image upload to storage failed");
    }

    const elapsed = Date.now() - startedAt;
    await markRenderSuccess({
      renderId: params.renderId,
      sessionId: params.sessionId,
      imagePath,
      width: result.width,
      height: result.height,
      generationMs: elapsed,
      costCents: DEFAULT_IMAGE_COST_CENTS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[planner/generate:bg] failed:", msg);
    await markRenderFailed(params.renderId, msg);
  }
}

/**
 * Im Mock-Mode (kein FAL_KEY oder FAL_MOCK=1) schreiben wir ein
 * minimales embedded JPEG in den Storage, damit der Smoke-Test komplett
 * durchlaufen kann ohne externe Abhaengigkeiten.
 */
async function uploadMockImage(path: string): Promise<boolean> {
  try {
    // 1x1-Pixel JPEG (smallest valid), base64-dekodiert
    const MIN_JPEG_B64 =
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgP//Z";
    const buffer = Buffer.from(MIN_JPEG_B64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("lead-files")
      .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
    if (error) {
      console.error("[planner/generate:bg] mock upload error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[planner/generate:bg] mock upload exception:", e);
    return false;
  }
}

async function downloadAndStoreImage(url: string, path: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("[planner/generate:bg] fetch failed:", res.status, res.statusText);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    const { error } = await supabaseAdmin.storage
      .from("lead-files")
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      console.error("[planner/generate:bg] storage upload error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[planner/generate:bg] download exception:", e);
    return false;
  }
}
