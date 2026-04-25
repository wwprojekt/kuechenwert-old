/**
 * GET /api/planner/renders/[id]
 *
 * Poll-Endpoint: liefert aktuellen Status eines Renders.
 * Bei success wird eine signed-URL zum Bild zurueckgegeben.
 * Bei completed wird zusaetzlich die Preis-Range aus der Session geladen.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getRender, getSessionById, getSignedImageUrl } from "@/lib/planner/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  }

  const render = await getRender(id);
  if (!render) {
    return NextResponse.json({ error: "Render nicht gefunden" }, { status: 404 });
  }

  if (render.status === "pending") {
    return NextResponse.json({
      status: "pending",
      renderId: render.id,
      sessionId: render.session_id,
      version: render.version,
    });
  }

  if (render.status === "failed") {
    return NextResponse.json({
      status: "failed",
      renderId: render.id,
      sessionId: render.session_id,
      error: render.error_message ?? "Unbekannter Fehler",
    });
  }

  // Success
  const signedUrl = render.image_path
    ? await getSignedImageUrl(render.image_path, 3600)
    : null;

  const session = await getSessionById(render.session_id);

  return NextResponse.json({
    status: "success",
    renderId: render.id,
    sessionId: render.session_id,
    sessionToken: session?.session_token,
    version: render.version,
    imageUrl: signedUrl,
    imageWidth: render.image_width,
    imageHeight: render.image_height,
    generationMs: render.generation_ms,
    priceRange:
      session?.price_range_min_cents != null && session?.price_range_max_cents != null
        ? {
            minCents: session.price_range_min_cents,
            maxCents: session.price_range_max_cents,
          }
        : null,
    expertNote: session?.expert_note ?? null,
  });
}
