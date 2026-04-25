/**
 * Fal.ai-Client fuer den Traumkueche-Funnel.
 *
 * Wrapper um @fal-ai/client mit:
 *   - Lazy Initialisierung (Muster wie supabase/admin.ts)
 *   - Mock-Mode via FAL_MOCK=1 (fuer Smoke-Tests und lokales Entwickeln ohne Key)
 *   - Einheitliche Fehlerbehandlung
 */

import { fal } from "@fal-ai/client";

const DEFAULT_MODEL = "fal-ai/flux-pro/v1.1-ultra" as const;

let _configured = false;

function ensureConfigured() {
  if (_configured) return;
  const key = process.env.FAL_KEY?.trim();
  if (!key) {
    if (process.env.NODE_ENV === "production" && !isMockMode()) {
      throw new Error(
        "FATAL: FAL_KEY fehlt in Production. Image-Generation faellt aus.",
      );
    }
    // Dev: Warnung, wir wechseln in Mock-Mode
    console.warn(
      "[planner/fal] FAL_KEY fehlt - Mock-Mode aktiv (Placeholder-Bild).",
    );
    return;
  }
  fal.config({ credentials: key });
  _configured = true;
}

export function isMockMode(): boolean {
  return (
    process.env.FAL_MOCK === "1" ||
    process.env.PLANNER_MOCK === "1" ||
    (!process.env.FAL_KEY && process.env.NODE_ENV !== "production")
  );
}

// ============================================================
// Queue-Pattern: submit -> poll status -> fetch result
// ============================================================

export interface FalQueueSubmitResult {
  requestId: string;
}

export interface FalImageResult {
  imageUrl: string;
  width: number;
  height: number;
  seed?: number;
  hasNsfwConcepts?: boolean;
}

export interface FalQueueStatus {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: string[];
  error?: string;
}

/**
 * Schickt einen Generation-Request ab und liefert die Request-ID.
 * Blockiert nicht.
 */
export async function submitFluxJob(params: {
  prompt: string;
  aspectRatio?: "16:9" | "3:2" | "1:1" | "4:5";
  numImages?: number;
  model?: string;
  safetyTolerance?: "1" | "2" | "3" | "4" | "5" | "6";
}): Promise<FalQueueSubmitResult> {
  if (isMockMode()) {
    return { requestId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }

  ensureConfigured();
  const model = params.model ?? DEFAULT_MODEL;

  const { request_id } = await fal.queue.submit(model, {
    input: {
      prompt: params.prompt,
      aspect_ratio: params.aspectRatio ?? "16:9",
      num_images: params.numImages ?? 1,
      safety_tolerance: params.safetyTolerance ?? "4",
      output_format: "jpeg",
      raw: false,
    },
  });

  return { requestId: request_id };
}

export async function getFluxStatus(
  requestId: string,
  model: string = DEFAULT_MODEL,
): Promise<FalQueueStatus> {
  if (isMockMode()) {
    // Mock wird sofort "fertig" - Ergebnis ist Placeholder-Bild.
    return { status: "COMPLETED" };
  }

  ensureConfigured();

  try {
    const status = await fal.queue.status(model, {
      requestId,
      logs: false,
    });

    type FalStatusResponse = { status?: string; logs?: Array<string | { message?: string }> };
    const s = status as FalStatusResponse;
    const raw = (s.status ?? "").toString().toUpperCase();
    let normalized: FalQueueStatus["status"];
    if (raw === "IN_QUEUE") normalized = "IN_QUEUE";
    else if (raw === "IN_PROGRESS") normalized = "IN_PROGRESS";
    else if (raw === "COMPLETED") normalized = "COMPLETED";
    else normalized = "IN_PROGRESS";

    return {
      status: normalized,
      logs: s.logs
        ? s.logs.map((l) => (typeof l === "string" ? l : (l.message ?? "")))
        : undefined,
    };
  } catch (e) {
    return {
      status: "FAILED",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function getFluxResult(
  requestId: string,
  model: string = DEFAULT_MODEL,
): Promise<FalImageResult> {
  if (isMockMode()) {
    return {
      imageUrl: getMockImageUrl(),
      width: 1920,
      height: 1080,
      seed: 0,
      hasNsfwConcepts: false,
    };
  }

  ensureConfigured();

  const result = await fal.queue.result(model, { requestId });
  type FalResultData = {
    images?: Array<{ url: string; width?: number; height?: number }>;
    seed?: number;
    has_nsfw_concepts?: boolean[];
    prompt?: string;
  };
  const data = (result.data ?? {}) as FalResultData;
  const firstImage = data.images?.[0];
  if (!firstImage?.url) {
    throw new Error("Fal.ai-Result enthielt kein Bild.");
  }

  return {
    imageUrl: firstImage.url,
    width: firstImage.width ?? 1920,
    height: firstImage.height ?? 1080,
    seed: data.seed,
    hasNsfwConcepts: data.has_nsfw_concepts?.[0] ?? false,
  };
}

/**
 * Blocking-Wrapper: submit + polling bis fertig oder timeout.
 * Nur fuer kurze Aufrufe (<30s) geeignet. In API-Routes NICHT blockierend
 * aufrufen - stattdessen submit + separate Poll-Route.
 */
export async function generateBlocking(
  params: Parameters<typeof submitFluxJob>[0],
  opts: { timeoutMs?: number; pollIntervalMs?: number } = {},
): Promise<{ requestId: string; result: FalImageResult; elapsedMs: number }> {
  const timeout = opts.timeoutMs ?? 45_000;
  const interval = opts.pollIntervalMs ?? 1_500;
  const start = Date.now();

  const { requestId } = await submitFluxJob(params);

  while (Date.now() - start < timeout) {
    const status = await getFluxStatus(requestId);
    if (status.status === "COMPLETED") {
      const result = await getFluxResult(requestId);
      return { requestId, result, elapsedMs: Date.now() - start };
    }
    if (status.status === "FAILED") {
      throw new Error(`FLUX failed: ${status.error ?? "unknown"}`);
    }
    await sleep(interval);
  }

  throw new Error(`FLUX timeout nach ${timeout}ms (requestId=${requestId}).`);
}

// ============================================================
// Mock + Helpers
// ============================================================

function getMockImageUrl(): string {
  // Im Smoke-Test liegt /public/mock-render.webp als Platzhalter.
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/mock-render.webp`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * FLUX-Pro-1.1-ultra kostet laut Fal-Pricing ~0.05 USD/Bild.
 * Wir rechnen mit 0.05 EUR = 5 Cent als konservativer Wert.
 */
export const DEFAULT_IMAGE_COST_CENTS = 5;
