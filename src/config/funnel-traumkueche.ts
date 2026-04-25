/**
 * Funnel C ("Traumkueche") - Step-Definition + State-Type.
 *
 * Unterschied zu Funnel A/B:
 *   - Hohe visuelle Ebene (grosse Stil-Karten, Farb-Swatches)
 *   - Serverseitige Session (planner_sessions) als Anker
 *   - KI-Render nach Step 8, Kontakt-Gate vor Iteration
 *   - Optionaler Grundriss-Upload spaeter integrierbar
 */

import type { Segment, KitchenFormSlug } from "./funnel-traumkueche-stammdaten";

// ============================================================
// Floorplan-Analyse (Phase 2)
// ============================================================

export interface TraumkuecheFloorplanAnalysis {
  kitchenForm: KitchenFormSlug | null;
  approxLengthMeters: number | null;
  approxDepthMeters: number | null;
  doorsDetected: number | null;
  windowsDetected: number | null;
  recommendedLayout: string | null;
  confidence: number;
  warnings: string[];
  usable: boolean;
}

export interface TraumkuecheFloorplan {
  filePath: string;
  analyzedAt: string;
  analysis: TraumkuecheFloorplanAnalysis;
}

export const FUNNEL_TRAUMKUECHE_ID = "traumkueche" as const;

export type TraumkuecheStepType =
  | "style-hero"            // Stil (grosse Bild-Karten)
  | "surface-finish"        // Oberflaechen-Charakteristik
  | "color-swatch"          // Farb-Swatches
  | "worktop"               // Arbeitsplatte
  | "storage-features"      // Stauraum + Beleuchtung
  | "appliance-layouts"     // Geraete-Anordnung
  | "appliance-segment"     // Geraete-Qualitaetsstufe
  | "form-size"             // Kuechenform + Groesse
  | "generating"            // KI-Render in progress
  | "reveal"                // Bild-Enthuellung + Preis-Range
  | "lead-gate"             // Kontakt-Abfrage
  | "done";                 // Redirect zur Ergebnis-Seite

export interface TraumkuecheStepConfig {
  slug: string;
  label: string;
  headline: string;
  subheadline: string;
  type: TraumkuecheStepType;
  required: boolean;
  /** Welche Kategorie fuer die Progress-Anzeige */
  category: "stil" | "material" | "ausstattung" | "form" | "kontakt";
}

export const TRAUMKUECHE_STEPS: TraumkuecheStepConfig[] = [
  {
    slug: "stil",
    label: "Stil",
    headline: "Wie soll deine Traumkueche aussehen?",
    subheadline: "Waehle den Stil, der dich am meisten anspricht.",
    type: "style-hero",
    required: true,
    category: "stil",
  },
  {
    slug: "oberflaeche",
    label: "Oberflaeche",
    headline: "Welche Oberflaeche willst du fuehlen?",
    subheadline: "Matt, seidig oder spiegelglatt - das praegt den Charakter.",
    type: "surface-finish",
    required: true,
    category: "stil",
  },
  {
    slug: "farbe",
    label: "Farbe",
    headline: "Welche Farbe soll deine Front haben?",
    subheadline: "Von klassisch weiss bis dunkles Anthrazit.",
    type: "color-swatch",
    required: true,
    category: "stil",
  },
  {
    slug: "arbeitsplatte",
    label: "Arbeitsplatte",
    headline: "Welche Arbeitsplatte passt zu dir?",
    subheadline: "Keramik, Naturstein, Holz - jedes Material wirkt anders.",
    type: "worktop",
    required: true,
    category: "material",
  },
  {
    slug: "ausstattung",
    label: "Ausstattung",
    headline: "Worauf legst du bei Stauraum & Licht Wert?",
    subheadline: "Mehrfachauswahl. Alles, was wichtig ist.",
    type: "storage-features",
    required: false,
    category: "ausstattung",
  },
  {
    slug: "geraete",
    label: "Geraete",
    headline: "Wie sollen deine Geraete angeordnet sein?",
    subheadline: "Backofen hoch, Induktion mit Muldenlueftung - du entscheidest.",
    type: "appliance-layouts",
    required: false,
    category: "ausstattung",
  },
  {
    slug: "geraete-segment",
    label: "Marken-Stufe",
    headline: "In welcher Qualitaetsstufe sollen die Geraete sein?",
    subheadline: "Von solide bis absolute Spitzenklasse.",
    type: "appliance-segment",
    required: true,
    category: "ausstattung",
  },
  {
    slug: "form",
    label: "Form",
    headline: "Welche Kuechenform hast du im Raum?",
    subheadline: "Form und ungefaehre Groesse - damit die KI es richtig zeichnet.",
    type: "form-size",
    required: true,
    category: "form",
  },
  {
    slug: "render",
    label: "KI-Render",
    headline: "Deine Traumkueche entsteht...",
    subheadline: "Die KI zeichnet jetzt dein Moodboard. Dauert etwa 10 Sekunden.",
    type: "generating",
    required: true,
    category: "form",
  },
  {
    slug: "ergebnis",
    label: "Enthuellung",
    headline: "Hier ist deine Kueche!",
    subheadline: "Gefaellt dir, was du siehst?",
    type: "reveal",
    required: true,
    category: "form",
  },
  {
    slug: "kontakt",
    label: "Kontakt",
    headline: "Lass uns dein Moodboard sichern",
    subheadline: "Name und E-Mail - damit du zurueckkommen und teilen kannst.",
    type: "lead-gate",
    required: true,
    category: "kontakt",
  },
];

