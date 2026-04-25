"use client";

import { clsx } from "clsx";
import Image from "next/image";
import type { KitchenStyle } from "@/config/funnel-traumkueche-stammdaten";

interface StyleHeroCardStepProps {
  options: KitchenStyle[];
  selected: string | null;
  onSelect: (slug: string) => void;
  onAutoAdvance?: () => void;
  autoAdvanceMs?: number;
}

export function StyleHeroCardStep({
  options,
  selected,
  onSelect,
  onAutoAdvance,
  autoAdvanceMs = 400,
}: StyleHeroCardStepProps) {
  function handleSelect(slug: string) {
    onSelect(slug);
    if (onAutoAdvance && autoAdvanceMs > 0) {
      setTimeout(onAutoAdvance, autoAdvanceMs);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((style) => {
        const isActive = selected === style.slug;
        return (
          <button
            key={style.slug}
            type="button"
            onClick={() => handleSelect(style.slug)}
            aria-pressed={isActive}
            className={clsx(
              "group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all",
              isActive
                ? "border-brand-500 shadow-card-active ring-4 ring-brand-500/15"
                : "border-neutral-200 shadow-sm hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card-hover",
            )}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image
                src={style.heroImage}
                alt={style.label}
                fill
                sizes="(max-width: 640px) 50vw, 320px"
                className={clsx(
                  "object-cover transition-transform duration-500",
                  isActive ? "scale-[1.03]" : "group-hover:scale-105",
                )}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
              />
              {isActive && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white shadow-lg"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-9" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-4 text-white sm:px-4 sm:pb-4">
                <div className="font-display text-lg font-bold leading-tight drop-shadow-md sm:text-xl">
                  {style.label}
                </div>
                <div className="mt-0.5 text-[12px] leading-snug text-white/90 drop-shadow sm:text-[13px]">
                  {style.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
