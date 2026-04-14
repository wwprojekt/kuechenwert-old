"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/ui/steps-indicator";
import { CardSelector } from "@/components/ui/card-selector";
import {
  FUNNEL_STEPS,
  KITCHEN_FORMS,
  KITCHEN_STYLES,
  PURCHASE_REASONS,
  TIMEFRAMES,
  BUDGET_RANGES,
  SPECIAL_WISHES,
} from "@/config/funnel-steps";

interface FunnelData {
  plz: string;
  kitchenForm: string;
  kitchenStyle: string;
  purchaseReason: string;
  specialWishes: string[];
  timeframe: string;
  budget: string;
  hasExistingOffer: boolean;
  offerFile: File | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentCall: boolean;
  consentMarketing: boolean;
}

const STORAGE_KEY = "kw_funnel_data";

function loadSavedData(): Partial<FunnelData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data: Partial<FunnelData>) {
  if (typeof window === "undefined") return;
  const { offerFile, ...serializable } = data as FunnelData;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function FunnelStepClient({
  stepSlug,
  initialPlz,
}: {
  stepSlug: string;
  initialPlz: string;
}) {
  const router = useRouter();
  const stepIndex = FUNNEL_STEPS.findIndex((s) => s.slug === stepSlug);
  const step = FUNNEL_STEPS[stepIndex];

  const [data, setData] = useState<Partial<FunnelData>>(() => ({
    ...loadSavedData(),
    ...(initialPlz ? { plz: initialPlz } : {}),
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback(
    (patch: Partial<FunnelData>) => setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goNext = useCallback(() => {
    if (stepIndex < FUNNEL_STEPS.length - 1) {
      router.push(`/funnel/${FUNNEL_STEPS[stepIndex + 1].slug}`);
    }
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      router.push(`/funnel/${FUNNEL_STEPS[stepIndex - 1].slug}`);
    } else {
      router.push("/");
    }
  }, [stepIndex, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/funnel/danke");
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  function canProceed(): boolean {
    switch (step.id) {
      case "kitchen-form": return !!data.kitchenForm;
      case "kitchen-style": return !!data.kitchenStyle;
      case "reason": return !!data.purchaseReason;
      case "wishes": return true;
      case "timeframe": return !!data.timeframe;
      case "budget": return !!data.budget;
      case "offer-check": return true;
      case "contact": return !!(data.firstName && data.lastName && data.email && data.phone && data.consentCall);
      default: return false;
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <StepsIndicator
          steps={FUNNEL_STEPS.map((s) => ({ id: s.id, label: s.label }))}
          currentIndex={stepIndex}
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold">{step.label}</h2>
        <p className="mt-1 text-sm text-zinc-500">{step.description}</p>

        <div className="mt-6">
          {step.id === "kitchen-form" && (
            <CardSelector
              options={KITCHEN_FORMS.map((f) => ({ id: f.id, label: f.label }))}
              selected={data.kitchenForm ?? ""}
              onSelect={(id) => update({ kitchenForm: id })}
              columns={5}
            />
          )}

          {step.id === "kitchen-style" && (
            <CardSelector
              options={KITCHEN_STYLES.map((s) => ({ id: s.id, label: s.label }))}
              selected={data.kitchenStyle ?? ""}
              onSelect={(id) => update({ kitchenStyle: id })}
              columns={4}
            />
          )}

          {step.id === "reason" && (
            <CardSelector
              options={PURCHASE_REASONS.map((r) => ({ id: r.id, label: r.label }))}
              selected={data.purchaseReason ?? ""}
              onSelect={(id) => update({ purchaseReason: id })}
              columns={2}
            />
          )}

          {step.id === "wishes" && (
            <CardSelector
              options={SPECIAL_WISHES.map((w) => ({ id: w.id, label: w.label }))}
              selected={data.specialWishes ?? []}
              onSelect={(id) => {
                const current = data.specialWishes ?? [];
                update({
                  specialWishes: current.includes(id)
                    ? current.filter((w) => w !== id)
                    : [...current, id],
                });
              }}
              multiple
              columns={3}
            />
          )}

          {step.id === "timeframe" && (
            <CardSelector
              options={TIMEFRAMES.map((t) => ({ id: t.id, label: t.label }))}
              selected={data.timeframe ?? ""}
              onSelect={(id) => update({ timeframe: id })}
              columns={3}
            />
          )}

          {step.id === "budget" && (
            <CardSelector
              options={BUDGET_RANGES.map((b) => ({ id: b.id, label: b.label }))}
              selected={data.budget ?? ""}
              onSelect={(id) => update({ budget: id })}
              columns={3}
            />
          )}

          {step.id === "offer-check" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-600">
                Haben Sie bereits ein Küchenangebot von einem anderen Studio? Laden Sie es hoch für einen unabhängigen Gegen-Check.
              </p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 p-8 transition hover:border-brand-500 hover:bg-brand-50">
                <span className="text-sm font-medium text-zinc-600">
                  {data.hasExistingOffer ? "Datei ausgewählt ✓" : "Angebot hochladen (PDF, JPG, PNG)"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) update({ hasExistingOffer: true, offerFile: file });
                  }}
                />
              </label>
              <button
                type="button"
                className="text-sm text-zinc-500 underline"
                onClick={() => update({ hasExistingOffer: false, offerFile: null })}
              >
                Überspringen – ich habe kein Angebot
              </button>
            </div>
          )}

          {step.id === "contact" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="input-field"
                  placeholder="Vorname *"
                  value={data.firstName ?? ""}
                  onChange={(e) => update({ firstName: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Nachname *"
                  value={data.lastName ?? ""}
                  onChange={(e) => update({ lastName: e.target.value })}
                  required
                />
              </div>
              <input
                className="input-field"
                type="email"
                placeholder="E-Mail-Adresse *"
                value={data.email ?? ""}
                onChange={(e) => update({ email: e.target.value })}
                required
              />
              <input
                className="input-field"
                type="tel"
                placeholder="Telefonnummer *"
                value={data.phone ?? ""}
                onChange={(e) => update({ phone: e.target.value })}
                required
              />
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.consentCall ?? false}
                  onChange={(e) => update({ consentCall: e.target.checked })}
                  className="mt-0.5"
                  required
                />
                <span className="text-zinc-600">
                  Ich stimme zu, dass KüchenWert mich telefonisch zur Qualifizierung meiner Anfrage kontaktiert. *
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.consentMarketing ?? false}
                  onChange={(e) => update({ consentMarketing: e.target.checked })}
                  className="mt-0.5"
                />
                <span className="text-zinc-500">
                  Ich möchte Tipps und Angebote rund um den Küchenkauf per E-Mail erhalten (abbestellbar).
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button type="button" onClick={goBack} className="btn-secondary">
            Zurück
          </button>
          {step.id === "contact" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="btn-primary"
            >
              {submitting ? "Wird gesendet…" : "Kostenlos Angebote erhalten"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="btn-primary"
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
