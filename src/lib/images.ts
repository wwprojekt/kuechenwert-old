/**
 * Zentrale Bild-URLs (Unsplash, alle CC0 / Unsplash-License = kommerziell nutzbar).
 * Optimiert via Unsplash-Image-CDN-Parameter (w=, q=, fm=webp).
 */

const u = (id: string, w = 1200, q = 75) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const KITCHEN_IMAGES = {
  // Hero: moderne, helle Küche mit Insel + Holz-Akzent
  hero: u("1556909114-f6e7ad7d3136", 1400, 80),
  heroMobile: u("1556909114-f6e7ad7d3136", 720, 75),

  // 6 Küchen-Stile für Auktions-Thumbnails (diverse Optik)
  modern: u("1556909212-d5b604d0c90d", 800),
  classic: u("1565538810643-b5bdb714032a", 800),
  lshape: u("1600585154340-be6161a56a0c", 800),
  island: u("1600566753190-17f0baa2a6c8", 800),
  black: u("1556911220-bff31c812dba", 800),
  scandi: u("1560448204-e02f11c3d0e2", 800),

  // CTA-Bottom-Background
  ctaBackground: u("1556909114-f6e7ad7d3136", 1600, 70),
};

/** Hero-Avatar-Foto (Pravatar = Unsplash-User-Pool, stabile Test-Avatars) */
export const AVATARS = {
  martin: "https://i.pravatar.cc/120?img=12",
  julia: "https://i.pravatar.cc/120?img=47",
  thomas: "https://i.pravatar.cc/120?img=33",
  anna: "https://i.pravatar.cc/120?img=44",
};

/** Funnel: Küchen-Formen (Wahl-Karten) */
export const FUNNEL_KITCHEN_FORMS = {
  zeile: u("1600489000022-c2086d79f9d4", 600),      // gerade Küchenzeile
  "l-form": u("1600585154340-be6161a56a0c", 600),    // L-Form Küche
  "u-form": u("1556909114-f6e7ad7d3136", 600),      // U-Form
  zweizeilig: u("1565538810643-b5bdb714032a", 600),  // zweizeilig
  kochinsel: u("1556911220-bff31c812dba", 600),     // Insel modern
  unsicher: u("1560448204-e02f11c3d0e2", 600),      // generisch / Skandi
};

/** Funnel: Küchen-Stile (Wahl-Karten) */
export const FUNNEL_KITCHEN_STYLES = {
  modern: u("1556911220-bff31c812dba", 600),       // dunkle moderne Küche
  landhaus: u("1565538810643-b5bdb714032a", 600),  // weiß-warm
  klassisch: u("1600585154340-be6161a56a0c", 600), // hellgrau klassisch
  minimalistisch: u("1556909212-d5b604d0c90d", 600), // weiß minimal
  industrial: u("1600566753190-17f0baa2a6c8", 600),  // industrial / dunkel
  individuell: u("1560448204-e02f11c3d0e2", 600),    // skandinavisch offen
};

/**
 * Funnel A: Arbeitsplatten-Material-Kategorien
 * (6 Quiz-Karten anstelle der DB-Liste — pragmatisch, unverbindlich,
 * Händler klärt das Detail später per Telefon).
 *
 * Bilder sind bewusst küchennahe Referenzfotos mit passender Material-/
 * Farbanmutung, keine exakten Material-Closeups (die liefern wir später aus).
 */
export const FUNNEL_WORKTOP_CATEGORIES = {
  holz: u("1600585154340-be6161a56a0c", 600),      // warme Hell/Holz-Anmutung
  naturstein: u("1556911220-bff31c812dba", 600),    // dunkel, steinartig
  quarz: u("1556909212-d5b604d0c90d", 600),         // hell, modern
  keramik: u("1600566753190-17f0baa2a6c8", 600),    // matt-modern
  schichtstoff: u("1565538810643-b5bdb714032a", 600), // pragmatisch hell
  unsicher: u("1560448204-e02f11c3d0e2", 600),      // generisch
};

/** Mapping Küchenform → Thumbnail */
export function imageForKitchenForm(form: string | null): string {
  switch ((form ?? "").toLowerCase()) {
    case "l":
    case "l-form":
    case "l-küche":
      return KITCHEN_IMAGES.lshape;
    case "u":
    case "u-form":
    case "u-küche":
      return KITCHEN_IMAGES.classic;
    case "insel":
    case "kochinsel":
    case "kitchen-island":
      return KITCHEN_IMAGES.island;
    case "küchenzeile":
    case "zeile":
      return KITCHEN_IMAGES.modern;
    default:
      return KITCHEN_IMAGES.modern;
  }
}
