import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CronTrigger = "vercel_cron" | "manual" | "unknown";

export type CronJobResult = {
  /** Anzahl der verarbeiteten Items (Auctions, Invoices, ...) */
  processed: number;
  /** Optionales Detail-Payload, wird in cron_runs.details gespeichert */
  details?: Record<string, unknown>;
};

/**
 * Wickelt einen Cron-Endpoint-Handler ab:
 *  1. Pruef Auth (Vercel-Cron-Header oder Bearer ${CRON_SECRET})
 *  2. Schreibt cron_runs Eintrag (status=running)
 *  3. Fuehrt run() aus
 *  4. Updated cron_runs (success+duration+processed oder error+message)
 *  5. Liefert NextResponse zurueck
 */
export async function runCronJob(
  job: string,
  req: Request,
  run: () => Promise<CronJobResult>,
): Promise<NextResponse> {
  const trigger = detectTrigger(req);
  if (!trigger.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const { data: created, error: insertErr } = await supabaseAdmin
    .from("cron_runs")
    .insert({
      job,
      trigger: trigger.kind,
      status: "running",
      started_at: startedAt.toISOString(),
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error(`[cron:${job}] cron_runs insert failed:`, insertErr);
  }
  const runId = created?.id ?? null;

  try {
    const result = await run();
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    if (runId) {
      const { error: updErr } = await supabaseAdmin
        .from("cron_runs")
        .update({
          status: "success",
          finished_at: finishedAt.toISOString(),
          duration_ms: durationMs,
          processed: result.processed,
          details: result.details ?? {},
        })
        .eq("id", runId);
      if (updErr) console.error(`[cron:${job}] cron_runs update failed:`, updErr);
    }

    return NextResponse.json({
      ok: true,
      job,
      run_id: runId,
      processed: result.processed,
      duration_ms: durationMs,
      ...(result.details ?? {}),
    });
  } catch (err) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[cron:${job}] failed:`, err);

    if (runId) {
      await supabaseAdmin
        .from("cron_runs")
        .update({
          status: "error",
          finished_at: finishedAt.toISOString(),
          duration_ms: durationMs,
          error_message: errorMessage.slice(0, 2000),
        })
        .eq("id", runId);
    }

    return NextResponse.json(
      { ok: false, job, run_id: runId, error: errorMessage },
      { status: 500 },
    );
  }
}

function detectTrigger(req: Request): { authorized: boolean; kind: CronTrigger } {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = !!process.env.VERCEL;
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const isVercelCronHeader = req.headers.get("x-vercel-cron") === "1";

  const isAuthorizedBearer = !!cronSecret && auth === `Bearer ${cronSecret}`;

  // Production-Hardening:
  //   - x-vercel-cron Header ist NUR als Auth-Beweis akzeptiert wenn wir
  //     tatsächlich auf Vercel laufen (sonst trivial fälschbar).
  //   - Auf Self-Hosting (Dokploy etc.) ist Bearer ${CRON_SECRET} Pflicht.
  //   - Im Dev-Mode dürfen beide Wege.
  if (isVercelCronHeader && (isVercel || !isProduction)) {
    return { authorized: true, kind: "vercel_cron" };
  }
  if (isAuthorizedBearer) {
    return { authorized: true, kind: "manual" };
  }

  if (isProduction && !cronSecret) {
    console.error(
      "[cron] CRON_SECRET ist nicht gesetzt. Cron-Endpoints sind ungeschützt!",
    );
  }

  return { authorized: false, kind: "unknown" };
}
