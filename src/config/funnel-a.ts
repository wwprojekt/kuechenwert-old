/**
 * Funnel A: "Angebot erhalten" (Lead-Generation)
 *
 * 12-Step-Funnel im küchenportal.de/Aroundhome-Stil.
 *  - Single-Choice-Steps mit Auto-Advance
 *  - Budget als Slider (3.000 – 50.000 €, Default 10.000 €)
 *  - Kontakt gesplittet: Name/E-Mail ⇒ Telefon-Verifizierung
 *  - Keine Pflicht-Adresse (erst nach Lead-Kauf erfasst)
 * Stammdaten (Fronten, Geraete, Worktops) werden aus DB geladen.
 */

export const FUNNEL_A_ID = "a" as const;

export type FunnelAStepType =
  | "cards"
  | "image-cards"
  | "multi-cards"
  | "stammdaten-cards"
  | "stammdaten-multi-cards"
  | "size"
  | "budget-slider"
  | "plz"
  | "contact"
  | "phone";

export interface FunnelAStepConfig {
  slug: string;
  label: string;
  description: string;
  type: FunnelAStepType;
  required: boolean;
}

export const FUNNEL_A_STEPS: FunnelAStepConfig[] = [
  {
    slug: "anlass",
    label: "Anlass",
    description: "Was ist der Anlass für Ihre neue Küche?",
    type: "cards",
    required: true,
  },
  {
    slug: "wohnsituation",
    label: "Wohnsituation",
    description: "Wie wohnen Sie?",
    type: "cards",
    required: true,
  },
  {
    slug: "kuechenform",
    label: "Küchenform",
    description: "Welche Küchenform schwebt Ihnen vor?",
    type: "image-cards",
    required: true,
  },
  {
    slug: "groesse",
    label: "Größe",
    description: "Wie groß ist Ihre Küche ungefähr?",
    type: "size",
    required: false,
  },
  {
    slug: "stil",
    label: "Stil",
    description: "Welcher Stil gefällt Ihnen?",
    type: "image-cards",
    required: false,
  },
  {
    slug: "fronten",
    label: "Fronten",
    description: "Welche Fronten bevorzugen Sie? (optional, mehrere möglich)",
    type: "stammdaten-multi-cards",
    required: false,
  },
  {
    slug: "arbeitsplatte",
    label: "Arbeitsplatte",
    description: "Welches Material wünschen Sie für die Arbeitsplatte?",
    type: "stammdaten-cards",
    required: false,
  },
  {
    slug: "geraete",
    label: "Geräte-Marken",
    description: "Welche Geräte-Marken bevorzugen Sie? (optional)",
    type: "stammdaten-multi-cards",
    required: false,
  },
  {
    slug: "zeitrahmen",
    label: "Zeitrahmen",
    description: "Wann soll Ihre neue Küche geliefert werden?",
    type: "cards",
    required: true,
  },
  {
    slug: "budget",
    label: "Budget",
    description:
      "Welches Budget haben Sie ungefähr eingeplant? (unverbindlich)",
    type: "budget-slider",
    required: true,
  },
  {
    slug: "plz",
    label: "Region",
    description: "Wo suchen Sie ein Küchenstudio?",
    type: "plz",
    required: true,
  },
  {
    slug: "kontakt",
    label: "Wer soll die Angebote erhalten?",
    description: "Damit wir Ihre Angebote richtig adressieren können.",
    type: "contact",
    required: true,
  },
  {
    slug: "telefon",
    label: "Zur Verifizierung Ihrer Angaben",
    description:
      "Damit wir Ihre Anfrage bestätigen und Rückfragen klären können.",
    type: "phone",
    required: true,
  },
];

// ---------------------------------------------------------------
// 1) Anlass
// ---------------------------------------------------------------
export const FUNNEL_A_OCCASIONS = [
  { id: "neukauf", label: "Neue Küche", description: "Erstausstattung oder kompletter Neukauf" },
  { id: "renovierung", label: "Renovierung", description: "Bestehende Küche wird ersetzt" },
  { id: "umzug", label: "Umzug", description: "Neue Wohnung / neues Haus" },
  { id: "modernisierung", label: "Modernisierung", description: "Einzelne Komponenten erneuern" },
  { id: "unsicher", label: "Weiß noch nicht", description: "Bin in der Orientierungsphase" },
] as const;

// ---------------------------------------------------------------
// 2) Wohnsituation - PFLICHT
// ---------------------------------------------------------------
export const FUNNEL_A_HOUSING = [
  { id: "rent_apartment", label: "Mietwohnung", description: "Ich miete eine Wohnung", housing_type: "rent" },
  { id: "rent_house", label: "Miethaus", description: "Ich miete ein Haus", housing_type: "rent" },
  { id: "own_apartment", label: "Eigentumswohnung", description: "Mir gehört die Wohnung", housing_type: "own" },
  { id: "own_house", label: "Eigenheim", description: "Mir gehört das Haus", housing_type: "own" },
  { id: "unsicher", label: "Möchte ich nicht sagen", description: "Keine Angabe", housing_type: "unknown" },
] as const;

