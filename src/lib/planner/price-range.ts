/**
 * Price-Range + Experten-Note fuer die Traumkueche-Ergebnisseite.
 *
 * Zieht die passende Range aus kitchen_price_brackets und generiert
 * eine regelbasierte deutsche Einschaetzung ("Ihre Auswahl kombiniert...").
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  APPLIANCE_SEGMENTS,
  KITCHEN_FORMS,
  KITCHEN_STYLES,
  resolveStyleSegment,
  resolveWorktopTier,
  WORKTOP_CHOICES,
  type Segment,
} from "@/config/funnel-traumkueche-stammdaten";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

export interface PriceRange {
  minCents: number;
  maxCents: number;
  midCents: number;
  formatted: string; // "18.000 - 27.000 EUR"
}

export interface PriceResult {
  range: PriceRange;
  expertNote: string;
  segments: {
    style: Segment;
    appliance: Segment;
    worktopTier: string;
    kitchenForm: string;
  };
}

const CONSERVATIVE_FALLBACK: PriceRange = {
  minCents: 1_200_000,
  maxCents: 2_500_000,
  midCents: 1_850_000,
  formatted: "12.000 - 25.000 EUR",
};

export async function calculatePriceRange(data: TraumkuecheData): Promise<PriceResult> {
  const styleSegment: Segment = resolveStyleSegment(data.styleSlug);
  const applianceSegment: Segment = data.applianceSegment ?? "mittel";
  const worktopTier = resolveWorktopTier(data.worktopSlug);
  const kitchenForm = data.kitchenForm ?? "l";

  let range = CONSERVATIVE_FALLBACK;

  try {
    const { data: rows } = await supabaseAdmin
      .from("kitchen_price_brackets")
      .select("price_min_cents, price_max_cents")
      .eq("style_segment", styleSegment)
      .eq("appliance_segment", applianceSegment)
      .eq("worktop_tier", worktopTier)
      .eq("kitchen_form", kitchenForm)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (rows && typeof rows.price_min_cents === "number" && typeof rows.price_max_cents === "number") {
      range = {
        minCents: rows.price_min_cents,
        maxCents: rows.price_max_cents,
        midCents: Math.round((rows.price_min_cents + rows.price_max_cents) / 2),
        formatted: formatRange(rows.price_min_cents, rows.price_max_cents),
      };
    }
  } catch (e) {
    console.warn("[planner/price-range] Lookup failed, using fallback:", e);
  }

  const expertNote = buildExpertNote(data, styleSegment, applianceSegment, worktopTier);

  return {
    range,
    expertNote,
    segments: {
      style: styleSegment,
      appliance: applianceSegment,
      worktopTier,
      kitchenForm,
    },
  };
}

function formatRange(minCents: number, maxCents: number): string {
  const min = Math.round(minCents / 100);
  const max = Math.round(maxCents / 100);
  const fmt = (n: number) => new Intl.NumberFormat("de-DE").format(n);
  return `${fmt(min)} - ${fmt(max)} EUR`;
}

function buildExpertNote(
  data: TraumkuecheData,
  styleSegment: Segment,
  applianceSegment: Segment,
  worktopTier: string,
): string {
  const parts: string[] = [];

  // Opening: Stil-Charakteristik
  const style = KITCHEN_STYLES.find((s) => s.slug === data.styleSlug);
  if (style) {
    parts.push(
      `Ihre Wahl „${style.label}“ deutet auf ${styleSegmentAdjective(styleSegment)} Küche hin.`,
    );
  }

  // Geraete-Einschaetzung
  const segment = APPLIANCE_SEGMENTS.find((s) => s.slug === applianceSegment);
  if (segment) {
    parts.push(
      `Bei den Geräten haben Sie ${segment.label.toLowerCase()} gewählt (${segment.exampleBrands}).`,
    );
  }

  // Worktop-Einschaetzung
  const worktop = WORKTOP_CHOICES.find((w) => w.slug === data.worktopSlug);
  if (worktop) {
    const tierLabel =
      worktopTier === "premium"
        ? "hochwertige"
        : worktopTier === "mid"
          ? "gehobene"
          : "praktische";
    parts.push(
      `Als Arbeitsplatte eine ${tierLabel} Wahl (${worktop.label}) – ${worktopRationale(worktopTier)}.`,
    );
  }

  // Stimmigkeits-Hinweis
  if (styleSegment === "luxus" && applianceSegment === "budget") {
    parts.push(
      "Hinweis: Der luxuriöse Stil passt nicht ganz zu Einstiegs-Geräten – ein Experte kann hier gezielt nachjustieren.",
    );
  } else if (styleSegment === "budget" && applianceSegment === "luxus") {
    parts.push(
      "Hinweis: Luxus-Geräte in einem preiswerten Stil – ein Übergang zu Mittelklasse-Marken könnte das Verhältnis ausbalancieren.",
    );
  } else if (isConsistent(styleSegment, applianceSegment)) {
    parts.push("Die Kombination ist in sich stimmig.");
  }

  // Form / Groesse
  const form = KITCHEN_FORMS.find((f) => f.slug === data.kitchenForm);
  if (form) {
    parts.push(`Für eine ${form.label} in Ihrer Größe ist die genannte Range realistisch.`);
  }

  // Abschluss
  parts.push(
    "Die genaue Zahl hängt von Ausstattungs-Details (Auszüge, Beschläge, Elektronik) ab. Unser Experte ruft Sie zurück und schneidet das Angebot passgenau zu.",
  );

  return parts.join(" ");
}

function styleSegmentAdjective(s: Segment): string {
  switch (s) {
    case "budget":
      return "eine preisbewusste";
    case "mittel":
      return "eine solide mittelpreisige";
    case "premium":
      return "eine hochwertige";
    case "luxus":
      return "eine Luxus-";
  }
}

function worktopRationale(tier: string): string {
  switch (tier) {
    case "premium":
      return "extrem langlebig und prägt den Gesamt-Look";
    case "mid":
      return "ein guter Kompromiss aus Optik und Preis";
    default:
      return "praktisch und pflegeleicht, spart Budget für andere Upgrades";
  }
}

function isConsistent(style: Segment, appliance: Segment): boolean {
  const order: Segment[] = ["budget", "mittel", "premium", "luxus"];
  const diff = Math.abs(order.indexOf(style) - order.indexOf(appliance));
  return diff <= 1;
}
