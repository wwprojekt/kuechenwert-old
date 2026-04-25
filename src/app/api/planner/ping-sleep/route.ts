/**
 * GET /api/planner/ping-sleep?ms=<n>
 *
 * Diagnose-Route fuer Traefik/Dokploy-Timeouts. Sleept auf dem Server
 * fuer die angegebene Dauer (max 90s) und antwortet dann 200.
 *
 * Ziel: Pruefen, dass die Dokploy/Traefik-Konfiguration lange laufende
 * Responses NICHT abschneidet, bevor der Fal-Polling-Pfad in Production
 * Last bekommt.
 *
 *   curl -s -o /dev/null -w "%{http_code} %{time_total}\n" \
 *        https://<domain>/api/planner/ping-sleep?ms=45000
 *
 * Sicherheit: Nur fuer Ops. Nicht verlinkt, keine Mutation, klar begrenzt.
 * In Production zusaetzlich ueber Cloudflare-WAF drosseln.
 */

import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_SLEEP_MS = 90_000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const msRaw = url.searchParams.get("ms") ?? "1000";
  const parsed = Number.parseInt(msRaw, 10);
  const ms = Number.isFinite(parsed) ? Math.max(0, Math.min(parsed, MAX_SLEEP_MS)) : 1000;

  const startedAt = Date.now();
  await new Promise((resolve) => setTimeout(resolve, ms));
  const elapsed = Date.now() - startedAt;

  return NextResponse.json(
    { ok: true, requestedMs: ms, elapsedMs: elapsed },
    { headers: { "cache-control": "no-store" } },
  );
}
