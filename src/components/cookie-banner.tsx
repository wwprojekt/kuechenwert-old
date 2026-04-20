"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Shield, X } from "lucide-react";

const STORAGE_KEY = "kw-cookie-consent-v1";

type ConsentChoice = "all" | "essential";
type ConsentRecord = {
  choice: ConsentChoice;
  ts: number;
  version: string;
};

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setOpen(true);
        return;
      }
      const parsed = JSON.parse(raw) as ConsentRecord;
      // Banner erneut zeigen, wenn ältere Policy-Version gespeichert wurde
      if (parsed.version !== "v1.0-2026-04") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function persist(choice: ConsentChoice) {
    const rec: ConsentRecord = {
      choice,
      ts: Date.now(),
      version: "v1.0-2026-04",
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
    } catch {
      // ignore (Inkognito etc.)
    }
    setOpen(false);
  }

  // SSR / vor Hydration nichts rendern (verhindert Layout-Shift + Hydration-Mismatch)
  if (!hydrated || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/98 shadow-card-elevated backdrop-blur supports-[backdrop-filter]:bg-white/95"
    >
      <div className="section-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-5">
        <div className="flex items-start gap-3 lg:max-w-3xl">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="cookie-banner-title"
              className="font-display text-[15px] font-bold text-ink"
            >
              Ihre Privatsphäre — Cookies &amp; Tracking
            </h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">
              Wir nutzen ausschließlich technisch notwendige Cookies (Session,
              CSRF, Funnel-Fortschritt). Optional dürfen wir mit Ihrer
              Einwilligung anonyme Reichweiten-Statistiken erheben, um die
              Plattform zu verbessern. Details in unserer{" "}
              <Link
                href="/datenschutz"
                className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => persist("essential")}
            className="rounded-lg border-2 border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-neutral-300 hover:bg-neutral-50"
          >
            Nur notwendige
          </button>
          <button
            type="button"
            onClick={() => persist("all")}
            className="btn-primary"
          >
            <Shield className="mr-1 inline h-4 w-4" />
            Alle akzeptieren
          </button>
          <button
            type="button"
            onClick={() => persist("essential")}
            aria-label="Banner schließen (nur notwendige Cookies)"
            className="absolute right-2 top-2 rounded-full p-1 text-ink-subtle hover:bg-neutral-100 hover:text-ink lg:static"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
