"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FunnelShell } from "@/components/funnel/funnel-shell";
import { CardStep } from "@/components/funnel/card-step";
import { PlzStep } from "@/components/funnel/plz-step";
import {
  ContactStep,
  isContactComplete,
  type ContactData,
} from "@/components/funnel/contact-step";
import {
  ANGEBOTE_STEPS,
  ANGEBOTE_KITCHEN_FORMS,
  ANGEBOTE_BUDGETS,
  ANGEBOTE_TIMEFRAMES,
  FUNNEL_ANGEBOTE_ID,
  createEmptyAngeboteData,
  type AngeboteFunnelData,
} from "@/config/funnel-angebote";

const STORAGE_KEY = "kw_funnel_angebote";

function loadSaved(): Partial<AngeboteFunnelData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(data: AngeboteFunnelData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function AngeboteFunnelClient({
  stepSlug,
  initialPlz,
}: {
  stepSlug: string;
  initialPlz: string;
}) {
  const router = useRouter();
  const stepIndex = ANGEBOTE_STEPS.findIndex((s) => s.slug === stepSlug);
  const step = ANGEBOTE_STEPS[stepIndex];

  const [data, setData] = useState<AngeboteFunnelData>(() => {
    const saved = loadSaved();
    const base = createEmptyAngeboteData();
    return {
      ...base,
      ...saved,
      ...(initialPlz ? { plz: initialPlz } : {}),
    };
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    persist(data);
  }, [data]);

  const update = useCallback(
    (patch: Partial<AngeboteFunnelData>) =>
      setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goNext = useCallback(() => {
    if (stepIndex < ANGEBOTE_STEPS.length - 1) {
      router.push(`/funnel/angebote/${ANGEBOTE_STEPS[stepIndex + 1].slug}`);
    }
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      router.push(`/funnel/angebote/${ANGEBOTE_STEPS[stepIndex - 1].slug}`);
    } else {
      router.push("/angebote-vergleichen");
    }
  }, [stepIndex, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnel_type: FUNNEL_ANGEBOTE_ID,
          ...data,
        }),
      });
      if (res.ok) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/funnel/danke?funnel=angebote");
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
      case "budget":
        return !!data.budget;
      case "zeitrahmen":
        return !!data.timeframe;
      case "plz":
        return /^\d{5}$/.test(data.plz);
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
      totalSteps={ANGEBOTE_STEPS.length}
      stepLabel={step.label}
      stepDescription={step.description}
      onBack={goBack}
      onNext={isFinal ? handleSubmit : goNext}
      canProceed={canProceed()}
      isFinalStep={isFinal}
      isSubmitting={submitting}
      submitLabel="Kostenlos 3 Angebote erhalten"
    >
      {step.slug === "kuechenform" && (
        <CardStep
          options={ANGEBOTE_KITCHEN_FORMS.map((f) => ({
            id: f.id,
            label: f.label,
          }))}
          selected={data.kitchenForm}
          onSelect={(id) => update({ kitchenForm: id })}
          columns={5}
        />
      )}

      {step.slug === "budget" && (
        <CardStep
          options={ANGEBOTE_BUDGETS.map((b) => ({
            id: b.id,
            label: b.label,
          }))}
          selected={data.budget}
          onSelect={(id) => update({ budget: id })}
          columns={3}
        />
      )}

      {step.slug === "zeitrahmen" && (
        <CardStep
          options={ANGEBOTE_TIMEFRAMES.map((t) => ({
            id: t.id,
            label: t.label,
          }))}
          selected={data.timeframe}
          onSelect={(id) => update({ timeframe: id })}
          columns={3}
        />
      )}

      {step.slug === "plz" && (
        <PlzStep
          value={data.plz}
          onChange={(plz) => update({ plz })}
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
          onChange={(patch) => update(patch as Partial<AngeboteFunnelData>)}
        />
      )}
    </FunnelShell>
  );
}
