import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Generiert eine zeitlich begrenzte Signed-URL für ein Lead-File und
 * leitet den User darauf weiter. Audit-tauglich (file_id wird geloggt).
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id, fileId } = await ctx.params;

  const { data: file, error } = await supabaseAdmin
    .from("lead_files")
    .select("id, lead_id, file_url, file_name")
    .eq("id", fileId)
    .eq("lead_id", id)
    .single();
  if (error || !file) {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }

  const { data: signed, error: sErr } = await supabaseAdmin.storage
    .from("lead-files")
    .createSignedUrl(file.file_url, 60 * 5); // 5 Minuten
  if (sErr || !signed) {
    return NextResponse.json({ error: sErr?.message ?? "Signed-URL fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
