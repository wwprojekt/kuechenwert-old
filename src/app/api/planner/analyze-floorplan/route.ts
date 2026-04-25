/**
 * POST /api/planner/analyze-floorplan
 *
 * Multipart-Upload: { file, sessionToken, turnstileToken? }
 *
 * Speichert die Datei in `lead-files/planner/{sessionId}/floorplan-{ts}.{ext}`,
 * erzeugt eine signierte URL, schickt sie an ein Vision-LLM und persistiert
 * das extrahierte Ergebnis in `planner_sessions.spec.floorplan`.
 *
 * Fallback: Wenn die Analyse fehlschlaegt oder confidence zu niedrig ist,
 * lassen wir die Session-Spec unveraendert und melden dem Client
 * `{ usable: false }` zurueck - der Client zeigt dann den manuellen
 * Form-Picker an.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getSessionByToken,
  replaceSessionSpec,
  getSignedImageUrl,
  upsertPlannerSession,
} from "@/lib/planner/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/planner/rate-limit";
import { looksLikeBot, verifyTurnstile } from "@/lib/planner/turnstile";
import { analyzeFloorplanImage } from "@/lib/planner/floorplan-analysis";
import { clampTextLength } from "@/lib/planner/safe-text";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  if (looksLikeBot(userAgent)) {
    return NextResponse.json({ error: "Bot-Zugriff blockiert." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart" }, { status: 400 });
  }

  const sessionToken = form.get("sessionToken");
  const turnstileToken = form.get("turnstileToken");
  const file = form.get("file");

  if (typeof sessionToken !== "string" || sessionToken.length < 8) {
    return NextResponse.json({ error: "sessionToken fehlt" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file fehlt" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Datei zu gross (max 8 MB)" }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      {
        error: "Dateityp nicht unterstuetzt. Bitte JPG, PNG oder WebP hochladen.",
        note: "PDFs bitte vorher als Bild exportieren.",
      },
      { status: 415 },
    );
  }

  const tsResult = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : undefined,
    ip,
  );
  if (!tsResult.success && !tsResult.skipped) {
    return NextResponse.json(
      { error: "Bot-Schutz fehlgeschlagen.", errors: tsResult.errors },
      { status: 403 },
    );
  }

  // Rate-Limit: Vision-Calls sind teuer, deshalb konservativ
  const [ipLimit, sessionLimit] = await Promise.all([
    checkRateLimit(`planner-floorplan:ip:${ip}`, 3600, 10),
    checkRateLimit(`planner-floorplan:session:${sessionToken}`, 3600, 3),
  ]);
  if (!ipLimit.allowed || !sessionLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds, sessionLimit.retryAfterSeconds);
    return NextResponse.json(
      { error: "Rate-Limit erreicht.", retryAfterSeconds: retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // Session holen oder anlegen (User hat evtl. vor Schritt-1 den Grundriss hochgeladen)
  let session = await getSessionByToken(sessionToken);
  if (!session) {
    session = await upsertPlannerSession({
      sessionToken,
      spec: {},
      ipAddress: ip,
      userAgent,
    });
  }

  // 1) Datei in Storage
  const ext = extFromMime(file.type);
  const path = `planner/${session.id}/floorplan-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await supabaseAdmin.storage
    .from("lead-files")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadErr) {
    return NextResponse.json(
      { error: "Upload fehlgeschlagen", detail: clampTextLength(uploadErr.message, 300) },
      { status: 500 },
    );
  }

  // 2) Signed URL (10 min reicht fuer LLM-Pull)
  const signed = await getSignedImageUrl(path, 600);
  if (!signed) {
    return NextResponse.json(
      { error: "Signed URL konnte nicht erstellt werden." },
      { status: 500 },
    );
  }

  // 3) LLM-Analyse
  let analysis;
  try {
    analysis = await analyzeFloorplanImage({ imageUrl: signed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[planner/analyze-floorplan] LLM failed:", msg);
    return NextResponse.json(
      {
        error: "Grundriss-Analyse fehlgeschlagen",
        detail: msg,
        filePath: path,
        usable: false,
      },
      { status: 502 },
    );
  }

  // 4) Spec updaten (merge, bei usable auch kitchenForm)
  const currentSpec = session.spec as unknown as TraumkuecheData;
  const nextSpec: Record<string, unknown> = {
    ...currentSpec,
    floorplan: {
      filePath: path,
      analyzedAt: new Date().toISOString(),
      analysis,
    },
  };
  if (analysis.usable && analysis.kitchenForm) {
    nextSpec.kitchenForm = analysis.kitchenForm;
  }

  try {
    await replaceSessionSpec({ sessionId: session.id, spec: nextSpec });
  } catch (e) {
    console.error("[planner/analyze-floorplan] spec write failed:", e);
  }

  return NextResponse.json({
    sessionId: session.id,
    filePath: path,
    analysis,
    appliedForm: analysis.usable ? analysis.kitchenForm : null,
  });
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}
