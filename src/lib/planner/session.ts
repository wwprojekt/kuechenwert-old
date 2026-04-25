/**
 * Planner-Session-Helper: CRUD auf planner_sessions + planner_renders.
 *
 * Alles laeuft ueber supabaseAdmin (Service-Role), da RLS auf diesen
 * Tabellen admin-only ist.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export interface PlannerSessionRow {
  id: string;
  session_token: string;
  lead_id: string | null;
  spec: Record<string, unknown>;
  current_render_id: string | null;
  price_range_min_cents: number | null;
  price_range_max_cents: number | null;
  expert_note: string | null;
  status: "active" | "completed" | "abandoned";
  contact_captured_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlannerRenderRow {
  id: string;
  session_id: string;
  version: number;
  prompt: string;
  negative_prompt: string | null;
  spec_snapshot: Record<string, unknown>;
  user_message: string | null;
  image_path: string | null;
  image_width: number | null;
  image_height: number | null;
  status: "pending" | "success" | "failed";
  fal_request_id: string | null;
  model_slug: string | null;
  generation_ms: number | null;
  cost_cents: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface UpsertParams {
  sessionToken: string;
  spec: Partial<TraumkuecheData>;
  ipAddress?: string;
  userAgent?: string;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
}

export async function upsertPlannerSession(
  params: UpsertParams,
): Promise<PlannerSessionRow> {
  const { sessionToken, spec, ipAddress, userAgent, utm } = params;

  // Existiert Session bereits?
  const existing = await getSessionByToken(sessionToken);

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("planner_sessions")
      .update({
        spec: { ...existing.spec, ...spec },
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(`[session] update failed: ${error.message}`);
    return data as PlannerSessionRow;
  }

  const { data, error } = await supabaseAdmin
    .from("planner_sessions")
    .insert({
      session_token: sessionToken,
      spec,
      ip_address: ipAddress ?? null,
      user_agent: userAgent ?? null,
      utm_source: utm?.source ?? null,
      utm_medium: utm?.medium ?? null,
      utm_campaign: utm?.campaign ?? null,
      utm_content: utm?.content ?? null,
      utm_term: utm?.term ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`[session] insert failed: ${error.message}`);
  return data as PlannerSessionRow;
}

export async function getSessionByToken(
  token: string,
): Promise<PlannerSessionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("planner_sessions")
    .select("*")
    .eq("session_token", token)
    .maybeSingle();

  if (error) {
    console.warn("[session] getByToken error:", error);
    return null;
  }
  return (data as PlannerSessionRow) ?? null;
}

export async function getSessionById(id: string): Promise<PlannerSessionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("planner_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return (data as PlannerSessionRow) ?? null;
}

export async function createRender(params: {
  sessionId: string;
  prompt: string;
  negativePrompt: string;
  specSnapshot: Record<string, unknown>;
  modelSlug: string;
}): Promise<PlannerRenderRow> {
  // Naechste Version ermitteln
  const { data: maxRow } = await supabaseAdmin
    .from("planner_renders")
    .select("version")
    .eq("session_id", params.sessionId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = ((maxRow as { version?: number } | null)?.version ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("planner_renders")
    .insert({
      session_id: params.sessionId,
      version: nextVersion,
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      spec_snapshot: params.specSnapshot,
      model_slug: params.modelSlug,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(`[render] insert failed: ${error.message}`);
  return data as PlannerRenderRow;
}

export async function markRenderRunning(
  renderId: string,
  falRequestId: string,
): Promise<void> {
  await supabaseAdmin
    .from("planner_renders")
    .update({ fal_request_id: falRequestId })
    .eq("id", renderId);
}

export async function markRenderSuccess(params: {
  renderId: string;
  sessionId: string;
  imagePath: string;
  width: number;
  height: number;
  generationMs: number;
  costCents: number;
}): Promise<void> {
  const now = new Date().toISOString();

  await supabaseAdmin
    .from("planner_renders")
    .update({
      status: "success",
      image_path: params.imagePath,
      image_width: params.width,
      image_height: params.height,
      generation_ms: params.generationMs,
      cost_cents: params.costCents,
      completed_at: now,
    })
    .eq("id", params.renderId);

  await supabaseAdmin
    .from("planner_sessions")
    .update({ current_render_id: params.renderId, updated_at: now })
    .eq("id", params.sessionId);
}

export async function markRenderFailed(
  renderId: string,
  errorMessage: string,
): Promise<void> {
  await supabaseAdmin
    .from("planner_renders")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 2000),
      completed_at: new Date().toISOString(),
    })
    .eq("id", renderId);
}

export async function getRender(renderId: string): Promise<PlannerRenderRow | null> {
  const { data } = await supabaseAdmin
    .from("planner_renders")
    .select("*")
    .eq("id", renderId)
    .maybeSingle();
  return (data as PlannerRenderRow) ?? null;
}

export async function getRendersForSession(sessionId: string): Promise<PlannerRenderRow[]> {
  const { data } = await supabaseAdmin
    .from("planner_renders")
    .select("*")
    .eq("session_id", sessionId)
    .order("version", { ascending: true });
  return (data as PlannerRenderRow[] | null) ?? [];
}

export async function updateSessionPriceRange(params: {
  sessionId: string;
  minCents: number;
  maxCents: number;
  expertNote: string;
}): Promise<void> {
  await supabaseAdmin
    .from("planner_sessions")
    .update({
      price_range_min_cents: params.minCents,
      price_range_max_cents: params.maxCents,
      expert_note: params.expertNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.sessionId);
}

export async function saveContactOnSession(params: {
  sessionId: string;
  contact: Record<string, unknown>;
}): Promise<void> {
  const session = await getSessionById(params.sessionId);
  if (!session) throw new Error("[session] not found");

  await supabaseAdmin
    .from("planner_sessions")
    .update({
      spec: { ...session.spec, contact: params.contact },
      contact_captured_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.sessionId);
}

export async function getSignedImageUrl(imagePath: string, expiresInSec = 3600): Promise<string | null> {
  if (!imagePath) return null;
  const { data, error } = await supabaseAdmin.storage
    .from("lead-files")
    .createSignedUrl(imagePath, expiresInSec);
  if (error) {
    console.warn("[session] signed url failed:", error);
    return null;
  }
  return data?.signedUrl ?? null;
}
