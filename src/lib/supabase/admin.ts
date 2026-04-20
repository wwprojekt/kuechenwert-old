import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Service-Role-Client – nur in API-Routes/Server-Code verwenden.
 * Umgeht RLS, daher IMMER hinter einer requireAdmin()-Prüfung benutzen.
 *
 * SECURITY: Zur Laufzeit wird hart gefailt, wenn der Service-Role-Key in
 * Production fehlt. Im Dev-Mode warnen wir und fallen auf den Anon-Key zurück.
 *
 * LAZY: Der Client wird erst beim ersten Zugriff erzeugt, damit `next build`
 * (collecting page data) nicht throwt, falls dort die Env nicht injiziert ist.
 */

let _client: SupabaseClient | null = null;

function buildClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "FATAL: NEXT_PUBLIC_SUPABASE_URL fehlt – Supabase-Client kann nicht erzeugt werden.",
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  let key: string;
  if (serviceKey) {
    key = serviceKey;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FATAL: SUPABASE_SERVICE_ROLE_KEY fehlt in Production. " +
        "Admin-Operationen würden mit Anon-Key (RLS-eingeschränkt) brechen.",
    );
  } else {
    console.warn(
      "[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY fehlt – Fallback auf Anon-Key (nur Dev).",
    );
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function getClient(): SupabaseClient {
  if (!_client) _client = buildClient();
  return _client;
}

// Proxy: alle Aufrufe leiten erst beim Zugriff den echten Client weiter.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

export type AdminGuardResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Stellt sicher, dass der eingeloggte User die Admin-Rolle hat.
 * In API-Routes verwenden:
 *
 *   const guard = await requireAdmin();
 *   if (!guard.ok) return guard.response;
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, userId: user.id };
}

/**
 * Audit-Log-Eintrag schreiben. Niemals werfen – nur loggen.
 */
export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  const { error } = await supabaseAdmin.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
  if (error) console.error("audit_log insert failed:", error);
}
