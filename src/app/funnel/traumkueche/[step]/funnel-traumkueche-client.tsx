"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FunnelShell } from "@/components/funnel/funnel-shell";
import { CardStep } from "@/components/funnel/card-step";
import { ImageCardStep } from "@/components/funnel/image-card-step";
import { StyleHeroCardStep } from "@/components/funnel/traumkueche/style-hero-card-step";
import { ColorSwatchStep } from "@/components/funnel/traumkueche/color-swatch-step";
import { MultiFeatureStep } from "@/components/funnel/traumkueche/multi-feature-step";
import { GeneratingStep } from "@/components/funnel/traumkueche/generating-step";
import { RevealStep } from "@/components/funnel/traumkueche/reveal-step";
import { LeadGateStep } from "@/components/funnel/traumkueche/lead-gate-step";
import {
  APPLIANCE_LAYOUTS,
  APPLIANCE_SEGMENTS,
  FRONT_COLORS,
  KITCHEN_FORMS,
  KITCHEN_SIZES,
  KITCHEN_STYLES,
  STORAGE_FEATURES,
  SURFACE_FINISHES,
  WORKTOP_CHOICES,
  type Segment,
  type KitchenFormSlug,
} from "@/config/funnel-traumkueche-stammdaten";
import {
  createEmptyTraumkuecheData,
  findStepBySlug,
  findStepIndex,
  TRAUMKUECHE_STEPS,
  type TraumkuecheContact,
  type TraumkuecheData,
} from "@/config/funnel-traumkueche";
import { getStoredUtm, captureUtmParams } from "@/lib/utm";
import { initAnalytics, track } from "@/lib/analytics";

const STORAGE_KEY = "kw_traumkueche";

