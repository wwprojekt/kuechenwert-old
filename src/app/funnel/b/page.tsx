"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileUp, ShieldCheck, Lightbulb, Phone } from "lucide-react";
import { FunnelBShell } from "@/components/funnel/funnel-b-shell";
import {
  KITCHEN_BRANDS,
  FRONT_MATERIALS,
  FRONT_CATEGORY_LABEL,
  HANDLE_TYPES,
  WORKTOP_MATERIALS,
  WORKTOP_DESIGNS,
  APPLIANCE_CATEGORIES,
  APPLIANCE_BRANDS,
  SINK_BRANDS,
  SINK_MATERIALS,
  EXTRAS_OPTIONS,
  HOUSING_TYPES,
  TIMEFRAMES,
  DELIVERY_MODES,
  FINANCING_OPTIONS,
  type FrontMaterial,
} from "@/config/funnel-b-stammdaten";

type FunnelBData = {
  // Step 0 - Situation (PFLICHT: housingType)
  housingType: string;
  purchaseReason: string; // optional: neubau / renovierung / erstausstattung
  timeframe: string;
  desiredDeliveryDate: string;

  // Step 1 - Korpus & Fronten
  brand: string;
  brandCustom: string;
  frontMaterialName: string;
  frontMaterialCategory: string;
  handleType: string;

  // Step 2 - Arbeitsplatte
  worktopMaterial: string;
  worktopDesign: string;
  worktopDesignCustom: string;

  // Step 3 - Geräte (multi)
  appliances: { id: string; categorySlug: string; brandSlug: string; model: string }[];

  // Step 4 - Sanitär & Müll
  sinkBrand: string;
  sinkMaterial: string;
  sinkDesignation: string;
  wasteSeparationSystem: "yes" | "no" | "";

  // Step 5 - Extras
  extras: string[];
  extrasNotes: string;

  // Step 6 - Lieferung + Zahlung
  deliveryMode: string;
  paymentDownPaymentPercent: string; // store as string to allow empty input
  paymentFinancing: string;
  paymentFinancingApr: string;
  paymentFinancingMonths: string;

  // Step 7 - Studio-Angebot + Upload (PFLICHT: existingOfferPriceEur)
  existingOfferStudio: string;
  existingOfferPriceEur: string;
  uploads: { id: string; category: "angebot" | "grundriss" | "kueche_bild"; file: File }[];

  // Step 8 - Kontakt (alles PFLICHT)
  postalCode: string;
  city: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salutation: "frau" | "herr" | "divers" | "";
  consentCall: boolean;
  consentMarketing: boolean;
};

const initialData: FunnelBData = {
  housingType: "",
  purchaseReason: "",
  timeframe: "",
  desiredDeliveryDate: "",
  brand: "",
  brandCustom: "",
  frontMaterialName: "",
  frontMaterialCategory: "",
  handleType: "",
  worktopMaterial: "",
  worktopDesign: "",
  worktopDesignCustom: "",
  appliances: [],
  sinkBrand: "",
  sinkMaterial: "",
  sinkDesignation: "",
  wasteSeparationSystem: "",
  extras: [],
  extrasNotes: "",
  deliveryMode: "",
  paymentDownPaymentPercent: "",
  paymentFinancing: "",
  paymentFinancingApr: "",
  paymentFinancingMonths: "",
  existingOfferStudio: "",
  existingOfferPriceEur: "",
  uploads: [],
  postalCode: "",
  city: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  salutation: "",
  consentCall: false,
  consentMarketing: false,
};

const STEPS = [
  { label: "Über Ihre Situation", description: "Eigentum oder Miete? Wann soll die Küche stehen?" },
  { label: "Korpus & Fronten", description: "Welche Marke, welches Material, welcher Grifftyp?" },
  { label: "Arbeitsplatte", description: "Material und – falls bekannt – die genaue Bezeichnung." },
  { label: "Geräte", description: "Welche Geräte sind im Angebot? Marke und Modell, falls bekannt." },
  { label: "Sanitär & Müllsystem", description: "Spüle, Material, Mülltrennsystem ja/nein." },
  { label: "Ausstattung & Zubehör", description: "Steckdosen, Beleuchtung, Besteckeinsatz, Sonstiges." },
  { label: "Lieferung & Zahlung", description: "Liefermodus, Anzahlung, Finanzierungswunsch." },
  { label: "Vorhandenes Angebot", description: "Wer hat angeboten, wieviel kostet es, optional Upload." },
  { label: "Ihre Kontaktdaten", description: "Damit wir uns für den Experten-Check melden können." },
];

