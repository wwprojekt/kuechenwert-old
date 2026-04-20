import Link from "next/link";
import { Gavel, ChevronRight, Trophy } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DealerAuctionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "active" | "own" | "won" | "ended" }>;
}) {
  const { filter = "active" } = await searchParams;
  const ctx = await requireDealer("/dealer/auctions");

  type Row = Record<string, unknown> & {
    id: string;
    offer_price_eur: number | null;
    ends_at: string | null;
    status: string;
    leads: { postal_code: string; city: string | null; tier: string; kitchen_form: string | null } | null;
    own_low?: number | null;
    bid_count?: number;
  };

  let rows: Row[] = [];

  if (filter === "won") {
    const { data: bids } = await supabaseAdmin
      .from("bids")
      .select("id, price_eur, auction:auctions(id, ends_at, status, offer_price_eur, leads(postal_code, city, tier, kitchen_form))")
      .eq("dealer_id", ctx.dealer.id)
      .eq("is_winning", true)
      .order("created_at", { ascending: false });
    rows = (bids ?? []).map((b) => {
      const a = (b as unknown as { auction: Record<string, unknown> | null }).auction;
      return {
        ...((a ?? {}) as Record<string, unknown>),
        own_low: Number((b as { price_eur: number }).price_eur),
      } as Row;
    });
  } else if (filter === "own") {
    const { data: bids } = await supabaseAdmin
      .from("bids")
      .select("auction_id")
      .eq("dealer_id", ctx.dealer.id);
    const ids = Array.from(new Set((bids ?? []).map((b) => b.auction_id)));
    if (ids.length > 0) {
      const { data: aucs } = await supabaseAdmin
        .from("auctions")
        .select("id, status, offer_price_eur, ends_at, leads(postal_code, city, tier, kitchen_form)")
        .in("id", ids)
        .order("ends_at", { ascending: true });
      rows = (aucs ?? []) as unknown as Row[];
    }
  } else {
    let q = supabaseAdmin
      .from("auctions")
      .select("id, status, offer_price_eur, ends_at, leads!inner(postal_code, city, tier, kitchen_form, funnel_type)")
      .eq("is_published", true)
      .order("ends_at", { ascending: true })
      .limit(100);
    if (filter === "ended") {
      q = q.in("status", ["completed", "cancelled"]);
    } else {
      q = q.eq("status", "active");
    }
    const { data } = await q;
    rows = (data ?? []) as unknown as Row[];
  }

  // Bid-Count für jede Auktion (best effort)
  await Promise.all(
    rows.map(async (r) => {
      const { count } = await supabaseAdmin
        .from("bids")
        .select("*", { count: "exact", head: true })
        .eq("auction_id", r.id);
      r.bid_count = count ?? 0;
    }),
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <Gavel className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Auktionen (Funnel B)</h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        72-Stunden-Rückwärtsauktionen bestehender Kunden-Angebote. Ihr Gebot ist
        verbindlich. Niedrigstes Gebot bei Auktionsende gewinnt.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <FilterChip href="/dealer/auctions" active={filter === "active"} label="Aktiv" />
        <FilterChip href="/dealer/auctions?filter=own" active={filter === "own"} label="Eigene Gebote" />
        <FilterChip href="/dealer/auctions?filter=won" active={filter === "won"} label="Gewonnen" />
        <FilterChip href="/dealer/auctions?filter=ended" active={filter === "ended"} label="Beendet" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">PLZ</th>
              <th className="px-4 py-3">Stil</th>
              <th className="px-4 py-3">Studio-Preis</th>
              <th className="px-4 py-3">Gebote</th>
              <th className="px-4 py-3">Endet</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">Keine Auktionen.</td></tr>
            )}
            {rows.map((a) => {
              const isWon = filter === "won";
              return (
                <tr key={a.id} className="hover:bg-surface-soft">
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                    {isWon && <span className="ml-2 inline-flex items-center gap-1 text-accent-700"><Trophy className="h-3 w-3" /> Sieger</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.leads?.postal_code} {a.leads?.city ?? ""}</td>
                  <td className="px-4 py-3 text-xs">{a.leads?.kitchen_form ?? "–"}</td>
                  <td className="px-4 py-3 text-xs">
                    {a.offer_price_eur ? `${Number(a.offer_price_eur).toLocaleString("de-DE")} €` : "–"}
                  </td>
                  <td className="px-4 py-3 text-xs">{a.bid_count ?? 0}</td>
                  <td className="px-4 py-3 text-xs">{a.ends_at ? new Date(a.ends_at).toLocaleString("de-DE") : "–"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dealer/auctions/${a.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                      Detail <ChevronRight className="h-3 w-3" />
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

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1 transition ${active ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"}`}>
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-accent-100 text-accent-700",
    draft: "bg-amber-100 text-amber-700",
    completed: "bg-slate-100 text-slate-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] ?? "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
