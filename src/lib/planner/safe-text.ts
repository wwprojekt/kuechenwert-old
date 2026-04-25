/**
 * Kleine Hilfsfunktionen fuer LLM-/User-Text, die wir in Logs + Errors
 * ausgeben. Haelt Text ueberall im Projekt auf sichere Laenge.
 */

export function clampTextLength(input: string | null | undefined, max = 500): string {
  if (!input) return "";
  if (input.length <= max) return input;
  return input.slice(0, max - 1) + "\u2026";
}
