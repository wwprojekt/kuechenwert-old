export interface FunnelStepConfig {
  id: string;
  slug: string;
  label: string;
  description: string;
  fieldType: "cards" | "form" | "upload" | "contact";
}

export const FUNNEL_STEPS: FunnelStepConfig[] = [
  {
    id: "kitchen-form",
    slug: "kuechenform",
    label: "Küchenform",
    description: "Welche Küchenform schwebt Ihnen vor?",
    fieldType: "cards",
  },
  {
    id: "kitchen-style",
    slug: "stil",
    label: "Küchenstil",
    description: "Welcher Stil gefällt Ihnen?",
    fieldType: "cards",
  },
  {
    id: "reason",
    slug: "grund",
    label: "Anlass",
    description: "Was ist der Grund für die neue Küche?",
    fieldType: "cards",
  },
  {
    id: "wishes",
    slug: "wuensche",
    label: "Besondere Wünsche",
    description: "Haben Sie besondere Ausstattungswünsche?",
    fieldType: "cards",
  },
  {
    id: "timeframe",
    slug: "zeitrahmen",
    label: "Zeitrahmen",
    description: "Wann soll die Küche stehen?",
    fieldType: "cards",
  },
  {
    id: "budget",
    slug: "budget",
    label: "Budget",
    description: "Was ist Ihre Budget-Vorstellung?",
    fieldType: "cards",
  },
  {
    id: "offer-check",
    slug: "angebots-check",
    label: "Angebots-Check",
    description: "Haben Sie bereits ein Angebot vorliegen?",
    fieldType: "upload",
  },
  {
    id: "contact",
    slug: "kontakt",
    label: "Kontaktdaten",
    description: "Wie können wir Sie erreichen?",
    fieldType: "contact",
  },
];

export const KITCHEN_FORMS = [
  { id: "zeile", label: "Küchenzeile", icon: "LayoutList" },
  { id: "l-form", label: "L-Form", icon: "CornerDownRight" },
  { id: "u-form", label: "U-Form", icon: "Square" },
  { id: "insel", label: "Kochinsel", icon: "Maximize" },
  { id: "unsicher", label: "Weiß noch nicht", icon: "HelpCircle" },
] as const;

export const KITCHEN_STYLES = [
  { id: "modern", label: "Modern", image: "/images/stil-modern.jpg" },
  { id: "klassisch", label: "Klassisch", image: "/images/stil-klassisch.jpg" },
  { id: "landhaus", label: "Landhaus", image: "/images/stil-landhaus.jpg" },
  { id: "design", label: "Design", image: "/images/stil-design.jpg" },
] as const;

export const PURCHASE_REASONS = [
  { id: "neubau", label: "Neubau / Erstbezug" },
  { id: "renovierung", label: "Renovierung / Austausch" },
] as const;

export const TIMEFRAMES = [
  { id: "1-3", label: "1–3 Monate", months: 2 },
  { id: "4-6", label: "4–6 Monate", months: 5 },
  { id: "later", label: "Später", months: 12 },
] as const;

export const BUDGET_RANGES = [
  { id: "under-5k", label: "Unter 5.000 €", midpoint: 3500 },
  { id: "5k-10k", label: "5.000 – 10.000 €", midpoint: 7500 },
  { id: "10k-15k", label: "10.000 – 15.000 €", midpoint: 12500 },
  { id: "15k-25k", label: "15.000 – 25.000 €", midpoint: 20000 },
  { id: "over-25k", label: "Über 25.000 €", midpoint: 30000 },
  { id: "unsicher", label: "Bin mir unsicher", midpoint: null },
] as const;

export const SPECIAL_WISHES = [
  { id: "dampfgarer", label: "Dampfgarer" },
  { id: "smart-home", label: "Smart Home" },
  { id: "holz", label: "Holz-Arbeitsplatte" },
  { id: "granit", label: "Granit" },
  { id: "keramik", label: "Keramik" },
  { id: "muldenluefter", label: "Muldenlüfter" },
  { id: "dunstabzug", label: "Dunstabzugshaube" },
  { id: "quooker", label: "Quooker / Heißwasser" },
  { id: "weinschrank", label: "Weinkühlschrank" },
] as const;
