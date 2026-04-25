/**
 * Tool-Definitionen fuer den Chat-Refinement-LLM.
 *
 * Das LLM bekommt in der System-Message die vollstaendige Liste der
 * erlaubten Werte (Slugs) und uebersetzt natuerlichsprachige Wuensche
 * in konkrete Tool-Calls. Die Tool-Calls werden in applyToolCall() auf
 * die TraumkuecheData-Spec angewendet.
 *
 * Grundsaetze:
 *   - Kein Freitext in Spec-Feldern - wir akzeptieren nur vordefinierte
 *     Slugs (kein Injection-Risiko, konsistentes Prompting).
 *   - Tools sind idempotent.
 *   - Fehlerhafte Tool-Calls werden ignoriert, im Server-Log vermerkt,
 *     aber nicht als harter Fehler an den User zurueckgegeben.
 */

import {
  APPLIANCE_LAYOUTS,
  APPLIANCE_SEGMENTS,
  FRONT_COLORS,
  KITCHEN_FORMS,
  KITCHEN_STYLES,
  STORAGE_FEATURES,
  SURFACE_FINISHES,
  WORKTOP_CHOICES,
  type KitchenFormSlug,
  type Segment,
} from "@/config/funnel-traumkueche-stammdaten";
import type { TraumkuecheData } from "@/config/funnel-traumkueche";
import type { LlmToolDefinition, LlmToolCall } from "@/lib/planner/llm-client";

// ============================================================
// Tool Definitions
// ============================================================