const TOTAL = STEPS.length;

export default function FunnelBPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FunnelBData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = useCallback((patch: Partial<FunnelBData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(data.housingType);
      case 7:
        return Number(data.existingOfferPriceEur) > 0;
      case 8:
        return (
          /^\d{5}$/.test(data.postalCode) &&
          data.firstName.trim().length > 1 &&
          data.lastName.trim().length > 1 &&
          /\S+@\S+\.\S+/.test(data.email) &&
          data.phone.trim().length >= 6 &&
          data.consentCall
        );
      default:
        return true;
    }
  }, [step, data]);

  const handleNext = useCallback(async () => {
    if (step < TOTAL - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify({ ...data, uploads: undefined }));
      data.uploads.forEach(({ category, file }, i) => {
        formData.append(`file_${i}`, file);
        formData.append(`file_${i}_category`, category);
      });

      const res = await fetch("/api/leads/funnel-b", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fehler beim Speichern");
      router.push(`/funnel/b/danke?id=${json.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setSubmitting(false);
    }
  }, [step, data, router]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sidebar = (
    <>
      <div className="card text-sm">
        <div className="flex items-center gap-2 text-brand-700">
          <Lightbulb className="h-4 w-4" />
          <span className="font-semibold text-ink">Tipp</span>
        </div>
        <p className="mt-2 text-ink-muted">{TIPS[step]}</p>
      </div>
      <div className="card text-sm">
        <div className="flex items-center gap-2 text-accent-700">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-semibold text-ink">Verbindliche Auktion</span>
        </div>
        <p className="mt-2 text-ink-muted">
          Nach unserem Experten-Check stellen wir Ihre Anfrage neutralisiert für
          72&nbsp;h ein. Verifizierte Händler unterbieten den Preis Ihres Studios –
          Sie nehmen das beste Gebot verbindlich an.
        </p>
      </div>
      <div className="card text-sm">
        <div className="flex items-center gap-2 text-brand-700">
          <Phone className="h-4 w-4" />
          <span className="font-semibold text-ink">Brauchen Sie Hilfe?</span>
        </div>
        <p className="mt-2 text-ink-muted">
          Rufen Sie uns an: <a href="tel:+4900000000" className="font-medium text-brand-700 hover:underline">+49 (0) 000 00 00 00</a>
        </p>
      </div>
    </>
  );

  const stepDef = STEPS[step];
  return (
    <FunnelBShell
      currentStep={step}
      totalSteps={TOTAL}
      stepLabel={stepDef.label}
      stepDescription={stepDef.description}
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isFinalStep={step === TOTAL - 1}
      isSubmitting={submitting}
      sidebar={sidebar}
    >
      {step === 0 && <Step0 data={data} update={update} />}
      {step === 1 && <Step1 data={data} update={update} />}
      {step === 2 && <Step2 data={data} update={update} />}
      {step === 3 && <Step3 data={data} update={update} />}
      {step === 4 && <Step4 data={data} update={update} />}
      {step === 5 && <Step5 data={data} update={update} />}
      {step === 6 && <Step6 data={data} update={update} />}
      {step === 7 && <Step7 data={data} update={update} />}
      {step === 8 && <Step8 data={data} update={update} />}

      {submitError && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}
    </FunnelBShell>
  );
}

const TIPS = [
  "Eigentum oder Miete entscheidet über Mehrwert-Kalkulation. Die Wohnsituation hilft dem Händler bei realistischer Anlieferungs-/Montageplanung.",
  "Wenn Sie Marke oder Material nicht sicher wissen: einfach 'Sonstiger / weiß ich nicht' wählen. Unser Experte ergänzt das im Telefonat.",
  "Die Bezeichnung der Arbeitsplatte (z. B. „Calacatta Roma\") finden Sie meist auf Ihrem schriftlichen Angebot. Optional!",
  "Marke + Modell pro Gerät steigert die Vergleichbarkeit. Beispiele: „Bosch HBG675BS1\", „Miele DGC 7460\".",
  "Spülen-Material und -Marke beeinflussen den Preis stark. Mülltrennsysteme sind oft separat kalkuliert.",
  "Beleuchtung und Steckdosen-Lösungen sind häufige „versteckte\" Posten – hier verlangen Studios oft hohe Aufschläge.",
  "Anzahlung und Finanzierungsbedingungen sind verhandelbar. Geben Sie an, was Ihr Studio Ihnen angeboten hat.",
  "Falls Sie ein schriftliches Angebot oder einen Grundriss haben: hochladen erhöht die Genauigkeit der Auktion deutlich.",
  "Wir rufen Sie binnen 24h an – das ist Pflichtschritt vor jeder Auktion. SMS oder E-Mail-Termine sind möglich.",
];

/* ====================================================================== */
/* STEP COMPONENTS                                                         */
/* ====================================================================== */

type StepProps = {
  data: FunnelBData;
  update: (patch: Partial<FunnelBData>) => void;
};

function Step0({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <Field label="Wohnsituation *" hint="Pflicht – relevant für Vergleich und Liefermodus.">
        <CardGroup
          options={HOUSING_TYPES.map((h) => ({ value: h.slug, label: h.name }))}
          value={data.housingType}
          onChange={(v) => update({ housingType: v })}
        />
      </Field>

      <Field label="Anlass" hint="Optional.">
        <CardGroup
          columns={3}
          options={[
            { value: "neubau", label: "Neubau / Erstbezug" },
            { value: "renovierung", label: "Renovierung / Austausch" },
            { value: "erstausstattung", label: "Erstausstattung Wohnung" },
          ]}
          value={data.purchaseReason}
          onChange={(v) => update({ purchaseReason: v })}
        />
      </Field>

      <Field label="Wann soll die Küche geliefert/montiert werden?" hint="Optional – hilft bei Verfügbarkeitsprüfung.">
        <CardGroup
          options={TIMEFRAMES.map((t) => ({ value: t.slug, label: t.name }))}
          value={data.timeframe}
          onChange={(v) => update({ timeframe: v })}
        />
      </Field>

      <Field label="Konkretes Wunschdatum" hint="Optional. Datum (TT.MM.JJJJ).">
        <input
          type="date"
          className="input-field max-w-xs"
          value={data.desiredDeliveryDate}
          onChange={(e) => update({ desiredDeliveryDate: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Step1({ data, update }: StepProps) {
  const filteredFronts: FrontMaterial[] = useMemo(() => {
    if (!data.frontMaterialCategory) return FRONT_MATERIALS;
    return FRONT_MATERIALS.filter((f) => f.category === data.frontMaterialCategory);
  }, [data.frontMaterialCategory]);

  return (
    <div className="space-y-6">
      <Field label="Hersteller / Marke der Küche" hint="Optional. Alle gängigen deutschen Hersteller in der Liste.">
        <select
          className="input-field"
          value={data.brand}
          onChange={(e) => update({ brand: e.target.value })}
        >
          <option value="">– Bitte wählen –</option>
          {KITCHEN_BRANDS.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}{b.segment ? ` (${b.segment})` : ""}
            </option>
          ))}
        </select>
        {data.brand === "sonstiger" && (
          <input
            type="text"
            placeholder="Marke (Freitext)"
            className="input-field mt-2"
            value={data.brandCustom}
            onChange={(e) => update({ brandCustom: e.target.value })}
          />
        )}
      </Field>

      <Field label="Front-Kategorie" hint="Optional – Filter für die Materialliste unten.">
        <CardGroup
          columns={3}
          options={[
            { value: "", label: "Alle anzeigen" },
            ...Object.entries(FRONT_CATEGORY_LABEL).map(([slug, label]) => ({
              value: slug,
              label,
            })),
          ]}
          value={data.frontMaterialCategory}
          onChange={(v) =>
            update({
              frontMaterialCategory: v,
              frontMaterialName:
                v && data.frontMaterialName &&
                FRONT_MATERIALS.find((f) => f.name === data.frontMaterialName)?.category !== v
                  ? ""
                  : data.frontMaterialName,
            })
          }
        />
      </Field>

      <Field label="Frontmaterial" hint={'Optional. Z. B. „UV-Lack hochglanz".'}>
        <select
          className="input-field"
          value={data.frontMaterialName}
          onChange={(e) => update({ frontMaterialName: e.target.value })}
        >
          <option value="">– Bitte wählen –</option>
          {filteredFronts.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}{f.description ? ` – ${f.description}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Grifftyp" hint="Optional.">
        <CardGroup
          columns={2}
          options={HANDLE_TYPES.map((h) => ({
            value: h.slug,
            label: h.name,
            description: h.description,
          }))}
          value={data.handleType}
          onChange={(v) => update({ handleType: v })}
        />
      </Field>
    </div>
  );
}

function Step2({ data, update }: StepProps) {
  const designs = useMemo(() => {
    if (!data.worktopMaterial) return [];
    return WORKTOP_DESIGNS.filter((d) => d.materialSlug === data.worktopMaterial);
  }, [data.worktopMaterial]);

  return (
    <div className="space-y-6">
      <Field label="Material der Arbeitsplatte" hint="Optional.">
        <CardGroup
          columns={2}
          options={WORKTOP_MATERIALS.map((m) => ({
            value: m.slug,
            label: m.name,
            description: m.description,
          }))}
          value={data.worktopMaterial}
          onChange={(v) => update({ worktopMaterial: v, worktopDesign: "", worktopDesignCustom: "" })}
        />
      </Field>

      {data.worktopMaterial && designs.length > 0 && (
        <Field label="Bekannte Bezeichnungen" hint="Optional – wählen oder unten Freitext.">
          <select
            className="input-field"
            value={data.worktopDesign}
            onChange={(e) => update({ worktopDesign: e.target.value })}
          >
            <option value="">– Keine Auswahl –</option>
            {designs.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}{d.manufacturer ? ` (${d.manufacturer})` : ""}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Eigene Bezeichnung / Notiz" hint={'Optional. Z. B. „Eiche massiv geölt" oder spezifischer Code vom Studio.'}>
        <input
          type="text"
          className="input-field"
          placeholder="z. B. Calacatta Roma 12 mm"
          value={data.worktopDesignCustom}
          onChange={(e) => update({ worktopDesignCustom: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Step3({ data, update }: StepProps) {
  const addAppliance = () => {
    update({
      appliances: [
        ...data.appliances,
        {
          id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          categorySlug: "",
          brandSlug: "",
          model: "",
        },
      ],
    });
  };
  const remove = (id: string) => {
    update({ appliances: data.appliances.filter((a) => a.id !== id) });
  };
  const upd = (id: string, patch: Partial<typeof data.appliances[number]>) => {
    update({
      appliances: data.appliances.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Geräte sind komplett optional. Klicken Sie auf <span className="font-medium">„Gerät hinzufügen"</span>,
        um eine Position einzutragen.
      </p>

      <div className="space-y-3">
        {data.appliances.map((a, i) => (
          <div key={a.id} className="rounded-lg border border-slate-200 bg-surface-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-ink-subtle">Gerät {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Entfernen
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="label-field">Typ</label>
                <select
                  className="input-field"
                  value={a.categorySlug}
                  onChange={(e) => upd(a.id, { categorySlug: e.target.value })}
                >
                  <option value="">– Wählen –</option>
                  {APPLIANCE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Marke</label>
                <select
                  className="input-field"
                  value={a.brandSlug}
                  onChange={(e) => upd(a.id, { brandSlug: e.target.value })}
                >
                  <option value="">– Wählen –</option>
                  {APPLIANCE_BRANDS.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Modell / Bezeichnung</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="z. B. HBG675BS1"
                  value={a.model}
                  onChange={(e) => upd(a.id, { model: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addAppliance} className="btn-secondary">
        <Plus className="h-4 w-4" /> Gerät hinzufügen
      </button>
    </div>
  );
}

function Step4({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Spülen-Marke" hint="Optional.">
          <select
            className="input-field"
            value={data.sinkBrand}
            onChange={(e) => update({ sinkBrand: e.target.value })}
          >
            <option value="">– Wählen –</option>
            {SINK_BRANDS.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Spülen-Material" hint="Optional.">
          <select
            className="input-field"
            value={data.sinkMaterial}
            onChange={(e) => update({ sinkMaterial: e.target.value })}
          >
            <option value="">– Wählen –</option>
            {SINK_MATERIALS.map((m) => (
              <option key={m.slug} value={m.slug}>{m.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Bezeichnung / Modell" hint={'Optional. z. B. „Blanco Subline 500-U".'}>
        <input
          type="text"
          className="input-field"
          value={data.sinkDesignation}
          onChange={(e) => update({ sinkDesignation: e.target.value })}
        />
      </Field>

      <Field label="Mülltrennsystem" hint="Optional.">
        <CardGroup
          columns={3}
          options={[
            { value: "yes", label: "Ja, vorgesehen" },
            { value: "no", label: "Nein, kein System" },
            { value: "", label: "Weiß ich nicht" },
          ]}
          value={data.wasteSeparationSystem}
          onChange={(v) => update({ wasteSeparationSystem: v as FunnelBData["wasteSeparationSystem"] })}
        />
      </Field>
    </div>
  );
}

function Step5({ data, update }: StepProps) {
  const toggle = (slug: string) => {
    if (data.extras.includes(slug)) {
      update({ extras: data.extras.filter((s) => s !== slug) });
    } else {
      update({ extras: [...data.extras, slug] });
    }
  };
  return (
    <div className="space-y-6">
      <Field label="Welche Extras sind im Angebot enthalten?" hint="Mehrfachauswahl möglich – alles optional.">
        <div className="grid gap-2 sm:grid-cols-2">
          {EXTRAS_OPTIONS.map((e) => {
            const selected = data.extras.includes(e.slug);
            return (
              <label
                key={e.slug}
                className={`card-clickable !p-4 ${selected ? "is-selected" : ""}`}
                data-selected={selected}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => toggle(e.slug)}
                />
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-5 w-5 flex-none rounded border-2 ${
                      selected
                        ? "border-brand-700 bg-brand-700"
                        : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <svg className="h-full w-full text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">{e.name}</div>
                    {e.description && <div className="mt-0.5 text-xs text-ink-muted">{e.description}</div>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Sonstige Komponenten / Notizen" hint="Optional. Alles, was wir noch wissen sollten.">
        <textarea
          rows={3}
          className="input-field"
          placeholder="z. B. Spritzschutz aus Glas, USB-Dosen in Schublade, ..."
          value={data.extrasNotes}
          onChange={(e) => update({ extrasNotes: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Step6({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <Field label="Wie soll geliefert werden?" hint="Optional.">
        <CardGroup
          columns={2}
          options={DELIVERY_MODES.map((d) => ({ value: d.slug, label: d.name }))}
          value={data.deliveryMode}
          onChange={(v) => update({ deliveryMode: v })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Anzahlung in %" hint="Optional. Was Ihr Studio fordert (z. B. 30 %).">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            className="input-field"
            placeholder="z. B. 30"
            value={data.paymentDownPaymentPercent}
            onChange={(e) => update({ paymentDownPaymentPercent: e.target.value })}
          />
        </Field>

        <Field label="Finanzierung" hint="Optional.">
          <select
            className="input-field"
            value={data.paymentFinancing}
            onChange={(e) => update({ paymentFinancing: e.target.value })}
          >
            <option value="">– Wählen –</option>
            {FINANCING_OPTIONS.map((f) => (
              <option key={f.slug} value={f.slug}>{f.name}</option>
            ))}
          </select>
        </Field>
      </div>

      {data.paymentFinancing === "with_interest" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Effektivzins (% p. a.)" hint="Optional.">
            <input
              type="number"
              min={0}
              step={0.1}
              className="input-field"
              placeholder="z. B. 4.9"
              value={data.paymentFinancingApr}
              onChange={(e) => update({ paymentFinancingApr: e.target.value })}
            />
          </Field>
          <Field label="Laufzeit (Monate)" hint="Optional.">
            <input
              type="number"
              min={1}
              step={1}
              className="input-field"
              placeholder="z. B. 36"
              value={data.paymentFinancingMonths}
              onChange={(e) => update({ paymentFinancingMonths: e.target.value })}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Step7({ data, update }: StepProps) {
  const addFile = (category: "angebot" | "grundriss" | "kueche_bild", file: File) => {
    update({
      uploads: [
        ...data.uploads,
        { id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, category, file },
      ],
    });
  };
  const remove = (id: string) => {
    update({ uploads: data.uploads.filter((u) => u.id !== id) });
  };
  const formatBytes = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="space-y-6">
      <Field
        label="Angebotspreis Ihres Küchenstudios *"
        hint="Pflicht. Brutto in Euro – das werden die Händler in der Auktion unterbieten."
      >
        <div className="relative max-w-xs">
          <input
            type="number"
            min={1}
            step={1}
            className="input-field pr-10"
            placeholder="z. B. 18000"
            value={data.existingOfferPriceEur}
            onChange={(e) => update({ existingOfferPriceEur: e.target.value })}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
            €
          </span>
        </div>
      </Field>

      <Field label="Name des Küchenstudios" hint="Optional. Hilft uns bei Quervergleichen, wird Händlern nicht gezeigt.">
        <input
          type="text"
          className="input-field"
          placeholder="z. B. Küchen Müller GmbH, Musterstadt"
          value={data.existingOfferStudio}
          onChange={(e) => update({ existingOfferStudio: e.target.value })}
        />
      </Field>

      <div className="space-y-3">
        <UploadDrop
          label="Schriftliches Angebot hochladen"
          description="PDF oder Bild. Max. 10 MB. Optional aber sehr hilfreich."
          accept="application/pdf,image/*"
          onFile={(f) => addFile("angebot", f)}
        />
        <UploadDrop
          label="Grundriss hochladen"
          description="PDF oder Bild. Max. 10 MB."
          accept="application/pdf,image/*"
          onFile={(f) => addFile("grundriss", f)}
        />
        <UploadDrop
          label="Bild der gewünschten Küche"
          description="JPG / PNG. Max. 10 MB."
          accept="image/*"
          onFile={(f) => addFile("kueche_bild", f)}
        />
      </div>

      {data.uploads.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-surface-soft p-4">
          <div className="mb-2 text-xs font-semibold uppercase text-ink-subtle">
            Hochgeladen ({data.uploads.length})
          </div>
          <ul className="space-y-1 text-sm">
            {data.uploads.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  <span className="chip mr-2">{u.category}</span>
                  {u.file.name}{" "}
                  <span className="text-xs text-ink-subtle">({formatBytes(u.file.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(u.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Step8({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="PLZ *">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            className="input-field"
            placeholder="12345"
            value={data.postalCode}
            onChange={(e) => update({ postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
          />
        </Field>
        <Field label="Stadt" hint="Optional, ergänzen wir aus PLZ.">
          <input
            type="text"
            className="input-field"
            value={data.city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Anrede" hint="Optional.">
        <CardGroup
          columns={3}
          options={[
            { value: "frau", label: "Frau" },
            { value: "herr", label: "Herr" },
            { value: "divers", label: "Divers" },
          ]}
          value={data.salutation}
          onChange={(v) => update({ salutation: v as FunnelBData["salutation"] })}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Vorname *">
          <input
            type="text"
            className="input-field"
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </Field>
        <Field label="Nachname *">
          <input
            type="text"
            className="input-field"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="E-Mail *">
          <input
            type="email"
            className="input-field"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>
        <Field label="Telefon *" hint="Wir rufen Sie für den Experten-Check an.">
          <input
            type="tel"
            className="input-field"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-surface-soft p-4 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 flex-none accent-brand-700"
            checked={data.consentCall}
            onChange={(e) => update({ consentCall: e.target.checked })}
          />
          <span className="text-ink-muted">
            <strong className="text-ink">Pflicht:</strong> Ich willige ein, dass mich KüchenWert telefonisch
            zur Klärung meines Angebots kontaktiert. Ich kann diese Einwilligung jederzeit widerrufen.
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 flex-none accent-brand-700"
            checked={data.consentMarketing}
            onChange={(e) => update({ consentMarketing: e.target.checked })}
          />
          <span className="text-ink-muted">
            Optional: Ich möchte Tipps und Marktinformationen rund um meinen Küchenkauf per E-Mail erhalten.
          </span>
        </label>
        <p className="text-xs text-ink-subtle">
          Mit Absenden bestätigen Sie unsere{" "}
          <a href="/datenschutz" className="underline">Datenschutzerklärung</a> und{" "}
          <a href="/agb" className="underline">AGB</a>. Verbindliche Auktion: bei grundlosem Abbruch
          während laufender Auktion wird eine Bearbeitungsgebühr von 299 € fällig.
        </p>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* SHARED FIELD HELPERS                                                    */
/* ====================================================================== */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label-field">{label}</label>
      {children}
      {hint && <p className="helper-text">{hint}</p>}
    </div>
  );
}

function CardGroup({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: 1 | 2 | 3;
}) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <div className={`grid gap-2 ${colClass}`}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            type="button"
            key={`${o.value}-${o.label}`}
            onClick={() => onChange(o.value)}
            className={`card-clickable !p-4 text-left ${selected ? "is-selected" : ""}`}
            data-selected={selected}
          >
            <div className="text-sm font-medium text-ink">{o.label}</div>
            {o.description && (
              <div className="mt-0.5 text-xs text-ink-muted">{o.description}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function UploadDrop({
  label,
  description,
  accept,
  onFile,
}: {
  label: string;
  description?: string;
  accept?: string;
  onFile: (f: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-surface-soft p-4 transition hover:border-brand-300 hover:bg-white">
      <FileUp className="h-5 w-5 flex-none text-brand-700" />
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{label}</div>
        {description && <div className="text-xs text-ink-muted">{description}</div>}
      </div>
      <span className="btn-ghost text-xs">Datei wählen</span>
      <input
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}
