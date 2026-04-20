import { Percent } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RangeRuleEditor, type RangeRuleColumn } from "@/components/admin/range-rule-editor";

export const dynamic = "force-dynamic";

const columns: RangeRuleColumn[] = [
  {
    key: "order_value_min_eur",
    label: "Auftragswert ab",
    type: "number",
    isEur: true,
    required: true,
    hint: "inkl., in €",
  },
  {
    key: "order_value_max_eur",
    label: "Auftragswert bis",
    type: "number",
    isEur: true,
    hint: "exkl., leer = open",
  },
  { key: "percent", label: "% Provision", type: "number", suffix: "%", required: true },
  { key: "min_eur", label: "Min. Provision", type: "number", isEur: true, required: true },
  { key: "max_eur", label: "Max. Provision", type: "number", isEur: true, hint: "Cap, optional" },
  { key: "is_active", label: "Aktiv", type: "boolean" },
  { key: "notes", label: "Notiz", type: "text" },
];

export default async function CommissionsPage() {
  const { data } = await supabaseAdmin
    .from("commission_tiers")
    .select("*")
    .order("order_value_min_cents", { ascending: true });

  const rows = (data ?? []).map((r) => ({
    id: r.id,
    order_value_min_eur: r.order_value_min_cents != null ? Number(r.order_value_min_cents) / 100 : null,
    order_value_max_eur: r.order_value_max_cents != null ? Number(r.order_value_max_cents) / 100 : null,
    percent: r.percent,
    min_eur: r.min_cents != null ? Number(r.min_cents) / 100 : null,
    max_eur: r.max_cents != null ? Number(r.max_cents) / 100 : null,
    is_active: r.is_active,
    notes: r.notes,
  }));

  return (
    <div>
      <div className="flex items-center gap-3">
        <Percent className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Provisions-Staffel (Funnel B)</h1>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-ink-muted">
        Provision, die Händler nach gewonnener Auktion an KüchenWert zahlen. Pro
        Auftragswert-Range wird ein Prozentsatz mit Mindestbetrag fällig. Beispiel:
        0–10.000 € → 2 % min. 200 € · 10.000–15.000 € → 1,8 % min. 250 € usw.
      </p>

      <div className="mt-8">
        <RangeRuleEditor
          apiPath="/api/admin/commissions"
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
