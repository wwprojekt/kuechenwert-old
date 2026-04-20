import Link from "next/link";
import { CATALOGS } from "@/config/admin-catalogs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Database, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StammdatenOverviewPage() {
  // Counts pro Tabelle holen (parallel)
  const counts = await Promise.all(
    CATALOGS.map(async (c) => {
      const { count } = await supabaseAdmin
        .from(c.table)
        .select("*", { count: "exact", head: true });
      return [c.slug, count ?? 0] as const;
    }),
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Database className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Stammdaten-Pflege</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Diese Listen werden in den Funnels angezeigt und erscheinen in den
        Auktions-Spezifikationen. Änderungen sind sofort live, beeinflussen aber
        nur neue Anfragen – keine bestehenden Auktionen.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOGS.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/stammdaten/${c.slug}`}
            className="group flex items-center justify-between rounded-card border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
          >
            <div>
              <div className="font-semibold text-ink">{c.label}</div>
              {c.description && (
                <div className="mt-1 text-xs text-ink-muted">{c.description}</div>
              )}
              <div className="mt-2 text-xs font-medium text-brand-700">
                {countMap[c.slug] ?? 0} Einträge
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-subtle transition group-hover:text-brand-700" />
          </Link>
        ))}
      </div>
    </div>
  );
}
