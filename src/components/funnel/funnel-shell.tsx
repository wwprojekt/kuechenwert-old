"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Lock, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { BadgeTuevStyle, BadgeEkomiStyle, BadgeDsgvoStyle, BadgeSslStyle } from "@/components/ui/trust-badges";

interface FunnelShellProps {
  children: React.ReactNode;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Step label shown above the content */
  stepLabel: string;
  /** Step description */
  stepDescription: string;
  /** Called when back button is pressed */
  onBack: () => void;
  /** Called when next/submit button is pressed */
  onNext: () => void;
  /** Whether the next button should be disabled */
  canProceed: boolean;
  /** Whether this is the final step with a submit action */
  isFinalStep?: boolean;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Custom label for the next button */
  nextLabel?: string;
  /** Custom label for the submit button */
  submitLabel?: string;
  /** Show exit intent dialog when user tries to leave */
  showExitIntent?: boolean;
}

const SUPPORT_PHONE_DISPLAY = "+49 30 - 555 80 100";
const SUPPORT_PHONE_TEL = "+493055580100";

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = Math.min(100, Math.round(((current + 1) / total) * 100));
  return (
    <div className="w-full" aria-label={`Schritt ${current + 1} von ${total}`}>
      {/* Schlanker, dezenter Fortschrittsbalken – wie küchenportal.de */}
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Unauffälliger Step-Counter direkt darunter */}
      <div className="mt-1.5 text-right text-[11px] font-medium text-ink-subtle">
        {current + 1} / {total}
      </div>
    </div>
  );
}

function ExitIntentDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-elevated">
        <h3 className="text-lg font-bold text-black">Wirklich abbrechen?</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Ihre Angaben werden nicht gespeichert und wir können Ihnen keine
          kostenlosen Angebote erstellen.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button type="button" onClick={onStay} className="btn-primary w-full">
            Weiter ausfüllen
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Trotzdem verlassen
          </button>
        </div>
      </div>
    </div>
  );
}

export function FunnelShell({
  children,
  currentStep,
  totalSteps,
  stepLabel,
  stepDescription,
  onBack,
  onNext,
  canProceed,
  isFinalStep = false,
  isSubmitting = false,
  nextLabel = "Weiter",
  submitLabel = "Kostenlos Angebote erhalten",
  showExitIntent = true,
}: FunnelShellProps) {
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      if (showExitIntent && currentStep > 0) {
        e.preventDefault();
        setExitDialogOpen(true);
      }
    },
    [showExitIntent, currentStep],
  );

  useEffect(() => {
    if (!showExitIntent || currentStep === 0) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showExitIntent, currentStep]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="section-container flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="inline-flex items-center gap-1 font-display text-lg font-bold tracking-tight-2 text-black"
          >
            <span>Küchen</span>
            <span>Wert</span>
            <span
              className="ml-0.5 inline-block h-1.5 w-1.5 translate-y-1 rounded-full bg-brand-500"
              aria-hidden
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Live-Counter (nur Desktop) */}
            <span className="hidden items-center gap-1.5 text-xs font-medium text-ink-muted lg:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
              </span>
              <span>
                <span className="font-bold text-black">23</span> Anfragen heute
              </span>
            </span>

            {/* Trust-Pill (nur md+) */}
            <span className="hidden items-center gap-1.5 rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-semibold text-success-700 md:inline-flex">
              <Lock className="h-3 w-3" />
              SSL · DSGVO
            </span>

            {/* Phone */}
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </header>

      {/* ============ MAIN ============ */}
      <main className="flex flex-1 flex-col items-center px-4 py-6 sm:py-10 lg:py-14">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <ProgressBar current={currentStep} total={totalSteps} />

          {/* Step Card */}
          <div
            key={currentStep}
            className="mt-5 animate-step-in rounded-2xl border border-neutral-200 bg-white p-6 shadow-card sm:p-8 lg:p-10"
          >
            <h2 className="font-display text-[1.5rem] font-bold leading-tight tracking-tight-2 text-black sm:text-[1.75rem]">
              {stepLabel}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              {stepDescription}
            </p>

            <div className="mt-7">{children}</div>

            {/* Desktop-Navigation (Mobile bekommt Sticky-Footer) */}
            <div className="mt-9 hidden items-center justify-between gap-4 sm:flex">
              <button
                type="button"
                onClick={onBack}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface-strong hover:text-ink",
                  currentStep === 0 && "invisible",
                )}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </button>

              {isFinalStep ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed || isSubmitting}
                  className="btn-primary-lg"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Wird gesendet …
                    </span>
                  ) : (
                    <>
                      {submitLabel}
                      <ArrowRight className="h-5 w-5 btn-icon-arrow" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                  className="btn-primary"
                >
                  {nextLabel}
                  <ArrowRight className="h-4 w-4 btn-icon-arrow" />
                </button>
              )}
            </div>
          </div>

          {/* ============ TRUST-BADGES (Bottom) ============ */}
          <div className="mt-8 hidden flex-wrap items-center justify-center gap-x-6 gap-y-3 text-ink-subtle md:flex">
            <BadgeTuevStyle />
            <BadgeEkomiStyle />
            <BadgeDsgvoStyle />
            <BadgeSslStyle />
          </div>

          {/* Trust-Pills (Mobile) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-muted md:hidden">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
              Kostenlos
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
              DSGVO
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
              SSL
            </span>
          </div>
        </div>
      </main>

      {/* ============ STICKY MOBILE FOOTER ============ */}
      <div className="sticky bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className={clsx(
              "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface-strong",
              currentStep === 0 && "invisible",
            )}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </button>

          {isFinalStep ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              className="btn-primary-lg flex-1 justify-center text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {submitLabel}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className="btn-primary flex-1 justify-center"
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4 btn-icon-arrow" />
            </button>
          )}
        </div>
      </div>

      {/* Exit Intent */}
      <ExitIntentDialog
        open={exitDialogOpen}
        onStay={() => setExitDialogOpen(false)}
        onLeave={() => {
          setExitDialogOpen(false);
          window.location.href = "/";
        }}
      />
    </div>
  );
}
