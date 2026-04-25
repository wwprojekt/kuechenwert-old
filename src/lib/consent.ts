import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Aktuelle Version unserer Datenschutzerklärung. Bei Änderungen hochzählen. */
export const PRIVACY_POLICY_VERSION = "v1.0-2026-04";

export type ConsentSource =
  | "funnel_a"
  | "funnel_b"
  | "funnel_traumkueche"
  | "register_dealer";

export interface ConsentInput {
  /** "privacy_policy" | "marketing_call" | "marketing_email" */
  purpose: string;
  /** wahr, wenn der User aktiv eingewilligt hat */
  granted: boolean;
}

interface ConsentContext {
  leadId?: string | null;
  userId?: string | null;
  source: ConsentSource;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Schreibt mehrere Consent-Records in einer Transaktion (best-effort, nicht
 * blockierend für den Hauptflow). Loggt Fehler, wirft aber nicht.
 *
 * Nutzt Tabelle public.consent_records aus Migration 001 + 006:
 *   id, user_id, lead_id, purpose, granted, text_version,
 *   ip_address inet, user_agent, source, created_at
 */
export async function recordConsents(
  consents: ConsentInput[],
  ctx: ConsentContext,
): Promise<void> {
  if (!consents.length) return;

  const rows = consents.map((c) => ({
    user_id: ctx.userId ?? null,
    lead_id: ctx.leadId ?? null,
    purpose: c.purpose,
    granted: c.granted,
    text_version: PRIVACY_POLICY_VERSION,
    ip_address: ctx.ip ?? null,
    user_agent: ctx.userAgent ?? null,
    source: ctx.source,
  }));

  const { error } = await supabaseAdmin.from("consent_records").insert(rows);
  if (error) {
    console.error("[consent_records] insert failed:", error);
  }
}

/**
 * Extrahiert IP-Adresse aus Request-Headern (X-Forwarded-For, X-Real-IP).
 * Liefert null wenn nichts erkennbar.
 */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

/** SHA256-Hash eines beliebigen Strings (nicht aktuell genutzt, aber praktisch
 * für die spätere Beweisbarkeit konkret angezeigter Texte). */
export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}
