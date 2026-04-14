"use client";

import { clsx } from "clsx";

interface CardOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

interface CardSelectorProps {
  options: readonly CardOption[] | CardOption[];
  selected: string | string[];
  onSelect: (id: string) => void;
  multiple?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export function CardSelector({
  options,
  selected,
  onSelect,
  multiple = false,
  columns = 3,
}: CardSelectorProps) {
  const isSelected = (id: string) =>
    Array.isArray(selected) ? selected.includes(id) : selected === id;

  const gridCols: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={clsx("grid gap-3", gridCols[columns])}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={clsx(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition",
            isSelected(opt.id)
              ? "border-brand-600 bg-brand-50 text-brand-800 shadow-sm"
              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:shadow-sm",
          )}
        >
          {opt.icon && <span className="text-2xl">{opt.icon}</span>}
          <span className="text-sm font-semibold">{opt.label}</span>
          {opt.description && (
            <span className="text-xs text-zinc-500">{opt.description}</span>
          )}
          {multiple && (
            <span className={clsx(
              "mt-1 h-4 w-4 rounded border",
              isSelected(opt.id) ? "border-brand-600 bg-brand-600" : "border-zinc-300",
            )} />
          )}
        </button>
      ))}
    </div>
  );
}
