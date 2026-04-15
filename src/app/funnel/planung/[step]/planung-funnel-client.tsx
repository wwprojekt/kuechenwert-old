"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FunnelShell } from "@/components/funnel/funnel-shell";
import { CardStep } from "@/components/funnel/card-step";
import { MultiCardStep } from "@/components/funnel/multi-card-step";
import { TextareaStep } from "@/components/funnel/textarea-step";
import { UploadStep } from "@/components/funnel/upload-step";
import {
  ContactStep,
  isContactComplete,
  type ContactData,
} from "@/components/funnel/contact-step";
import {
  PLANUNG_STEPS,
  PLANUNG_KITCHEN_FORMS,
  PLANUNG_STYLES,
  PLANUNG_ROOM_TYPES,
  PLANUNG_COLORS,
  PLANUNG_EQUIPMENT,
  PLANUNG_HOUSEHOLD,
  PLANUNG_TIMEFRAMES,
  PLANUNG_REASONS,
  PLANUNG_BUDGETS,
  FUNNEL_PLANUNG_ID,
  createEmptyPlanungData,
  type PlanungFunnelData,
} from "@/config/funnel-planung";

const STORAGE_KEY = "kw_funnel_planung";

function loadSaved(): Partial<PlanungFunnelData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // File cannot be restored from sessionStorage
    delete parsed.floorPlanFile;
    return parsed;
  } catch {
    return {};
  }
}

