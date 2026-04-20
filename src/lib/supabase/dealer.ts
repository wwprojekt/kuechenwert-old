import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface DealerContext {
  userId: string;
  dealer: {
    id: string;
    company_name: string;
    is_verified: boolean;
    is_active: boolean;
    wallet_balance_cents: number;
    plan: string;
    postal_code: string;
    service_radius_km: number;
  };
}

/**
 * Dealer-Guard für Server-Components.
 * Bei fehlendem Login → /auth/login mit ?next=...
 * Bei falscher Rolle → / (Startseite)
 * Bei nicht freigeschaltetem Dealer → /dealer/pending
 */
export async function requireDealer(currentPath?: string): Promise<DealerContext> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : "";
    redirect(`/auth/login${next}`);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "dealer" && profile?.role !== "admin") redirect("/");

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, is_verified, is_active, wallet_balance_cents, plan, postal_code, service_radius_km")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dealer) {
    // Profil ist dealer aber kein dealers-Record? -> Reg unvollständig
    redirect("/auth/register-dealer");
  }
  if (!dealer.is_verified || !dealer.is_active) {
    redirect("/auth/pending");
  }

  return { userId: user.id, dealer };
}

export type DealerApiResult =
  | { ok: true; userId: string; dealerId: string; isVerified: boolean }
  | { ok: false; response: NextResponse };

/**
 * Dealer-Guard für API-Routes.
 */
export async function requireDealerApi(verifiedOnly = true): Promise<DealerApiResult> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "dealer" && profile?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("id, is_verified, is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!dealer) {
    return { ok: false, response: NextResponse.json({ error: "Dealer-Profil fehlt" }, { status: 404 }) };
  }
  if (verifiedOnly && (!dealer.is_verified || !dealer.is_active)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Dealer noch nicht freigeschaltet" },
        { status: 403 },
      ),
    };
  }
  return { ok: true, userId: user.id, dealerId: dealer.id, isVerified: dealer.is_verified };
}
