/**
 * Funnel 2: "Küchenplanung starten" (Küchenheld Style)
 *
 * Detailed funnel for users who want comprehensive kitchen planning.
 * 11 steps -- lower conversion rate, HIGH lead quality.
 */

export const FUNNEL_PLANUNG_ID = "planung" as const;

export interface PlanungStepConfig {
  slug: string;
  label: string;
  description: string;
  type: "cards" | "multi-cards" | "textarea" | "upload" | "contact";
}

export const PLANUNG_STEPS: PlanungStepConfig[] = [
  {
    slug: "kuechenform",
    label: "Küchenform",
    description: "Welche Küchenform gefällt Ihnen?",
    type: "cards",
  },
  {
    slug: "stil",
    label: "Küchenstil",
    description: "Welcher Stil spricht Sie an?",
    type: "cards",
  },
  {
    slug: "raum",
    label: "Raumtyp",
    description: "Wie sieht der Raum für Ihre neue Küche aus?",
    type: "cards",
  },
  {
    slug: "farbe",
    label: "Farbwunsch",
    description: "Welche Farbe soll Ihre Küche haben?",
    type: "cards",
  },
  {
    slug: "ausstattung",
    label: "Ausstattungswünsche",
    description: "Was ist Ihnen besonders wichtig? (Mehrfachauswahl möglich)",
    type: "multi-cards",
  },
  {
    slug: "haushalt",
    label: "Haushaltsgröße",
    description: "Wie viele Personen leben in Ihrem Haushalt?",
    type: "cards",
  },
  {
    slug: "zeitrahmen",
    label: "Zeitrahmen",
    description: "Wann benötigen Sie Ihre neue Küche?",
    type: "cards",
  },
  {
    slug: "anlass",
    label: "Anlass",
    description: "Warum benötigen Sie eine neue Küche?",
    type: "cards",
  },
  {
    slug: "budget",
    label: "Budget",
    description: "Wie viel möchten Sie in Ihre neue Küche investieren?",
    type: "cards",
  },
  {
    slug: "sonstiges",
    label: "Sonderwünsche",
    description: "Gibt es sonst noch etwas, das Sie uns mitteilen möchten?",
    type: "textarea",
  },
  {
    slug: "kontakt",
    label: "Kontaktdaten",
    description: "Fast geschafft – wie können wir Sie erreichen?",
    type: "contact",
  },
];

export const PLANUNG_KITCHEN_FORMS = [
  { id: "zeile", label: "Küchenzeile/n" },
  { id: "l-form", label: "L-Form" },
  { id: "u-form", label: "U-Form" },
  { id: "kochinsel", label: "Kochinsel" },
  { id: "zwei-zeilen", label: "Zwei Zeilen" },
  { id: "unsicher", label: "Andere / Unsicher" },
] as const;

export const PLANUNG_STYLES = [
  { id: "modern", label: "Modern minimalistisch" },
  { id: "klassisch", label: "Klassisch funktional" },
  { id: "landhaus", label: "Landhaus – gemütlich" },
  { id: "industrial", label: "Industrial – rau & edel" },
  { id: "skandinavisch", label: "Skandinavisch" },
  { id: "unsicher", label: "Bin noch unsicher" },
] as const;

export const PLANUNG_ROOM_TYPES = [
  { id: "offen", label: "Offene Küche" },
  { id: "geschlossen", label: "Geschlossene Küche" },
  { id: "planung", label: "Noch in Planung" },
] as const;

export const PLANUNG_COLORS = [
  { id: "hell", label: "Hell" },
  { id: "dunkel", label: "Dunkel" },
  { id: "farbig", label: "Farbig" },
  { id: "holz", label: "Holz" },
] as const;

export const PLANUNG_EQUIPMENT = [
  { id: "ergonomie", label: "Ergonomie" },
  { id: "beleuchtung", label: "Beleuchtung" },
  { id: "stauraum", label: "Viel Stauraum" },
  { id: "innenorganisation", label: "Innenorganisation" },
  { id: "muelltrennung", label: "Mülltrennsystem" },
  { id: "dampfgarer", label: "Dampfgarer" },
  { id: "kaffeevollautomat", label: "Einbau-Kaffeevollautomat" },
  { id: "naturstein", label: "Naturstein/Keramik Arbeitsplatte" },
  { id: "muldenluefter", label: "Muldenlüfter" },
  { id: "quooker", label: "Quooker / Heißwasserhahn" },
  { id: "weinschrank", label: "Weinkühlschrank" },
] as const;

export const PLANUNG_HOUSEHOLD = [
  { id: "alleine", label: "Alleine" },
  { id: "zu-zweit", label: "Zu zweit" },
  { id: "familie", label: "Familie mit Kindern" },
  { id: "gross", label: "WG / Großfamilie" },
] as const;

export const PLANUNG_TIMEFRAMES = [
  { id: "1-3", label: "1–3 Monate" },
  { id: "4-6", label: "4–6 Monate" },
  { id: "7-12", label: "7–12 Monate" },
  { id: "12+", label: "12+ Monate" },
] as const;

export const PLANUNG_REASONS = [
  { id: "renovierung", label: "Renovierung" },
  { id: "umzug", label: "Umzug" },
  { id: "neubau", label: "Neubau" },
] as const;

export const PLANUNG_BUDGETS = [
  { id: "5k-10k", label: "5.000 – 10.000 €" },
  { id: "10k-15k", label: "10.000 – 15.000 €" },
  { id: "15k-25k", label: "15.000 – 25.000 €" },
  { id: "ueber-25k", label: "Über 25.000 €" },
] as const;

export interface PlanungFunnelData {
  kitchenForm: string;
  style: string;
  roomType: string;
  color: string;
  equipment: string[];
  household: string;
  timeframe: string;
  reason: string;
  budget: string;
  freeText: string;
  floorPlanFile: File | null;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentCall: boolean;
  consentMarketing: boolean;
}

export function createEmptyPlanungData(): PlanungFunnelData {
  return {
    kitchenForm: "",
    style: "",
    roomType: "",
    color: "",
    equipment: [],
    household: "",
    timeframe: "",
    reason: "",
    budget: "",
    freeText: "",
    floorPlanFile: null,
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consentCall: false,
    consentMarketing: false,
  };
}
