/**
 * POST /api/planner/refine
 *
 * Phase-2-Chat: Der Nutzer schickt eine natuerliche Anweisung
 * ("mach die Farbe heller, nimm Keramik als Arbeitsplatte"), das LLM
 * uebersetzt sie in Tool-Calls, wir aktualisieren die Spec und starten
 * einen neuen FLUX-Render.
 *
 * Harte Begrenzungen:
 *   - Max. 5 Refines pro Session (Cost-Cap)
 *   - Rate-Limit IP + Session
 *   - Turnstile optional (fail-open in Dev)
 *   - Spec-Writes ausschliesslich ueber vordefinierte Tool-Slugs
 *
 * Request:
 *   { sessionToken: string, message: string, turnstileToken?: string }
 * Response (success):
 *   {
 *     renderId: string, version: number,
 *     iterationCount: number, iterationLimit: number,
 *     applied: AppliedChange[],
 *     assistantMessage: string,
 *     updatedSpec: Record<string, unknown>,
 *     mock: boolean
 *   }
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  countRefineIterations,
  createRender,
  getSessionByToken,
  replaceSessionSpec,
  updateSessionPriceRange,
} from "@/lib/planner/session";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/planner/rate-limit";
import { looksLikeBot, verifyTurnstile } from "@/lib/planner/turnstile";
import { buildKitchenPrompt } from "@/lib/planner/prompt-builder";
import { calculatePriceRange } from "@/lib/planner/price-range";
import {
  applyRefineToolCalls,
  buildRefineSystemPrompt,
  buildRefineTools,
} from "@/lib/planner/refine-tools";
import { llmChat } from "@/lib/planner/llm-client";
import { runBackgroundRender } from "@/lib/planner/render-job";
import { clampTextLength } from "@/lib/planner/safe-text";
import {
  REFINE_ITERATION_LIMIT,
  REFINE_MESSAGE_MAX_LENGTH,
} from "@/lib/planner/refine-limits";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL_SLUG = "fal-ai/flux-pro/v1.1-ultra";

interface RefineBody {
  sessionToken: string;
  message: string;
  turnstileToken?: string;
}

export async function POST(req: NextRequest) {
  let body: RefineBody;
  try {
    body = (await req.json()) as RefineBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.sessionToken || typeof body.sessionToken !== "string") {
    return NextResponse.json({ error: "sessionToken fehlt" }, { status: 400 });
  }
  if (!body.message || typeof body.message !== "string" || body.message.trim().length < 2) {
    return NextResponse.json({ error: "message fehlt oder zu kurz" }, { status: 400 });
  }
  const message = clampTextLength(body.message.trim(), REFINE_MESSAGE_MAX_LENGTH);

  const ip = clientIpFromHeaders(req.headers);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (looksLikeBot(userAgent)) {
    return NextResponse.json({ error: "Bot-Zugriff blockiert." }, { status: 403 });
  }

  // Rate-Limits zuerst pruefen (billig, ohne DB-Lookup der Session).
  // Konservativer als generate, weil jeder Refine einen FLUX- + LLM-Call kostet.
  const [ipLimit, sessionLimit] = await Promise.all([
    checkRateLimit(`planner-refine:ip:${ip}`, 3600, 15),
    checkRateLimit(`planner-refine:session:${body.sessionToken}`, 3600, 8),
  ]);
  if (!ipLimit.allowed || !sessionLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, sessionLimit.retryAfterSeconds);
    return NextResponse.json(
      { error: "Rate-Limit erreicht.", retryAfterSeconds: retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const session = await getSessionByToken(body.sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  }

  // Turnstile: Der Refine-Chat steht HINTER dem Lead-Gate. Wenn der Nutzer
  // Kontakt captured hat, gilt er als verifiziert - er hat auf dem Lead-Gate
  // bereits ein Turnstile-Widget geloest. Zusaetzlichen Token verlangen wir
  // nicht (der Widget wird im Refine-Chat nicht re-rendered). Wenn kein
  // Kontakt captured ist (ausnahme: direkter POST von aussen), erzwingen wir
  // Turnstile weiterhin.
  if (!session.contact_captured_at) {
    const tsResult = await verifyTurnstile(body.turnstileToken, ip);
    if (!tsResult.success && !tsResult.skipped) {
      return NextResponse.json(
        { error: "Bot-Schutz fehlgeschlagen.", errors: tsResult.errors },
        { status: 403 },
      );
    }
  }

  // Iterations-Limit pruefen
  const iterationCount = await countRefineIterations(session.id);
  if (iterationCount >= REFINE_ITERATION_LIMIT) {
    return NextResponse.json(
      {
        error: "Iterations-Limit erreicht",
        iterationCount,
        iterationLimit: REFINE_ITERATION_LIMIT,
      },
      { status: 409 },
    );
  }

  // Current spec - defensiv: spec kann theoretisch null sein (alte Rows).
  const currentSpec = (session.spec ?? {}) as unknown as TraumkuecheData;

  // LLM call: tool-call-only refine
  let llmResult;
  try {
    llmResult = await llmChat({
      messages: [
        { role: "system", content: buildRefineSystemPrompt() },
        {
          role: "user",
          content: [
            { type: "text", text: `Aktuelle Kueche: ${JSON.stringify(specForLlm(currentSpec))}` },
            { type: "text", text: `Aenderungswunsch: ${message}` },
          ],
        },
      ],
      tools: buildRefineTools(),
      toolChoice: "auto",
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 25_000,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[planner/refine] LLM failed:", msg);
    return NextResponse.json(
      { error: "KI-Assistent gerade nicht verfuegbar.", detail: msg },
      { status: 502 },
    );
  }

  // Keine Tool-Calls -> Rueckfrage an User, kein Render
  if (llmResult.toolCalls.length === 0) {
    return NextResponse.json({
      renderId: null,
      iterationCount,
      iterationLimit: REFINE_ITERATION_LIMIT,
      applied: [],
      assistantMessage:
        llmResult.content ??
        "Ich konnte deinen Wunsch nicht einordnen. Sag mir konkret, was ich aendern soll (Farbe, Stil, Arbeitsplatte, Stauraum, Geraete).",
      updatedSpec: currentSpec,
      mock: llmResult.mock,
    });
  }

  // Tool-Calls auf Spec anwenden
  const { spec: newSpec, applied } = applyRefineToolCalls(currentSpec, llmResult.toolCalls);
  const okChanges = applied.filter((a) => a.ok);
  if (okChanges.length === 0) {
    return NextResponse.json({
      renderId: null,
      iterationCount,
      iterationLimit: REFINE_ITERATION_LIMIT,
      applied,
      assistantMessage:
        "Die gewuenschte Aenderung konnte ich leider nicht eindeutig zuordnen. Bitte nenne die Option konkret.",
      updatedSpec: currentSpec,
      mock: llmResult.mock,
    });
  }

  try {
    // 1) Prompt bauen
    const { prompt, negativePrompt } = buildKitchenPrompt(newSpec);

    // 2) Render-Row anlegen (mit Snapshot). Zuerst, damit bei DB-Fehler
    //    die Session-Spec nicht bereits geaendert wurde (kein halber State).
    const render = await createRender({
      sessionId: session.id,
      prompt,
      negativePrompt,
      specSnapshot: newSpec as unknown as Record<string, unknown>,
      modelSlug: MODEL_SLUG,
      userMessage: message,
    });

    // 3) Session-Spec aktualisieren (erst jetzt, wenn Render-Row existiert)
    await replaceSessionSpec({
      sessionId: session.id,
      spec: newSpec as unknown as Record<string, unknown>,
    });

    // 4) Preis-Range neu rechnen (parallel)
    void (async () => {
      try {
        const price = await calculatePriceRange(newSpec);
        await updateSessionPriceRange({
          sessionId: session.id,
          minCents: price.range.minCents,
          maxCents: price.range.maxCents,
          expertNote: price.expertNote,
        });
      } catch (e) {
        console.error("[planner/refine] price-range failed:", e);
      }
    })();

    // 5) Neuen Render starten
    void runBackgroundRender({
      sessionId: session.id,
      renderId: render.id,
      prompt,
      model: MODEL_SLUG,
    });

    return NextResponse.json({
      renderId: render.id,
      version: render.version,
      iterationCount: iterationCount + 1,
      iterationLimit: REFINE_ITERATION_LIMIT,
      applied,
      assistantMessage: llmResult.content ?? "Ich habe deine Aenderungen uebernommen.",
      updatedSpec: newSpec,
      mock: llmResult.mock,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[planner/refine] error:", msg);
    return NextResponse.json({ error: "Interner Fehler", detail: msg }, { status: 500 });
  }
}

/**
 * Reduzierte Spec fuer LLM-Kontext (keine Kontakt-Daten, keine Token).
 */
function specForLlm(spec: TraumkuecheData): Record<string, unknown> {
  return {
    styleSlug: spec.styleSlug,
    surfaceFinishSlug: spec.surfaceFinishSlug,
    frontColorSlug: spec.frontColorSlug,
    worktopSlug: spec.worktopSlug,
    storageFeatures: spec.storageFeatures,
    applianceLayouts: spec.applianceLayouts,
    applianceSegment: spec.applianceSegment,
    kitchenForm: spec.kitchenForm,
    kitchenSize: spec.kitchenSize,
  };
}
