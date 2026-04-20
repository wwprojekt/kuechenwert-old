"use client";

import { useRef } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface CardOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CardStepProps {
  options: CardOption[];
  selected: string;
  onSelect: (id: string) => void;
  columns?: 2 | 3 | 4 | 5;
  /** Auto-Advance Delay in ms; default 250 (snappy) */
  autoAdvanceMs?: number;
  onAutoAdvance?: () => void;
}

export function CardStep({
  options,
  selected,
  onSelect,
  columns = 3,
  autoAdvanceMs = 250,
  onAutoAdvance,
}: CardStepProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick(id: string) {
    onSelect(id);
    if (onAutoAdvance && autoAdvanceMs > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onAutoAdvance, autoAdvanceMs);
    }
  }

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={clsx("grid gap-3", gridCols[columns])}>
      {options.map((opt) => {
        const isActive = selected === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleClick(opt.id)}
            aria-pressed={isActive}
            className={clsx(
              "group relative flex min-h-[110px] flex-col items-start gap-1.5 rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all",
              isActive
                ? "border-brand-500 bg-brand-50/40 shadow-card-active ring-4 ring-brand-500/15"
                : "border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card-hover",
            )}
          >
            {/* Selection indicator (oben rechts) */}
            <span
              className={clsx(
                "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full border-2 transition",
                isActive
                  ? "border-brand-500 bg-brand-500"
                  : "border-neutral-300 bg-white",
              )}
            >
              {isActive && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
            </span>

            {opt.icon && (
              <div
                className={clsx(
                  "grid h-9 w-9 place-items-center rounded-lg text-lg transition",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-neutral-100 text-ink-muted",
                )}
              >
                {opt.icon}
              </div>
            )}

            <span
              className={clsx(
                "pr-7 font-display text-[15px] font-bold leading-tight",
                isActive ? "text-brand-900" : "text-black",
              )}
            >
              {opt.label}
            </span>

            {opt.description && (
              <span className="pr-7 text-xs leading-relaxed text-ink-muted">
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