function persist(data: PlanungFunnelData) {
  if (typeof window === "undefined") return;
  const { floorPlanFile, ...serializable } = data;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function PlanungFunnelClient({ stepSlug }: { stepSlug: string }) {
  const router = useRouter();
  const stepIndex = PLANUNG_STEPS.findIndex((s) => s.slug === stepSlug);
  const step = PLANUNG_STEPS[stepIndex];

  const [data, setData] = useState<PlanungFunnelData>(() => ({
    ...createEmptyPlanungData(),
    ...loadSaved(),
  }));

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    persist(data);
  }, [data]);

  const update = useCallback(
    (patch: Partial<PlanungFunnelData>) =>
      setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goNext = useCallback(() => {
    if (stepIndex < PLANUNG_STEPS.length - 1) {
      router.push(`/funnel/planung/${PLANUNG_STEPS[stepIndex + 1].slug}`);
    }
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      router.push(`/funnel/planung/${PLANUNG_STEPS[stepIndex - 1].slug}`);
    } else {
      router.push("/kuechenplanung");
    }
  }, [stepIndex, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnel_type: FUNNEL_PLANUNG_ID,
          kitchenForm: data.kitchenForm,
          style: data.style,
          roomType: data.roomType,
          color: data.color,
          equipment: data.equipment,
          household: data.household,
          timeframe: data.timeframe,
          reason: data.reason,
          budget: data.budget,
          freeText: data.freeText,
          salutation: data.salutation,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          consentCall: data.consentCall,
          consentMarketing: data.consentMarketing,
        }),
      });
      if (res.ok) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/funnel/danke?funnel=planung");
      }
    } catch {
      // TODO: show user-facing error
    } finally {
      setSubmitting(false);
    }
  }

  function canProceed(): boolean {
    switch (step.slug) {
      case "kuechenform":
        return !!data.kitchenForm;
      case "stil":
        return !!data.style;
      case "raum":
        return !!data.roomType;
      case "farbe":
        return !!data.color;
      case "ausstattung":
        return true; // optional multi-select
      case "haushalt":
        return !!data.household;
      case "zeitrahmen":
        return !!data.timeframe;
      case "anlass":
        return !!data.reason;
      case "budget":
        return !!data.budget;
      case "sonstiges":
        return true; // optional
      case "kontakt":
        return isContactComplete({
          salutation: data.salutation,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          consentCall: data.consentCall,
          consentMarketing: data.consentMarketing,
        });
      default:
        return false;
    }
  }

  const isFinal = step.slug === "kontakt";

  return (
    <FunnelShell
      currentStep={stepIndex}
      totalSteps={PLANUNG_STEPS.length}
      stepLabel={step.label}
      stepDescription={step.description}
      onBack={goBack}
      onNext={isFinal ? handleSubmit : goNext}
      canProceed={canProceed()}
      isFinalStep={isFinal}
      isSubmitting={submitting}
      submitLabel="Kostenloses Angebot erhalten"
      showExitIntent
    >
      {step.slug === "kuechenform" && (
        <CardStep
          options={PLANUNG_KITCHEN_FORMS.map((f) => ({
            id: f.id,
            label: f.label,
          }))}
          selected={data.kitchenForm}
          onSelect={(id) => update({ kitchenForm: id })}
          columns={3}
        />
      )}

      {step.slug === "stil" && (
        <CardStep
          options={PLANUNG_STYLES.map((s) => ({
            id: s.id,
            label: s.label,
          }))}
          selected={data.style}
          onSelect={(id) => update({ style: id })}
          columns={3}
        />
      )}

      {step.slug === "raum" && (
        <CardStep
          options={PLANUNG_ROOM_TYPES.map((r) => ({
            id: r.id,
            label: r.label,
          }))}
          selected={data.roomType}
          onSelect={(id) => update({ roomType: id })}
          columns={3}
        />
      )}

      {step.slug === "farbe" && (
        <CardStep
          options={PLANUNG_COLORS.map((c) => ({
            id: c.id,
            label: c.label,
          }))}
          selected={data.color}
          onSelect={(id) => update({ color: id })}
          columns={4}
        />
      )}

      {step.slug === "ausstattung" && (
        <MultiCardStep
          options={PLANUNG_EQUIPMENT.map((e) => ({
            id: e.id,
            label: e.label,
          }))}
          selected={data.equipment}
          onSelectionChange={(ids) => update({ equipment: ids })}
          columns={3}
          hint="Wählen Sie alle Ausstattungsmerkmale, die Ihnen wichtig sind."
        />
      )}

      {step.slug === "haushalt" && (
        <CardStep
          options={PLANUNG_HOUSEHOLD.map((h) => ({
            id: h.id,
            label: h.label,
          }))}
          selected={data.household}
          onSelect={(id) => update({ household: id })}
          columns={4}
        />
      )}

      {step.slug === "zeitrahmen" && (
        <CardStep
          options={PLANUNG_TIMEFRAMES.map((t) => ({
            id: t.id,
            label: t.label,
          }))}
          selected={data.timeframe}
          onSelect={(id) => update({ timeframe: id })}
          columns={4}
        />
      )}

      {step.slug === "anlass" && (
        <CardStep
          options={PLANUNG_REASONS.map((r) => ({
            id: r.id,
            label: r.label,
          }))}
          selected={data.reason}
          onSelect={(id) => update({ reason: id })}
          columns={3}
        />
      )}

      {step.slug === "budget" && (
        <CardStep
          options={PLANUNG_BUDGETS.map((b) => ({
            id: b.id,
            label: b.label,
          }))}
          selected={data.budget}
          onSelect={(id) => update({ budget: id })}
          columns={4}
        />
      )}

      {step.slug === "sonstiges" && (
        <TextareaStep
          value={data.freeText}
          onChange={(v) => update({ freeText: v })}
          placeholder="z.B. besondere Maße, spezielle Geräte, Barrierefreiheit…"
          helpText="Optional: Gibt es sonst noch etwas, das Sie uns mitteilen möchten?"
        />
      )}

      {step.slug === "kontakt" && (
        <ContactStep
          data={{
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            consentCall: data.consentCall,
            consentMarketing: data.consentMarketing,
          }}
          onChange={(patch) => update(patch as Partial<PlanungFunnelData>)}
        >
          {/* Floor plan upload integrated into contact step */}
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="mb-3 text-sm font-medium text-zinc-700">
              Grundriss hochladen (optional)
            </p>
            <UploadStep
              file={data.floorPlanFile}
              onFileChange={(f) => update({ floorPlanFile: f })}
              label="Grundriss auswählen"
              helpText="Für eine präzisere Planung: Laden Sie Ihren Grundriss hoch (alle Maße, Türen, Fenster und Anschlüsse sollten erkennbar sein)."
              skippable={false}
            />
          </div>
        </ContactStep>
      )}
    </FunnelShell>
  );
}
