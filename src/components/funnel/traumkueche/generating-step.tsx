"use client";

import { Sparkles, Brush, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

interface GeneratingStepProps {
  elapsedMs: number;
  estimatedMs?: number;
}

/**
 * Visuelles Loading waehrend FLUX rendert.
 *
 * Drei rotierende Status-Messages geben dem Wartevorgang Dramaturgie,
 * ohne konkretes Pipeline-Wissen preiszugeben.
 */
const STATUS_MESSAGES = [
  { icon: "sparkles", label: "KI interpretiert deine Wünsche …" },
  { icon: "brush", label: "Oberflächen + Materialien werden abgestimmt …" },
  { icon: "lightbulb", label: "Licht + Perspektive werden gesetzt …" },
  { icon: "sparkles", label: "Finale Details werden poliert …" },
];

export function GeneratingStep({ elapsedMs, estimatedMs = 12_000 }: GeneratingStepProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const percent = Math.min(95, Math.round((elapsedMs / estimatedMs) * 100));
  const msg = STATUS_MESSAGES[messageIndex]!;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Animated Canvas */}
      <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-neutral-50 to-brand-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white/90 shadow-lg backdrop-blur">
            <Sparkles className="h-10 w-10 animate-pulse text-brand-600" aria-hidden />
          </div>
        </div>
        {/* Shimmer-Linien */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-y-0 w-32 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{
              animation: "kw-shimmer 2.2s ease-in-out infinite",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes kw-shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(400%);
            }
          }
        `}</style>
      </div>

      {/* Status-Messages */}
      <div className="min-h-[48px] w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-brand-700 sm:text-sm">
          {msg.icon === "sparkles" && <Sparkles className="h-4 w-4" aria-hidden />}
          {msg.icon === "brush" && <Brush className="h-4 w-4" aria-hidden />}
          {msg.icon === "lightbulb" && <Lightbulb className="h-4 w-4" aria-hidden />}
          <span>{msg.label}</span>
        </div>
      </div>

      {/* Progress-Bar */}
      <div className="w-full max-w-sm">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 text-center text-xs text-ink-subtle">
          Typisch 10-15 Sekunden. Der erste Entwurf ist nur der Anfang.
        </div>
      </div>
    </div>
  );
}
