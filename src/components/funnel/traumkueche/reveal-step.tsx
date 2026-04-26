"use client";

import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

interface RevealStepProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onContinue: () => void;
  priceRangeFormatted?: string;
}

export function RevealStep({
  imageUrl,
  imageWidth,
  imageHeight,
  onContinue,
  priceRangeFormatted,
}: RevealStepProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Dein Moodboard ist fertig
      </div>

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-card-elevated">
        <Image
          src={imageUrl}
          alt="Deine generierte Traumküche"
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 640px) 100vw, 640px"
          className="h-auto w-full object-cover"
          priority
          unoptimized
        />
      </div>

      {priceRangeFormatted && (
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-surface-soft px-4 py-3 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Vorläufige Preisrange
          </div>
          <div className="mt-1 font-display text-xl font-bold text-black sm:text-2xl">
            {priceRangeFormatted}
          </div>
          <div className="mt-1 text-[12px] text-ink-muted">
            Detail-Einschätzung vom Experten nach deinem Kontakt.
          </div>
        </div>
      )}

      <p className="max-w-md text-center text-[13px] leading-relaxed text-ink-muted sm:text-sm">
        Gib jetzt kurz deinen Namen und deine E-Mail an, damit wir dir das
        Moodboard sichern und der Experte dir die genaue Einschätzung senden kann.
      </p>

      <button type="button" onClick={onContinue} className="btn-primary-lg">
        Jetzt sichern + Experten-Einschätzung
        <ArrowRight className="h-5 w-5 btn-icon-arrow" />
      </button>
    </div>
  );
}
