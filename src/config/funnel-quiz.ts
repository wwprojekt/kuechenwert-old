/**
 * Funnel 3: "Style-Quiz" (KitchenAdvisor Style)
 *
 * Visual quiz for inspiration seekers and undecided users.
 * 7 steps -- good conversion, medium-high lead quality.
 * Produces a "quiz result" (matched kitchen style) at the end.
 */

export const FUNNEL_QUIZ_ID = "quiz" as const;

export interface QuizStepConfig {
  slug: string;
  label: string;
  description: string;
  type: "image-select" | "color-select" | "cards" | "multi-cards" | "upload" | "plz" | "contact";
}

export const QUIZ_STEPS: QuizStepConfig[] = [
  {
    slug: "stil",
    label: "Welcher Stil gefällt Ihnen?",
    description: "Wählen Sie ein oder mehrere Bilder, die Sie ansprechen.",
    type: "image-select",
  },
  {
    slug: "farbe",
    label: "Welche Farbwelt passt zu Ihnen?",
    description: "Wählen Sie die Farbrichtung für Ihre Traumküche.",
    type: "color-select",
  },
  {
    slug: "form",
    label: "Welche Küchenform?",
    description: "Welches Layout passt am besten in Ihren Raum?",
    type: "cards",
  },
  {
    slug: "prioritaeten",
    label: "Was ist Ihnen wichtig?",
    description: "Wählen Sie bis zu 3 Prioritäten.",
    type: "multi-cards",
  },
  {
    slug: "grundriss",
    label: "Grundriss hochladen",
    description: "Für präzisere Angebote können Sie Ihren Grundriss hochladen.",
    type: "upload",
  },
  {
    slug: "plz",
    label: "Ihre Postleitzahl",
    description: "Damit wir Küchenstudios in Ihrer Nähe finden können.",
    type: "plz",
  },
  {
    slug: "kontakt",
    label: "Ihre Kontaktdaten",
    description: "Gleich haben Sie es geschafft!",
    type: "contact",
  },
];

export const QUIZ_STYLE_OPTIONS = [
  {
    id: "modern",
    label: "Modern / Minimalistisch",
    bgClass: "bg-gradient-to-br from-zinc-800 to-zinc-950",
  },
  {
    id: "landhaus",
    label: "Landhaus / Gemütlich",
    bgClass: "bg-gradient-to-br from-amber-700 to-amber-900",
  },
  {
    id: "industrial",
    label: "Industrial / Loft",
    bgClass: "bg-gradient-to-br from-stone-600 to-stone-800",
  },
  {
    id: "skandinavisch",
    label: "Skandinavisch / Clean",
    bgClass: "bg-gradient-to-br from-sky-100 to-sky-300",
  },
] as const;

export const QUIZ_COLOR_OPTIONS = [
  {
    id: "weiss-hell",
    label: "Weiß & Hell",
    bgClass: "bg-gradient-to-br from-white to-zinc-100",
  },
  {
    id: "schwarz-dunkel",
    label: "Schwarz & Dunkel",
    bgClass: "bg-gradient-to-br from-zinc-800 to-zinc-950",
  },
  {
    id: "holztoene",
    label: "Holztöne",
    bgClass: "bg-gradient-to-br from-amber-600 to-amber-800",
  },
  {
    id: "bunt",
    label: "Bunt & Mutig",
    bgClass: "bg-gradient-to-br from-rose-400 to-violet-500",
  },
  {
    id: "beton-grau",
    label: "Beton & Grau",
    bgClass: "bg-gradient-to-br from-stone-400 to-stone-600",
  },
] as const;

export const QUIZ_FORM_OPTIONS = [
  { id: "zeile", label: "Küchenzeile" },
  { id: "l-form", label: "L-Form" },
  { id: "u-form", label: "U-Form" },
  { id: "kochinsel", label: "Kochinsel" },
  { id: "unsicher", label: "Noch unsicher" },
] as const;

export const QUIZ_PRIORITY_OPTIONS = [
  { id: "stauraum", label: "Viel Stauraum" },
  { id: "kochinsel", label: "Kochinsel" },
  { id: "offen", label: "Offene Gestaltung" },
  { id: "geraete", label: "Hochwertige Geräte" },
  { id: "pflegeleicht", label: "Pflegeleichte Materialien" },
  { id: "design", label: "Design & Ästhetik" },
] as const;

export interface QuizFunnelData {
  styles: string[];
  colors: string[];
  kitchenForm: string;
  priorities: string[];
  floorPlanFile: File | null;
  plz: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentCall: boolean;
  consentMarketing: boolean;
}

export function createEmptyQuizData(): QuizFunnelData {
  return {
    styles: [],
    colors: [],
    kitchenForm: "",
    priorities: [],
    floorPlanFile: null,
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

/**
 * Determines the primary kitchen style result based on quiz answers.
 * Returns a style slug and description for the result page.
 */
export function calculateQuizResult(data: QuizFunnelData): {
  styleSlug: string;
  styleLabel: string;
  description: string;
} {
  const styleCounts: Record<string, number> = {};

  for (const s of data.styles) {
    styleCounts[s] = (styleCounts[s] ?? 0) + 2;
  }

  if (data.colors.includes("weiss-hell") || data.colors.includes("beton-grau")) {
    styleCounts["modern"] = (styleCounts["modern"] ?? 0) + 1;
  }
  if (data.colors.includes("holztoene")) {
    styleCounts["landhaus"] = (styleCounts["landhaus"] ?? 0) + 1;
    styleCounts["skandinavisch"] = (styleCounts["skandinavisch"] ?? 0) + 1;
  }
  if (data.colors.includes("schwarz-dunkel")) {
    styleCounts["industrial"] = (styleCounts["industrial"] ?? 0) + 1;
    styleCounts["modern"] = (styleCounts["modern"] ?? 0) + 1;
  }
  if (data.colors.includes("bunt")) {
    styleCounts["skandinavisch"] = (styleCounts["skandinavisch"] ?? 0) + 1;
  }

  if (data.priorities.includes("design")) {
    styleCounts["modern"] = (styleCounts["modern"] ?? 0) + 1;
  }
  if (data.priorities.includes("offen")) {
    styleCounts["skandinavisch"] = (styleCounts["skandinavisch"] ?? 0) + 1;
  }

  const sorted = Object.entries(styleCounts).sort(([, a], [, b]) => b - a);
  const topStyle = sorted[0]?.[0] ?? "modern";

  const descriptions: Record<string, { label: string; description: string }> = {
    modern: {
      label: "Modern / Minimalistisch",
      description: "Klare Linien, hochwertige Materialien und eine aufgeräumte Optik – Ihre Küche wird zum architektonischen Statement.",
    },
    landhaus: {
      label: "Landhaus / Gemütlich",
      description: "Natürliche Materialien, warme Farben und einladende Details – Ihre Küche wird zum Mittelpunkt des Familienlebens.",
    },
    industrial: {
      label: "Industrial / Loft",
      description: "Beton, Metall und rohes Holz treffen auf funktionales Design – Ihre Küche bekommt urbanen Charakter.",
    },
    skandinavisch: {
      label: "Skandinavisch / Clean",
      description: "Helle Farben, natürliches Holz und durchdachte Funktionalität – Ihre Küche strahlt nordische Gelassenheit aus.",
    },
  };

  const result = descriptions[topStyle] ?? descriptions.modern;

  return {
    styleSlug: topStyle,
    styleLabel: result.label,
    description: result.description,
  };
}
