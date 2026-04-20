import { Coins } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RangeRuleEditor, type RangeRuleColumn } from "@/components/admin/range-rule-editor";

export const dynamic = "force-dynamic";

const columns: RangeRuleColumn[] = [
  { key: "budget_min_eur", label: "Budget ab", type: "number", isEur: true, required: true, hint: "inkl., in €" },
  { key: "budget_max_eur", label: "Budget bis", type: "number", isEur: true, hint: "exkl., leer = open" },
  {
    key: "tier",
    label: "Tier",
    type: "select",
    required: true,
    options: [
      { value: "standard", label: "Standard" },
      { value: "qualified", label: "Qualified" },
      { value: "premium", label: "Premium" },
      { value: "hot", label: "Hot" },
    ],
  },
  { key: "percent_of_budget", label: "% vom Budget", type: "number", suffix: "%", required: true },
  { key: "min_price_eur", label: "Min. Preis", type: "number", isEur: true, required: true },
  { key: "max_price_eur", label: "Max. Preis", type: "number", isEur: true, hint: "Cap, optional" },
  { key: "is_active", label: "Aktiv", type: "boolean" },
  { key: "notes", label: "Notiz", type: "text" },
];

export default async function PricingMatrixPage() {
  const { data } = await supabaseAdmin
    .from("lead_pricing_rules")
    .select("*")
    .order("budget_min_cents", { ascending: true })
    .order("tier", { ascending: true });

  // Cents -> EUR transform: API & UI sprechen EUR
  const rows = (data ?? []).map((r) => ({
    id: r.id,
    budget_min_eur: r.budget_min_cents != null ? Number(r.budget_min_cents) / 100 : null,
    budget_max_eur: r.budget_max_cents != null ? Number(r.budget_max_cents) / 100 : null,
    tier: r.tier,
    percent_of_budget: r.percent_of_budget,
    min_price_eur: r.min_price_cents != null ? Number(r.min_price_cents) / 100 : null,
    max_price_eur: r.max_price_cents != null ? Number(r.max_price_cents) / 100 : null,
    is_active: r.is_active,
    notes: r.notes,
  }));

  return (
    <div>
      <div className="flex items-center gap-3">
        <Coins className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Lead-Preise (Funnel A)</h1>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-ink-muted">
        Hier definieren Sie die Preise, die Händler für Leads aus Funnel A („Angebot
        erhalten") zahlen. Pro Budget-Range × Tier wird ein Prozentsatz vom Budget
        berechnet, mit einem festen Mindestpreis. Es gewinnt die erste passende
        Regel (sortiert nach <span className="font-mono">budget_min</span> aufsteigend).
      </p>

      <div className="mt-8">
        <RangeRuleEditor
          apiPath="/api/admin/pricing-rules"
          columns={columns}
          initialRows={rows}
          rowToForm={(r) => ({ ...r })}
          formatCell={(c, v) => {
            if (v === null || v === undefined || v === "") {
              if (c.key.includes("max")) return <span className="text-ink-subtle">∞</span>;
              return <span className="text-ink-subtle">–</span>;
            }
            if (c.type === "boolean") {
              return v ? <span className="chip-success">Aktiv</span> : <span className="chip">Inaktiv</span>;
            }
            if (c.type === "select") {
              const opt = c.options?.find((o) => o.value === v);
              return opt?.label ?? String(v);
            }
            if (c.isEur) {
              const n = typeof v === "number" ? v : Number(v);
              return `${n.toLocaleString("de-DE", { maximumFractionDigits: 2 })} €`;
            }
            if (c.suffix) return `${v}${c.suffix}`;
            return String(v);
          }}
        />
      </div>
    </div>
  );
}
