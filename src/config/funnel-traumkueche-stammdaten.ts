/**
 * Funnel C ("Traumkueche") - Stammdaten fuer KI-Kuechen-Planer.
 *
 * Jeder Eintrag hat ein `promptFragment`-Feld fuer den FLUX-Prompt-Builder.
 * Die Fragmente sind bewusst generisch (keine Markennamen) um Markenrechts-
 * Probleme bei der Bildgenerierung zu vermeiden.
 *
 * Die Segmente ('budget'/'mittel'/'premium'/'luxus') werden fuer die
 * Preisrange-Lookup in `kitchen_price_brackets` verwendet.
 */

export type Segment = "budget" | "mittel" | "premium" | "luxus";
export type WorktopTier = "basic" | "mid" | "premium";
export type KitchenFormSlug = "zeile" | "l" | "u" | "parallel" | "g" | "insel";

// ============================================================
// 1) KITCHEN_STYLES - optische Grund-Variante
// ============================================================
export interface KitchenStyle {
  slug: string;
  label: string;
  description: string;
  segment: Segment;
  promptFragment: string;
  heroImage: string; // /traumkueche/styles/{slug}.webp
}

export const KITCHEN_STYLES: KitchenStyle[] = [
  {
    slug: "modern-grifflos",
    label: "Modern grifflos",
    description: "Klare Linien, perfekt integrierte Fronten, minimalistisch",
    segment: "premium",
    promptFragment:
      "ultra-modern handleless kitchen design, completely flush cabinet fronts with push-to-open mechanism, clean minimalist lines, seamless integrated look",
    heroImage: "/traumkueche/styles/modern-grifflos.webp",
  },
  {
    slug: "modern-griff",
    label: "Modern mit Griff",
    description: "Zeitlose Moderne mit markanten Bügel- oder Stabgriffen",
    segment: "mittel",
    promptFragment:
      "modern kitchen design with slim bar handles, contemporary clean aesthetic, understated elegance",
    heroImage: "/traumkueche/styles/modern-griff.webp",
  },
  {
    slug: "landhaus",
    label: "Landhaus",
    description: "Warm, gemütlich, Holz, Rahmenfronten, klassische Knöpfe",
    segment: "mittel",
    promptFragment:
      "classic country-style farmhouse kitchen, shaker-style cabinet fronts with visible frames, traditional brass knobs, warm wooden accents",
    heroImage: "/traumkueche/styles/landhaus.webp",
  },
  {
    slug: "skandinavisch",
    label: "Skandinavisch",
    description: "Hell, luftig, helle Hölzer, weiche Formen",
    segment: "mittel",
    promptFragment:
      "Scandinavian nordic kitchen design, light birch and oak wood tones, soft whites, airy minimalism, hygge atmosphere",
    heroImage: "/traumkueche/styles/skandinavisch.webp",
  },
  {
    slug: "industrial",
    label: "Industrial",
    description: "Beton, schwarzer Stahl, offene Regale, rohe Materialien",
    segment: "premium",
    promptFragment:
      "industrial loft kitchen design, exposed black steel frames, concrete and raw materials, open shelving, factory-style pendant lights",
    heroImage: "/traumkueche/styles/industrial.webp",
  },
  {
    slug: "luxus-klassisch",
    label: "Luxus klassisch",
    description: "Edel, Holz furniert, Naturstein, repräsentativ",
    segment: "luxus",
    promptFragment:
      "luxury classical kitchen, high-end wood veneer cabinets, natural stone accents, sophisticated craftsmanship, mansion-grade finishes",
    heroImage: "/traumkueche/styles/luxus-klassisch.webp",
  },
];

// ============================================================
// 2) SURFACE_FINISHES - Oberflaechen-Charakteristik
// ============================================================
export interface SurfaceFinish {
  slug: string;
  label: string;
  description: string;
  promptFragment: string;
}

