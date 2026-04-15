"use client";

import { useCallback } from "react";
import { clsx } from "clsx";

export interface ImageOption {
  id: string;
  label: string;
  /** Tailwind gradient class as visual placeholder */
  bgClass: string;
  /** Optional image URL */
  imageSrc?: string;
}

interface ImageCardStepProps {
  options: ImageOption[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  /** Single select or multi select */
  multiple?: boolean;
  columns?: 2 | 3;
}

export function ImageCardStep({
  options,
  selected,
  onSelectionChange,
  multiple = false,
  columns = 2,
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
      }
    },
    [selected, onSelectionChange, multiple],
  );

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={clsx("grid gap-4", gridCols[columns])}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.id);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={clsx(
              "group relative overflow-hidden rounded-xl border-3 transition-all",
              isActive
                ? "border-brand-600 shadow-lg shadow-brand-600/15"
                : "border-transparent shadow-sm hover:shadow-md",
            )}
          >
            {/* Image or gradient placeholder */}
            <div className="aspect-[4/3] overflow-hidden">
              {opt.imageSrc ? (
                <img
                  src={opt.imageSrc}
                  alt={opt.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div
                  className={clsx(
                    "flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105",
                    opt.bgClass,
                  )}
                >
                  <span className="text-4xl text-white/30">
                    ✦
                  </span>
                </div>
              )}
            </div>

            {/* Label bar */}
            <div
              className={clsx(
                "flex items-center justify-between px-4 py-3 transition",
                isActive ? "bg-brand-50" : "bg-white",
              )}
            >
              <span
                className={clsx(
                  "text-sm font-semibold",
                  isActive ? "text-brand-800" : "text-zinc-800",
                )}
              >
                {opt.label}
              </span>

              {/* Selection indicator */}
              <div
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 transition",
                  isActive
                    ? "border-brand-600 bg-brand-600"
                    : "border-zinc-300",
                )}
              >
                {isActive && (
                  <svg
                    className="h-3.5 w-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
