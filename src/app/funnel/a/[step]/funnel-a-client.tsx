"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FunnelShell } from "@/components/funnel/funnel-shell";
import { CardStep } from "@/components/funnel/card-step";
import { ImageCardStep } from "@/components/funnel/image-card-step";
import { MultiCardStep } from "@/components/funnel/multi-card-step";
import { PlzStep } from "@/components/funnel/plz-step";
import {
  ContactStep,
  isContactComplete,
} from "@/components/funnel/contact-step";
import {
  BudgetSliderStep,
  isBudgetValid,
} from "@/components/funnel/budget-slider-step";
import {
  PhoneStep,
  isPhoneStepComplete,
} from "@/components/funnel/phone-step";
import {
  FUNNEL_A_ID,
  FUNNEL_A_STEPS,
  FUNNEL_A_OCCASIONS,
  FUNNEL_A_HOUSING,
  FUNNEL_A_KITCHEN_FORMS,
  FUNNEL_A_SIZES,
  FUNNEL_A_STYLES,
  FUNNEL_A_TIMEFRAMES,
  FUNNEL_A_BUDGET_SLIDER,
  createEmptyFunnelAData,
  type FunnelAData,
  type FunnelAStammdaten,
} from "@/config/funnel-a";
import { getStoredUtm } from "@/lib/utm";
import {
  OCCASION_ICONS,
  HOUSING_ICONS,
  SIZE_ICONS,
  TIMEFRAME_ICONS,
  WORKTOP_FALLBACK_ICON,
} from "@/components/funnel/funnel-a-icons";

const STORAGE_KEY = "kw_funnel_a";