export function buildRefineTools(): LlmToolDefinition[] {
  const enumOf = (slugs: string[]) => ({ type: "string", enum: slugs });

  return [
    {
      name: "change_style",
      description: "Aendere den Grund-Stil der Kueche.",
      parameters: {
        type: "object",
        properties: {
          styleSlug: enumOf(KITCHEN_STYLES.map((s) => s.slug)),
        },
        required: ["styleSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "change_surface_finish",
      description: "Aendere die Oberflaechen-Charakteristik der Fronten.",
      parameters: {
        type: "object",
        properties: {
          surfaceFinishSlug: enumOf(SURFACE_FINISHES.map((s) => s.slug)),
        },
        required: ["surfaceFinishSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "change_color",
      description: "Aendere die Farbe der Kuechenfront.",
      parameters: {
        type: "object",
        properties: {
          colorSlug: enumOf(FRONT_COLORS.map((c) => c.slug)),
        },
        required: ["colorSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "change_worktop",
      description: "Aendere die Arbeitsplatte (Material).",
      parameters: {
        type: "object",
        properties: {
          worktopSlug: enumOf(WORKTOP_CHOICES.map((w) => w.slug)),
        },
        required: ["worktopSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "add_storage_feature",
      description: "Fuege eine Stauraum-/Ausstattungs-Option hinzu.",
      parameters: {
        type: "object",
        properties: {
          featureSlug: enumOf(STORAGE_FEATURES.map((s) => s.slug)),
        },
        required: ["featureSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "remove_storage_feature",
      description: "Entferne eine Stauraum-/Ausstattungs-Option.",
      parameters: {
        type: "object",
        properties: {
          featureSlug: enumOf(STORAGE_FEATURES.map((s) => s.slug)),
        },
        required: ["featureSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "add_appliance_layout",
      description: "Fuege eine Geraete-Anordnung hinzu (z.B. Backofen hoch + Kaffeemaschine).",
      parameters: {
        type: "object",
        properties: {
          layoutSlug: enumOf(APPLIANCE_LAYOUTS.map((a) => a.slug)),
        },
        required: ["layoutSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "remove_appliance_layout",
      description: "Entferne eine Geraete-Anordnung.",
      parameters: {
        type: "object",
        properties: {
          layoutSlug: enumOf(APPLIANCE_LAYOUTS.map((a) => a.slug)),
        },
        required: ["layoutSlug"],
        additionalProperties: false,
      },
    },
    {
      name: "change_appliance_segment",
      description: "Aendere die Qualitaetsstufe der Geraete.",
      parameters: {
        type: "object",
        properties: {
          segment: enumOf(APPLIANCE_SEGMENTS.map((s) => s.slug)),
        },
        required: ["segment"],
        additionalProperties: false,
      },
    },
    {
      name: "change_kitchen_form",
      description: "Aendere die Kuechenform.",
      parameters: {
        type: "object",
        properties: {
          kitchenForm: enumOf(KITCHEN_FORMS.map((f) => f.slug)),
        },
        required: ["kitchenForm"],
        additionalProperties: false,
      },
    },
  ];
}

// ============================================================
// System prompt
// ============================================================

export function buildRefineSystemPrompt(): string {
  const styleList = KITCHEN_STYLES.map((s) => `- ${s.slug}: ${s.label}`).join("\n");
  const colorList = FRONT_COLORS.map((c) => `- ${c.slug}: ${c.label}`).join("\n");
  const worktopList = WORKTOP_CHOICES.map((w) => `- ${w.slug}: ${w.label}`).join("\n");
  const storageList = STORAGE_FEATURES.map((s) => `- ${s.slug}: ${s.label}`).join("\n");
  const layoutList = APPLIANCE_LAYOUTS.map((a) => `- ${a.slug}: ${a.label}`).join("\n");

  return [
    "Du bist der Küchenplaner-Assistent von KüchenWert. Der Nutzer hat ",
    "gerade einen ersten KI-Render seiner Traumküche gesehen und möchte ",
    "Änderungen an der Planung vornehmen.",
    "",
    "WICHTIG:",
    "1. Nutze ausschließlich die zur Verfügung stehenden Tool-Calls, um ",
    "   Änderungen an der Küchen-Spec vorzunehmen. Kein Freitext-Update.",
    "2. Pro Turn solltest du zwischen 1 und 3 Tool-Calls auslösen, ",
    "   abhängig davon, wie viele Änderungen in der Nutzer-Nachricht stecken.",
    "3. Wenn der Nutzer-Wunsch unklar ist oder nicht mit einem Tool ",
    "   abbildbar, frage höflich nach - kein Tool-Call.",
    "4. Antworte kurz, freundlich, auf Deutsch, maximal 2 Sätze.",
    "",
    "Erlaubte Stile (styleSlug):",
    styleList,
    "",
    "Erlaubte Farben (colorSlug):",
    colorList,
    "",
    "Erlaubte Arbeitsplatten (worktopSlug):",
    worktopList,
    "",
    "Erlaubte Stauraum-Features (featureSlug):",
    storageList,
    "",
    "Erlaubte Geräte-Anordnungen (layoutSlug):",
    layoutList,
    "",
    "Wenn der Nutzer einen ungefähren Begriff nutzt, matche auf das ",
    "semantisch nächste Slug. Beispiel: 'heller' → zuerst prüfen, ob ",
    "eine helle Farb-Alternative konkret genannt wird; 'grün' → ",
    "'farbig-salbeigruen' oder 'farbig-dunkelgruen' je nach Kontext.",
  ].join("\n");
}

// ============================================================
// Apply Tool Calls to Spec
// ============================================================

export interface AppliedChange {
  tool: string;
  field: string;
  from: unknown;
  to: unknown;
  ok: boolean;
  reason?: string;
}

export interface RefineApplyResult {
  spec: TraumkuecheData;
  applied: AppliedChange[];
}

function isValidSlug<T extends { slug: string }>(list: readonly T[], slug: unknown): slug is string {
  return typeof slug === "string" && list.some((i) => i.slug === slug);
}

export function applyRefineToolCalls(
  spec: TraumkuecheData,
  calls: LlmToolCall[],
): RefineApplyResult {
  const next: TraumkuecheData = {
    ...spec,
    storageFeatures: [...(spec.storageFeatures ?? [])],
    applianceLayouts: [...(spec.applianceLayouts ?? [])],
  };
  const applied: AppliedChange[] = [];

  for (const call of calls) {
    const args = call.arguments ?? {};
    switch (call.name) {
      case "change_style": {
        const slug = args.styleSlug;
        if (isValidSlug(KITCHEN_STYLES, slug)) {
          applied.push({
            tool: call.name, field: "styleSlug", from: next.styleSlug, to: slug, ok: true,
          });
          next.styleSlug = slug;
        } else {
          applied.push({
            tool: call.name, field: "styleSlug", from: next.styleSlug, to: slug, ok: false,
            reason: "Unbekannter Style-Slug",
          });
        }
        break;
      }
      case "change_surface_finish": {
        const slug = args.surfaceFinishSlug;
        if (isValidSlug(SURFACE_FINISHES, slug)) {
          applied.push({ tool: call.name, field: "surfaceFinishSlug", from: next.surfaceFinishSlug, to: slug, ok: true });
          next.surfaceFinishSlug = slug;
        } else {
          applied.push({ tool: call.name, field: "surfaceFinishSlug", from: next.surfaceFinishSlug, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "change_color": {
        const slug = args.colorSlug;
        if (isValidSlug(FRONT_COLORS, slug)) {
          applied.push({ tool: call.name, field: "frontColorSlug", from: next.frontColorSlug, to: slug, ok: true });
          next.frontColorSlug = slug;
        } else {
          applied.push({ tool: call.name, field: "frontColorSlug", from: next.frontColorSlug, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "change_worktop": {
        const slug = args.worktopSlug;
        if (isValidSlug(WORKTOP_CHOICES, slug)) {
          applied.push({ tool: call.name, field: "worktopSlug", from: next.worktopSlug, to: slug, ok: true });
          next.worktopSlug = slug;
        } else {
          applied.push({ tool: call.name, field: "worktopSlug", from: next.worktopSlug, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "add_storage_feature": {
        const slug = args.featureSlug;
        if (isValidSlug(STORAGE_FEATURES, slug)) {
          if (!next.storageFeatures.includes(slug)) {
            next.storageFeatures.push(slug);
          }
          applied.push({ tool: call.name, field: "storageFeatures", from: null, to: slug, ok: true });
        } else {
          applied.push({ tool: call.name, field: "storageFeatures", from: null, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "remove_storage_feature": {
        const slug = args.featureSlug;
        if (typeof slug === "string") {
          next.storageFeatures = next.storageFeatures.filter((s) => s !== slug);
          applied.push({ tool: call.name, field: "storageFeatures", from: slug, to: null, ok: true });
        } else {
          applied.push({ tool: call.name, field: "storageFeatures", from: slug, to: null, ok: false, reason: "Ungueltig" });
        }
        break;
      }
      case "add_appliance_layout": {
        const slug = args.layoutSlug;
        if (isValidSlug(APPLIANCE_LAYOUTS, slug)) {
          if (!next.applianceLayouts.includes(slug)) {
            next.applianceLayouts.push(slug);
          }
          applied.push({ tool: call.name, field: "applianceLayouts", from: null, to: slug, ok: true });
        } else {
          applied.push({ tool: call.name, field: "applianceLayouts", from: null, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "remove_appliance_layout": {
        const slug = args.layoutSlug;
        if (typeof slug === "string") {
          next.applianceLayouts = next.applianceLayouts.filter((s) => s !== slug);
          applied.push({ tool: call.name, field: "applianceLayouts", from: slug, to: null, ok: true });
        } else {
          applied.push({ tool: call.name, field: "applianceLayouts", from: slug, to: null, ok: false, reason: "Ungueltig" });
        }
        break;
      }
      case "change_appliance_segment": {
        const slug = args.segment;
        const known = APPLIANCE_SEGMENTS.some((s) => s.slug === slug);
        if (known && typeof slug === "string") {
          applied.push({ tool: call.name, field: "applianceSegment", from: next.applianceSegment, to: slug, ok: true });
          next.applianceSegment = slug as Segment;
        } else {
          applied.push({ tool: call.name, field: "applianceSegment", from: next.applianceSegment, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      case "change_kitchen_form": {
        const slug = args.kitchenForm;
        const known = KITCHEN_FORMS.some((f) => f.slug === slug);
        if (known && typeof slug === "string") {
          applied.push({ tool: call.name, field: "kitchenForm", from: next.kitchenForm, to: slug, ok: true });
          next.kitchenForm = slug as KitchenFormSlug;
        } else {
          applied.push({ tool: call.name, field: "kitchenForm", from: next.kitchenForm, to: slug, ok: false, reason: "Unbekannt" });
        }
        break;
      }
      default:
        applied.push({ tool: call.name, field: "?", from: null, to: args, ok: false, reason: "Unbekanntes Tool" });
    }
  }

  return { spec: next, applied };
}
