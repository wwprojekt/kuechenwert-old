/**
 * Analytics-Facade fuer Meta Pixel + Google Ads/GA4.
 *
 * Consent-Gating: Events werden NUR gesendet, wenn der User "all" akzeptiert
 * hat (kw-cookie-consent-v1). Server-seitige CAPI-Aufrufe sind davon
 * unabhaengig und erfolgen nach Lead-Submit (mit impliziter Zustimmung durch
 * Datenschutz-Checkbox).
 */

const CONSENT_KEY = "kw-cookie-consent-v1";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type TraumkuecheEvent =
  | { name: "planner_start"; utm?: Record<string, string | undefined> }
  | { name: "planner_step_complete"; step: string }
  | { name: "planner_image_generated"; generationMs?: number }
  | { name: "planner_lead_submitted"; leadId?: string; plzRegion?: string };

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { choice?: string };
    return parsed.choice === "all";
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget Event-Emitter. Silently no-op wenn kein Consent.
 */
export function track(event: TraumkuecheEvent): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  // --- Meta Pixel ---
  if (typeof window.fbq === "function") {
    const mapping: Record<string, string> = {
      planner_start: "InitiateCheckout",
      planner_step_complete: "AddToCart",
      planner_image_generated: "ViewContent",
      planner_lead_submitted: "Lead",
    };
    const fbEvent = mapping[event.name];
    if (fbEvent) {
      const params: Record<string, unknown> = { source: "traumkueche" };
      if ("step" in event) params.content_name = event.step;
      if ("leadId" in event && event.leadId) params.lead_id = event.leadId;
      window.fbq("track", fbEvent, params);
    }
  }

  // --- GA4 / Google Ads ---
  if (typeof window.gtag === "function") {
    const params: Record<string, unknown> = { event_category: "traumkueche" };
    if ("step" in event) params.step = event.step;
    if ("generationMs" in event && event.generationMs)
      params.generation_ms = event.generationMs;
    if ("leadId" in event && event.leadId) params.lead_id = event.leadId;
    window.gtag("event", event.name, params);
  }
}

/**
 * Loads Meta Pixel + GA4 tags nach Consent. Idempotent.
 */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (metaId && !window.fbq) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq!("init", metaId);
    window.fbq!("track", "PageView");
  }

  if (gaId && !window.gtag) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.gtag = function gtag(...args: unknown[]) {
      (window.dataLayer as unknown[]).push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { send_page_view: true });
  }
}
