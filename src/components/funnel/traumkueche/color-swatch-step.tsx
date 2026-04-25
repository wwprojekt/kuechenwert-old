"use client";

import { useMemo } from "react";
import { clsx } from "clsx";
import type { FrontColor } from "@/config/funnel-traumkueche-stammdaten";

interface ColorSwatchStepProps {
  options: FrontColor[];
  selected: string | null;
  onSelect: (slug: string) => void;
  onAutoAdvance?: () => void;
  autoAdvanceMs?: number;
}

const FAMILY_ORDER: Array<{ key: FrontColor["family"]; label: string }> = [
  { key: "hell", label: "Hell" },
  { key: "neutral", label: "Neutral" },
  { key: "dunkel", label: "Dunkel" },
  { key: "warm", label: "Warm" },
  { key: "farbig", label: "Farbig" },
  { key: "holz", label: "Holz" },
];

export function ColorSwatchStep({
  options,
  selected,
  onSelect,
  onAutoAdvance,
  autoAdvanceMs = 600,
}: ColorSwatchStepProps) {
  const grouped = useMemo(() => {
    const map = new Map<FrontColor["family"], FrontColor[]>();
    for (const color of options) {
      if (!map.has(color.family)) map.set(color.family, []);
      map.get(color.family)!.push(color);
    }
    return FAMILY_ORDER
      .filter((g) => map.has(g.key))
      .map((g) => ({ ...g, items: map.get(g.key)! }));
  }, [options]);

  function handleSelect(slug: string) {
    onSelect(slug);
    if (onAutoAdvance && autoAdvanceMs > 0) {
      setTimeout(onAutoAdvance, autoAdvanceMs);
    }
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.key}>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            {group.label}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {group.items.map((color) => {
              const isActive = selected === color.slug;
              return (
                <button
                  key={color.slug}
                  type="button"
                  onClick={() => handleSelect(color.slug)}
                  aria-pressed={isActive}
                  className={clsx(
                    "group flex flex-col items-center gap-1.5 rounded-xl border-2 bg-white p-1.5 transition-all",
                    isActive
                      ? "border-brand-500 shadow-card-active ring-4 ring-brand-500/15"
                      : "border-neutral-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm",
                  )}
                >
                  <span
                    className={clsx(
                      "block h-12 w-full rounded-lg border transition-transform",
                      isActive ? "scale-[1.04]" : "group-hover:scale-[1.02]",
                      color.hex.toLowerCase() === "#ffffff"
                        ? "border-neutral-300"
                        : "border-black/5",
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  <span
                    className={clsx(
                      "text-center text-[11px] font-semibold leading-tight sm:text-xs",
                      isActive ? "text-brand-900" : "text-black",
                    )}
                  >
                    {color.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
