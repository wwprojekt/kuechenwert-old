"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Unsichtbarer Cloudflare-Turnstile-Widget, der im Hintergrund der Funnel-
 * Navigation einen Token ausstellt und per Callback nach aussen reicht.
 *
 * Hintergrund:
 *   Der `/api/planner/generate`-Call passiert auf Funnel-Step 9 ("render"),
 *   also VOR dem Lead-Gate. Ohne diesen Background-Widget hat der Client zu
 *   dem Zeitpunkt keinen Token und der Server muesste 403 liefern (wenn
 *   `TURNSTILE_SECRET_KEY` gesetzt ist).
 *
 *   Diese Komponente mountet den Widget einmal pro Funnel-Instanz und laedt
 *   Tokens proaktiv nach (expired-callback -> reset). Sie bleibt ueber alle
 *   Steps hinweg gemountet, solange der FunnelTraumkuecheClient lebt.
 *
 * Kein-Op-Verhalten:
 *   - `siteKey` fehlt -> no-op (Dev ohne Turnstile-Config)
 *   - SSR -> no-op
 */

interface TurnstileApi {
  render: (
    container: string | HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      "timeout-callback"?: () => void;
      size?: string;
      appearance?: "always" | "execute" | "interaction-only";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  execute: (widgetId?: string) => void;
}

const SCRIPT_ID = "kw-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function TurnstileBackground({
  siteKey,
  onToken,
}: {
  siteKey?: string;
  onToken: (token: string | undefined) => void;
}) {
  const instanceId = useId();
  const containerIdRef = useRef(
    `kw-ts-bg-${instanceId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
  );
  const widgetIdRef = useRef<string | null>(null);

  // Script einmal laden
  useEffect(() => {
    if (!siteKey || typeof window === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [siteKey]);

  // Widget rendern + auf Token warten
  useEffect(() => {
    if (!siteKey || typeof window === "undefined") return;
    const containerId = containerIdRef.current;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 80; // ~20s bis der Script ready sein muss

    const tryMount = () => {
      if (cancelled) return;
      const win = window as unknown as { turnstile?: TurnstileApi };
      const ts = win.turnstile;
      const container = document.getElementById(containerId);
      if (ts && container && !widgetIdRef.current) {
        try {
          const id = ts.render(container, {
            sitekey: siteKey,
            size: "flexible",
            appearance: "interaction-only",
            callback: (token: string) => {
              if (!cancelled) onToken(token);
            },
            "expired-callback": () => {
              if (cancelled) return;
              onToken(undefined);
              // automatisch re-challengen
              try {
                if (widgetIdRef.current) ts.reset(widgetIdRef.current);
              } catch {
                // Widget-ID evtl. stale; ignore
              }
            },
            "error-callback": () => {
              if (!cancelled) onToken(undefined);
            },
            "timeout-callback": () => {
              if (cancelled) return;
              try {
                if (widgetIdRef.current) ts.reset(widgetIdRef.current);
              } catch {
                // ignore
              }
            },
          });
          widgetIdRef.current = id;
          return;
        } catch {
          // doppeltes render auf gleichem Container - ignorieren
          return;
        }
      }
      attempts += 1;
      if (attempts < maxAttempts) setTimeout(tryMount, 250);
    };

    tryMount();

    return () => {
      cancelled = true;
      const win = window as unknown as { turnstile?: TurnstileApi };
      if (widgetIdRef.current && win.turnstile) {
        try {
          win.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  // Container existiert, damit das Widget einen Anker hat. Durch
  // `appearance: "interaction-only"` bleibt der Widget UI-seitig neutral und
  // fordert erst dann eine Challenge an, wenn Cloudflare Verdacht schoepft.
  return (
    <div
      id={containerIdRef.current}
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    />
  );
}
