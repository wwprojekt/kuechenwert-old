"use client";

/**
 * Grundriss-Upload (optional) fuer den Form-Size-Step.
 *
 * - Akzeptiert JPG/PNG/WebP, max 8 MB.
 * - Ruft /api/planner/analyze-floorplan auf, zeigt Analyse-Ergebnis an.
 * - Wenn usable: benachrichtigt den Parent ueber die KitchenForm.
 * - Bei Fehler / low confidence: sichtbarer Fallback-Hinweis.
 */

import { useCallback, useRef, useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react";
import type { KitchenFormSlug } from "@/config/funnel-traumkueche-stammdaten";

interface FloorplanAnalysis {
  kitchenForm: KitchenFormSlug | null;
  approxLengthMeters: number | null;
  approxDepthMeters: number | null;
  doorsDetected: number | null;
  windowsDetected: number | null;
  recommendedLayout: string | null;
  confidence: number;
  warnings: string[];
  usable: boolean;
}

interface AnalyzeResponse {
  sessionId: string;
  filePath: string;
  analysis: FloorplanAnalysis;
  appliedForm: KitchenFormSlug | null;
  error?: string;
}

export function FloorplanUpload({
  sessionToken,
  onAppliedForm,
  turnstileToken,
}: {
  sessionToken: string;
  onAppliedForm?: (form: KitchenFormSlug) => void;
  turnstileToken?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);
      setFileName(file.name);
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("sessionToken", sessionToken);
        fd.append("file", file);
        if (turnstileToken) fd.append("turnstileToken", turnstileToken);

        const res = await fetch("/api/planner/analyze-floorplan", {
          method: "POST",
          body: fd,
        });
        const json = (await res.json()) as AnalyzeResponse;
        if (!res.ok) {
          setError(json.error ?? `Fehler ${res.status}`);
          return;
        }
        setResult(json);
        if (json.appliedForm) onAppliedForm?.(json.appliedForm);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [onAppliedForm, sessionToken, turnstileToken],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void onFile(f);
  };

  const clear = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-neutral-300 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Upload className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-ink">
            Optional: Grundriss hochladen
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
            JPG, PNG oder WebP (max 8 MB). Die KI erkennt Kuechenform und
            ungefaehre Masse automatisch.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onInputChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn-secondary text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysiere...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" /> Datei waehlen
            </>
          )}
        </button>
        {fileName && (
          <div className="flex items-center gap-1 text-[12px] text-ink-muted">
            <span className="max-w-[180px] truncate">{fileName}</span>
            {!loading && (
              <button
                type="button"
                onClick={clear}
                className="text-ink-subtle hover:text-red-600"
                aria-label="Entfernen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {result && result.analysis && (
        <div
          className={`rounded-lg border p-3 text-[12px] ${
            result.analysis.usable
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-2">
            {result.analysis.usable ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-semibold">
                {result.analysis.usable
                  ? "Grundriss erkannt"
                  : "Nicht eindeutig - bitte Form manuell waehlen"}
              </div>
              {result.analysis.kitchenForm && (
                <div>Form: {labelForForm(result.analysis.kitchenForm)}</div>
              )}
              {(result.analysis.approxLengthMeters || result.analysis.approxDepthMeters) && (
                <div>
                  Masse ca. {fmt(result.analysis.approxLengthMeters)} m x{" "}
                  {fmt(result.analysis.approxDepthMeters)} m
                </div>
              )}
              {result.analysis.recommendedLayout && (
                <div>Hinweis: {result.analysis.recommendedLayout}</div>
              )}
              {result.analysis.warnings.length > 0 && (
                <ul className="list-disc pl-4">
                  {result.analysis.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              <div className="text-[10px] uppercase tracking-wider opacity-70">
                Vertrauen: {Math.round(result.analysis.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-800">
          {error}
        </div>
      )}
    </div>
  );
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

function fmt(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "?";
  return n.toFixed(1);
}
