import Link from "next/link";
import { Gavel, ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["draft", "active", "completed", "cancelled"];

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-accent-100 text-accent-700",
  completed: "bg-brand-100 text-brand-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AdminAuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let q = supabaseAdmin
    .from("auctions")
    .select(
      "id, lead_id, status, offer_price_eur, duration_hours, starts_at, ends_at, is_published, created_at, leads!inner(funnel_type, postal_code, city, first_name, last_name, tier)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && STATUS_FILTERS.includes(status)) q = q.eq("status", status);

  const { data: auctionsRaw } = await q;

  type AuctionRow = {
    id: string;
    lead_id: string;
    status: string;
    offer_price_eur: number | null;
    duration_hours: number | null;
    starts_at: string | null;
    ends_at: string | null;
    is_published: boolean;
    created_at: string;
    leads: {
      funnel_type: string;
      postal_code: string;
      city: string | null;
      first_name: string | null;
      last_name: string | null;
      tier: string;
    } | null;
  };
  const auctions = (auctionsRaw ?? []) as unknown as AuctionRow[];

  // Counts pro Status (parallel, ohne Filter)
  const counts: Record<string, number> = {};
  await Promise.all(
    STATUS_FILTERS.map(async (s) => {
      const { count } = await supabaseAdmin
        .from("auctions")
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      counts[s] = count ?? 0;
    }),
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <Gavel className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Auktionen</h1>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/auctions?status=${s}`}
            className={`card hover:-translate-y-0.5 hover:shadow-card-hover ${
              status === s ? "ring-2 ring-brand-700" : ""
            }`}
          >
            <div className={`mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[s]}`}>{s}</div>
            <div className="text-2xl font-bold text-ink">{counts[s] ?? 0}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs">
        <Link
          href="/admin/auctions"
          className={`rounded-full px-3 py-1 transition ${
            !status ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200"
          }`}
        >
          Alle anzeigen
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Funnel</th>
              <th className="px-4 py-3">PLZ / Stadt</th>
              <th className="px-4 py-3">Studio-Preis</th>
              <th className="px-4 py-3">Läuft bis</th>
              <th className="px-4 py-3">Erstellt</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auctions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">Keine Auktionen gefunden.</td></tr>
            )}
            {auctions.map((a) => {
              const l = a.leads;
              return (
                <tr key={a.id} className="hover:bg-surface-soft">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[a.status]}`}>
                      {a.status}
                    </span>
                    {a.is_published && <span className="ml-1 chip-success">live</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      l?.funnel_type === "b" ? "bg-brand-100 text-brand-800" : "bg-accent-50 text-accent-700"
                    }`}>
                      {(l?.funnel_type ?? "a").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{l?.postal_code} {l?.city ?? ""}</td>
                  <td className="px-4 py-3">
                    {a.offer_price_eur
                      ? `${Number(a.offer_price_eur).toLocaleString("de-DE")} €`
                      : <span className="text-ink-subtle">–</span>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {a.ends_at
                      ? new Date(a.ends_at).toLocaleString("de-DE")
                      : <span className="text-ink-subtle">noch nicht freigegeben</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-subtle">
                    {new Date(a.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/leads/${a.lead_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Lead öffnen <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
