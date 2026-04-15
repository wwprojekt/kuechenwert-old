/**
 * Funnel 1: "Angebote vergleichen" (Küchenportal/Aroundhome Style)
 *
 * Quick funnel for users who want to compare regional offers fast.
 * 5 steps -- high conversion, medium lead quality.
 */

export const FUNNEL_ANGEBOTE_ID = "angebote" as const;

export interface AngeboteStepConfig {
  slug: string;
  label: string;
  description: string;
  type: "cards" | "plz" | "contact";
}

export const ANGEBOTE_STEPS: AngeboteStepConfig[] = [
  {
    slug: "kuechenform",
    label: "Küchenform",
    description: "Welche Küchenform schwebt Ihnen vor?",
    type: "cards",
  },
  {
    slug: "budget",
    label: "Budget",
    description: "Was möchten Sie in Ihre neue Küche investieren?",
    type: "cards",
  },
  {
    slug: "zeitrahmen",
    label: "Zeitrahmen",
    description: "Wann soll Ihre neue Küche stehen?",
    type: "cards",
  },
  {
    slug: "plz",
    label: "Ihre Region",
    description: "Wo suchen Sie Küchenstudios?",
    type: "plz",
  },
  {
    slug: "kontakt",
    label: "Kontaktdaten",
    description: "Wie können wir Sie erreichen?",
    type: "contact",
  },
];

export const ANGEBOTE_KITCHEN_FORMS = [
  { id: "zeile", label: "Küchenzeile" },
  { id: "l-form", label: "L-Form" },
  { id: "u-form", label: "U-Form" },
  { id: "kochinsel", label: "Kochinsel" },
  { id: "unsicher", label: "Steht noch nicht fest" },
] as const;

export const ANGEBOTE_BUDGETS = [
  { id: "unter-5k", label: "Unter 5.000 €" },
  { id: "5k-10k", label: "5.000 – 10.000 €" },
  { id: "10k-15k", label: "10.000 – 15.000 €" },
  { id: "15k-25k", label: "15.000 – 25.000 €" },
  { id: "ueber-25k", label: "Über 25.000 €" },
  { id: "unsicher", label: "Bin mir unsicher" },
] as const;

export const ANGEBOTE_TIMEFRAMES = [
  { id: "1-3", label: "1–3 Monate" },
  { id: "4-6", label: "4–6 Monate" },
  { id: "spaeter", label: "Später / Erst informieren" },
] as const;

export interface AngeboteFunnelData {
  kitchenForm: string;
  budget: string;
  timeframe: string;
  plz: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentCall: boolean;
  consentMarketing: boolean;
}

export function createEmptyAngeboteData(): AngeboteFunnelData {
  return {
    kitchenForm: "",
    budget: "",
    timeframe: "",
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
