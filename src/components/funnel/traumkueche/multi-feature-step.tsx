"use client";

import { clsx } from "clsx";

export interface MultiFeatureOption {
  slug: string;
  label: string;
  description: string;
}

interface MultiFeatureStepProps {
  options: MultiFeatureOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  /** Optional gruppieren nach Kategorie-Key */
  groups?: Array<{ key: string; label: string; slugs: string[] }>;
}

export function MultiFeatureStep({
  options,
  selected,
  onSelectionChange,
  groups,
}: MultiFeatureStepProps) {
  function toggle(slug: string) {
    if (selected.includes(slug)) {
      onSelectionChange(selected.filter((s) => s !== slug));
    } else {
      onSelectionChange([...selected, slug]);
    }
  }

  if (groups && groups.length > 0) {
    return (
      <div className="space-y-5">
        {groups.map((g) => {
          const groupOptions = options.filter((o) => g.slugs.includes(o.slug));
          if (groupOptions.length === 0) return null;
          return (
            <div key={g.key}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                {g.label}
              </div>
              <div className="grid gap-2">
                {groupOptions.map((opt) => (
                  <FeatureRow
                    key={opt.slug}
                    option={opt}
                    active={selected.includes(opt.slug)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <FeatureRow
          key={opt.slug}
          option={opt}
          active={selected.includes(opt.slug)}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function FeatureRow({
  option,
  active,
  onToggle,
}: {
  option: MultiFeatureOption;
  active: boolean;
  onToggle: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.slug)}
      aria-pressed={active}
      className={clsx(
        "flex items-start gap-3 rounded-xl border-2 bg-white px-3.5 py-3 text-left transition-all",
        active
          ? "border-brand-500 bg-brand-50/30 shadow-card-active"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm",
      )}
    >
      <div
        aria-hidden
        className={clsx(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          active ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-300 bg-white",
        )}
      >
        {active && (
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="none" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-9" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div
          className={clsx(
            "font-display text-[14px] font-bold leading-snug sm:text-[15px]",
            active ? "text-brand-900" : "text-black",
          )}
        >
          {option.label}
        </div>
        <div className="mt-0.5 text-[12px] leading-snug text-ink-muted sm:text-[13px]">
          {option.description}
        </div>
      </div>
    </button>
  );
}