function loadSaved(): Partial<FunnelAData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(data: FunnelAData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function FunnelAClient({
  stepSlug,
  initialPlz,
  stammdaten,
}: {
  stepSlug: string;
  initialPlz: string;
  stammdaten: FunnelAStammdaten;
}) {
  const router = useRouter();
  const stepIndex = FUNNEL_A_STEPS.findIndex((s) => s.slug === stepSlug);
  const step = FUNNEL_A_STEPS[stepIndex];

  const [data, setData] = useState<FunnelAData>(() => {
    const saved = loadSaved();
    const base = createEmptyFunnelAData();
    return {
      ...base,
      ...saved,
      ...(initialPlz ? { plz: initialPlz } : {}),
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    persist(data);
  }, [data]);

  const update = useCallback(
    (patch: Partial<FunnelAData>) =>
      setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goNext = useCallback(() => {
    if (stepIndex < FUNNEL_A_STEPS.length - 1) {
      router.push(`/funnel/a/${FUNNEL_A_STEPS[stepIndex + 1].slug}`);
    }
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      router.push(`/funnel/a/${FUNNEL_A_STEPS[stepIndex - 1].slug}`);
    } else {
      router.push("/");
    }
  }, [stepIndex, router]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const housingType = FUNNEL_A_HOUSING.find((h) => h.id === data.housing)
        ?.housing_type;

      const payload = {
        funnel_type: FUNNEL_A_ID,
        funnel_variant: "a",

        // Eigene Auswahl
        purchaseReason: data.occasion,
        housing_type: housingType ?? null,
        kitchenForm: data.kitchenForm,
        kitchen_size: data.size,
        kitchenStyle: data.style,

        // Stammdaten-Wuensche - als Namen mappen fuer Lesbarkeit im Backend
        front_material_ids: data.frontMaterialIds,
        front_material_names: data.frontMaterialIds
          .map((id) => stammdaten.frontMaterials.find((f) => f.id === id)?.name)
          .filter(Boolean),
        worktop_material_id: data.worktopMaterialId || null,
        worktop_material_name:
          stammdaten.worktopMaterials.find(
            (w) => w.id === data.worktopMaterialId,
          )?.name ?? null,
        appliance_brand_ids: data.applianceBrandIds,
        appliance_brand_names: data.applianceBrandIds
          .map(
            (id) => stammdaten.applianceBrands.find((b) => b.id === id)?.name,
          )
          .filter(Boolean),

        timeframe: data.timeframe,
        // Budget als Number (Slider-Wert) – API liest `budgetEur` direkt.
        // Falls Nutzer den Slider nicht berührt hat, gilt der Default.
        budget: "slider",
        budgetEur: data.budget || FUNNEL_A_BUDGET_SLIDER.default,
        plz: data.plz,

        // Adresse wird erst nach Lead-Kauf vom Händler eingeholt
        // (address_line / city werden dann bei Bedarf nachgetragen).

        salutation: data.salutation,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        consentCall: data.consentCall,
        consentMarketing: data.consentMarketing,

        ...getStoredUtm(),
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Senden fehlgeschlagen");
      }
      sessionStorage.removeItem(STORAGE_KEY);
      router.push("/funnel/danke?funnel=a");
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Senden fehlgeschlagen",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function canProceed(): boolean {
    switch (step.slug) {
      case "anlass":
        return !!data.occasion;
      case "wohnsituation":
        return !!data.housing;
      case "kuechenform":
        return !!data.kitchenForm;
      case "groesse":
        return !!data.size || !step.required;
      case "stil":
        return !!data.style || !step.required;
      case "fronten":
      case "geraete":
      case "arbeitsplatte":
        return true;
      case "zeitrahmen":
        return !!data.timeframe;
      case "budget":
        return isBudgetValid(
          data.budget || FUNNEL_A_BUDGET_SLIDER.default,
          FUNNEL_A_BUDGET_SLIDER.min,
          FUNNEL_A_BUDGET_SLIDER.max,
        );
      case "plz":
        return /^\d{5}$/.test(data.plz);
      case "kontakt":
        return isContactComplete(
          {
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            consentCall: data.consentCall,
            consentMarketing: data.consentMarketing,
          },
          "without-phone",
        );
      case "telefon":
        return isPhoneStepComplete({
          phone: data.phone,
          consentCall: data.consentCall,
          consentMarketing: data.consentMarketing,
        });
      default:
        return false;
    }
  }

  const isFinal = step.slug === "telefon";

  return (
    <FunnelShell
      currentStep={stepIndex}
      totalSteps={FUNNEL_A_STEPS.length}
      stepLabel={step.label}
      stepDescription={step.description}
      onBack={goBack}
      onNext={isFinal ? handleSubmit : goNext}
      canProceed={canProceed()}
      isFinalStep={isFinal}
      isSubmitting={submitting}
      submitLabel="Kostenlose Angebote anfordern"
    >
      {step.slug === "anlass" && (
        <CardStep
          options={FUNNEL_A_OCCASIONS.map((o) => ({
            id: o.id,
            label: o.label,
            description: o.description,
            icon: OCCASION_ICONS[o.id],
          }))}
          selected={data.occasion}
          onSelect={(id) => update({ occasion: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "wohnsituation" && (
        <CardStep
          options={FUNNEL_A_HOUSING.map((h) => ({
            id: h.id,
            label: h.label,
            description: h.description,
            icon: HOUSING_ICONS[h.id],
          }))}
          selected={data.housing}
          onSelect={(id) => update({ housing: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "kuechenform" && (
        <ImageCardStep
          options={FUNNEL_A_KITCHEN_FORMS.map((f) => ({
            id: f.id,
            label: f.label,
            description: f.description,
            bgClass: f.bgClass,
            imageSrc: f.imageSrc,
          }))}
          selected={data.kitchenForm ? [data.kitchenForm] : []}
          onSelectionChange={(ids) => update({ kitchenForm: ids[0] ?? "" })}
          autoAdvanceMs={300}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "groesse" && (
        <CardStep
          options={FUNNEL_A_SIZES.map((s) => ({
            id: s.id,
            label: s.label,
            description: s.description,
            icon: SIZE_ICONS[s.id],
          }))}
          selected={data.size}
          onSelect={(id) => update({ size: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "stil" && (
        <ImageCardStep
          options={FUNNEL_A_STYLES.map((s) => ({
            id: s.id,
            label: s.label,
            description: s.description,
            bgClass: s.bgClass,
            imageSrc: s.imageSrc,
          }))}
          selected={data.style ? [data.style] : []}
          onSelectionChange={(ids) => update({ style: ids[0] ?? "" })}
          autoAdvanceMs={300}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "fronten" && (
        <MultiCardStep
          options={stammdaten.frontMaterials.map((f) => ({
            id: f.id,
            label: f.name,
          }))}
          selected={data.frontMaterialIds}
          onSelectionChange={(ids) => update({ frontMaterialIds: ids })}
          maxSelections={3}
          hint="Wählen Sie bis zu 3 Fronten, die Ihnen gefallen – oder überspringen Sie diesen Schritt."
          columns={2}
        />
      )}

      {step.slug === "arbeitsplatte" && (
        <CardStep
          options={[
            {
              id: "",
              label: "Egal / Beratung gewünscht",
              description: "",
              icon: WORKTOP_FALLBACK_ICON,
            },
            ...stammdaten.worktopMaterials.map((w) => ({
              id: w.id,
              label: w.name,
              icon: WORKTOP_FALLBACK_ICON,
            })),
          ]}
          selected={data.worktopMaterialId || ""}
          onSelect={(id) => update({ worktopMaterialId: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "geraete" && (
        <MultiCardStep
          options={stammdaten.applianceBrands.map((b) => ({
            id: b.id,
            label: b.name,
          }))}
          selected={data.applianceBrandIds}
          onSelectionChange={(ids) => update({ applianceBrandIds: ids })}
          maxSelections={4}
          hint="Bevorzugen Sie bestimmte Geräte-Marken? (optional, max. 4)"
          columns={3}
        />
      )}

      {step.slug === "zeitrahmen" && (
        <CardStep
          options={FUNNEL_A_TIMEFRAMES.map((t) => ({
            id: t.id,
            label: t.label,
            icon: TIMEFRAME_ICONS[t.id],
          }))}
          selected={data.timeframe}
          onSelect={(id) => update({ timeframe: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.slug === "budget" && (
        <BudgetSliderStep
          value={data.budget}
          onChange={(v) => update({ budget: v })}
          min={FUNNEL_A_BUDGET_SLIDER.min}
          max={FUNNEL_A_BUDGET_SLIDER.max}
          step={FUNNEL_A_BUDGET_SLIDER.step}
          defaultValue={FUNNEL_A_BUDGET_SLIDER.default}
        />
      )}

      {step.slug === "plz" && (
        <PlzStep value={data.plz} onChange={(plz) => update({ plz })} />
      )}

      {step.slug === "kontakt" && (
        <ContactStep
          variant="without-phone"
          data={{
            salutation: data.salutation,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            consentCall: data.consentCall,
            consentMarketing: data.consentMarketing,
          }}
          onChange={(patch) => update(patch as Partial<FunnelAData>)}
        />
      )}

      {step.slug === "telefon" && (
        <>
          <PhoneStep
            data={{
              phone: data.phone,
              consentCall: data.consentCall,
              consentMarketing: data.consentMarketing,
            }}
            onChange={(patch) => update(patch as Partial<FunnelAData>)}
          />
          {submitError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}
        </>
      )}
    </FunnelShell>
  );
}
