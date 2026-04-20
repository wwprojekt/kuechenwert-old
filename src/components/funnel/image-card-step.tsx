"use client";

import Image from "next/image";
import { useCallback } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface ImageOption {
  id: string;
  label: string;
  description?: string;
  /** Tailwind background class als Fallback */
  bgClass: string;
  /** Optional image URL (Unsplash/CDN) */
  imageSrc?: string;
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
            {/* Image-Header */}
            <div className={clsx("relative aspect-[5/4] overflow-hidden", opt.bgClass)}>
              {opt.imageSrc && (
                <Image
                  src={opt.imageSrc}
                  alt={opt.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Selection-Overlay (oben rechts) */}
              <span
                className={clsx(
                  "absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border-2 transition",
                  isActive
                    ? "border-white bg-brand-500 shadow-md"
                    : "border-white/80 bg-white/80 backdrop-blur",
                )}
              >
                {isActive && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </span>
            </div>

            {/* Label-Bar */}
            <div
              className={clsx(
                "px-3 py-3 transition sm:px-4",
                isActive ? "bg-brand-50" : "bg-white",
              )}
            >
              <div
                className={clsx(
                  "font-display text-sm font-bold sm:text-base",
                  isActive ? "text-brand-900" : "text-black",
                )}
              >
                {opt.label}
              </div>
              {opt.description && (
                <div className="mt-0.5 text-xs text-ink-muted">{opt.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
