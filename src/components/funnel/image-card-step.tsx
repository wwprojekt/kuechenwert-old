"use client";

import Image from "next/image";
import { useCallback } from "react";
import { clsx } from "clsx";

export interface ImageOption {
  id: string;
  label: string;
  description?: string;
  /** Tailwind background class als Fallback */
  bgClass: string;
  /** Optional image URL (Unsplash/CDN) */
  imageSrc?: string;
  /** Optional SVG-Pictogramm (rendert statt Image, in Brand-Color) */
  pictogram?: React.ReactNode;
}

interface ImageCardStepProps {
  options: ImageOption[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  /** Single select or multi select */
  multiple?: boolean;
  columns?: 2 | 3;
  /** Auto-Advance bei Single-Select nach Klick (ms, 0 = aus) */
  autoAdvanceMs?: number;
  onAutoAdvance?: () => void;
}

export function ImageCardStep({
  options,
  selected,
  onSelectionChange,
  multiple = false,
  columns = 2,
  autoAdvanceMs = 0,
  onAutoAdvance,
}: ImageCardStepProps) {
  const toggle = useCallback(
    (id: string) => {
      if (multiple) {
        if (selected.includes(id)) {
          onSelectionChange(selected.filter((s) => s !== id));
        } else {
          onSelectionChange([...selected, id]);
        }
      } else {
        onSelectionChange([id]);
        if (onAutoAdvance && autoAdvanceMs > 0) {
          setTimeout(onAutoAdvance, autoAdvanceMs);
        }
      }
    },
    [selected, onSelectionChange, multiple, autoAdvanceMs, onAutoAdvance],
  );

  const gridCols: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
  };

  return (
    <div className={clsx("grid gap-3 sm:gap-4", gridCols[columns])}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.id);
        const hasPictogram = !!opt.pictogram;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            aria-pressed={isActive}
            className={clsx(
              "group relative overflow-hidden rounded-2xl border-2 bg-white text-left transition-all",
              isActive
                ? "border-brand-500 shadow-card-active ring-4 ring-brand-500/15"
                : "border-neutral-200 shadow-sm hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card-hover",
            )}
          >
            {/* Visual-Header: Pictogram in neutraler Flaeche ODER Foto */}
            {hasPictogram ? (
              <div
                className={clsx(
                  "relative flex aspect-[4/3] items-center justify-center p-3 transition-colors sm:p-4",
                  isActive ? "bg-brand-50" : "bg-neutral-50",
                )}
              >
                <div
                  className={clsx(
                    "h-full w-full transition-colors",
                    isActive ? "text-brand-600" : "text-brand-500",
                  )}
                >
                  {opt.pictogram}
                </div>
              </div>
            ) : (
              <div className={clsx("relative aspect-[4/3] overflow-hidden", opt.bgClass)}>
                {opt.imageSrc && (
                  <Image
                    src={opt.imageSrc}
                    alt={opt.label}
                    fill
                    sizes="(max-width: 640px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
            )}

            {/* Label-Bar (zentriert, KP-Style) */}
            <div
              className={clsx(
                "px-2.5 py-2 text-center transition sm:px-3 sm:py-2.5",
                isActive ? "bg-brand-50" : "bg-white",
              )}
            >
              <div
                className={clsx(
                  "font-display text-[13px] font-bold leading-tight sm:text-sm",
                  isActive ? "text-brand-900" : "text-black",
                )}
              >
                {opt.label}
              </div>
              {opt.description && (
                <div className="mt-0.5 text-[11px] leading-tight text-ink-muted sm:text-xs">
                  {opt.description}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