export const SURFACE_FINISHES: SurfaceFinish[] = [
  {
    slug: "matt-antifingerprint",
    label: "Matt (Anti-Fingerprint)",
    description: "Samtmatte Oberflaeche, keine Fingerabdruecke",
    promptFragment: "ultra-matte anti-fingerprint finish, velvet-smooth surface, no reflections",
  },
  {
    slug: "matt-klassisch",
    label: "Matt klassisch",
    description: "Mattlackiert, angenehm tastbar",
    promptFragment: "matte lacquered finish, soft tactile surface, no glare",
  },
  {
    slug: "seidenmatt",
    label: "Seidenmatt",
    description: "Zart schimmernd, zwischen matt und glanz",
    promptFragment: "silk-matte finish with subtle satin sheen",
  },
  {
    slug: "hochglanz",
    label: "Hochglanz",
    description: "Spiegelnd, lichtdurchflutet, luxurioes",
    promptFragment: "high-gloss lacquered finish, mirror-like reflections, polished surfaces",
  },
  {
    slug: "struktur-holz",
    label: "Holzmaserung sichtbar",
    description: "Natuerliche Oberflaeche, Poren und Struktur fuehlbar",
    promptFragment: "natural wood grain texture, visible pores and structure, tactile wood feel",
  },
  {
    slug: "strukturiert-stein",
    label: "Stein-Struktur",
    description: "Rauere, natuerlich anmutende Oberflaeche",
    promptFragment: "textured stone-like surface with natural roughness",
  },
];

// ============================================================
// 3) FRONT_COLORS - Farbpalette mit Swatches
// ============================================================
export interface FrontColor {
  slug: string;
  label: string;
  family: "neutral" | "dunkel" | "hell" | "warm" | "farbig" | "holz";
  hex: string;
  promptFragment: string;
}

export const FRONT_COLORS: FrontColor[] = [
  // Helle Neutralwelt
  { slug: "weiss-reinweiss", label: "Reinweiss", family: "hell", hex: "#FFFFFF", promptFragment: "pure bright white" },
  { slug: "weiss-alpinweiss", label: "Alpinweiss", family: "hell", hex: "#F5F3EF", promptFragment: "warm alpine white with subtle cream undertone" },
  { slug: "creme", label: "Creme", family: "hell", hex: "#EEE3D2", promptFragment: "soft cream beige" },
  { slug: "beige-kaschmir", label: "Kaschmir", family: "hell", hex: "#CDB999", promptFragment: "warm cashmere beige" },

  // Neutral / Grau
  { slug: "grau-hellgrau", label: "Hellgrau", family: "neutral", hex: "#C8C8C8", promptFragment: "light neutral grey" },
  { slug: "grau-taupe", label: "Taupe", family: "neutral", hex: "#8E8478", promptFragment: "elegant taupe grey with warm undertone" },
  { slug: "grau-steingrau", label: "Steingrau", family: "neutral", hex: "#848484", promptFragment: "stone grey" },

  // Dunkel
  { slug: "dunkel-anthrazit", label: "Anthrazit", family: "dunkel", hex: "#383B3E", promptFragment: "deep anthracite dark grey" },
  { slug: "dunkel-graphit", label: "Graphit", family: "dunkel", hex: "#2E2E2E", promptFragment: "graphite near-black" },
  { slug: "dunkel-schwarz-matt", label: "Schwarz matt", family: "dunkel", hex: "#111111", promptFragment: "matte deep black" },

  // Farbig
  { slug: "farbig-salbeigruen", label: "Salbeigruen", family: "farbig", hex: "#A4B29A", promptFragment: "muted sage green" },
  { slug: "farbig-dunkelgruen", label: "Dunkelgruen", family: "farbig", hex: "#3E5B47", promptFragment: "deep forest green" },
  { slug: "farbig-petrol", label: "Petrol", family: "farbig", hex: "#2D5B66", promptFragment: "deep petrol blue-green" },
  { slug: "farbig-marineblau", label: "Marineblau", family: "farbig", hex: "#1E2A4A", promptFragment: "navy marine blue" },
  { slug: "farbig-terrakotta", label: "Terrakotta", family: "warm", hex: "#B26547", promptFragment: "warm terracotta clay" },

  // Holz
  { slug: "holz-eiche-natur", label: "Eiche natur", family: "holz", hex: "#B28355", promptFragment: "natural oak wood with visible grain" },
  { slug: "holz-eiche-hell", label: "Eiche hell", family: "holz", hex: "#D6B583", promptFragment: "light oak wood, Scandinavian tone" },
  { slug: "holz-nussbaum", label: "Nussbaum", family: "holz", hex: "#5C3A21", promptFragment: "rich walnut wood with warm dark tones" },
  { slug: "holz-eiche-rustikal", label: "Eiche rustikal", family: "holz", hex: "#8B5A2B", promptFragment: "rustic oak with pronounced knots and texture" },
];

// ============================================================
// 4) WORKTOP_MATERIALS - Arbeitsplatten
// ============================================================
export interface WorktopChoice {
  slug: string;
  label: string;
  description: string;
  tier: WorktopTier;
  promptFragment: string;
}

