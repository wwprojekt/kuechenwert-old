"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { clsx } from "clsx";

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

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Schritt {current + 1} von {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-zinc-900">
          Wollen Sie wirklich abbrechen?
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Ihre Angaben werden nicht gespeichert und wir werden Ihnen keine
          Angebote erstellen können.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onStay}
            className="btn-primary flex-1"
          >
            Zurück zur Eingabe
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="btn-secondary flex-1"
          >
            Ja, verlassen
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
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Funnel Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="section-container flex h-14 items-center justify-between">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="text-lg font-bold"
          >
            <span className="text-accent-400">Küchen</span>
            <span className="text-brand-800">Wert</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-zinc-400 sm:block">
              100% kostenlos & unverbindlich
            </span>
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-zinc-500">SSL-verschlüsselt</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <ProgressBar current={currentStep} total={totalSteps} />

          {/* Step Content Card */}
          <div
            key={currentStep}
            className="mt-6 animate-step-in rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
              {stepLabel}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">{stepDescription}</p>

            <div className="mt-6">{children}</div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className={clsx(
                  "inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800",
                  currentStep === 0 && "invisible",
                )}
                disabled={currentStep === 0}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Zurück
              </button>

              {isFinalStep ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed || isSubmitting}
                  className="btn-accent px-8 py-3.5 text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Wird gesendet…
                    </span>
                  ) : (
                    submitLabel
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                  className="btn-primary px-8 py-3"
                >
                  {nextLabel}
                  <svg
                    className="ml-1.5 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Trust Elements */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Kostenlos
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Unverbindlich
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Geprüfte Fachhändler
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              DSGVO-konform
            </span>
          </div>
        </div>
      </main>

      {/* Exit Intent Dialog */}
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
