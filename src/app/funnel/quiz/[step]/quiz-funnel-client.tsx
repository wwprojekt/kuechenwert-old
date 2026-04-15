"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FunnelShell } from "@/components/funnel/funnel-shell";
import { CardStep } from "@/components/funnel/card-step";
import { MultiCardStep } from "@/components/funnel/multi-card-step";
import { ImageCardStep } from "@/components/funnel/image-card-step";
import { UploadStep } from "@/components/funnel/upload-step";
import { PlzStep } from "@/components/funnel/plz-step";
import {
  ContactStep,
  isContactComplete,
  type ContactData,
} from "@/components/funnel/contact-step";
import {
  QUIZ_STEPS,
  QUIZ_STYLE_OPTIONS,
  QUIZ_COLOR_OPTIONS,
  QUIZ_FORM_OPTIONS,
  QUIZ_PRIORITY_OPTIONS,
  FUNNEL_QUIZ_ID,
  createEmptyQuizData,
  calculateQuizResult,
  type QuizFunnelData,
} from "@/config/funnel-quiz";

const STORAGE_KEY = "kw_funnel_quiz";

function loadSaved(): Partial<QuizFunnelData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    delete parsed.floorPlanFile;
    return parsed;
  } catch {
    return {};
  }
}

function persist(data: QuizFunnelData) {
  if (typeof window === "undefined") return;
  const { floorPlanFile, ...serializable } = data;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

export function QuizFunnelClient({ stepSlug }: { stepSlug: string }) {
  const router = useRouter();
  const stepIndex = QUIZ_STEPS.findIndex((s) => s.slug === stepSlug);
  const step = QUIZ_STEPS[stepIndex];

  const [data, setData] = useState<QuizFunnelData>(() => ({
    ...createEmptyQuizData(),
    ...loadSaved(),
  }));

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    persist(data);
  }, [data]);

  const update = useCallback(
    (patch: Partial<QuizFunnelData>) =>
      setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const goNext = useCallback(() => {
    if (stepIndex < QUIZ_STEPS.length - 1) {
      router.push(`/funnel/quiz/${QUIZ_STEPS[stepIndex + 1].slug}`);
    }
  }, [stepIndex, router]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      router.push(`/funnel/quiz/${QUIZ_STEPS[stepIndex - 1].slug}`);
    } else {
      router.push("/style-quiz");
    }
  }, [stepIndex, router]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const quizResult = calculateQuizResult(data);

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funnel_type: FUNNEL_QUIZ_ID,
          quizStyles: data.styles,
          quizColors: data.colors,
          kitchenForm: data.kitchenForm,
          quizPriorities: data.priorities,
          plz: data.plz,
          quizResult,
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
        // Store result for the result page
        sessionStorage.setItem(
          "kw_quiz_result",
          JSON.stringify(quizResult),
        );
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/funnel/ergebnis");
      }
    } catch {
      // TODO: show user-facing error
    } finally {
      setSubmitting(false);
    }
  }

  function canProceed(): boolean {
    switch (step.slug) {
      case "stil":
        return data.styles.length > 0;
      case "farbe":
        return data.colors.length > 0;
      case "form":
        return !!data.kitchenForm;
      case "prioritaeten":
        return data.priorities.length > 0;
      case "grundriss":
        return true; // skippable
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
      totalSteps={QUIZ_STEPS.length}
      stepLabel={step.label}
      stepDescription={step.description}
      onBack={goBack}
      onNext={isFinal ? handleSubmit : goNext}
      canProceed={canProceed()}
      isFinalStep={isFinal}
      isSubmitting={submitting}
      submitLabel="Ergebnis anzeigen & Angebote erhalten"
    >
      {step.slug === "stil" && (
        <ImageCardStep
          options={QUIZ_STYLE_OPTIONS.map((s) => ({
            id: s.id,
            label: s.label,
            bgClass: s.bgClass,
          }))}
          selected={data.styles}
          onSelectionChange={(ids) => update({ styles: ids })}
          multiple
          columns={2}
        />
      )}

      {step.slug === "farbe" && (
        <ImageCardStep
          options={QUIZ_COLOR_OPTIONS.map((c) => ({
            id: c.id,
            label: c.label,
            bgClass: c.bgClass,
          }))}
          selected={data.colors}
          onSelectionChange={(ids) => update({ colors: ids })}
          multiple
          columns={3}
        />
      )}

      {step.slug === "form" && (
        <CardStep
          options={QUIZ_FORM_OPTIONS.map((f) => ({
            id: f.id,
            label: f.label,
          }))}
          selected={data.kitchenForm}
          onSelect={(id) => update({ kitchenForm: id })}
          columns={5}
        />
      )}

      {step.slug === "prioritaeten" && (
        <MultiCardStep
          options={QUIZ_PRIORITY_OPTIONS.map((p) => ({
            id: p.id,
            label: p.label,
          }))}
          selected={data.priorities}
          onSelectionChange={(ids) => update({ priorities: ids })}
          maxSelections={3}
          columns={3}
          hint="Wählen Sie bis zu 3 Dinge, die Ihnen bei Ihrer neuen Küche am wichtigsten sind."
        />
      )}

      {step.slug === "grundriss" && (
        <UploadStep
          file={data.floorPlanFile}
          onFileChange={(f) => update({ floorPlanFile: f })}
          label="Grundriss hochladen"
          helpText="Laden Sie Ihren Grundriss hoch, damit die Küchenstudios präzisere Angebote erstellen können. Alle Raummaße, Türen, Fenster und Anschlüsse sollten erkennbar sein."
          skippable
          skipLabel="Ich habe keinen Grundriss – überspringen"
          onSkip={goNext}
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
          onChange={(patch) => update(patch as Partial<QuizFunnelData>)}
        />
      )}
    </FunnelShell>
  );
}
