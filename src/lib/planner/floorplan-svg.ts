/**
 * Schematischer 2D-Draufsicht-Renderer fuer die Traumkueche.
 *
 * Pure Funktion — aus `TraumkuecheData` (+ optionalen Grundriss-Daten)
 * erzeugen wir einen SVG-String mit massstabstreuer Darstellung der
 * Kuechenform, Arbeitsplatte und Geraete-Platzierung.
 *
 * Wichtig:
 *  - Kein DOM-Zugriff, rein String-basiert. Geeignet fuer Server-Render
 *    und fuer den Smoke-Test.
 *  - Masse aus Grundriss-Analyse (Meter) werden in SVG-Units skaliert.
 *    Fallback: Heuristik nach `kitchenSize`.
 *  - Styling bewusst flaechig, ohne Bilder — bleibt beim Skalieren klar.
 */

import type { TraumkuecheData } from "@/config/funnel-traumkueche";
import type { KitchenFormSlug } from "@/config/funnel-traumkueche-stammdaten";

export interface FloorplanSvgOptions {
  /** SVG-Breite in px */
  width?: number;
  /** SVG-Hoehe in px */
  height?: number;
  /** Nord-Wand-Laenge in Metern (optional) */
  lengthMeters?: number;
  /** Raum-Tiefe in Metern (optional) */
  depthMeters?: number;
  /** Accent-Farbe (brand) */
  accent?: string;
}

interface RoomDims {
  roomWidthM: number;
  roomDepthM: number;
  /** Worktop-Tiefe (meist 0.60m) */
  worktopDepth: number;
}

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 480;
const DEFAULT_ACCENT = "#0f766e";

const SIZE_FALLBACK: Record<NonNullable<TraumkuecheData["kitchenSize"]>, { w: number; d: number }> = {
  klein: { w: 3.0, d: 2.4 },
  mittel: { w: 4.2, d: 3.2 },
  gross: { w: 5.4, d: 4.0 },
  xl: { w: 6.8, d: 5.0 },
};

/**
 * Rendert die Draufsicht als SVG-String.
 */
export function renderFloorplanSvg(
  spec: TraumkuecheData,
  opts: FloorplanSvgOptions = {},
): string {
  const W = opts.width ?? DEFAULT_WIDTH;
  const H = opts.height ?? DEFAULT_HEIGHT;
  const accent = opts.accent ?? DEFAULT_ACCENT;

  const dims = pickDims(spec, opts);
  const form = spec.kitchenForm ?? "l";

  // Skalierung: Raum soll 85% der SVG-Flaeche einnehmen
  const margin = 40;
  const innerW = W - 2 * margin;
  const innerH = H - 2 * margin;
  const scale = Math.min(innerW / dims.roomWidthM, innerH / dims.roomDepthM);
  const roomW = dims.roomWidthM * scale;
  const roomH = dims.roomDepthM * scale;
  const x0 = (W - roomW) / 2;
  const y0 = (H - roomH) / 2;

  const worktopPx = dims.worktopDepth * scale;

  const parts: string[] = [];

  // Hintergrund (Raum)
  parts.push(
    rect(x0, y0, roomW, roomH, {
      fill: "#F8F7F4",
      stroke: "#1F1F1F",
      strokeWidth: 2,
    }),
  );

  // Kuechenform zeichnen
  parts.push(...drawKitchenForm(form, { x0, y0, roomW, roomH, worktopPx, accent }));

  // Geraete-Icons (vereinfacht als Beschriftung + Kreis)
  parts.push(
    ...drawAppliances(spec.applianceLayouts ?? [], {
      x0,
      y0,
      roomW,
      roomH,
      worktopPx,
      form,
    }),
  );

  // Massstabs-Label
  parts.push(
    text(x0, y0 - 10, `${dims.roomWidthM.toFixed(1)} m`, {
      fill: "#666",
      fontSize: 11,
    }),
  );
  parts.push(
    text(x0 + roomW + 6, y0 + roomH / 2, `${dims.roomDepthM.toFixed(1)} m`, {
      fill: "#666",
      fontSize: 11,
      transform: `rotate(90 ${x0 + roomW + 6} ${y0 + roomH / 2})`,
    }),
  );

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Draufsicht Kuechenlayout">`,
    `<title>Draufsicht - ${labelForForm(form)} (${dims.roomWidthM.toFixed(1)}m x ${dims.roomDepthM.toFixed(1)}m)</title>`,
    ...parts,
    `</svg>`,
  ].join("");
}

