import Link from "next/link";
import { Inbox, Gavel, Trophy, Clock } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DealerDashboardPage() {
  const ctx = await requireDealer("/dealer/dashboard");
  const { dealer } = ctx;

  const [
    { count: availableLeads },
    { count: purchasedLeads },
    { count: activeAuctions },
    { count: ownBids },
    { count: wonAuctions },
  ] = await Promise.all([
    // Funnel A „qualified" (für Lead-Marketplace) – TODO: nach Region/Brand filtern
    supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("funnel_type", "a")
      .in("status", ["qualified", "matched"]),
    supabaseAdmin
      .from("match_candidates")
      .select("*", { count: "exact", head: true })
      .eq("dealer_id", dealer.id)
      .eq("is_purchased", true),
    supabaseAdmin
      .from("auctions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("is_published", true),
    supabaseAdmin
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("dealer_id", dealer.id),
    supabaseAdmin
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("dealer_id", dealer.id)
      .eq("is_winning", true),
  ]);

  const { data: latestAuctionsRaw } = await supabaseAdmin
    .from("auctions")
    .select("id, lead_id, offer_price_eur, ends_at, status, leads ( postal_code, city, tier )")
    .eq("status", "active")
    .eq("is_published", true)
    .order("ends_at", { ascending: true })
    .limit(5);

  type LatestAuctionRow = {
    id: string;
    lead_id: string;
    offer_price_eur: number | null;
    ends_at: string | null;
    status: string;
    leads: {
      postal_code: string;
      city: string | null;
      tier: string;
    } | null;
  };
  const latestAuctions = (latestAuctionsRaw ?? []) as unknown as LatestAuctionRow[];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Willkommen zurück, {dealer.company_name}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Aktueller Wallet-Stand: <strong className="text-ink">
          {(dealer.wallet_balance_cents / 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} €
        </strong>
        {" · "}Plan: <strong className="text-ink">{dealer.plan}</strong>
        {" · "}Service-Radius: <strong className="text-ink">{dealer.service_radius_km} km</strong>
      </p>

      {/* KPI cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={<Inbox className="h-5 w-5" />} label="Verfügbare Leads" value={availableLeads ?? 0} href="/dealer/leads" tone="brand" />
        <KpiCard icon={<Inbox className="h-5 w-5" />} label="Gekaufte Leads" value={purchasedLeads ?? 0} href="/dealer/leads?filter=purchased" />
        <KpiCard icon={<Gavel className="h-5 w-5" />} label="Aktive Auktionen" value={activeAuctions ?? 0} href="/dealer/auctions" tone="accent" />
        <KpiCard icon={<Clock className="h-5 w-5" />} label="Eigene Gebote" value={ownBids ?? 0} href="/dealer/auctions?filter=own" />
        <KpiCard icon={<Trophy className="h-5 w-5" />} label="Gewonnen" value={wonAuctions ?? 0} href="/dealer/auctions?filter=won" tone="accent" />
      </div>

      {/* Latest auctions */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Aktuelle Auktionen, die bald enden</h2>
          <Link href="/dealer/auctions" className="text-sm font-semibold text-brand-700 hover:underline">
            Alle ansehen →
          </Link>
        </div>
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
              <tr>
                <th className="px-4 py-3">PLZ</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Studio-Preis</th>
                <th className="px-4 py-3">Endet</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestAuctions.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Aktuell keine offenen Auktionen.</td></tr>
              )}
              {latestAuctions.map((a) => {
                const lead = a.leads;
                return (
                  <tr key={a.id} className="hover:bg-surface-soft">
                    <td className="px-4 py-3">{lead?.postal_code} {lead?.city ?? ""}</td>
                    <td className="px-4 py-3"><span className="chip">{lead?.tier ?? "–"}</span></td>
                    <td className="px-4 py-3">
                      {a.offer_price_eur ? `${Number(a.offer_price_eur).toLocaleString("de-DE")} €` : "–"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {a.ends_at ? new Date(a.ends_at).toLocaleString("de-DE") : "–"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dealer/auctions/${a.id}`} className="text-xs font-semibold text-brand-700 hover:underline">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
  tone?: "brand" | "accent";
}) {
  const colorMap: Record<string, string> = {
    brand: "text-brand-700",
    accent: "text-accent-700",
  };
  return (
    <Link
      href={href}
      className="card transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md bg-surface-soft ${tone ? colorMap[tone] : "text-ink-muted"}`}>
        {icon}
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-ink-subtle">{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </Link>
  );
}