// ---------------------------------------------------------------
// 3) Kuechenform - mit echten Küchen-Bildern
// ---------------------------------------------------------------
import { FUNNEL_KITCHEN_FORMS, FUNNEL_KITCHEN_STYLES } from "@/lib/images";

export const FUNNEL_A_KITCHEN_FORMS = [
  { id: "zeile", label: "Küchenzeile", description: "Gerade Front", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS.zeile },
  { id: "l-form", label: "L-Form", description: "Über Eck", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS["l-form"] },
  { id: "u-form", label: "U-Form", description: "Drei Seiten", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS["u-form"] },
  { id: "zweizeilig", label: "Zweizeilig", description: "Parallel", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS.zweizeilig },
  { id: "kochinsel", label: "Kochinsel", description: "Mit Insel", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS.kochinsel },
  { id: "unsicher", label: "Steht noch nicht fest", description: "Beratung gewünscht", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_FORMS.unsicher },
] as const;

// ---------------------------------------------------------------
// 4) Groesse (m²)
// ---------------------------------------------------------------
export const FUNNEL_A_SIZES = [
  { id: "klein", label: "Bis 8 m²", description: "Kleine Küche" },
  { id: "mittel", label: "8 – 15 m²", description: "Standard-Küche" },
  { id: "gross", label: "15 – 25 m²", description: "Große Küche" },
  { id: "xl", label: "Über 25 m²", description: "Wohnküche / offen" },
  { id: "unsicher", label: "Weiß ich nicht", description: "Noch nicht ausgemessen" },
] as const;

// ---------------------------------------------------------------
// 5) Stil - mit echten Küchen-Stil-Bildern
// ---------------------------------------------------------------
export const FUNNEL_A_STYLES = [
  { id: "modern", label: "Modern", description: "Klare Linien, Hochglanz", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.modern },
  { id: "landhaus", label: "Landhaus", description: "Warm, gemütlich, Holz", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.landhaus },
  { id: "klassisch", label: "Klassisch", description: "Zeitlos, elegant", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.klassisch },
  { id: "minimalistisch", label: "Minimalistisch", description: "Reduziert, grifflos", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.minimalistisch },
  { id: "industrial", label: "Industrial", description: "Beton, Metall, dunkel", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.industrial },
  { id: "individuell", label: "Bin offen / unsicher", description: "Beratung gewünscht", bgClass: "bg-neutral-200", imageSrc: FUNNEL_KITCHEN_STYLES.individuell },
] as const;

// ---------------------------------------------------------------
// 9) Zeitrahmen
// ---------------------------------------------------------------
export const FUNNEL_A_TIMEFRAMES = [
  { id: "asap", label: "So schnell wie möglich", months: 1 },
  { id: "1-3", label: "1 – 3 Monate", months: 2 },
  { id: "4-6", label: "4 – 6 Monate", months: 5 },
  { id: "7-12", label: "7 – 12 Monate", months: 9 },
  { id: "spaeter", label: "Später / Nur informieren", months: 18 },
  { id: "unsicher", label: "Weiß noch nicht", months: 12 },
] as const;

// ---------------------------------------------------------------
// Budget-Slider-Config (ersetzt die alten BUDGET-Cards)
// ---------------------------------------------------------------
export const FUNNEL_A_BUDGET_SLIDER = {
  min: 3_000,
  max: 50_000,
  step: 500,
  default: 10_000,
} as const;

// ---------------------------------------------------------------
// State
// ---------------------------------------------------------------
export interface FunnelAData {
  // Step 1-5 (eigene Auswahl)
  occasion: string;
  housing: string;
  kitchenForm: string;
  size: string;
  style: string;

  // Step 6-8 (Stammdaten-IDs)
  frontMaterialIds: string[];
  worktopMaterialId: string;
  applianceBrandIds: string[];

  // Step 9-10 (Pflicht)
  timeframe: string;
  /** Budget in Euro (Slider-Wert). 0 = noch nicht gewählt. */
  budget: number;

  // Step 11 (Pflicht)
  plz: string;

  // Step 12 (Kontakt – ohne Telefon)
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;

  // Step 13 (Telefon-Verifizierung – Pflicht)
  phone: string;
  consentCall: boolean;
  consentMarketing: boolean;
}

export function createEmptyFunnelAData(): FunnelAData {
  return {
    occasion: "",
    housing: "",
    kitchenForm: "",
    size: "",
    style: "",
    frontMaterialIds: [],
    worktopMaterialId: "",
    applianceBrandIds: [],
    timeframe: "",
    budget: 0,
    plz: "",
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consentCall: false,
    consentMarketing: false,
  };
}

// ---------------------------------------------------------------
// Stammdaten-Slot-Typen (kommen aus DB)
// ---------------------------------------------------------------
export interface CatalogItem {
  id: string;
  name: string;
}

export interface FunnelAStammdaten {
  frontMaterials: CatalogItem[];
  worktopMaterials: CatalogItem[];
  applianceBrands: CatalogItem[];
}
