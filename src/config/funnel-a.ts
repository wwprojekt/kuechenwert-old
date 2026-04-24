/**
 * Funnel A: "Angebot erhalten" (Lead-Generation)
 *
 * 17-Step-Funnel im küchenportal.de/Aroundhome-Stil.
 *  - Single-Choice-Steps mit Auto-Advance
 *  - 4 ergänzende Quiz-Fragen (Farbe, Kochfeld, Backofen, Kochstil)
 *    für mehr "easy clicks" → weniger Abbruch vor dem Kontakt-Teil.
 *  - Arbeitsplatte als 6 Material-Kategorien mit Bildern (nicht mehr
 *    DB-Stammdaten-Liste — der Händler klärt das Detail am Telefon).
 *  - Fronten/Geräte-Marken optional (Skip-first).
 *  - Budget als Slider (3.000 – 50.000 €, Default 10.000 €).
 *  - Kontakt gesplittet: Name/E-Mail ⇒ Telefon-Verifizierung.
 *  - Keine Pflicht-Adresse (wird erst nach Lead-Kauf erfasst).
 */

export const FUNNEL_A_ID = "a" as const;

export type FunnelAStepType =
  | "cards"
  | "image-cards"
  | "multi-cards"
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
    slug: "farbe",
    label: "Farbwelt",
    description: "Welche Farbwelt gefällt Ihnen?",
    type: "cards",
    required: false,
  },
  {
    slug: "arbeitsplatte",
    label: "Arbeitsplatte",
    description: "Welches Material wünschen Sie für die Arbeitsplatte?",
    type: "image-cards",
    required: false,
  },
  {
    slug: "kochfeld",
    label: "Kochfeld",
    description: "Welches Kochfeld bevorzugen Sie?",
    type: "cards",
    required: false,
  },
  {
    slug: "backofen",
    label: "Backofen",
    description: "Wie soll der Backofen eingebaut sein?",
    type: "cards",
    required: false,
  },
  {
    slug: "kochstil",
    label: "Kochstil",
    description: "Wie wird bei Ihnen gekocht?",
    type: "cards",
    required: false,
  },
  {
    slug: "fronten",
    label: "Fronten (optional)",
    description:
      "Haben Sie Lieblings-Fronten? Überspringen ist absolut ok – der Küchenplaner empfiehlt passende Fronten beim Termin.",
    type: "stammdaten-multi-cards",
    required: false,
  },
  {
    slug: "geraete",
    label: "Geräte-Marken (optional)",
    description:
      "Gibt es Marken, die Sie bevorzugen? Kein Muss – überspringen Sie, wenn Sie offen sind.",
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
import {
  FUNNEL_KITCHEN_FORMS,
  FUNNEL_KITCHEN_STYLES,
  FUNNEL_WORKTOP_CATEGORIES,
} from "@/lib/images";

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
// 6) Farbwelt (neuer Quiz-Step)
// ---------------------------------------------------------------
export const FUNNEL_A_COLORS = [
  { id: "hell", label: "Hell", description: "Weiß, Creme, Beige" },
  { id: "holz", label: "Holzton", description: "Natur, warm, Eiche" },
  { id: "dunkel", label: "Dunkel", description: "Anthrazit, Schwarz, Grau" },
  { id: "farbig", label: "Farbig", description: "Blau, Grün, Petrol" },
  { id: "mix", label: "Zweifarbig", description: "Kombination aus 2 Farben" },
  { id: "unsicher", label: "Weiß noch nicht", description: "Bin offen" },
] as const;

// ---------------------------------------------------------------
// 7) Arbeitsplatte — Material-Kategorien (neu: keine DB-Liste mehr)
// ---------------------------------------------------------------
export const FUNNEL_A_WORKTOP_CATEGORIES = [
  {
    id: "holz",
    label: "Holz",
    description: "Massiv, warm, gemütlich",
    bgClass: "bg-amber-50",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.holz,
  },
  {
    id: "naturstein",
    label: "Naturstein",
    description: "Granit, Marmor, Schiefer",
    bgClass: "bg-neutral-200",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.naturstein,
  },
  {
    id: "quarz",
    label: "Quarz / Quarzkomposit",
    description: "Robust, pflegeleicht",
    bgClass: "bg-neutral-100",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.quarz,
  },
  {
    id: "keramik",
    label: "Keramik / Sinterstein",
    description: "Kratz- und hitzefest",
    bgClass: "bg-neutral-200",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.keramik,
  },
  {
    id: "schichtstoff",
    label: "Schichtstoff",
    description: "Preiswert, viele Dekore",
    bgClass: "bg-neutral-100",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.schichtstoff,
  },
  {
    id: "unsicher",
    label: "Beratung gewünscht",
    description: "Das soll der Planer empfehlen",
    bgClass: "bg-neutral-200",
    imageSrc: FUNNEL_WORKTOP_CATEGORIES.unsicher,
  },
] as const;

// ---------------------------------------------------------------
// 8) Kochfeld (neuer Quiz-Step)
// ---------------------------------------------------------------
export const FUNNEL_A_COOKTOPS = [
  { id: "induktion", label: "Induktion", description: "Schnell, sicher, modern" },
  { id: "ceran", label: "Ceran / Glaskeramik", description: "Bewährter Klassiker" },
  { id: "gas", label: "Gas", description: "Direkte Hitzeregelung" },
  { id: "unsicher", label: "Weiß noch nicht", description: "Soll der Planer empfehlen" },
] as const;

// ---------------------------------------------------------------
// 9) Backofen-Einbau (neuer Quiz-Step)
// ---------------------------------------------------------------
export const FUNNEL_A_OVENS = [
  { id: "unter-kochfeld", label: "Unter dem Kochfeld", description: "Klassisch, platzsparend" },
  { id: "augenhoehe", label: "Auf Augenhöhe", description: "Bequem zu bedienen" },
  { id: "doppelt", label: "Zwei Backöfen", description: "Backofen + Dampfgarer o. ä." },
  { id: "unsicher", label: "Weiß noch nicht", description: "Bin offen" },
] as const;

// ---------------------------------------------------------------
// 10) Kochstil (neuer Quiz-Step)
// ---------------------------------------------------------------
export const FUNNEL_A_COOKSTYLES = [
  { id: "allein", label: "Ich koche alleine", description: "Eher selten, praktisch" },
  { id: "paar", label: "Zu zweit", description: "Gemütlich, regelmäßig" },
  { id: "familie", label: "Mit Familie / Kindern", description: "Oft, funktional" },
  { id: "freunde", label: "Mit Freunden / Gästen", description: "Gerne ausgiebig, offen" },
  { id: "selten", label: "Eher selten", description: "Schnell & unkompliziert" },
  { id: "unsicher", label: "Weiß noch nicht", description: "Kein Thema" },
] as const;

// ---------------------------------------------------------------
// 11) Zeitrahmen
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
// Budget-Slider-Config
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

  // Step 6-10 (neue Quiz-Felder)
  color: string;
  worktopCategory: string;
  cooktop: string;
  oven: string;
  cookstyle: string;

  // Step 11-12 (Stammdaten-IDs, optional)
  frontMaterialIds: string[];
  applianceBrandIds: string[];

  // Step 13-14 (Pflicht)
  timeframe: string;
  /** Budget in Euro (Slider-Wert). 0 = noch nicht gewählt. */
  budget: number;

  // Step 15 (Pflicht)
  plz: string;

  // Step 16 (Kontakt – ohne Telefon)
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;

  // Step 17 (Telefon-Verifizierung – Pflicht)
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
    color: "",
    worktopCategory: "",
    cooktop: "",
    oven: "",
    cookstyle: "",
    frontMaterialIds: [],
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
// Stammdaten-Slot-Typen (kommen aus DB, nur noch Fronten+Geräte)
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
