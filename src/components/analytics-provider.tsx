"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";
import { captureUtmParams } from "@/lib/utm";

/**
 * Client-Provider fuer Analytics. Laedt Meta Pixel + GA4 nach Consent,
 * erfasst UTM-Parameter in sessionStorage. Muss auf der Traumkueche-Landing
 * und Funnel-Seiten eingebunden werden.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    captureUtmParams();
    initAnalytics();
    const handler = () => initAnalytics();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);
  return null;
}