// ============================================================
// Shapes
// ============================================================

interface DrawContext {
  x0: number;
  y0: number;
  roomW: number;
  roomH: number;
  worktopPx: number;
  accent?: string;
  form?: KitchenFormSlug;
}

function drawKitchenForm(form: KitchenFormSlug, ctx: DrawContext): string[] {
  const { x0, y0, roomW, roomH, worktopPx, accent = DEFAULT_ACCENT } = ctx;
  const style = { fill: accent, opacity: 0.85, stroke: "#1F1F1F", strokeWidth: 1 };
  const out: string[] = [];

  switch (form) {
    case "zeile":
      // Eine Wand oben
      out.push(rect(x0, y0, roomW, worktopPx, style));
      break;

    case "parallel":
      // Oben + Unten
      out.push(rect(x0, y0, roomW, worktopPx, style));
      out.push(rect(x0, y0 + roomH - worktopPx, roomW, worktopPx, style));
      break;

    case "l": {
      const longLen = roomW;
      const shortLen = Math.min(roomH * 0.7, roomW * 0.55);
      // Oben
      out.push(rect(x0, y0, longLen, worktopPx, style));
      // Linke Wand runter
      out.push(rect(x0, y0, worktopPx, shortLen, style));
      break;
    }
    case "u": {
      // Oben + beide Seiten
      out.push(rect(x0, y0, roomW, worktopPx, style));
      out.push(rect(x0, y0, worktopPx, roomH * 0.75, style));
      out.push(rect(x0 + roomW - worktopPx, y0, worktopPx, roomH * 0.75, style));
      break;
    }
    case "g": {
      // U + kurze Insel-Verlaengerung rechts unten
      out.push(rect(x0, y0, roomW, worktopPx, style));
      out.push(rect(x0, y0, worktopPx, roomH * 0.8, style));
      out.push(rect(x0 + roomW - worktopPx, y0, worktopPx, roomH * 0.6, style));
      const gX = x0 + roomW - worktopPx * 3.2;
      const gY = y0 + roomH * 0.6 - worktopPx;
      out.push(rect(gX, gY, worktopPx * 2.2, worktopPx, style));
      break;
    }
    case "insel": {
      // L-Form + Insel in der Mitte
      out.push(rect(x0, y0, roomW, worktopPx, style));
      out.push(rect(x0, y0, worktopPx, roomH * 0.65, style));
      // Insel
      const iw = roomW * 0.45;
      const id = worktopPx * 1.4;
      const ix = x0 + (roomW - iw) / 2 + worktopPx * 0.5;
      const iy = y0 + roomH - id - roomH * 0.15;
      out.push(
        rect(ix, iy, iw, id, {
          fill: accent,
          opacity: 0.95,
          stroke: "#1F1F1F",
          strokeWidth: 1.5,
        }),
      );
      out.push(text(ix + iw / 2, iy + id / 2 + 4, "Insel", { fill: "white", fontSize: 12, textAnchor: "middle" }));
      break;
    }
  }

  return out;
}

function drawAppliances(
  layouts: string[],
  ctx: DrawContext,
): string[] {
  const out: string[] = [];
  if (layouts.length === 0) return out;

  const { x0, y0, roomW, worktopPx, form } = ctx;

  // Wir platzieren Geraete-Marker entlang der "Oben"-Wand (einzige, die in
  // allen Formen existiert). Pro Preset ein Marker mit Kuerzel.
  const iconY = y0 + worktopPx / 2;
  const iconsPerRow = Math.min(layouts.length, 4);
  const gap = roomW / (iconsPerRow + 1);

  layouts.slice(0, 4).forEach((slug, idx) => {
    const cx = x0 + gap * (idx + 1);
    out.push(circle(cx, iconY, 14, { fill: "white", stroke: "#1F1F1F", strokeWidth: 1.5 }));
    out.push(
      text(cx, iconY + 4, abbreviateLayout(slug), {
        fontSize: 9,
        textAnchor: "middle",
        fill: "#1F1F1F",
      }),
    );
  });

  // Form-Hinweis
  if (form) {
    out.push(
      text(x0 + 6, y0 + worktopPx + 14, labelForForm(form), {
        fontSize: 11,
        fill: "white",
        fontWeight: 600,
      }),
    );
  }

  return out;
}

