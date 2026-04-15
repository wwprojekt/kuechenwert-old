"use client";

import { clsx } from "clsx";

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
}

export function CardStep({
  options,
  selected,
  onSelect,
  columns = 3,
}: CardStepProps) {
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
            onClick={() => onSelect(opt.id)}
            className={clsx(
              "relative flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-center transition-all",
              isActive
                ? "border-brand-600 bg-brand-50 shadow-md shadow-brand-600/10"
                : "border-zinc-200 bg-white hover:border-brand-300 hover:shadow-sm",
            )}
          >
            {/* Selection indicator */}
            <div
              className={clsx(
                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                isActive
                  ? "border-brand-600 bg-brand-600"
                  : "border-zinc-300",
              )}
            >
              {isActive && (
                <svg
                  className="h-3 w-3 text-white"
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

            {opt.icon && (
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-lg transition",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-zinc-100 text-zinc-500",
                )}
              >
                {opt.icon}
              </div>
            )}

            <span
              className={clsx(
                "text-sm font-semibold",
                isActive ? "text-brand-800" : "text-zinc-800",
              )}
            >
              {opt.label}
            </span>

            {opt.description && (
              <span className="text-xs leading-relaxed text-zinc-500">
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
