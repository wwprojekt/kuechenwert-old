"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

type LeadFormState = Record<string, string | number | null>;

const STATUS_OPTIONS = [
  "new",
  "qualified",
  "disqualified",
  "matched",
  "in_auction",
  "sold",
  "contacted",
  "appointment_set",
  "offer_sent",
  "closed_won",
  "closed_lost",
  "disputed",
];
const TIER_OPTIONS = ["standard", "qualified", "premium", "hot"];
const HOUSING_OPTIONS = [
  { v: "", l: "– unbekannt –" },
  { v: "own", l: "Eigentum" },
  { v: "rent", l: "Mietverhältnis" },
  { v: "unknown", l: "Weiß nicht" },
];
const FINANCING_OPTIONS = [
  { v: "", l: "– keine Angabe –" },
  { v: "none", l: "Keine Finanzierung" },
  { v: "zero_interest", l: "0 % Finanzierung" },
  { v: "with_interest", l: "Mit Zinsen" },
  { v: "unknown", l: "Unbekannt" },
];
const DELIVERY_OPTIONS = [
  { v: "", l: "– keine Angabe –" },
  { v: "delivery_assembly", l: "Lieferung + Montage" },
  { v: "delivery_only", l: "Nur Lieferung" },
  { v: "pickup", l: "Selbstabholung" },
  { v: "unknown", l: "Unbekannt" },
];
const WASTE_OPTIONS = [
  { v: "", l: "– keine Angabe –" },
  { v: "yes", l: "Ja" },
  { v: "no", l: "Nein" },
];

export function LeadEditor({
  leadId,
  initial,
}: {
  leadId: string;
  initial: LeadFormState;
}) {
  const router = useRouter();
  const [data, setData] = useState<LeadFormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  const set = (k: keyof LeadFormState, v: string | number | null) =>
    setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Map zurück zum DB-Schema (eur -> cents, waste yes/no -> bool)
    const body: Record<string, unknown> = { ...data };
    if (data.existing_offer_price_eur !== "" && data.existing_offer_price_eur !== null) {
      body.existing_offer_price_cents = Math.round(Number(data.existing_offer_price_eur) * 100);
    } else {
      body.existing_offer_price_cents = null;
    }
    delete body.existing_offer_price_eur;

    if (data.waste_separation_system === "yes") body.waste_separation_system = true;
    else if (data.waste_separation_system === "no") body.waste_separation_system = false;
    else body.waste_separation_system = null;

    // empty -> null für numerics
    for (const k of [
      "score",
      "budget_midpoint",
      "payment_down_payment_percent",
      "payment_financing_apr",
      "payment_financing_months",
    ]) {
      if (body[k] === "" || body[k] === undefined) body[k] = null;
      else if (body[k] !== null) body[k] = Number(body[k]);
    }

    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Fehler beim Speichern");
      return;
    }
    setSuccess("Gespeichert.");
    startTransition(() => router.refresh());
    setTimeout(() => setSuccess(null), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Triage */}
      <Section title="Triage">
        <Grid>
          <Field label="Status">
            <select className="input-field" value={String(data.status ?? "")} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Tier">
            <select className="input-field" value={String(data.tier ?? "")} onChange={(e) => set("tier", e.target.value)}>
              {TIER_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Score (0–100)">
            <input
              type="number"
              min={0}
              max={100}
              className="input-field"
              value={data.score ?? ""}
              onChange={(e) => set("score", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
        </Grid>
      </Section>

      {/* Kontakt */}
      <Section title="Kontakt">
        <Grid>
          <Field label="Vorname">
            <input className="input-field" value={String(data.first_name ?? "")} onChange={(e) => set("first_name", e.target.value)} />
          </Field>
          <Field label="Nachname">
            <input className="input-field" value={String(data.last_name ?? "")} onChange={(e) => set("last_name", e.target.value)} />
          </Field>
          <Field label="E-Mail">
            <input type="email" className="input-field" value={String(data.email ?? "")} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Telefon">
            <input type="tel" className="input-field" value={String(data.phone ?? "")} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </Grid>
        <Grid>
          <Field label="PLZ">
            <input className="input-field" value={String(data.postal_code ?? "")} onChange={(e) => set("postal_code", e.target.value)} />
          </Field>
          <Field label="Stadt">
            <input className="input-field" value={String(data.city ?? "")} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Adresse" wide>
            <input className="input-field" value={String(data.address_line ?? "")} onChange={(e) => set("address_line", e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* Funnel B / Pricing */}
      <Section title="Funnel-B Spezifika">
        <Grid>
          <Field label="Wohnsituation">
            <select className="input-field" value={String(data.housing_type ?? "")} onChange={(e) => set("housing_type", e.target.value)}>
              {HOUSING_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="Budget-Mittelwert (€)">
            <input
              type="number"
              className="input-field"
              value={data.budget_midpoint ?? ""}
              onChange={(e) => set("budget_midpoint", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Studio-Angebot (€)">
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={data.existing_offer_price_eur ?? ""}
              onChange={(e) => set("existing_offer_price_eur", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Studio-Name" wide>
            <input className="input-field" value={String(data.existing_offer_studio ?? "")} onChange={(e) => set("existing_offer_studio", e.target.value)} />
          </Field>
        </Grid>
        <Grid>
          <Field label="Liefermodus">
            <select className="input-field" value={String(data.delivery_mode ?? "")} onChange={(e) => set("delivery_mode", e.target.value)}>
              {DELIVERY_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="Wunschdatum">
            <input type="date" className="input-field" value={String(data.desired_delivery_at ?? "")} onChange={(e) => set("desired_delivery_at", e.target.value)} />
          </Field>
          <Field label="Mülltrennsystem">
            <select className="input-field" value={String(data.waste_separation_system ?? "")} onChange={(e) => set("waste_separation_system", e.target.value)}>
              {WASTE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
        </Grid>
        <Grid>
          <Field label="Anzahlung (%)">
            <input
              type="number"
              className="input-field"
              value={data.payment_down_payment_percent ?? ""}
              onChange={(e) => set("payment_down_payment_percent", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Finanzierung">
            <select className="input-field" value={String(data.payment_financing ?? "")} onChange={(e) => set("payment_financing", e.target.value)}>
              {FINANCING_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="APR (%)">
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={data.payment_financing_apr ?? ""}
              onChange={(e) => set("payment_financing_apr", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Laufzeit (Monate)">
            <input
              type="number"
              className="input-field"
              value={data.payment_financing_months ?? ""}
              onChange={(e) => set("payment_financing_months", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
        </Grid>
      </Section>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Speichern
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
        {success && <span className="text-sm text-accent-700">{success}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-subtle">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-2" : ""}>
      <label className="label-field">{label}</label>
      {children}
    </div>
  );
}