// ============================================================
// Helpers
// ============================================================

function pickDims(spec: TraumkuecheData, opts: FloorplanSvgOptions): RoomDims {
  const fromAnalysis = spec.floorplan?.analysis;
  const length =
    opts.lengthMeters ??
    (fromAnalysis?.approxLengthMeters && fromAnalysis.approxLengthMeters > 0
      ? fromAnalysis.approxLengthMeters
      : undefined);
  const depth =
    opts.depthMeters ??
    (fromAnalysis?.approxDepthMeters && fromAnalysis.approxDepthMeters > 0
      ? fromAnalysis.approxDepthMeters
      : undefined);

  const fallback = SIZE_FALLBACK[spec.kitchenSize ?? "mittel"];

  return {
    roomWidthM: length ?? fallback.w,
    roomDepthM: depth ?? fallback.d,
    worktopDepth: 0.6,
  };
}

function labelForForm(slug: KitchenFormSlug): string {
  switch (slug) {
    case "zeile":
      return "Kuechenzeile";
    case "l":
      return "L-Form";
    case "u":
      return "U-Form";
    case "parallel":
      return "Parallel";
    case "g":
      return "G-Form";
    case "insel":
      return "Mit Insel";
    default:
      return slug;
  }
}

function abbreviateLayout(slug: string): string {
  if (slug.includes("backofen") && slug.includes("kaffee")) return "BO+KA";
  if (slug.includes("backofen")) return "BO";
  if (slug.includes("induktion")) return "IND";
  if (slug.includes("kuehlschrank")) return "KS";
  if (slug.includes("geschirrspueler")) return "GS";
  if (slug.includes("mikrowelle")) return "MW";
  return slug.slice(0, 3).toUpperCase();
}

interface RectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

function rect(x: number, y: number, w: number, h: number, s: RectStyle = {}): string {
  const attrs = [
    `x="${x.toFixed(1)}"`,
    `y="${y.toFixed(1)}"`,
    `width="${w.toFixed(1)}"`,
    `height="${h.toFixed(1)}"`,
    s.fill && `fill="${s.fill}"`,
    s.stroke && `stroke="${s.stroke}"`,
    s.strokeWidth && `stroke-width="${s.strokeWidth}"`,
    typeof s.opacity === "number" && `opacity="${s.opacity}"`,
  ].filter(Boolean);
  return `<rect ${attrs.join(" ")} />`;
}

function circle(cx: number, cy: number, r: number, s: RectStyle = {}): string {
  const attrs = [
    `cx="${cx.toFixed(1)}"`,
    `cy="${cy.toFixed(1)}"`,
    `r="${r}"`,
    s.fill && `fill="${s.fill}"`,
    s.stroke && `stroke="${s.stroke}"`,
    s.strokeWidth && `stroke-width="${s.strokeWidth}"`,
  ].filter(Boolean);
  return `<circle ${attrs.join(" ")} />`;
}

interface TextStyle {
  fontSize?: number;
  fill?: string;
  fontWeight?: number | string;
  textAnchor?: "start" | "middle" | "end";
  transform?: string;
}

function text(x: number, y: number, content: string, s: TextStyle = {}): string {
  const attrs = [
    `x="${x.toFixed(1)}"`,
    `y="${y.toFixed(1)}"`,
    s.fontSize && `font-size="${s.fontSize}"`,
    s.fill && `fill="${s.fill}"`,
    s.fontWeight && `font-weight="${s.fontWeight}"`,
    s.textAnchor && `text-anchor="${s.textAnchor}"`,
    s.transform && `transform="${s.transform}"`,
    `font-family="system-ui, sans-serif"`,
  ].filter(Boolean);
  return `<text ${attrs.join(" ")}>${escapeXml(content)}</text>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
