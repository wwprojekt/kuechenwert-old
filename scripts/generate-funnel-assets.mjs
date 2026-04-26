#!/usr/bin/env node
/**
 * Generator fuer alle Traumkueche-Funnel-Bilder (Stil-, Form-, Hero-Beispiele).
 *
 * Laeuft gegen Fal.ai (FLUX 1.1 pro ultra) und konvertiert die JPEG-Outputs
 * via sharp zu WebP. Idempotent: existierende Dateien werden uebersprungen.
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/generate-funnel-assets.mjs
 *   node --env-file=.env.local scripts/generate-funnel-assets.mjs --only=styles
 *   node --env-file=.env.local scripts/generate-funnel-assets.mjs --force
 *
 * Voraussetzung:
 *   FAL_KEY muss in .env.local gesetzt sein.
 *
 * Kosten: 18 Bilder x ~0.06 USD = ~1.10 USD bei flux-pro/v1.1-ultra.
 */

import { fal } from "@fal-ai/client";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const MODEL = "fal-ai/flux-pro/v1.1-ultra";
const WEBP_QUALITY = 85;

// CLI-Flags
const args = process.argv.slice(2);
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];
const FORCE = args.includes("--force");

const FAL_KEY = process.env.FAL_KEY?.trim();
if (!FAL_KEY) {
  console.error(
    "[generate-funnel-assets] FAL_KEY fehlt. Ruf das Script mit --env-file=.env.local auf.",
  );
  process.exit(1);
}
fal.config({ credentials: FAL_KEY });

// ------------------------------------------------------------------
// Prompt-Targets
// ------------------------------------------------------------------

const COMMON_NEG =
  "no text, no watermark, no logo, no brand name, no people visible, no distorted geometry";

const COMMON_QUALITY =
  "photorealistic, magazine-quality architectural interior photography, natural daylight through large window, shallow depth of field, soft bokeh, editorial style, shot on Hasselblad, crisp details";

/**
 * @typedef {{ category: 'styles'|'forms'|'examples', outputPath: string, aspectRatio: string, prompt: string }} Target
 */

