/**
 * Rate-Limiting via Supabase-RPC `rate_limit_increment`.
 *
 * Usage:
 *   const rl = await checkRateLimit(`ip:${ip}`, 3600, 20);
 *   if (!rl.allowed) return NextResponse.json({ error }, { status: 429 });
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

export async function checkRateLimit(
  key: string,
  windowSeconds: number,
  limit: number,
): Promise<RateLimitResult> {
  const { data, error } = await supabaseAdmin.rpc("rate_limit_increment", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_limit: limit,
  });

  if (error) {
    console.warn("[rate-limit] RPC failed, fail-open:", error);
    return {
      allowed: true,
      currentCount: 0,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
      retryAfterSeconds: 0,
    };
  }

  type Row = { current_count: number; allowed: boolean; reset_at: string };
  const rows = data as Row[] | null;
  const row = rows?.[0];
  if (!row) {
    return {
      allowed: true,
      currentCount: 0,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
      retryAfterSeconds: 0,
    };
  }

  const resetAt = new Date(row.reset_at);
  const retryAfter = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));

  return {
    allowed: row.allowed,
    currentCount: row.current_count,
    resetAt,
    retryAfterSeconds: retryAfter,
  };
}

/**
 * Extrahiert eine Client-IP aus Next-Request-Headers.
 * Dokploy/Traefik setzt X-Forwarded-For; wir nehmen das erste Glied.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
