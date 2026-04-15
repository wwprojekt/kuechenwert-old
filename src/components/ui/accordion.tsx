"use client";

import { useState, useCallback, useId } from "react";
import { clsx } from "clsx";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple items to be open at once */
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const baseId = useId();

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(allowMultiple ? prev : []);
        if (prev.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [allowMultiple],
  );

  return (
    <div className={clsx("divide-y divide-zinc-200 border-y border-zinc-200", className)}>
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        const triggerId = `${baseId}-trigger-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={i}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-brand-700"
            >
              <span className="text-base font-semibold text-zinc-900">
                {item.question}
              </span>
              <svg
                className={clsx(
                  "h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={clsx(
                "grid transition-all duration-200 ease-in-out",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-zinc-600">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