/** @type {Target[]} */
const TARGETS = [
  // ==================================================================
  // STILE  -  6x Portrait 4:5 lifestyle-photography
  // ==================================================================
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/modern-grifflos.webp",
    aspectRatio: "4:5",
    prompt: `Ultra-modern handleless kitchen in deep anthracite matte lacquer, completely flush cabinet fronts with push-to-open mechanism, seamless waterfall quartz countertop in pure white, integrated appliances, minimalist architecture, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/modern-griff.webp",
    aspectRatio: "4:5",
    prompt: `Modern contemporary kitchen with slim stainless steel bar handles on flat-slab cabinet fronts in soft warm taupe, medium-tone oak veneer accents, matte black induction cooktop, timeless understated design, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/landhaus.webp",
    aspectRatio: "4:5",
    prompt: `Warm country-style farmhouse kitchen, shaker-style cabinet fronts in cream white with visible frames and antique brass knobs, solid wood butcher-block countertop, vintage apron-front ceramic sink, exposed wooden ceiling beams, cozy hygge mood, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/skandinavisch.webp",
    aspectRatio: "4:5",
    prompt: `Scandinavian nordic kitchen, light birch wood cabinets with simple integrated grip rails, airy whites, pale grey marble countertop, matte black minimal faucet, single potted plant, natural linen textiles, bright airy atmosphere, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/industrial.webp",
    aspectRatio: "4:5",
    prompt: `Industrial loft kitchen with exposed black steel frame cabinets, rough raw concrete countertop, open iron shelving with copper pots, factory-style black pendant lights, exposed brick accent wall, Edison bulb ambient lighting, urban warehouse feel, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "styles",
    outputPath: "public/traumkueche/styles/luxus-klassisch.webp",
    aspectRatio: "4:5",
    prompt: `Luxury classical kitchen with high-end walnut wood-veneer cabinets, Calacatta marble countertop with dramatic veining, polished brass hardware, coffered ceiling, wine cellar glimpse in background, sophisticated mansion-grade craftsmanship, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },

  // ==================================================================
  // FORMEN  -  6x Quadratisch 1:1, isometrische Aufsicht, klare Geometrie
  // ==================================================================
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/zeile.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of a single-wall straight kitchen layout, cabinets in a clean line against one wall, light warm oak and off-white finishes, minimalist architectural rendering style, cutaway showing the layout shape clearly, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/l.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of an L-shaped kitchen layout, cabinets running along two adjacent walls forming a clear L-shape, light warm oak and off-white finishes, minimalist architectural rendering style, the L-shape clearly visible, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/u.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of a U-shaped kitchen layout, cabinets running along three walls forming a clear U-shape with an open end, light warm oak and off-white finishes, minimalist architectural rendering style, the U-shape clearly visible, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/parallel.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of a galley kitchen layout with two parallel rows of cabinets facing each other across a central aisle, light warm oak and off-white finishes, minimalist architectural rendering style, the two parallel rows clearly visible, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/g.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of a G-shaped kitchen layout, cabinets along three walls plus an additional peninsula extension forming a G-shape, light warm oak and off-white finishes, minimalist architectural rendering style, the G-shape with peninsula clearly visible, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },
  {
    category: "forms",
    outputPath: "public/traumkueche/forms/insel.webp",
    aspectRatio: "1:1",
    prompt: `Architectural isometric top-down cutaway view of a kitchen with central cooking island, cabinets along back wall and a large free-standing island in the middle with bar seating, light warm oak and off-white finishes, minimalist architectural rendering style, the central island clearly visible, soft studio lighting, no people, clean background, ${COMMON_NEG}`,
  },

  // ==================================================================
  // HERO-BEISPIELE  -  6x Portrait 4:5 Mix aus allen Stilen
  // ==================================================================
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-1.webp",
    aspectRatio: "4:5",
    prompt: `Ultra-modern handleless kitchen in deep anthracite matte lacquer, white quartz waterfall island with integrated seating, warm pendant lights above island, integrated appliances, evening ambiance, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-2.webp",
    aspectRatio: "4:5",
    prompt: `Classic country-style kitchen with cream shaker cabinets, brass knobs, wooden butcher-block island, apron-front ceramic sink, exposed wooden ceiling beams, bunch of fresh herbs on the counter, warm morning light, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-3.webp",
    aspectRatio: "4:5",
    prompt: `Industrial loft kitchen with exposed black steel cabinet frames, warm medium oak wood accents on the upper cabinets, concrete countertop, open shelving with copper cookware, Edison bulb pendants, exposed brick wall, evening golden hour light, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-4.webp",
    aspectRatio: "4:5",
    prompt: `Scandinavian kitchen with light birch wood cabinets, large central white quartz island with wooden bar stools, pale grey marble backsplash, matte black tap, hanging green trailing plant, abundant bright daylight, hygge atmosphere, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-5.webp",
    aspectRatio: "4:5",
    prompt: `Luxury classical kitchen with rich walnut wood-veneer cabinets, dramatic Calacatta marble island and backsplash, polished brass hardware and tap, crystal pendant chandelier, coffered ceiling, wine cellar glimpse through glass door, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
  {
    category: "examples",
    outputPath: "public/traumkueche/examples/hero-6.webp",
    aspectRatio: "4:5",
    prompt: `Modern contemporary kitchen with soft sage-green matte cabinet fronts, slim brushed brass bar handles, warm oak veneer shelving, cream quartz countertop, single Monstera plant, calm morning light, biophilic design, ${COMMON_QUALITY}, ${COMMON_NEG}`,
  },
];

// ------------------------------------------------------------------
// Generate-Loop
// ------------------------------------------------------------------

async function generateOne(/** @type {Target} */ target) {
  const absPath = path.resolve(ROOT, target.outputPath);

  // Idempotenz
  if (!FORCE) {
    try {
      const stat = await fs.stat(absPath);
      if (stat.size > 5_000) {
        console.log(`[skip]   ${target.outputPath} (existiert, ${stat.size} bytes)`);
        return { status: "skipped" };
      }
    } catch {
      // nicht vorhanden - generieren
    }
  }

  console.log(`[gen]    ${target.outputPath} (${target.aspectRatio})`);
  const startedAt = Date.now();

  let result;
  try {
    result = await fal.subscribe(MODEL, {
      input: {
        prompt: target.prompt,
        aspect_ratio: target.aspectRatio,
        num_images: 1,
        output_format: "jpeg",
        safety_tolerance: "4",
        raw: false,
      },
      logs: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[fail]   ${target.outputPath} -> fal error: ${msg}`);
    return { status: "failed", error: msg };
  }

  const data = /** @type {any} */ (result)?.data ?? {};
  const url = data?.images?.[0]?.url;
  if (!url) {
    console.error(`[fail]   ${target.outputPath} -> keine Bild-URL in Fal-Response`);
    return { status: "failed", error: "no-url" };
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[fail]   ${target.outputPath} -> download HTTP ${res.status}`);
    return { status: "failed", error: `http-${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());

  const webp = await sharp(buf)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, webp);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[ok]     ${target.outputPath} (${webp.length} bytes, ${elapsed}s)`,
  );
  return { status: "ok", bytes: webp.length };
}

async function main() {
  const filtered = ONLY
    ? TARGETS.filter((t) => t.category === ONLY)
    : TARGETS;

  console.log(
    `\n=== Generate ${filtered.length} Bilder ${ONLY ? `(only=${ONLY})` : ""} ${FORCE ? "--force" : ""} ===\n`,
  );

  const stats = { ok: 0, skipped: 0, failed: 0 };
  for (const t of filtered) {
    const r = await generateOne(t);
    if (r.status === "ok") stats.ok += 1;
    else if (r.status === "skipped") stats.skipped += 1;
    else stats.failed += 1;
    // kurze Pause zwischen Requests um Fal-Rate-Limits nicht zu reizen
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(
    `\n=== Fertig: ${stats.ok} generiert, ${stats.skipped} geskippt, ${stats.failed} fehlgeschlagen ===\n`,
  );

  if (stats.failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
