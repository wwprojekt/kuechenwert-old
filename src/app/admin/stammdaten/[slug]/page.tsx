import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CATALOGS, getCatalogBySlug } from "@/config/admin-catalogs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CatalogEditor } from "@/components/admin/catalog-editor";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return CATALOGS.map((c) => ({ slug: c.slug }));
}

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getCatalogBySlug(slug);
  if (!def) notFound();

  // Initial-Daten laden (Server-side für schnellen First Paint)
  let q = supabaseAdmin.from(def.table).select("*");
  for (const o of def.orderBy ?? []) {
    q = q.order(o.column, { ascending: o.ascending ?? true });
  }
  const { data: rows = [] } = await q;

  // FK-Optionen vorladen (für select-Felder vom Typ "fk")
  const fkOptionsMap: Record<string, { value: string; label: string }[]> = {};
  for (const f of def.fields) {
    if (f.type !== "fk" || !f.fkCatalog) continue;
    const fkDef = getCatalogBySlug(f.fkCatalog);
    if (!fkDef) continue;
    const { data: fkRows } = await supabaseAdmin
      .from(fkDef.table)
      .select("id, name")
      .order("name");
    fkOptionsMap[f.key] = (fkRows ?? []).map((r: { id: string; name: string }) => ({
      value: r.id,
      label: r.name,
    }));
  }

  return (
    <div>
      <Link
        href="/admin/stammdaten"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-700"
      >
        <ChevronLeft className="h-4 w-4" /> Zurück zur Übersicht
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">{def.label}</h1>
      {def.description && <p className="mt-1 text-sm text-ink-muted">{def.description}</p>}

      <div className="mt-8">
        <CatalogEditor
          slug={def.slug}
          fields={def.fields}
          initialRows={rows ?? []}
          fkOptionsMap={fkOptionsMap}
        />
      </div>
    </div>
  );
}
