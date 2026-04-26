/**
 * GET /api/planner/diag
 *
 * Diagnose-Endpunkt: Zeigt welche Planner-relevanten Env-Vars
 * der laufende Container _aktuell_ sieht. Wir geben nur
 * "present: true/false" zurueck - niemals Werte - und einen
 * kurzen Hash-Prefix, um Key-Rotationen identifizieren zu koennen.
 *
 * Sicher: Keine Secrets werden preisgegeben. Kein Schreibzugriff.
 */

import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function keyFingerprint(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return createHash("sha256").update(trimmed).digest("hex").slice(0, 8);
}

export async function GET() {
  const checks = {
    NODE_ENV: process.env.NODE_ENV ?? null,
    FAL_KEY: {
      present: Boolean(process.env.FAL_KEY?.trim()),
      fp: keyFingerprint(process.env.FAL_KEY),
    },
    OPENAI_API_KEY: {
      present: Boolean(process.env.OPENAI_API_KEY?.trim()),
      fp: keyFingerprint(process.env.OPENAI_API_KEY),
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      fp: keyFingerprint(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    NEXT_PUBLIC_SUPABASE_URL: {
      present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    },
    TURNSTILE_SECRET_KEY: {
      present: Boolean(process.env.TURNSTILE_SECRET_KEY?.trim()),
    },
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: {
      present: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()),
    },
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    PLANNER_MOCK: process.env.PLANNER_MOCK ?? null,
    FAL_MOCK: process.env.FAL_MOCK ?? null,
    buildTimestamp: process.env.BUILD_TIMESTAMP ?? null,
    serverTime: new Date().toISOString(),
  };

  return NextResponse.json(checks, {
    headers: { "cache-control": "no-store" },
  });
}