// ============================================================
// State / Payload
// ============================================================

export interface TraumkuecheContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  plz: string;
  consentDatenschutz: boolean;
  consentAi: boolean;
  consentCallback: boolean;
}

export interface TraumkuecheData {
  sessionToken: string;

  styleSlug?: string;
  surfaceFinishSlug?: string;
  frontColorSlug?: string;

  worktopSlug?: string;

  storageFeatures: string[];
  applianceLayouts: string[];
  applianceSegment?: Segment;

  kitchenForm?: KitchenFormSlug;
  kitchenSize?: "klein" | "mittel" | "gross" | "xl";

  currentRenderId?: string;
  priceRangeMinCents?: number;
  priceRangeMaxCents?: number;
  expertNote?: string;

  /** Phase 2: Optionale Grundriss-Analyse */
  floorplan?: TraumkuecheFloorplan;

  contact?: Partial<TraumkuecheContact>;
}

export function createEmptyTraumkuecheData(): TraumkuecheData {
  return {
    sessionToken: generateSessionToken(),
    storageFeatures: [],
    applianceLayouts: [],
  };
}

/**
 * Token fuer planner_sessions.session_token. Kollisionsfrei bei 128 Bit.
 * crypto.randomUUID waere sauberer, wird aber nicht in jedem Runtime
 * unterstuetzt - Math.random + Date.now reicht als Fallback.
 */
function generateSessionToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

// ============================================================
// Step-Navigation Helpers
// ============================================================

export function findStepBySlug(slug: string): TraumkuecheStepConfig | undefined {
  return TRAUMKUECHE_STEPS.find((s) => s.slug === slug);
}

export function findStepIndex(slug: string): number {
  return TRAUMKUECHE_STEPS.findIndex((s) => s.slug === slug);
}

export function nextStep(slug: string): TraumkuecheStepConfig | undefined {
  const i = findStepIndex(slug);
  return i >= 0 && i < TRAUMKUECHE_STEPS.length - 1 ? TRAUMKUECHE_STEPS[i + 1] : undefined;
}

export function prevStep(slug: string): TraumkuecheStepConfig | undefined {
  const i = findStepIndex(slug);
  return i > 0 ? TRAUMKUECHE_STEPS[i - 1] : undefined;
}

/**
 * Validiert einen Step. Return undefined wenn gueltig, sonst Fehlermeldung.
 * Wird sowohl vom Client (Step-Gate) als auch vom API-Endpoint genutzt.
 */
export function validateStep(
  slug: string,
  data: TraumkuecheData,
): string | undefined {
  const step = findStepBySlug(slug);
  if (!step) return "Unbekannter Schritt.";

  if (!step.required) return undefined;

  switch (step.type) {
    case "style-hero":
      if (!data.styleSlug) return "Bitte waehle einen Stil.";
      break;
    case "surface-finish":
      if (!data.surfaceFinishSlug) return "Bitte waehle eine Oberflaeche.";
      break;
    case "color-swatch":
      if (!data.frontColorSlug) return "Bitte waehle eine Farbe.";
      break;
    case "worktop":
      if (!data.worktopSlug) return "Bitte waehle eine Arbeitsplatte.";
      break;
    case "appliance-segment":
      if (!data.applianceSegment) return "Bitte waehle eine Qualitaetsstufe.";
      break;
    case "form-size":
      if (!data.kitchenForm) return "Bitte waehle eine Kuechenform.";
      if (!data.kitchenSize) return "Bitte gib eine ungefaehre Groesse an.";
      break;
    case "lead-gate":
      if (!data.contact?.firstName) return "Vorname fehlt.";
      if (!data.contact?.lastName) return "Nachname fehlt.";
      if (!data.contact?.email || !data.contact.email.includes("@"))
        return "Gueltige E-Mail fehlt.";
      if (!data.contact?.plz || !/^\d{5}$/.test(data.contact.plz))
        return "Gueltige PLZ fehlt.";
      if (!data.contact?.consentDatenschutz)
        return "Datenschutzerklaerung muss akzeptiert werden.";
      if (!data.contact?.consentAi)
        return "KI-Verarbeitungs-Einwilligung muss akzeptiert werden.";
      break;
    default:
      break;
  }
  return undefined;
}

// ============================================================
// Progress-Indicator-Helpers
// ============================================================

export const TRAUMKUECHE_CATEGORIES: Array<{
  key: TraumkuecheStepConfig["category"];
  label: string;
}> = [
  { key: "stil", label: "Stil" },
  { key: "material", label: "Material" },
  { key: "ausstattung", label: "Ausstattung" },
  { key: "form", label: "Ergebnis" },
  { key: "kontakt", label: "Abschluss" },
];

export function progressForSlug(slug: string): { current: number; total: number; percent: number } {
  const i = findStepIndex(slug);
  const total = TRAUMKUECHE_STEPS.length;
  const current = i + 1;
  return { current, total, percent: Math.round((current / total) * 100) };
}
