/**
 * Grundriss-Analyse ueber ein Vision-LLM.
 *
 * Der Kunde laedt einen Grundriss (JPG/PNG/PDF-1ter-Seite-als-Image) hoch.
 * Das LLM extrahiert:
 *   - Kuechenform (zeile/l/u/parallel/insel) - Heuristik
 *   - Approximative Laenge der kuechentauglichen Wand (m)
 *   - Approximative Tiefe/Stellflaeche (m)
 *   - Anzahl Tueren/Fenster an der Kuechenwand
 *   - Empfohlenes Layout (Kurzstichpunkt)
 *   - confidence (0-1)
 *   - warnings[] (Unsicherheit, Hinweise)
 *
 * Bei low confidence oder LLM-Fehler: graceful fallback -> Nutzer bleibt
 * bei der manuell gewaehlten Kuechenform.
 */

import { llmJson, visionModel } from "@/lib/planner/llm-client";
import type { KitchenFormSlug } from "@/config/funnel-traumkueche-stammdaten";
import type { TraumkuecheFloorplanAnalysis } from "@/config/funnel-traumkueche";

export interface FloorplanAnalysisRaw {
  kitchenForm?: string;
  approxLengthMeters?: number;
  approxDepthMeters?: number;
  doorsDetected?: number;
  windowsDetected?: number;
  recommendedLayout?: string;
  confidence?: number;
  warnings?: string[];
}

/** Re-export fuer Konsumenten, die nur dieses Modul kennen */
export type FloorplanAnalysisResult = TraumkuecheFloorplanAnalysis;

const VALID_FORMS: KitchenFormSlug[] = ["zeile", "l", "u", "parallel", "g", "insel"];

const FLOORPLAN_SYSTEM_PROMPT = [
  "Du bist ein Architekten-Assistent fuer Kuechenplanung.",
  "Analysiere den uebermittelten Grundriss und extrahiere strukturiert:",
  " - kitchenForm: eine der Optionen ('zeile','l','u','parallel','g','insel') oder null wenn unklar",
  " - approxLengthMeters: geschaetzte Laenge der laengsten kuechentauglichen Wand in Metern (0-8)",
  " - approxDepthMeters: geschaetzte Tiefe/Stellflaeche in Metern (1-5)",
  " - doorsDetected: Anzahl Tueren in/an dem fuer die Kueche vorgesehenen Raum",
  " - windowsDetected: Anzahl Fenster in/an dem fuer die Kueche vorgesehenen Raum",
  " - recommendedLayout: kurzer deutscher Hinweis fuer die beste Anordnung (max 80 Zeichen)",
  " - confidence: 0.0 bis 1.0 - wie sicher bist du dir",
  " - warnings: Array von kurzen deutschen Hinweisen, wenn etwas unklar ist",
  "",
  "Wenn du auf dem Bild keinen Grundriss erkennst, setze confidence auf 0 und",
  "warnings entsprechend. Liefere IMMER ein JSON-Objekt mit genau diesen Feldern.",
].join("\n");

export async function analyzeFloorplanImage(params: {
  imageUrl: string;
  model?: string;
  timeoutMs?: number;
}): Promise<FloorplanAnalysisResult> {
  const raw = await llmJson<FloorplanAnalysisRaw>({
    messages: [
      { role: "system", content: FLOORPLAN_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Hier ist ein Grundriss. Analysiere ihn fuer die Kuechenplanung und" +
              " antworte AUSSCHLIESSLICH mit dem JSON-Objekt.",
          },
          {
            type: "image_url",
            image_url: { url: params.imageUrl, detail: "high" },
          },
        ],
      },
    ],
    model: params.model ?? visionModel(),
    temperature: 0.1,
    maxTokens: 400,
    timeoutMs: params.timeoutMs ?? 30_000,
    responseFormat: "json_object",
  });

  return normalizeAnalysis(raw);
}

export function normalizeAnalysis(raw: FloorplanAnalysisRaw): FloorplanAnalysisResult {
  const form =
    typeof raw.kitchenForm === "string" && VALID_FORMS.includes(raw.kitchenForm as KitchenFormSlug)
      ? (raw.kitchenForm as KitchenFormSlug)
      : null;
  const length = clampNum(raw.approxLengthMeters, 0, 8);
  const depth = clampNum(raw.approxDepthMeters, 0, 5);
  const doors = clampInt(raw.doorsDetected, 0, 10);
  const windows = clampInt(raw.windowsDetected, 0, 10);
  const confidence = clampNum(raw.confidence, 0, 1) ?? 0;
  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings
        .filter((w): w is string => typeof w === "string")
        .slice(0, 5)
        .map((w) => w.slice(0, 200))
    : [];
  const recommended =
    typeof raw.recommendedLayout === "string" && raw.recommendedLayout.trim().length > 0
      ? raw.recommendedLayout.slice(0, 200)
      : null;

  const usable = confidence >= 0.5 && form !== null;

  return {
    kitchenForm: form,
    approxLengthMeters: length,
    approxDepthMeters: depth,
    doorsDetected: doors,
    windowsDetected: windows,
    recommendedLayout: recommended,
    confidence,
    warnings,
    usable,
  };
}

function clampNum(v: unknown, min: number, max: number): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.max(min, Math.min(max, v));
}

function clampInt(v: unknown, min: number, max: number): number | null {
  const n = clampNum(v, min, max);
  return n === null ? null : Math.round(n);
}