function loadSaved(): Partial<TraumkuecheData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(data: TraumkuecheData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface GenerateResponse {
  sessionId: string;
  sessionToken: string;
  renderId: string;
  version: number;
  status: string;
  mock?: boolean;
}

interface RenderPollResponse {
  status: "pending" | "success" | "failed";
  renderId: string;
  sessionId: string;
  sessionToken?: string;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  priceRange?: { minCents: number; maxCents: number } | null;
  expertNote?: string | null;
  error?: string;
}

export function FunnelTraumkuecheClient({
  stepSlug,
  turnstileSiteKey,
}: {
  stepSlug: string;
  turnstileSiteKey?: string;
}) {
  const router = useRouter();
  const stepIndex = findStepIndex(stepSlug);
  const step = findStepBySlug(stepSlug) ?? TRAUMKUECHE_STEPS[0]!;

  const [data, setData] = useState<TraumkuecheData>(() => {
    const saved = loadSaved();
    const base = createEmptyTraumkuecheData();
    // Falls bereits ein Token gespeichert, wiederverwenden
    return { ...base, ...saved };
  });

  const [generating, setGenerating] = useState(false);
  const [renderElapsed, setRenderElapsed] = useState(0);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderResult, setRenderResult] = useState<RenderPollResponse | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    persist(data);
  }, [data]);

  useEffect(() => {
    captureUtmParams();
    initAnalytics();
    if (stepIndex === 0) {
      track({ name: "planner_start", utm: getStoredUtm() as Record<string, string> });
    }
    track({ name: "planner_step_complete", step: step.slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepSlug]);

  const update = useCallback(
    (patch: Partial<TraumkuecheData>) =>
      setData((prev) => ({ ...prev, ...patch })),
    [],
  );

  const updateContact = useCallback(
    (patch: Partial<TraumkuecheContact>) =>
      setData((prev) => ({
        ...prev,
        contact: { ...(prev.contact ?? {}), ...patch },
      })),
    [],
  );

  const goTo = useCallback(
    (slug: string) => router.push(`/funnel/traumkueche/${slug}`),
    [router],
  );

  const goNext = useCallback(() => {
    if (stepIndex < TRAUMKUECHE_STEPS.length - 1) {
      goTo(TRAUMKUECHE_STEPS[stepIndex + 1]!.slug);
    }
  }, [stepIndex, goTo]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      goTo(TRAUMKUECHE_STEPS[stepIndex - 1]!.slug);
    } else {
      router.push("/traumkueche");
    }
  }, [stepIndex, goTo, router]);

  // ============================================================
  // Generation: startet automatisch beim Betreten des render-Steps
  // ============================================================
  const generationStartedRef = useRef(false);

  useEffect(() => {
    if (step.type !== "generating") return;
    if (generationStartedRef.current) return;
    generationStartedRef.current = true;

    void startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.type]);

  async function startGeneration() {
    setGenerating(true);
    setRenderError(null);
    setRenderResult(null);
    setRenderElapsed(0);

    try {
      const res = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: data.sessionToken,
          spec: data,
          turnstileToken,
          utm: getStoredUtm(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const payload = (await res.json()) as GenerateResponse;
      setRenderId(payload.renderId);

      // Polling
      const startedAt = Date.now();
      let lastResult: RenderPollResponse | null = null;
      const timeoutMs = 120_000;
      const intervalMs = 1_500;

      while (Date.now() - startedAt < timeoutMs) {
        await sleep(intervalMs);
        setRenderElapsed(Date.now() - startedAt);

        const pollRes = await fetch(`/api/planner/renders/${payload.renderId}`);
        if (!pollRes.ok) {
          throw new Error(`Poll-Fehler: HTTP ${pollRes.status}`);
        }
        lastResult = (await pollRes.json()) as RenderPollResponse;

        if (lastResult.status === "success") {
          setRenderResult(lastResult);
          update({
            currentRenderId: lastResult.renderId,
            priceRangeMinCents: lastResult.priceRange?.minCents,
            priceRangeMaxCents: lastResult.priceRange?.maxCents,
            expertNote: lastResult.expertNote ?? undefined,
          });
          track({
            name: "planner_image_generated",
            generationMs: Date.now() - startedAt,
          });
          setGenerating(false);
          goTo("ergebnis");
          return;
        }
        if (lastResult.status === "failed") {
          throw new Error(lastResult.error ?? "Generation fehlgeschlagen");
        }
      }

      throw new Error("Zeitueberschreitung");
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setGenerating(false);
    }
  }

  async function retryGeneration() {
    generationStartedRef.current = false;
    setRenderError(null);
    // Re-trigger
    generationStartedRef.current = true;
    await startGeneration();
  }

  // ============================================================
  // Lead-Gate Submit
  // ============================================================
  async function handleLeadGateSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const c = data.contact ?? {};
      const res = await fetch("/api/planner/save-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: data.sessionToken,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          plz: c.plz,
          consentDatenschutz: !!c.consentDatenschutz,
          consentAi: !!c.consentAi,
          consentCallback: !!c.consentCallback,
          consentMarketing: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const payload = (await res.json()) as { sessionId: string; leadId: string };

      track({
        name: "planner_lead_submitted",
        leadId: payload.leadId,
        plzRegion: (data.contact?.plz ?? "").slice(0, 2),
      });

      sessionStorage.removeItem(STORAGE_KEY);
      router.push(`/funnel/traumkueche/ergebnis/${payload.sessionId}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Senden fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================
  // Navigation-Steuerung
  // ============================================================
  function canProceed(): boolean {
    switch (step.type) {
      case "style-hero":
        return !!data.styleSlug;
      case "surface-finish":
        return !!data.surfaceFinishSlug;
      case "color-swatch":
        return !!data.frontColorSlug;
      case "worktop":
        return !!data.worktopSlug;
      case "storage-features":
        return true; // optional
      case "appliance-layouts":
        return true; // optional
      case "appliance-segment":
        return !!data.applianceSegment;
      case "form-size":
        return !!data.kitchenForm && !!data.kitchenSize;
      case "generating":
        return !!renderResult;
      case "reveal":
        return true;
      case "lead-gate":
        const c = data.contact;
        return (
          !!c?.firstName &&
          !!c?.lastName &&
          !!c?.email &&
          !!c?.plz &&
          /^\d{5}$/.test(c.plz) &&
          !!c?.consentDatenschutz &&
          !!c?.consentAi
        );
      default:
        return true;
    }
  }

  const isFinal = step.type === "lead-gate";

  // ============================================================
  // Render
  // ============================================================
  return (
    <FunnelShell
      currentStep={stepIndex}
      totalSteps={TRAUMKUECHE_STEPS.length}
      stepLabel={step.label}
      stepDescription={step.headline}
      onBack={goBack}
      onNext={isFinal ? handleLeadGateSubmit : goNext}
      canProceed={canProceed()}
      isFinalStep={isFinal}
      isSubmitting={submitting}
      submitLabel="Moodboard sichern"
      showExitIntent={step.type !== "generating" && step.type !== "reveal"}
    >
      <SubheadlineBlock text={step.subheadline} />

      {step.type === "style-hero" && (
        <StyleHeroCardStep
          options={[...KITCHEN_STYLES]}
          selected={data.styleSlug ?? null}
          onSelect={(slug) => update({ styleSlug: slug })}
          onAutoAdvance={goNext}
        />
      )}

      {step.type === "surface-finish" && (
        <CardStep
          options={SURFACE_FINISHES.map((s) => ({
            id: s.slug,
            label: s.label,
            description: s.description,
          }))}
          selected={data.surfaceFinishSlug ?? ""}
          onSelect={(id) => update({ surfaceFinishSlug: id })}
          onAutoAdvance={goNext}
          columns={3}
        />
      )}

      {step.type === "color-swatch" && (
        <ColorSwatchStep
          options={[...FRONT_COLORS]}
          selected={data.frontColorSlug ?? null}
          onSelect={(slug) => update({ frontColorSlug: slug })}
          onAutoAdvance={goNext}
        />
      )}

      {step.type === "worktop" && (
        <CardStep
          options={WORKTOP_CHOICES.map((w) => ({
            id: w.slug,
            label: w.label,
            description: w.description,
          }))}
          selected={data.worktopSlug ?? ""}
          onSelect={(id) => update({ worktopSlug: id })}
          onAutoAdvance={goNext}
          columns={2}
        />
      )}

      {step.type === "storage-features" && (
        <MultiFeatureStep
          options={STORAGE_FEATURES.map((s) => ({
            slug: s.slug,
            label: s.label,
            description: s.description,
          }))}
          selected={data.storageFeatures}
          onSelectionChange={(slugs) => update({ storageFeatures: slugs })}
          groups={[
            {
              key: "stauraum",
              label: "Stauraum",
              slugs: [
                "deckenhoch",
                "insel-rueckseite-schraenke",
                "apothekerauszug",
                "eckkarussell",
                "sockelschublade",
                "kraeuterregal",
                "abfalltrennung",
              ],
            },
            {
              key: "beleuchtung",
              label: "Beleuchtung",
              slugs: [
                "beleuchtung-unterboden",
                "beleuchtung-innen",
                "beleuchtung-nischen",
              ],
            },
            {
              key: "details",
              label: "Details",
              slugs: ["glas-rueckwand", "steckdosen-arbeitsplatte"],
            },
          ]}
        />
      )}

      {step.type === "appliance-layouts" && (
        <MultiFeatureStep
          options={APPLIANCE_LAYOUTS.map((a) => ({
            slug: a.slug,
            label: a.label,
            description: a.description,
          }))}
          selected={data.applianceLayouts}
          onSelectionChange={(slugs) => update({ applianceLayouts: slugs })}
          groups={[
            {
              key: "backofen",
              label: "Backofen + Kaffee",
              slugs: APPLIANCE_LAYOUTS.filter((a) => a.category === "backofen").map(
                (a) => a.slug,
              ),
            },
            {
              key: "kochfeld",
              label: "Kochfeld",
              slugs: APPLIANCE_LAYOUTS.filter((a) => a.category === "kochfeld").map(
                (a) => a.slug,
              ),
            },
            {
              key: "kuehlschrank",
              label: "Kuehlschrank",
              slugs: APPLIANCE_LAYOUTS.filter(
                (a) => a.category === "kuehlschrank",
              ).map((a) => a.slug),
            },
            {
              key: "geschirrspueler",
              label: "Geschirrspueler",
              slugs: APPLIANCE_LAYOUTS.filter(
                (a) => a.category === "geschirrspueler",
              ).map((a) => a.slug),
            },
            {
              key: "extras",
              label: "Extras",
              slugs: APPLIANCE_LAYOUTS.filter((a) => a.category === "extras").map(
                (a) => a.slug,
              ),
            },
          ]}
        />
      )}

      {step.type === "appliance-segment" && (
        <CardStep
          options={APPLIANCE_SEGMENTS.map((s) => ({
            id: s.slug,
            label: s.label,
            description: `${s.description} · ${s.exampleBrands}`,
          }))}
          selected={data.applianceSegment ?? ""}
          onSelect={(id) => update({ applianceSegment: id as Segment })}
          onAutoAdvance={goNext}
          columns={2}
        />
      )}

      {step.type === "form-size" && (
        <div className="space-y-6">
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Kuechenform
            </div>
            <ImageCardStep
              options={KITCHEN_FORMS.map((f) => ({
                id: f.slug,
                label: f.label,
                description: f.description,
                bgClass: "bg-neutral-100",
                imageSrc: f.heroImage,
              }))}
              selected={data.kitchenForm ? [data.kitchenForm] : []}
              onSelectionChange={(ids) => update({ kitchenForm: ids[0] as KitchenFormSlug })}
              multiple={false}
              columns={3}
            />
          </div>
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Ungefaehre Groesse
            </div>
            <CardStep
              options={KITCHEN_SIZES.map((s) => ({
                id: s.slug,
                label: s.label,
                description: s.description,
              }))}
              selected={data.kitchenSize ?? ""}
              onSelect={(id) => update({ kitchenSize: id as TraumkuecheData["kitchenSize"] })}
              onAutoAdvance={goNext}
              columns={4}
            />
          </div>
        </div>
      )}

      {step.type === "generating" && (
        <div className="space-y-4">
          <GeneratingStep elapsedMs={renderElapsed} />
          {renderError && (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <div className="text-sm font-semibold text-red-700">
                Generation fehlgeschlagen: {renderError}
              </div>
              <button type="button" onClick={retryGeneration} className="btn-secondary">
                Erneut versuchen
              </button>
            </div>
          )}
        </div>
      )}

      {step.type === "reveal" && (
        <RevealBlock
          renderResult={renderResult}
          priceRangeFormatted={
            renderResult?.priceRange
              ? formatPriceRange(renderResult.priceRange)
              : undefined
          }
          onContinue={() => goTo("kontakt")}
        />
      )}

      {step.type === "lead-gate" && (
        <LeadGateStep
          contact={data.contact ?? {}}
          onChange={updateContact}
          onSubmit={handleLeadGateSubmit}
          submitting={submitting}
          submitError={submitError}
          turnstileSiteKey={turnstileSiteKey}
          onTurnstileToken={setTurnstileToken}
          imageUrl={renderResult?.imageUrl ?? undefined}
          priceRangeFormatted={
            renderResult?.priceRange
              ? formatPriceRange(renderResult.priceRange)
              : undefined
          }
        />
      )}
    </FunnelShell>
  );
}

function SubheadlineBlock({ text }: { text: string }) {
  return (
    <p className="-mt-2 mb-5 text-center text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
      {text}
    </p>
  );
}

function RevealBlock({
  renderResult,
  priceRangeFormatted,
  onContinue,
}: {
  renderResult: RenderPollResponse | null;
  priceRangeFormatted?: string;
  onContinue: () => void;
}) {
  if (!renderResult || !renderResult.imageUrl) {
    return (
      <div className="text-center text-sm text-ink-muted">
        Bild wird geladen ...
      </div>
    );
  }
  return (
    <RevealStep
      imageUrl={renderResult.imageUrl}
      imageWidth={renderResult.imageWidth ?? 1920}
      imageHeight={renderResult.imageHeight ?? 1080}
      onContinue={onContinue}
      priceRangeFormatted={priceRangeFormatted}
    />
  );
}

function formatPriceRange(range: { minCents: number; maxCents: number }): string {
  const fmt = (c: number) =>
    new Intl.NumberFormat("de-DE").format(Math.round(c / 100));
  return `${fmt(range.minCents)} - ${fmt(range.maxCents)} EUR`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
