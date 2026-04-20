import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";
import { getCatalogBySlug, type CatalogField } from "@/config/admin-catalogs";

export const runtime = "nodejs";

/**
 * Whitelist + Cast Felder gegen die Catalog-Definition.
 * Verhindert dass beliebige Spalten geschrieben werden.
 */
function sanitize(
  body: Record<string, unknown>,
  fields: CatalogField[],
): { values: Record<string, unknown>; error?: string } {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    if (!(f.key in body)) continue;
    const raw = body[f.key];

    if (raw === "" || raw === null || raw === undefined) {
      if (f.required) return { values, error: `Feld „${f.label}" ist Pflicht` };
      values[f.key] = null;
      continue;
    }

    switch (f.type) {
      case "number": {
        const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
        if (!Number.isFinite(n)) return { values, error: `„${f.label}" muss eine Zahl sein` };
        values[f.key] = n;
        break;
      }
      case "boolean": {
        values[f.key] = raw === true || raw === "true" || raw === 1 || raw === "1";
        break;
      }
      case "select": {
        const allowed = f.options?.map((o) => o.value) ?? [];
        if (!allowed.includes(String(raw))) {
          return { values, error: `„${f.label}": ungültiger Wert` };
        }
        values[f.key] = String(raw);
        break;
      }
      case "fk":
      case "text":
      default:
        values[f.key] = String(raw);
    }
  }
  return { values };
}

// ---------- GET (list) ----------
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { slug } = await ctx.params;
  const def = getCatalogBySlug(slug);
  if (!def) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  let q = supabaseAdmin.from(def.table).select("*");
  for (const o of def.orderBy ?? []) {
    q = q.order(o.column, { ascending: o.ascending ?? true });
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

// ---------- POST (create) ----------
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { slug } = await ctx.params;
  const def = getCatalogBySlug(slug);
  if (!def) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const { values, error } = sanitize(body, def.fields);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data, error: insErr } = await supabaseAdmin
    .from(def.table)
    .insert(values)
    .select("*")
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  await audit(guard.userId, "catalog.create", def.table, data?.id ?? null, { values });
  return NextResponse.json({ row: data });
}

// ---------- PATCH (update) – ?id=... ----------
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { slug } = await ctx.params;
  const def = getCatalogBySlug(slug);
  if (!def) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });

  const body = (await req.json()) as Record<string, unknown>;
  const { values, error } = sanitize(body, def.fields);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data, error: updErr } = await supabaseAdmin
    .from(def.table)
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  await audit(guard.userId, "catalog.update", def.table, id, { values });
  return NextResponse.json({ row: data });
}

// ---------- DELETE – ?id=... ----------
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { slug } = await ctx.params;
  const def = getCatalogBySlug(slug);
  if (!def) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id" }, { status: 400 });

  const { error: delErr } = await supabaseAdmin.from(def.table).delete().eq("id", id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  await audit(guard.userId, "catalog.delete", def.table, id, {});
  return NextResponse.json({ ok: true });
}
