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
    headline: "Wie soll deine Traumküche aussehen?",
    subheadline: "Wähle den Stil, der dich am meisten anspricht.",
    type: "style-hero",
    required: true,
    category: "stil",
  },
  {
    slug: "oberflaeche",
    label: "Oberfläche",
    headline: "Welche Oberfläche willst du fühlen?",
    subheadline: "Matt, seidig oder spiegelglatt – das prägt den Charakter.",
    type: "surface-finish",
    required: true,
    category: "stil",
  },
  {
    slug: "farbe",
    label: "Farbe",
    headline: "Welche Farbe soll deine Front haben?",
    subheadline: "Von klassisch Weiß bis dunkles Anthrazit.",
    type: "color-swatch",
    required: true,
    category: "stil",
  },
  {
    slug: "arbeitsplatte",
    label: "Arbeitsplatte",
    headline: "Welche Arbeitsplatte passt zu dir?",
    subheadline: "Keramik, Naturstein, Holz – jedes Material wirkt anders.",
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
    label: "Geräte",
    headline: "Wie sollen deine Geräte angeordnet sein?",
    subheadline: "Backofen hoch, Induktion mit Muldenlüftung – du entscheidest.",
    type: "appliance-layouts",
    required: false,
    category: "ausstattung",
  },
  {
    slug: "geraete-segment",
    label: "Marken-Stufe",
    headline: "In welcher Qualitätsstufe sollen die Geräte sein?",
    subheadline: "Von solide bis absolute Spitzenklasse.",
    type: "appliance-segment",
    required: true,
    category: "ausstattung",
  },
  {
    slug: "form",
    label: "Form",
    headline: "Welche Küchenform hast du im Raum?",
    subheadline: "Form und ungefähre Größe – damit die KI es richtig zeichnet.",
    type: "form-size",
    required: true,
    category: "form",
  },
  {
    slug: "kontakt",
    label: "Kontakt",
    headline: "Fast geschafft – wohin schicken wir dein Moodboard?",
    subheadline: "Während du das ausfüllst, rendert die KI deine Küche im Hintergrund.",
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
      if (!data.styleSlug) return "Bitte wähle einen Stil.";
      break;
    case "surface-finish":
      if (!data.surfaceFinishSlug) return "Bitte wähle eine Oberfläche.";
      break;
    case "color-swatch":
      if (!data.frontColorSlug) return "Bitte wähle eine Farbe.";
      break;
    case "worktop":
      if (!data.worktopSlug) return "Bitte wähle eine Arbeitsplatte.";
      break;
    case "appliance-segment":
      if (!data.applianceSegment) return "Bitte wähle eine Qualitätsstufe.";
      break;
    case "form-size":
      if (!data.kitchenForm) return "Bitte wähle eine Küchenform.";
      if (!data.kitchenSize) return "Bitte gib eine ungefähre Größe an.";
      break;
    case "lead-gate":
      if (!data.contact?.firstName) return "Vorname fehlt.";
      if (!data.contact?.lastName) return "Nachname fehlt.";
      if (!data.contact?.email || !data.contact.email.includes("@"))
        return "Gültige E-Mail fehlt.";
      if (!data.contact?.plz || !/^\d{5}$/.test(data.contact.plz))
        return "Gültige PLZ fehlt.";
      if (!data.contact?.consentDatenschutz)
        return "Datenschutzerklärung muss akzeptiert werden.";
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
  { key: "form", label: "Form" },
  { key: "kontakt", label: "Abschluss" },
];

export function progressForSlug(slug: string): { current: number; total: number; percent: number } {
  const i = findStepIndex(slug);
  const total = TRAUMKUECHE_STEPS.length;
  const current = i + 1;
  return { current, total, percent: Math.round((current / total) * 100) };
}
