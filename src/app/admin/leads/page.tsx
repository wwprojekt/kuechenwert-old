import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Inbox, ChevronRight, AlertCircle, CheckCircle2, Gavel, ShoppingCart } from "lucide-react";
import { LeadQuickActions } from "@/components/admin/lead-quick-actions";

export const dynamic = "force-dynamic";

const TIER_COLOR: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  premium: "bg-amber-100 text-amber-700",
  qualified: "bg-blue-100 text-blue-700",
  standard: "bg-slate-100 text-slate-700",
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string; status?: string }>;
}) {
  const { funnel, status } = await searchParams;

  let q = supabaseAdmin
    .from("leads")
    .select(
      "id, status, tier, score, postal_code, city, kitchen_form, budget_midpoint, has_existing_offer, existing_offer_price_cents, first_name, last_name, email, phone, created_at, funnel_type",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (funnel === "a" || funnel === "b" || funnel === "traumkueche") q = q.eq("funnel_type", funnel);
  if (status) q = q.eq("status", status);

  const { data: leadsRaw } = await q;
  const leads = leadsRaw ?? [];

  // Triage-Counter (parallel) – immer ueber alle Funnel
  const [newCount, qualifiedCount, inAuctionCount, soldCount, leadIdsForAuction] = await Promise.all([
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }).eq("status", "qualified"),
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }).eq("status", "in_auction"),
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }).eq("status", "sold"),
    // Welche der gerade angezeigten Leads haben schon eine Auktion?
    leads.length > 0
      ? supabaseAdmin
          .from("auctions")
          .select("lead_id")
          .in("lead_id", leads.map((l) => l.id))
      : Promise.resolve({ data: [] as { lead_id: string }[] }),
  ]);
  const auctionLeadIds = new Set(
    (leadIdsForAuction.data ?? []).map((r) => r.lead_id),
  );

  const triageCounts = {
    new: newCount.count ?? 0,
    qualified: qualifiedCount.count ?? 0,
    in_auction: inAuctionCount.count ?? 0,
    sold: soldCount.count ?? 0,
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Inbox className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Lead-Queue</h1>
      </div>

      {/* Triage-Counter */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TriageCard
          icon={AlertCircle}
          tone="amber"
          label="Wartet auf Review"
          count={triageCounts.new}
          href="/admin/leads?status=new"
          active={status === "new"}
          hint="Standard-Tier-Leads – manuell qualifizieren"
        />
        <TriageCard
          icon={CheckCircle2}
          tone="accent"
          label="Live im Marketplace"
          count={triageCounts.qualified}
          href="/admin/leads?status=qualified"
          active={status === "qualified"}
          hint="Sichtbar fuer Haendler"
        />
        <TriageCard
          icon={Gavel}
          tone="brand"
          label="In Auktion"
          count={triageCounts.in_auction}
          href="/admin/leads?status=in_auction"
          active={status === "in_auction"}
          hint="Funnel-B Auktionen aktiv"
        />
        <TriageCard
          icon={ShoppingCart}
          tone="slate"
          label="Verkauft"
          count={triageCounts.sold}
          href="/admin/leads?status=sold"
          active={status === "sold"}
          hint="Lead an Haendler uebergeben"
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold uppercase text-ink-subtle">Funnel:</span>
        <FilterChip href="/admin/leads" active={!funnel} label="Alle" />
        <FilterChip href="/admin/leads?funnel=a" active={funnel === "a"} label="Funnel A" />
        <FilterChip href="/admin/leads?funnel=b" active={funnel === "b"} label="Funnel B" />
        <FilterChip
          href="/admin/leads?funnel=traumkueche"
          active={funnel === "traumkueche"}
          label="KI-Traumkueche"
        />
        <span className="ml-4 font-semibold uppercase text-ink-subtle">Status:</span>
        {["new", "qualified", "in_auction", "sold", "disqualified"].map((s) => (
          <FilterChip
            key={s}
            href={`/admin/leads?${funnel ? `funnel=${funnel}&` : ""}status=${s}`}
            active={status === s}
            label={s}
          />
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Funnel</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">PLZ</th>
              <th className="px-4 py-3">Budget / Studio-Preis</th>
              <th className="px-4 py-3">Kontakt</th>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-ink-muted">Keine Leads gefunden.</td></tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface-soft">
                <td className="px-4 py-3">
                  <FunnelCell type={l.funnel_type} />
                </td>
                <td className="px-4 py-3"><span className="chip">{l.status}</span></td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLOR[l.tier] ?? "bg-slate-100"}`}>{l.tier}</span>
                </td>
                <td className="px-4 py-3">{l.score}</td>
                <td className="px-4 py-3">{l.postal_code} {l.city ?? ""}</td>
                <td className="px-4 py-3">
                  {l.funnel_type === "b" && l.existing_offer_price_cents
                    ? `${(Number(l.existing_offer_price_cents) / 100).toLocaleString("de-DE")} € (Studio)`
                    : l.budget_midpoint
                      ? `${l.budget_midpoint.toLocaleString("de-DE")} €`
                      : "–"}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{l.first_name} {l.last_name}</div>
                  <div className="text-xs text-ink-subtle">{l.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-ink-subtle">
                  {new Date(l.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <LeadQuickActions
                      leadId={l.id}
                      status={l.status}
                      funnelType={l.funnel_type}
                      hasAuction={auctionLeadIds.has(l.id)}
                    />
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Öffnen <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunnelCell({ type }: { type: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    a: { cls: "bg-accent-50 text-accent-700", label: "A" },
    b: { cls: "bg-brand-100 text-brand-800", label: "B" },
    traumkueche: { cls: "bg-purple-100 text-purple-800", label: "KI" },
  };
  const t = (type ?? "a") as keyof typeof map;
  const entry = map[t] ?? map.a!;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 transition ${
        active ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"
      }`}
    >
      {label}
    </Link>
  );
}

const TRIAGE_TONES: Record<string, { ring: string; bg: string; iconBg: string; iconColor: string }> = {
  amber: {
    ring: "ring-amber-300",
    bg: "bg-amber-50/50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  accent: {
    ring: "ring-accent-300",
    bg: "bg-accent-50/40",
    iconBg: "bg-accent-100",
    iconColor: "text-accent-700",
  },
  brand: {
    ring: "ring-brand-300",
    bg: "bg-brand-50/40",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
  },
  slate: {
    ring: "ring-slate-300",
    bg: "bg-slate-50",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
};

function TriageCard({
  icon: Icon,
  tone,
  label,
  count,
  href,
  active,
  hint,
}: {
  icon: React.ElementType;
  tone: keyof typeof TRIAGE_TONES;
  label: string;
  count: number;
  href: string;
  active: boolean;
  hint: string;
}) {
  const t = TRIAGE_TONES[tone];
  return (
    <Link
      href={href}
      className={`card flex items-start gap-3 transition hover:-translate-y-0.5 hover:shadow-card-hover ${
        active ? `ring-2 ${t.ring} ${t.bg}` : ""
      }`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${t.iconBg} ${t.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-2xl font-bold text-ink">{count}</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{label}</div>
        <div className="mt-0.5 text-xs text-ink-muted">{hint}</div>
      </div>
    </Link>
  );
}