export const WORKTOP_CHOICES: WorktopChoice[] = [
  {
    slug: "keramik",
    label: "Keramik (Sinterstein)",
    description: "Kratz- und hitzefest, Calacatta, Neolith, Dekton",
    tier: "premium",
    promptFragment:
      "premium ceramic sintered stone worktop in Calacatta marble look, ultra-thin slab, white with fine grey veining",
  },
  {
    slug: "quarzkomposit",
    label: "Quarzkomposit",
    description: "Silestone, Caesarstone - robust, pflegeleicht",
    tier: "premium",
    promptFragment: "quartz composite worktop with subtle stone pattern, smooth polished finish",
  },
  {
    slug: "granit",
    label: "Granit (Naturstein)",
    description: "Nero Assoluto, Star Galaxy - einzigartige Maserung",
    tier: "premium",
    promptFragment: "natural granite worktop with distinctive crystalline pattern",
  },
  {
    slug: "marmor",
    label: "Marmor",
    description: "Carrara, Calacatta - klassischer Luxus",
    tier: "premium",
    promptFragment:
      "Carrara marble worktop with characteristic grey veining on white background",
  },
  {
    slug: "massivholz",
    label: "Massivholz",
    description: "Eiche, Nussbaum - warm, natuerlich",
    tier: "mid",
    promptFragment: "solid oak wood worktop with visible grain and warm tone",
  },
  {
    slug: "schichtstoff",
    label: "Schichtstoff / HPL",
    description: "Guenstig, viele Dekore, pflegeleicht",
    tier: "basic",
    promptFragment: "laminate HPL worktop in clean neutral tone",
  },
  {
    slug: "beton",
    label: "Beton-Optik",
    description: "Industrial, matt, zeitgenoessisch",
    tier: "mid",
    promptFragment: "concrete-look worktop with industrial matte finish",
  },
  {
    slug: "edelstahl",
    label: "Edelstahl",
    description: "Profi-Kueche, hygienisch, hitzebestaendig",
    tier: "premium",
    promptFragment: "brushed stainless steel worktop, professional kitchen feel",
  },
];

// ============================================================
// 5) STORAGE_FEATURES - Ausstattung / Stauraum
// ============================================================
export interface StorageFeature {
  slug: string;
  label: string;
  description: string;
  promptFragment: string;
}

export const STORAGE_FEATURES: StorageFeature[] = [
  {
    slug: "deckenhoch",
    label: "Hochschraenke bis zur Decke",
    description: "Maximaler Stauraum, keine Staubkanten",
    promptFragment: "floor-to-ceiling tall cabinets, no gap to ceiling, maximum storage",
  },
  {
    slug: "insel-rueckseite-schraenke",
    label: "Schraenke an Insel-Rueckseite",
    description: "Zusaetzlicher Stauraum auf der abgewandten Seite",
    promptFragment: "kitchen island with additional cabinets on the back side",
  },
  {
    slug: "apothekerauszug",
    label: "Apothekerauszug / Hochauszug",
    description: "Schmaler voll ausziehbarer Hochschrank",
    promptFragment: "tall narrow pullout pharmacy cabinet",
  },
  {
    slug: "eckkarussell",
    label: "Eckkarussell / Eckschrank-Loesung",
    description: "Drehbares Karussell oder Le-Mans-Ausstattung",
    promptFragment: "corner cabinet with rotating carousel solution",
  },
  {
    slug: "sockelschublade",
    label: "Sockel-Schubladen",
    description: "Nutzen den Sockelraum unter Unterschraenken",
    promptFragment: "plinth drawers in the base of the cabinets",
  },
  {
    slug: "beleuchtung-unterboden",
    label: "Beleuchtung unter Haengeschraenken",
    description: "LED-Leisten beleuchten Arbeitsplatte",
    promptFragment: "integrated LED under-cabinet lighting illuminating the worktop",
  },
  {
    slug: "beleuchtung-innen",
    label: "Beleuchtung in Schraenken",
    description: "Sensor-LED beim Oeffnen",
    promptFragment: "sensor-activated LED lighting inside cabinets",
  },
  {
    slug: "beleuchtung-nischen",
    label: "Nischen-/Sockelbeleuchtung",
    description: "Indirekte Beleuchtung fuer Ambiente",
    promptFragment: "indirect ambient LED lighting in plinths and niches",
  },
  {
    slug: "kraeuterregal",
    label: "Kraeuter- / Gewuerzregal",
    description: "Integriertes schmales Regal",
    promptFragment: "integrated narrow herb and spice rack",
  },
  {
    slug: "glas-rueckwand",
    label: "Glas-Rueckwand / Spritzschutz",
    description: "Durchgehender Spritzschutz aus Glas",
    promptFragment: "continuous glass splashback behind the worktop",
  },
  {
    slug: "abfalltrennung",
    label: "Abfalltrennung integriert",
    description: "Auszug unter Spuele mit mehreren Behaeltern",
    promptFragment: "integrated waste separation pullout under the sink",
  },
  {
    slug: "steckdosen-arbeitsplatte",
    label: "Steckdosen in Arbeitsplatte",
    description: "Versenkbare oder integrierte Steckdosen",
    promptFragment: "built-in recessed power sockets in the worktop",
  },
];

