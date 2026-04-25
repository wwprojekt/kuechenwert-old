/**
 * Prompt-Builder fuer Traumkueche-Render.
 *
 * Baut aus der TraumkuecheData einen kohaerenten FLUX-Prompt.
 * Grundsatz: keine Markennamen (Trademark-Risiko), kein geschuetztes
 * Design, sondern generische beschreibende Sprache.
 */

import {
  FRONT_COLORS,
  KITCHEN_FORMS,
  KITCHEN_STYLES,
  STORAGE_FEATURES,
  APPLIANCE_LAYOUTS,
  SURFACE_FINISHES,
  WORKTOP_CHOICES,
  APPLIANCE_SEGMENTS,
} from "@/config/funnel-traumkueche-stammdaten";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";

// Feste Photo-Pra/Post-Fixes fuer konsistenten Look ueber alle Prompts
const BASE_SUFFIX = [
  "professional interior photography",
  "architectural digest style",
  "natural daylight from large windows",
  "ultra-detailed",
  "8k resolution",
  "photorealistic",
  "wide-angle perspective",
  "beautifully staged",
].join(", ");

const NEGATIVE_PROMPT = [
  "cartoon",
  "illustration",
  "3d render",
  "cgi",
  "low quality",
  "blurry",
  "distorted perspective",
  "extra fingers",
  "floating objects",
  "warped geometry",
  "watermark",
  "text",
  "logos",
  "brand names",
].join(", ");

export interface BuiltPrompt {
  prompt: string;
  negativePrompt: string;
}

export function buildKitchenPrompt(data: TraumkuecheData): BuiltPrompt {
  const parts: string[] = [];

  // 1) Grundtyp: Form + Groesse
  const form = KITCHEN_FORMS.find((f) => f.slug === data.kitchenForm);
  if (form) parts.push(form.promptFragment);

  const size = data.kitchenSize;
  if (size === "klein") parts.push("compact kitchen space, efficient layout");
  else if (size === "gross") parts.push("spacious open-plan kitchen");
  else if (size === "xl") parts.push("very large loft kitchen with expansive layout");

  // 2) Stil
  const style = KITCHEN_STYLES.find((s) => s.slug === data.styleSlug);
  if (style) parts.push(style.promptFragment);

  // 3) Oberflaeche
  const finish = SURFACE_FINISHES.find((s) => s.slug === data.surfaceFinishSlug);
  if (finish) parts.push(finish.promptFragment);

  // 4) Farbe
  const color = FRONT_COLORS.find((c) => c.slug === data.frontColorSlug);
  if (color) parts.push(`cabinet fronts in ${color.promptFragment} color`);

  // 5) Arbeitsplatte
  const worktop = WORKTOP_CHOICES.find((w) => w.slug === data.worktopSlug);
  if (worktop) parts.push(worktop.promptFragment);

  // 6) Stauraum + Beleuchtung (Mehrfachauswahl)
  const selectedStorage = STORAGE_FEATURES.filter((s) =>
    data.storageFeatures.includes(s.slug),
  );
  if (selectedStorage.length > 0) {
    parts.push(selectedStorage.map((s) => s.promptFragment).join(", "));
  }

  // 7) Geraete-Layouts
  const selectedAppliances = APPLIANCE_LAYOUTS.filter((a) =>
    data.applianceLayouts.includes(a.slug),
  );
  if (selectedAppliances.length > 0) {
    parts.push(selectedAppliances.map((a) => a.promptFragment).join(", "));
  } else {
    // Default, damit keine "leere" Kueche generiert wird
    parts.push(
      "built-in oven at eye level, induction cooktop, integrated dishwasher, modern refrigerator",
    );
  }

  // 8) Geraete-Stufe - subtil zum Look beitragen
  const segment = APPLIANCE_SEGMENTS.find((s) => s.slug === data.applianceSegment);
  if (segment) {
    if (segment.slug === "luxus") {
      parts.push("high-end luxury appliances with professional-grade aesthetic");
    } else if (segment.slug === "premium") {
      parts.push("premium-quality integrated appliances");
    } else if (segment.slug === "budget") {
      parts.push("clean standard appliances, straightforward design");
    }
  }

  // 9) Styling-Suffix (immer)
  parts.push(BASE_SUFFIX);

  const prompt = parts.filter(Boolean).join(", ");

  return {
    prompt,
    negativePrompt: NEGATIVE_PROMPT,
  };
}

/**
 * Kompakter Textblock fuer die Ergebnisseite (Spec-Pills).
 * Zeigt dem User auf Deutsch, was er ausgewaehlt hat.
 */
export interface SpecSummary {
  label: string;
  value: string;
}

export function summarizeSpec(data: TraumkuecheData): SpecSummary[] {
  const summary: SpecSummary[] = [];

  const style = KITCHEN_STYLES.find((s) => s.slug === data.styleSlug);
  if (style) summary.push({ label: "Stil", value: style.label });

  const finish = SURFACE_FINISHES.find((s) => s.slug === data.surfaceFinishSlug);
  if (finish) summary.push({ label: "Oberflaeche", value: finish.label });

  const color = FRONT_COLORS.find((c) => c.slug === data.frontColorSlug);
  if (color) summary.push({ label: "Farbe", value: color.label });

  const worktop = WORKTOP_CHOICES.find((w) => w.slug === data.worktopSlug);
  if (worktop) summary.push({ label: "Arbeitsplatte", value: worktop.label });

  const form = KITCHEN_FORMS.find((f) => f.slug === data.kitchenForm);
  if (form) summary.push({ label: "Kuechenform", value: form.label });

  if (data.kitchenSize) {
    const sizeLabels: Record<string, string> = {
      klein: "bis 10 m²",
      mittel: "10-20 m²",
      gross: "20-35 m²",
      xl: "ueber 35 m²",
    };
    summary.push({ label: "Groesse", value: sizeLabels[data.kitchenSize] ?? data.kitchenSize });
  }

  const segment = APPLIANCE_SEGMENTS.find((s) => s.slug === data.applianceSegment);
  if (segment) summary.push({ label: "Geraete-Stufe", value: segment.label });

  if (data.storageFeatures.length > 0) {
    const labels = STORAGE_FEATURES
      .filter((s) => data.storageFeatures.includes(s.slug))
      .map((s) => s.label);
    summary.push({ label: "Ausstattung", value: labels.join(", ") });
  }

  if (data.applianceLayouts.length > 0) {
    const labels = APPLIANCE_LAYOUTS
      .filter((a) => data.applianceLayouts.includes(a.slug))
      .map((a) => a.label);
    summary.push({ label: "Geraete", value: labels.join(", ") });
  }

  return summary;
}
