"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

const MESSAGES = [
  { name: "Sabine", city: "München", action: "hat gerade 3 Angebote erhalten" },
  { name: "Thomas", city: "Hamburg", action: "hat die Küchenplanung gestartet" },
  { name: "Andrea", city: "Berlin", action: "hat 3 Angebote verglichen" },
  { name: "Markus", city: "Köln", action: "hat sein Style-Quiz abgeschlossen" },
  { name: "Julia", city: "Frankfurt", action: "hat 4.200 € gespart" },
  { name: "Stefan", city: "Stuttgart", action: "hat gerade 3 Angebote erhalten" },
  { name: "Maria", city: "Düsseldorf", action: "hat die Küchenplanung gestartet" },
  { name: "Peter", city: "Leipzig", action: "hat 2 Angebote verglichen" },
];

const SHOW_ON = ["/", "/angebote-vergleichen", "/kuechenplanung", "/style-quiz"];

export function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const pathname = usePathname();

  const showOnPage = SHOW_ON.includes(pathname);

  const showToast = useCallback(() => {
    setMsgIdx((i) => (i + 1) % MESSAGES.length);
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    if (!showOnPage) return;

    const initialDelay = setTimeout(showToast, 8000);
    const interval = setInterval(showToast, 20000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [showOnPage, showToast]);

  if (!showOnPage) return null;

  const msg = MESSAGES[msgIdx];

  return (
    <div
      className={`fixed bottom-20 left-4 z-40 max-w-xs transition-all duration-500 sm:bottom-6 ${
        visible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {msg.name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {msg.name} aus {msg.city}
          </p>
          <p className="text-xs text-zinc-500">{msg.action}</p>
          <p className="mt-1 text-[10px] text-zinc-400">
            vor {Math.floor(Math.random() * 5) + 1} Minuten
          </p>
        </div>
      </div>
    </div>
  );
}