// ============================================================
// 6) APPLIANCE_LAYOUTS - Geraete-Anordnungs-Presets
// ============================================================
export interface ApplianceLayout {
  slug: string;
  label: string;
  description: string;
  category: "backofen" | "kochfeld" | "kuehlschrank" | "geschirrspueler" | "extras";
  promptFragment: string;
}

export const APPLIANCE_LAYOUTS: ApplianceLayout[] = [
  // Backofen + Kaffee
  {
    slug: "backofen-hoch-kaffee-daneben",
    label: "Backofen hoch + Kaffeemaschine daneben",
    description: "Beide in Augenhoehe nebeneinander im Hochschrank",
    category: "backofen",
    promptFragment:
      "built-in oven and built-in coffee machine side-by-side in tall cabinet at eye level",
  },
  {
    slug: "backofen-hoch-mikro-daneben",
    label: "Backofen hoch + Mikrowelle",
    description: "Backofen mit Mikrowelle/Dampfgarer kombiniert in Augenhoehe",
    category: "backofen",
    promptFragment:
      "built-in oven stacked with microwave steam oven in tall cabinet at eye level",
  },
  {
    slug: "backofen-unter-kochfeld",
    label: "Backofen unter dem Kochfeld",
    description: "Klassisch, platzsparend",
    category: "backofen",
    promptFragment: "conventional oven installed under the cooktop",
  },

  // Kochfeld
  {
    slug: "kochfeld-induktion",
    label: "Induktionskochfeld",
    description: "Klassisch auf der Arbeitsplatte",
    category: "kochfeld",
    promptFragment: "induction cooktop flush-mounted in the worktop",
  },
  {
    slug: "kochfeld-muldenlueftung",
    label: "Induktion mit Muldenlueftung",
    description: "Dunstabzug nach unten, kein Hut darueber",
    category: "kochfeld",
    promptFragment:
      "induction cooktop with integrated downdraft extractor in the center, no overhead hood",
  },
  {
    slug: "kochfeld-gas",
    label: "Gas-Kochfeld",
    description: "Direkte Hitzeregelung",
    category: "kochfeld",
    promptFragment: "professional gas cooktop with cast-iron grates",
  },

  // Kuehlschrank
  {
    slug: "kuehl-hochintegriert",
    label: "Kuehlschrank hoch integriert (ohne Griffmulde)",
    description: "Komplett in der Kuechenfront verborgen",
    category: "kuehlschrank",
    promptFragment:
      "fully integrated tall fridge-freezer hidden behind matching cabinet front, no visible handle",
  },
  {
    slug: "kuehl-amerikanisch",
    label: "Side-by-Side Kuehlschrank",
    description: "Amerikanischer Look, freistehend",
    category: "kuehlschrank",
    promptFragment: "American side-by-side fridge freezer, freestanding",
  },
  {
    slug: "kuehl-griffmulde",
    label: "Kuehlschrank mit Griffmulde",
    description: "Integriert, aber mit sichtbarer Griffmulde",
    category: "kuehlschrank",
    promptFragment: "integrated fridge with visible recessed grip groove",
  },

  // Geschirrspueler
  {
    slug: "gs-vollintegriert",
    label: "Geschirrspueler vollintegriert",
    description: "Unsichtbar hinter Front",
    category: "geschirrspueler",
    promptFragment: "fully integrated dishwasher hidden behind cabinet front",
  },
  {
    slug: "gs-hoch",
    label: "Geschirrspueler in Arbeitshoehe",
    description: "Ergonomisch, rueckenschonend",
    category: "geschirrspueler",
    promptFragment: "dishwasher raised to countertop height for ergonomic loading",
  },

  // Extras
  {
    slug: "weinkuehler",
    label: "Weinkuehlschrank",
    description: "Separat integriert",
    category: "extras",
    promptFragment: "built-in wine refrigerator with glass door",
  },
  {
    slug: "armatur-ausziehbar",
    label: "Ausziehbare Armatur",
    description: "Mit Brause",
    category: "extras",
    promptFragment: "pull-out kitchen faucet with spray head",
  },
];

