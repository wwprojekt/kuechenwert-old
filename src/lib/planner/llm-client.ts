/**
 * LLM-Client fuer Traumkueche Phase 2 (Chat-Refinement + Floorplan-Vision).
 *
 * Wir gehen ueber die OpenAI-kompatible /v1/chat/completions API via fetch —
 * so bleiben wir SDK-frei und koennen denselben Wrapper spaeter auch gegen
 * Azure-OpenAI oder Proxys wie LiteLLM legen.
 *
 * Mock-Mode: Wenn OPENAI_API_KEY fehlt oder LLM_MOCK=1 gesetzt ist, geben
 * wir deterministische Fake-Antworten zurueck. So kann Phase 2 komplett
 * im Smoke-Test ohne API-Kosten laufen.
 */
import { clampTextLength } from "@/lib/planner/safe-text";

const BASE_URL = process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ?? "https://api.openai.com/v1";
const DEFAULT_REFINE_MODEL = process.env.OPENAI_REFINE_MODEL?.trim() || "gpt-4o-mini";
const DEFAULT_VISION_MODEL = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o";

export function isLlmMockMode(): boolean {
  return (
    process.env.LLM_MOCK === "1" ||
    process.env.PLANNER_MOCK === "1" ||
    !process.env.OPENAI_API_KEY?.trim()
  );
}

export interface LlmToolParameterSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: false;
}

export interface LlmToolDefinition {
  name: string;
  description: string;
  parameters: LlmToolParameterSchema;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<LlmTextPart | LlmImagePart>;
  tool_call_id?: string;
  name?: string;
}

interface LlmTextPart {
  type: "text";
  text: string;
}

interface LlmImagePart {
  type: "image_url";
  image_url: { url: string; detail?: "low" | "high" | "auto" };
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LlmCompletionResult {
  content: string | null;
  toolCalls: LlmToolCall[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
  model: string;
  /** Nur in mock mode true */
  mock: boolean;
}

export interface LlmChatOptions {
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  toolChoice?: "auto" | "required" | "none";
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
  timeoutMs?: number;
}

interface OpenAiToolCallRaw {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface OpenAiMessageRaw {
  role: string;
  content: string | null;
  tool_calls?: OpenAiToolCallRaw[];
}

interface OpenAiChatResponse {
  choices: Array<{ message: OpenAiMessageRaw; finish_reason?: string }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  model: string;
}

/**
 * Call LLM Chat Completion. Kehrt parsed tool-calls zurueck.
 */
export async function llmChat(opts: LlmChatOptions): Promise<LlmCompletionResult> {
  const model = opts.model ?? DEFAULT_REFINE_MODEL;

  if (isLlmMockMode()) {
    return buildMockResponse(opts, model);
  }

  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 800,
  };

  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
    body.tool_choice = opts.toolChoice ?? "auto";
  }

  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(
        `LLM HTTP ${res.status}: ${clampTextLength(txt, 500) || res.statusText}`,
      );
    }

    const json = (await res.json()) as OpenAiChatResponse;
    const choice = json.choices?.[0];
    if (!choice) throw new Error("LLM: no choices in response");

    const toolCalls: LlmToolCall[] = (choice.message.tool_calls ?? []).map((tc) => {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch {
        args = { _raw: tc.function.arguments };
      }
      return { id: tc.id, name: tc.function.name, arguments: args };
    });

    return {
      content: choice.message.content ?? null,
      toolCalls,
      usage: {
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens,
      },
      model: json.model ?? model,
      mock: false,
    };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Erzwingt JSON-Response (response_format=json_object). Parsed und gibt
 * das Objekt zurueck. Nutzbar fuer Vision-Extraktion.
 */
export async function llmJson<T = unknown>(opts: LlmChatOptions): Promise<T> {
  const result = await llmChat({ ...opts, responseFormat: "json_object" });
  if (result.mock) {
    return (buildMockJson(opts) as unknown) as T;
  }
  const text = result.content ?? "{}";
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`LLM returned invalid JSON: ${clampTextLength(text, 300)}`);
  }
}

export function visionModel(): string {
  return DEFAULT_VISION_MODEL;
}

export function refineModel(): string {
  return DEFAULT_REFINE_MODEL;
}

// ============================================================
// Mock responses
// ============================================================

function buildMockResponse(opts: LlmChatOptions, model: string): LlmCompletionResult {
  // Strategie: Wenn das letzte user-Message ein Keyword-Match hat, feuere
  // den entsprechenden tool-call. Sonst einen neutralen Text zurueckgeben.
  const lastUser = [...opts.messages].reverse().find((m) => m.role === "user");
  const text =
    typeof lastUser?.content === "string"
      ? lastUser.content.toLowerCase()
      : Array.isArray(lastUser?.content)
        ? lastUser!.content
            .filter((p): p is LlmTextPart => p.type === "text")
            .map((p) => p.text)
            .join(" ")
            .toLowerCase()
        : "";

  const toolCalls: LlmToolCall[] = [];
  const tools = opts.tools ?? [];
  const has = (name: string) => tools.some((t) => t.name === name);

  // Sehr simple Heuristiken fuer Smoke-Test
  if (has("change_color") && /(farb|color)/.test(text)) {
    toolCalls.push({
      id: "call_mock_color",
      name: "change_color",
      arguments: { colorSlug: "farbig-salbeigruen" },
    });
  } else if (has("change_worktop") && /(arbeitsplatte|worktop)/.test(text)) {
    toolCalls.push({
      id: "call_mock_worktop",
      name: "change_worktop",
      arguments: { worktopSlug: "keramik" },
    });
  } else if (has("add_storage_feature") && /(stauraum|storage|apotheker)/.test(text)) {
    toolCalls.push({
      id: "call_mock_storage",
      name: "add_storage_feature",
      arguments: { featureSlug: "apothekerauszug" },
    });
  } else if (has("change_style") && /(stil|style|landhaus|modern)/.test(text)) {
    toolCalls.push({
      id: "call_mock_style",
      name: "change_style",
      arguments: { styleSlug: "modern-grifflos" },
    });
  }

  return {
    content:
      toolCalls.length > 0
        ? "Alles klar, ich habe die Anpassung übernommen."
        : "Gerne. Sag mir konkret, was ich ändern soll (Farbe, Stil, Arbeitsplatte, Stauraum, Geräte-Layout).",
    toolCalls,
    model: `${model}-mock`,
    mock: true,
  };
}

function buildMockJson(_opts: LlmChatOptions): Record<string, unknown> {
  // Wir setzen confidence absichtlich unter 0.5, damit im Dev-Mode die
  // manuell gewaehlte kitchenForm NICHT ueberschrieben wird.
  return {
    kitchenForm: "l",
    approxLengthMeters: 3.6,
    approxDepthMeters: 2.8,
    doorsDetected: 1,
    windowsDetected: 1,
    recommendedLayout: "Arbeitszone parallel zum Fenster platzieren",
    confidence: 0.4,
    warnings: ["Mock-Daten - kein echter LLM-Call."],
  };
}
