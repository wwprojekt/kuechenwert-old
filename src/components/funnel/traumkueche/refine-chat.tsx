"use client";

/**
 * Refine-Chat fuer Phase 2: Der Nutzer kann per natuerlichsprachiger
 * Anweisung seine Kueche verfeinern. Hinterlegt als Client-Komponente
 * auf der Ergebnisseite, sichtbar nach Lead-Capture.
 *
 * Der Kopf zeigt Vorher/Nachher-Vergleich der letzten zwei Renders,
 * unten ein Chat-Input + Message-History + Iterations-Counter.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Send, RefreshCcw, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface RefineChatProps {
  sessionToken: string;
  /** Initialer Render als "Vorher"-Basis */
  initialRender: {
    id: string;
    imageUrl: string;
    version: number;
  };
  /** Wenn falsy, wird der Chat nicht angezeigt. */
  enabled: boolean;
  /** Aktueller Iteration-Zaehler (aus DB) */
  initialIterationCount: number;
  /** Absolutes Limit pro Session */
  iterationLimit: number;
}

interface HistoryEntry {
  renderId: string;
  version: number;
  imageUrl: string;
  userMessage: string;
  assistantMessage: string;
  appliedSummary: string;
}

interface AppliedChange {
  tool: string;
  field: string;
  from: unknown;
  to: unknown;
  ok: boolean;
  reason?: string;
}

interface RefineResponse {
  renderId: string | null;
  version?: number;
  iterationCount: number;
  iterationLimit: number;
  applied: AppliedChange[];
  assistantMessage: string;
  updatedSpec: Record<string, unknown>;
  mock?: boolean;
  error?: string;
}

