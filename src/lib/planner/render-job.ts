/**
 * Gemeinsame Render-Pipeline fuer /api/planner/generate (Phase 1) und
 * /api/planner/refine (Phase 2). Laeuft als "fire-and-forget"-Task
 * im Hintergrund: submit FLUX -> poll status -> Bild in Storage.
 *
 * Wichtig: Alle Fehler werden intern gefangen und in planner_renders
 * persistiert, damit der Client beim Polling eine sinnvolle Antwort
 * bekommt statt hang-to-death.
 */

import {
  DEFAULT_IMAGE_COST_CENTS,
  getFluxResult,
  getFluxStatus,
  isMockMode,
  submitFluxJob,
} from "@/lib/planner/fal-client";
import {
  markRenderFailed,
  markRenderRunning,
  markRenderSuccess,
} from "@/lib/planner/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface RunGenerationParams {
  sessionId: string;
  renderId: string;
  prompt: string;
  model: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
  /** Cost override, default 5 cents (FLUX pro) */
  costCents?: number;
}

export async function runBackgroundRender(params: RunGenerationParams): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = params.timeoutMs ?? 90_000;
  const pollIntervalMs = params.pollIntervalMs ?? 1_500;

  try {
    const { requestId } = await submitFluxJob({
      prompt: params.prompt,
      aspectRatio: "16:9",
      numImages: 1,
      model: params.model,
    });

    await markRenderRunning(params.renderId, requestId);

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
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    if (!result) throw new Error(`FLUX timeout nach ${timeoutMs}ms`);

    const imagePath = `planner/${params.sessionId}/v${Date.now()}.jpg`;
    const uploadOk = isMockMode()
      ? await uploadMockImage(imagePath)
      : await downloadAndStoreImage(result.imageUrl, imagePath);
    if (!uploadOk) throw new Error("Image upload to storage failed");

    await markRenderSuccess({
      renderId: params.renderId,
      sessionId: params.sessionId,
      imagePath,
      width: result.width,
      height: result.height,
      generationMs: Date.now() - startedAt,
      costCents: params.costCents ?? DEFAULT_IMAGE_COST_CENTS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[render-job] failed:", msg);
    await markRenderFailed(params.renderId, msg);
  }
}

export async function uploadMockImage(path: string): Promise<boolean> {
  try {
    const MIN_JPEG_B64 =
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgP//Z";
    const buffer = Buffer.from(MIN_JPEG_B64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("lead-files")
      .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
    if (error) {
      console.error("[render-job] mock upload error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[render-job] mock upload exception:", e);
    return false;
  }
}

export async function downloadAndStoreImage(url: string, path: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("[render-job] fetch failed:", res.status, res.statusText);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const { error } = await supabaseAdmin.storage
      .from("lead-files")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) {
      console.error("[render-job] storage upload error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[render-job] download exception:", e);
    return false;
  }
}
