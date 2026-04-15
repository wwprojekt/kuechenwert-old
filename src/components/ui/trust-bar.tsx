"use client";

import { useState, useEffect } from "react";

const STATIC_ITEMS = [
  "100% kostenlos",
  "Unverbindlich",
  "Geprüfte Fachhändler",
  "Telefonische Beratung",
];

const ROTATING_ITEMS = [
  "823 Anfragen diese Woche",
  "12.384 zufriedene Nutzer",
  "Ø 23% Ersparnis",
  "800+ Partner-Studios",
];

export function TrustBar() {
  const [rotateIdx, setRotateIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRotateIdx((i) => (i + 1) % ROTATING_ITEMS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-brand-900 text-white">
      <div className="section-container flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-2">
        {STATIC_ITEMS.map((text) => (
          <span
            key={text}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-200"
          >
            <svg
              className="h-3.5 w-3.5 text-accent-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {text}
          </span>
        ))}
        <span
          key={ROTATING_ITEMS[rotateIdx]}
          className="flex items-center gap-1.5 text-xs font-semibold text-accent-400 animate-fade-in"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          {ROTATING_ITEMS[rotateIdx]}
        </span>
      </div>
    </div>
  );
}
