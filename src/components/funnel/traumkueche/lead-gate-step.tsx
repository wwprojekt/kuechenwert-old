"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { Loader2, Phone, ShieldCheck, Sparkles } from "lucide-react";
import type { TraumkuecheContact } from "@/config/funnel-traumkueche";

type RenderStatus = "idle" | "pending" | "success" | "failed";

interface LeadGateStepProps {
  contact: Partial<TraumkuecheContact>;
  onChange: (patch: Partial<TraumkuecheContact>) => void;
  onSubmit: () => Promise<void> | void;
  submitting: boolean;
  submitError?: string | null;
  turnstileSiteKey?: string;
  imageUrl?: string;
  priceRangeFormatted?: string;
  /** Status der Hintergrund-KI-Generierung. Zeigt Live-Indikator. */
  renderStatus?: RenderStatus;
  renderElapsedMs?: number;
}

export function LeadGateStep({
  contact,
  onChange,
  onSubmit,
  submitting,
  submitError,
  turnstileSiteKey,
  imageUrl,
  priceRangeFormatted,
  renderStatus = "idle",
  renderElapsedMs = 0,
}: LeadGateStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const firstNameOk = (contact.firstName ?? "").trim().length >= 2;
  const lastNameOk = (contact.lastName ?? "").trim().length >= 2;
  const emailOk = !!contact.email && /.+@.+\..+/.test(contact.email);
  const plzOk = !!contact.plz && /^\d{5}$/.test(contact.plz);
  const consentsOk = !!contact.consentDatenschutz && !!contact.consentAi;

  const canSubmit =
    firstNameOk && lastNameOk && emailOk && plzOk && consentsOk && !submitting;

  const secondsElapsed = Math.floor(renderElapsedMs / 1000);

  return (
    <div className="space-y-5">
      {/* Live-Status des Hintergrund-Renders */}
      {imageUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-2 shadow-sm">
          <div className="h-16 w-20 overflow-hidden rounded-lg bg-neutral-100">
            <img src={imageUrl} alt="Dein Moodboard" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              <Sparkles className="mr-1 inline-block h-3 w-3" />
              Dein Moodboard ist fertig
            </div>
            {priceRangeFormatted && (
              <div className="mt-0.5 font-display text-[15px] font-bold text-black">
                {priceRangeFormatted}
              </div>
            )}
          </div>
        </div>
      ) : renderStatus === "pending" ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-3 shadow-sm">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100/60">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
          <div className="flex-1 text-[13px] leading-snug">
            <div className="font-semibold text-black">
              KI rendert dein Moodboard …
            </div>
            <div className="text-ink-muted">
              {secondsElapsed < 8
                ? "Dauert ca. 10 Sekunden. Fülle währenddessen das Formular aus."
                : `Noch einen Moment … (${secondsElapsed}s)`}
            </div>
          </div>
        </div>
      ) : renderStatus === "failed" ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 shadow-sm">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-[13px] leading-snug text-amber-900">
            Der Live-Render klappt gerade nicht – kein Problem, wir erstellen
            dein Moodboard nach dem Absenden erneut.
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Vorname"
          value={contact.firstName ?? ""}
          onChange={(v) => onChange({ firstName: v })}
          onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          error={touched.firstName && !firstNameOk ? "Bitte Vorname eingeben" : null}
          autoComplete="given-name"
        />
        <Input
          label="Nachname"
          value={contact.lastName ?? ""}
          onChange={(v) => onChange({ lastName: v })}
          onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
          error={touched.lastName && !lastNameOk ? "Bitte Nachname eingeben" : null}
          autoComplete="family-name"
        />
        <Input
          label="E-Mail"
          type="email"
          value={contact.email ?? ""}
          onChange={(v) => onChange({ email: v })}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={touched.email && !emailOk ? "Gültige E-Mail benötigt" : null}
          autoComplete="email"
        />
        <Input
          label="PLZ"
          value={contact.plz ?? ""}
          onChange={(v) => onChange({ plz: v.replace(/\D/g, "").slice(0, 5) })}
          onBlur={() => setTouched((t) => ({ ...t, plz: true }))}
          error={touched.plz && !plzOk ? "5-stellige PLZ" : null}
          inputMode="numeric"
          autoComplete="postal-code"
        />
        <Input
          className="sm:col-span-2"
          label="Telefon (optional, für schnelleren Rückruf)"
          type="tel"
          value={contact.phone ?? ""}
          onChange={(v) => onChange({ phone: v })}
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2 rounded-xl border border-neutral-200 bg-surface-soft p-3.5">
        <Checkbox
          checked={!!contact.consentDatenschutz}
          onChange={(v) => onChange({ consentDatenschutz: v })}
          label={
            <>
              Ich habe die{" "}
              <a href="/datenschutz" target="_blank" className="underline">
                Datenschutzerklärung
              </a>{" "}
              gelesen und stimme der Verarbeitung meiner Daten zu.
            </>
          }
          required
        />
        <Checkbox
          checked={!!contact.consentAi}
          onChange={(v) => onChange({ consentAi: v })}
          label={
            <>
              Ich willige ein, dass meine Eingaben für die KI-Bildgenerierung
              genutzt und meine Ergebnisse gespeichert werden.
            </>
          }
          required
        />
        <Checkbox
          checked={!!contact.consentCallback}
          onChange={(v) => onChange({ consentCallback: v })}
          label="Ich möchte einen kostenlosen Rückruf vom Experten für die finale Einschätzung."
        />
      </div>

      {turnstileSiteKey && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-subtle">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          <span>Bot-Schutz durch Cloudflare aktiv</span>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setTouched({ firstName: true, lastName: true, email: true, plz: true });
          if (canSubmit) onSubmit();
        }}
        disabled={!canSubmit}
        className="btn-primary-lg w-full"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {renderStatus === "pending" && !imageUrl
              ? "Moodboard wird fertiggestellt …"
              : "Wird gespeichert …"}
          </span>
        ) : (
          <>Moodboard sichern + Einschätzung erhalten</>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[12px] text-ink-subtle">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        DSGVO-konform. Keine Weitergabe an Dritte ohne deine Zustimmung.
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  onBlur,
  error,
  className,
  leftIcon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: "numeric" | "email" | "tel";
  autoComplete?: string;
  onBlur?: () => void;
  error?: string | null;
  className?: string;
  leftIcon?: React.ReactNode;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        {label}
      </span>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={clsx(
            "w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors",
            "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
            error ? "border-red-300" : "border-neutral-200",
            leftIcon && "pl-10",
          )}
        />
      </div>
      {error && <div className="mt-1 text-[12px] text-red-600">{error}</div>}
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
      />
      <span>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
    </label>
  );
}