export function RefineChat({
  sessionToken,
  initialRender,
  enabled,
  initialIterationCount,
  iterationLimit,
}: RefineChatProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [iterationCount, setIterationCount] = useState(initialIterationCount);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentImageUrl =
    history.length > 0 ? history[history.length - 1].imageUrl : initialRender.imageUrl;
  const previousImageUrl =
    history.length >= 2
      ? history[history.length - 2].imageUrl
      : initialRender.imageUrl;

  const remaining = Math.max(0, iterationLimit - iterationCount);
  const canRefine = enabled && remaining > 0 && !loading && !polling;

  type PollOutcome =
    | { kind: "success"; imageUrl: string }
    | { kind: "failed"; error: string }
    | { kind: "timeout" };

  const pollRender = useCallback(async (renderId: string): Promise<PollOutcome> => {
    const start = Date.now();
    const timeout = 120_000;
    while (Date.now() - start < timeout) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch(`/api/planner/renders/${renderId}`, { cache: "no-store" });
        if (!res.ok) continue;
        const json = (await res.json()) as {
          status?: string;
          imageUrl?: string | null;
          error?: string;
        };
        if (json.status === "success" && json.imageUrl) {
          return { kind: "success", imageUrl: json.imageUrl };
        }
        if (json.status === "failed") {
          return { kind: "failed", error: json.error ?? "Unbekannter Fehler beim Render." };
        }
      } catch {
        // ignore and retry
      }
    }
    return { kind: "timeout" };
  }, []);

  const submit = useCallback(async () => {
    if (!message.trim() || !canRefine) return;
    const outgoing = message.trim();
    setLoading(true);
    setError(null);
    setAssistantReply(null);
    try {
      const res = await fetch("/api/planner/refine", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, message: outgoing }),
      });
      const json = (await res.json()) as RefineResponse;

      if (!res.ok) {
        setError(json.error ?? `Fehler ${res.status}`);
        return;
      }

      setIterationCount(json.iterationCount);
      setAssistantReply(json.assistantMessage ?? null);

      if (!json.renderId) {
        // Rueckfrage, kein Render
        return;
      }

      // Polling auf neuen Render
      setPolling(true);
      const outcome = await pollRender(json.renderId);
      if (outcome.kind === "failed") {
        setError(`Render fehlgeschlagen: ${outcome.error}`);
        return;
      }
      if (outcome.kind === "timeout") {
        setError("Render hat laenger gedauert als erwartet. Bitte Seite neu laden.");
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          renderId: json.renderId!,
          version: json.version ?? prev.length + 2,
          imageUrl: outcome.imageUrl,
          userMessage: outgoing,
          assistantMessage: json.assistantMessage ?? "",
          appliedSummary: summarizeApplied(json.applied),
        },
      ]);
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setPolling(false);
    }
  }, [canRefine, message, pollRender, sessionToken]);

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
  }, [enabled]);

  if (!enabled) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 p-5 text-sm text-ink-muted">
        Nach dem Sichern des Moodboards kannst du hier die Kueche per Chat
        weiter anpassen. (Kostenlos, bis zu {iterationLimit} Anpassungen.)
      </section>
    );
  }

  const showCompare = history.length >= 1;
  const beforeImg =
    compareIndex !== null && compareIndex >= 0 && compareIndex < history.length
      ? (compareIndex === 0 ? initialRender.imageUrl : history[compareIndex - 1].imageUrl)
      : previousImageUrl;
  const afterImg =
    compareIndex !== null && compareIndex >= 0 && compareIndex < history.length
      ? history[compareIndex].imageUrl
      : currentImageUrl;

  return (
    <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <header className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" aria-hidden />
        <h2 className="font-display text-lg font-bold text-black">Feinschliff per KI-Chat</h2>
        <span className="ml-auto rounded-full border border-neutral-200 bg-surface-soft px-2.5 py-0.5 text-[11px] font-semibold text-ink-muted">
          {remaining} / {iterationLimit} frei
        </span>
      </header>

      {showCompare && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <figure className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              <Image
                src={beforeImg}
                alt="Vorher"
                width={960}
                height={540}
                className="h-auto w-full object-cover"
                unoptimized
              />
              <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Vorher
              </figcaption>
            </figure>
            <figure className="relative overflow-hidden rounded-xl border border-brand-300 bg-neutral-100 ring-2 ring-brand-200">
              <Image
                src={afterImg}
                alt="Nachher"
                width={960}
                height={540}
                className="h-auto w-full object-cover"
                unoptimized
              />
              <figcaption className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Nachher
              </figcaption>
            </figure>
          </div>
          {history.length >= 2 && (
            <div className="flex items-center justify-between text-[12px] text-ink-muted">
              <button
                type="button"
                onClick={() =>
                  setCompareIndex((i) => {
                    const max = history.length - 1;
                    const current = i ?? max;
                    return Math.max(0, current - 1);
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 hover:bg-surface-soft"
              >
                <ChevronLeft className="h-3 w-3" /> Aelter
              </button>
              <span>
                Vergleich {(compareIndex ?? history.length - 1) + 1} / {history.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCompareIndex((i) => {
                    const max = history.length - 1;
                    const current = i ?? max;
                    return Math.min(max, current + 1);
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 hover:bg-surface-soft"
              >
                Neuer <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <ol className="space-y-2">
          {history.map((h) => (
            <li
              key={h.renderId}
              className="rounded-lg border border-neutral-200 bg-surface-soft/50 p-3 text-[13px]"
            >
              <div className="text-ink-muted">
                <strong className="text-ink">Du:</strong> {h.userMessage}
              </div>
              <div className="mt-1 flex items-start gap-2 text-ink-muted">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                <div>
                  <strong className="text-ink">Assistent:</strong>{" "}
                  {h.assistantMessage || "Aenderung uebernommen."}
                  {h.appliedSummary && (
                    <div className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-subtle">
                      {h.appliedSummary}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {assistantReply && history.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-brand-50/60 p-3 text-[13px] text-ink-muted">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div>{assistantReply}</div>
        </div>
      )}

      {/* Chat input */}
      {remaining > 0 ? (
        <div className="space-y-2">
          <label htmlFor="refine-input" className="sr-only">
            Aenderungswunsch
          </label>
          <textarea
            id="refine-input"
            ref={inputRef}
            rows={2}
            disabled={!canRefine}
            placeholder="z.B. 'Bitte eine Keramik-Arbeitsplatte und dunklere Farbe'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void submit();
              }
            }}
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white p-3 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-ink-subtle">
              Tipp: sag es in einem Satz - z.B. Farbe, Material, Stauraum, Geraete-Layout.
            </span>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!canRefine || message.trim().length < 2}
              className="btn-primary"
            >
              {loading || polling ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {polling ? "Bild wird aktualisiert..." : "Denke nach..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Anpassen
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-[13px] text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Du hast die maximale Anzahl Anpassungen ({iterationLimit}) erreicht.
            Unser Kuechenexperte meldet sich in Kuerze fuer den persoenlichen
            Feinschliff.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[13px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{error}</div>
        </div>
      )}
    </section>
  );
}

function summarizeApplied(applied: AppliedChange[]): string {
  const ok = applied.filter((a) => a.ok);
  if (ok.length === 0) return "";
  return ok
    .map((c) => {
      const to = c.to;
      const toStr = typeof to === "string" ? to : JSON.stringify(to);
      return `${c.field} -> ${toStr}`;
    })
    .join(" · ");
}
