import { NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/supabase/admin";
import { getSiteUrlAscii } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_JOBS = new Set(["finalize-auctions", "dunning"]);

/**
 * Admin-Trigger fuer Cron-Jobs (Manual-Run).
 * Body: { job: "finalize-auctions" | "dunning" }
 * Antwortet mit dem Output des Cron-Endpoints (processed, run_id, ...).
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { job?: string };
  const job = body.job;
  if (!job || !ALLOWED_JOBS.has(job)) {
    return NextResponse.json({ error: "Unbekannter Job" }, { status: 400 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET ist nicht gesetzt - Manual-Trigger nicht moeglich." },
      { status: 500 },
    );
  }

  // ASCII-Form pflicht: Node-`fetch()` schlägt mit IDN-Hostnamen
  // (`küchenwert.de`) bei manchen Versionen fehl bzw. baut den Host-Header
  // falsch. URL-Konstruktor liefert automatisch Punycode.
  const fromEnv = getSiteUrlAscii();
  const fromVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl = fromEnv || fromVercel || new URL(req.url).origin;

  const url = `${baseUrl}/api/cron/${job}`;
  const start = Date.now();
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${cronSecret}` },
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Cron-Aufruf fehlgeschlagen: ${(err as Error).message}` },
      { status: 502 },
    );
  }

  const json = await upstream.json().catch(() => ({}));
  const durationMs = Date.now() - start;

  await audit(guard.userId, "cron.manual_trigger", "cron_job", null, {
    job,
    status_code: upstream.status,
    duration_ms: durationMs,
    upstream: json,
  });

  return NextResponse.json(
    {
      ok: upstream.ok,
      job,
      duration_ms: durationMs,
      ...json,
    },
    { status: upstream.ok ? 200 : 500 },
  );
}