// ============================================================
// 7) APPLIANCE_SEGMENTS - Marken-Segment fuer Preisrange
// ============================================================
export interface ApplianceSegment {
  slug: Segment;
  label: string;
  description: string;
  exampleBrands: string;
}

export const APPLIANCE_SEGMENTS: ApplianceSegment[] = [
  {
    slug: "budget",
    label: "Einstieg",
    description: "Solide Grundausstattung, preisbewusst",
    exampleBrands: "z.B. Bauknecht, Beko, Privileg",
  },
  {
    slug: "mittel",
    label: "Mittelklasse",
    description: "Bewaehrte Markenqualitaet, breites Feature-Set",
    exampleBrands: "z.B. Bosch, Siemens, Neff, AEG",
  },
  {
    slug: "premium",
    label: "Premium",
    description: "Spitzenqualitaet, lange Lebensdauer, Top-Features",
    exampleBrands: "z.B. Miele, V-Zug, Liebherr",
  },
  {
    slug: "luxus",
    label: "Luxus",
    description: "Exklusivitaet, Top-of-the-line",
    exampleBrands: "z.B. Gaggenau, Sub-Zero, Wolf",
  },
];

// ============================================================
// 8) KITCHEN_FORMS - Form + Groesse fuer Funnel C
// ============================================================
export interface KitchenForm {
  slug: KitchenFormSlug;
  label: string;
  description: string;
  promptFragment: string;
  heroImage: string;
}

export const KITCHEN_FORMS: KitchenForm[] = [
  {
    slug: "zeile",
    label: "Kuechenzeile",
    description: "Gerade Front an einer Wand",
    promptFragment: "single-wall straight kitchen layout",
    heroImage: "/traumkueche/forms/zeile.webp",
  },
  {
    slug: "l",
    label: "L-Form",
    description: "Ueber Eck, zwei Wandseiten",
    promptFragment: "L-shaped kitchen layout with cabinets along two walls",
    heroImage: "/traumkueche/forms/l.webp",
  },
  {
    slug: "u",
    label: "U-Form",
    description: "Drei Seiten, maximaler Stauraum",
    promptFragment: "U-shaped kitchen layout along three walls",
    heroImage: "/traumkueche/forms/u.webp",
  },
  {
    slug: "parallel",
    label: "Zweizeilig",
    description: "Zwei parallele Fronten gegenueber",
    promptFragment: "galley kitchen with two parallel rows of cabinets",
    heroImage: "/traumkueche/forms/parallel.webp",
  },
  {
    slug: "g",
    label: "G-Form",
    description: "U-Form mit Halbinsel",
    promptFragment: "G-shaped kitchen with peninsula extension",
    heroImage: "/traumkueche/forms/g.webp",
  },
  {
    slug: "insel",
    label: "Mit Kochinsel",
    description: "Zentrale Insel im Raum",
    promptFragment: "large kitchen with central island including seating area",
    heroImage: "/traumkueche/forms/insel.webp",
  },
];

export const KITCHEN_SIZES = [
  { slug: "klein", label: "Bis 10 m²", description: "Kompakt, effizient" },
  { slug: "mittel", label: "10 - 20 m²", description: "Standard-Kueche" },
  { slug: "gross", label: "20 - 35 m²", description: "Wohnkueche, offen" },
  { slug: "xl", label: "Ueber 35 m²", description: "Grosszuegig, Loft" },
] as const;

// ============================================================
// Helper: Segment aus Stil + Marke ableiten
// ============================================================
export function resolveStyleSegment(styleSlug: string | undefined): Segment {
  const style = KITCHEN_STYLES.find((s) => s.slug === styleSlug);
  return style?.segment ?? "mittel";
}

export function resolveWorktopTier(worktopSlug: string | undefined): WorktopTier {
  const worktop = WORKTOP_CHOICES.find((w) => w.slug === worktopSlug);
  return worktop?.tier ?? "mid";
}
