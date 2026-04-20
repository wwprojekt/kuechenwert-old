import Link from "next/link";
import { Inbox, ChevronRight } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TIER_COLOR: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  premium: "bg-amber-100 text-amber-700",
  qualified: "bg-accent-100 text-accent-700",
  standard: "bg-slate-100 text-slate-700",
};

export default async function DealerLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: "available" | "purchased" }>;
}) {
  const { filter = "available" } = await searchParams;
  const ctx = await requireDealer("/dealer/leads");

  // Verfügbare Funnel-A-Leads (qualified/matched, noch nicht von diesem Dealer gekauft)
  let leads: Array<Record<string, unknown> & { id: string; purchased?: boolean; price_cents: number | null }> = [];

  if (filter === "purchased") {
    const { data: mc = [] } = await supabaseAdmin
      .from("match_candidates")
      .select(`
        lead_id,
        is_purchased,
        purchased_at,
        price_cents,
        leads!inner(
          id, funnel_type, status, tier, score, postal_code, city,
          first_name, last_name, email, phone, kitchen_form, kitchen_style,
          budget_midpoint, has_existing_offer, timeframe_months, created_at
        )
      `)
      .eq("dealer_id", ctx.dealer.id)
      .eq("is_purchased", true)
      .order("purchased_at", { ascending: false })
      .limit(100);
    leads = (mc ?? []).map((m) => ({
      ...(m.leads as unknown as Record<string, unknown>),
      purchased: true,
      price_cents: (m as { price_cents: number | null }).price_cents ?? null,
    })) as typeof leads;
  } else {
    // Verfügbare: Funnel A, qualified, nicht bereits von diesem Dealer gekauft
    const { data: purchasedRows = [] } = await supabaseAdmin
      .from("match_candidates")
      .select("lead_id")
      .eq("dealer_id", ctx.dealer.id)
      .eq("is_purchased", true);
    const purchasedIds = (purchasedRows ?? []).map((r) => r.lead_id as string);

    let q = supabaseAdmin
      .from("leads")
      .select("id, funnel_type, status, tier, score, postal_code, region, kitchen_form, kitchen_style, budget_midpoint, has_existing_offer, timeframe_months, created_at")
      .eq("funnel_type", "a")
      .in("status", ["qualified", "matched"])
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (purchasedIds.length > 0) {
      q = q.not("id", "in", `(${purchasedIds.join(",")})`);
    }
    const { data: rows = [] } = await q;

    // Preis pro Lead via DB-Funktion
    const withPrice = await Promise.all(
      (rows ?? []).map(async (l) => {
        let price_cents: number | null = null;
        if (l.budget_midpoint && l.tier) {
          const { data: priceData } = await supabaseAdmin.rpc("calculate_lead_price_cents", {
            p_budget_cents: Number(l.budget_midpoint) * 100,
            p_tier: l.tier,
          });
          price_cents = priceData as number | null;
        }
        return { ...l, price_cents };
      }),
    );
    leads = withPrice as typeof leads;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Inbox className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Lead-Marktplatz</h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Funnel-A-Leads aus Ihrer Region. Sie sehen alle Konfigurationsdaten – Name,
        Adresse &amp; Telefon erst nach Kauf (First-come-Prinzip). Preis wird vom
        Wallet abgezogen.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <FilterChip href="/dealer/leads" active={filter === "available"} label="Verfügbar" />
        <FilterChip href="/dealer/leads?filter=purchased" active={filter === "purchased"} label="Meine gekauften" />
        <span className="ml-auto rounded-full bg-brand-50 px-3 py-1 text-brand-800">
          Wallet:&nbsp;<strong>{(ctx.dealer.wallet_balance_cents / 100).toFixed(2)} €</strong>
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">PLZ</th>
              <th className="px-4 py-3">Form / Stil</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Zeit</th>
              <th className="px-4 py-3">Preis</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">Keine Leads.</td></tr>
            )}
            {leads.map((l) => {
              const tier = String(l.tier ?? "standard");
              const price = l.price_cents != null ? Number(l.price_cents) / 100 : null;
              return (
                <tr key={l.id as string} className="hover:bg-surface-soft">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLOR[tier] ?? TIER_COLOR.standard}`}>{tier}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{String(l.postal_code ?? "")}</td>
                  <td className="px-4 py-3 text-xs">
                    <div>{String(l.kitchen_form ?? "–")}</div>
                    <div className="text-ink-subtle">{String(l.kitchen_style ?? "")}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {l.budget_midpoint ? `~${Number(l.budget_midpoint).toLocaleString("de-DE")} €` : "k. A."}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {l.timeframe_months ? `${l.timeframe_months} Mon.` : "–"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {price != null ? <strong className="text-ink">{price.toFixed(2)} €</strong> : <span className="text-ink-subtle">k. A.</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dealer/leads/${l.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Ansehen <ChevronRight className="h-3 w-3" />
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
