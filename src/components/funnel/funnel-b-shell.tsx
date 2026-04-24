"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export interface FunnelBShellProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  stepDescription?: string;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isFinalStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  submitLabel?: string;
  /** optional sidebar content (Trust, Tipps) */
  sidebar?: React.ReactNode;
}

export function FunnelBShell({
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
  submitLabel = "Anfrage absenden",
  sidebar,
}: FunnelBShellProps) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="section-container-wide flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-base font-bold text-brand-900"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-700 text-xs text-white">K</span>
            KüchenWert
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-600" />
            SSL-verschlüsselt
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 justify-center px-4 py-6 sm:py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
          <div className="flex flex-col">
            {/* Progress – dezent im kuechenportal.de-Stil */}
            <div aria-label={`Schritt ${currentStep + 1} von ${totalSteps}`}>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-brand-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-end text-[11px] font-medium text-ink-subtle">
                {currentStep + 1} / {totalSteps}
              </div>
            </div>

            {/* Card */}
            <div
              key={currentStep}
              className="mt-5 animate-step-in rounded-card border border-slate-200 bg-white p-6 shadow-card sm:p-8"
            >
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {stepLabel}
              </h1>
              {stepDescription && (
                <p className="mt-2 text-sm text-ink-muted">{stepDescription}</p>
              )}

              <div className="mt-6">{children}</div>

              {/* Nav */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={currentStep === 0 || isSubmitting}
                  className={`btn-ghost ${currentStep === 0 ? "invisible" : ""}`}
                >
                  <ArrowLeft className="h-4 w-4" /> Zurück
                </button>

                {isFinalStep ? (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed || isSubmitting}
                    className="btn-accent"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Wird gesendet…
                      </>
                    ) : (
                      submitLabel
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed}
                    className="btn-primary"
                  >
                    {nextLabel} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="trust-row mt-6 text-xs">
              <span className="trust-pill">Kostenlos</span>
              <span className="trust-pill">Unverbindlich</span>
              <span className="trust-pill">Verifizierte Händler</span>
              <span className="trust-pill">DSGVO</span>
            </div>
          </div>

          {/* Sidebar */}
          {sidebar && (
            <aside className="hidden flex-col gap-4 lg:flex">
              {sidebar}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
