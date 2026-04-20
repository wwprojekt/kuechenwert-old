"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";

export function CronTriggerButton({
  job,
  label,
}: {
  job: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function trigger() {
    setBusy(true);
    setError(null);
    setLast(null);
    try {
      const res = await fetch("/api/admin/cron/trigger", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        processed?: number;
        duration_ms?: number;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        setLast(
          `${json.processed ?? 0} verarbeitet · ${json.duration_ms ?? 0} ms`,
        );
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={trigger}
        disabled={busy || pending}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
      >
        {busy || pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        {label}
      </button>
      {last && <span className="text-[11px] text-accent-700">{last}</span>}
      {error && <span className="text-[11px] text-red-700">{error}</span>}
    </div>
  );
}
