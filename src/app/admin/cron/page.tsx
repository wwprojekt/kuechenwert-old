import {
  Activity,
  CheckCircle2,
  Clock,
  Gauge,
  PauseCircle,
  TimerReset,
  XCircle,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CronTriggerButton } from "@/components/admin/cron-trigger-button";

export const dynamic = "force-dynamic";

type CronRow = {
  id: string;
  job: string;
  trigger: "vercel_cron" | "manual" | "unknown";
  status: "running" | "success" | "error";
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  processed: number | null;
  error_message: string | null;
  details: Record<string, unknown> | null;
};

type JobConfig = {
  id: string;
  label: string;
  schedule: string;
  description: string;
  /** Stunden bevor "stale" angezeigt wird */
  staleAfterHours: number;
};

const JOBS: JobConfig[] = [
  {
    id: "finalize-auctions",
    label: "Auktionen finalisieren",
    schedule: "*/5 * * * * (alle 5 Min)",
    description:
      "Schliesst abgelaufene Auktionen ab, kuert das niedrigste Gebot zum Sieger, setzt Lead-Status, generiert Provisions-Rechnung.",
    staleAfterHours: 1,
  },
  {
    id: "dunning",
    label: "Mahnwesen",
    schedule: "0 8 * * * (taeglich 08:00 UTC)",
    description:
      "Eskaliert ueberfaellige Rechnungen je nach Tagesabstand auf die naechste Mahnstufe (1..5).",
    staleAfterHours: 26,
  },
];

function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `vor ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `vor ${m} Min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} h`;
  const d = Math.floor(h / 24);
  return `vor ${d} T`;
}

export default async function AdminCronHealthPage() {
  // Letzte 100 Runs ueber alle Jobs
  const { data: runsRaw } = await supabaseAdmin
    .from("cron_runs")
    .select(
      "id, job, trigger, status, started_at, finished_at, duration_ms, processed, error_message, details",
    )
    .order("started_at", { ascending: false })
    .limit(100);

  const runs = (runsRaw ?? []) as unknown as CronRow[];

  // Pro Job: jueng. Run, jueng. Erfolg, Fehleranzahl 24 h, 7 d, total
  const since24 = Date.now() - 24 * 60 * 60 * 1000;
  const since7d = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const jobStats = JOBS.map((job) => {
    const jobRuns = runs.filter((r) => r.job === job.id);
    const lastRun = jobRuns[0] ?? null;
    const lastSuccess = jobRuns.find((r) => r.status === "success") ?? null;
    const errors24h = jobRuns.filter(
      (r) => r.status === "error" && new Date(r.started_at).getTime() >= since24,
    ).length;
    const errors7d = jobRuns.filter(
      (r) => r.status === "error" && new Date(r.started_at).getTime() >= since7d,
    ).length;
    const total7d = jobRuns.filter(
      (r) => new Date(r.started_at).getTime() >= since7d,
    ).length;
    const successRate =
      total7d > 0 ? Math.round(((total7d - errors7d) / total7d) * 100) : null;

    const isStale =
      !lastSuccess ||
      Date.now() - new Date(lastSuccess.started_at).getTime() >
        job.staleAfterHours * 60 * 60 * 1000;

    const health: "ok" | "stale" | "failing" =
      errors24h > 0 && (!lastRun || lastRun.status === "error")
        ? "failing"
        : isStale
          ? "stale"
          : "ok";

    return { job, lastRun, lastSuccess, errors24h, errors7d, total7d, successRate, health };
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <Gauge className="h-6 w-6 text-brand-700" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Cron-Health</h1>
          <p className="text-sm text-ink-muted">
            Status, Latenz und Fehler aller geplanten Hintergrundjobs.
          </p>
        </div>
      </div>

      {/* Job-Cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {jobStats.map(
          ({ job, lastRun, lastSuccess, errors24h, errors7d, total7d, successRate, health }) => (
            <div
              key={job.id}
              className="rounded-card border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">
                      {job.label}
                    </h2>
                    <HealthBadge health={health} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{job.description}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-subtle">
                    <Clock className="h-3 w-3" />
                    {job.schedule}
                  </p>
                </div>
                <CronTriggerButton job={job.id} label="Jetzt ausfuehren" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <Mini
                  label="Letzter Run"
                  value={lastRun ? fmtRelative(lastRun.started_at) : "noch nie"}
                  sub={
                    lastRun
                      ? `${lastRun.status} · ${fmtDuration(lastRun.duration_ms)} · ${lastRun.processed ?? 0} verarb.`
                      : ""
                  }
                />
                <Mini
                  label="Letzter Erfolg"
                  value={lastSuccess ? fmtRelative(lastSuccess.started_at) : "noch nie"}
                  sub={
                    lastSuccess
                      ? `${lastSuccess.processed ?? 0} verarb. · ${fmtDuration(lastSuccess.duration_ms)}`
                      : ""
                  }
                />
                <Mini
                  label="Fehler 24 h"
                  value={String(errors24h)}
                  tone={errors24h > 0 ? "red" : "ok"}
                />
                <Mini
                  label="Erfolgsquote 7 d"
                  value={successRate != null ? `${successRate} %` : "—"}
                  sub={`${total7d} Runs · ${errors7d} Fehler`}
                  tone={
                    successRate == null
                      ? undefined
                      : successRate >= 95
                        ? "ok"
                        : successRate >= 80
                          ? "warn"
                          : "red"
                  }
                />
              </div>

              {lastRun?.status === "error" && lastRun.error_message && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <div className="font-semibold">Letzter Fehler:</div>
                  <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap font-mono text-[11px]">
                    {lastRun.error_message}
                  </pre>
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Run-History */}
      <div className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-700" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Run-Historie (letzte 100)
          </h2>
        </div>
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Trigger</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">Dauer</th>
                <th className="px-4 py-3 font-medium">Verarb.</th>
                <th className="px-4 py-3 font-medium">Fehler / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-muted">
                    <PauseCircle className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                    Noch keine Cron-Runs aufgezeichnet.
                  </td>
                </tr>
              ) : (
                runs.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <RunStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">{r.job}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {r.trigger === "vercel_cron"
                        ? "Vercel-Cron"
                        : r.trigger === "manual"
                          ? "Manuell"
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <div>{new Date(r.started_at).toLocaleString("de-DE")}</div>
                      <div className="text-[11px] text-ink-subtle">
                        {fmtRelative(r.started_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">{fmtDuration(r.duration_ms)}</td>
                    <td className="px-4 py-3 text-xs text-ink">{r.processed ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.status === "error" && r.error_message ? (
                        <span className="text-[11px] text-red-700">
                          {r.error_message.slice(0, 120)}
                          {r.error_message.length > 120 ? "…" : ""}
                        </span>
                      ) : r.details && Object.keys(r.details).length > 0 ? (
                        <span className="text-[11px] text-ink-subtle">
                          {summarizeDetails(r.details)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-ink-subtle">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HealthBadge({ health }: { health: "ok" | "stale" | "failing" }) {
  if (health === "ok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
        <CheckCircle2 className="h-3 w-3" />
        Healthy
      </span>
    );
  }
  if (health === "stale") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <TimerReset className="h-3 w-3" />
        Stale
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
      <XCircle className="h-3 w-3" />
      Failing
    </span>
  );
}

function RunStatusBadge({ status }: { status: "running" | "success" | "error" }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-accent-200 bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
        <CheckCircle2 className="h-3 w-3" />
        success
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
        <XCircle className="h-3 w-3" />
        error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
      <Activity className="h-3 w-3 animate-pulse" />
      running
    </span>
  );
}

const TONE_CLS: Record<string, string> = {
  ok: "text-accent-700",
  warn: "text-amber-700",
  red: "text-red-700",
};

function Mini({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: keyof typeof TONE_CLS | string;
}) {
  const valueCls = tone ? TONE_CLS[tone] ?? "text-ink" : "text-ink";
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </div>
      <div className={`mt-1 text-sm font-semibold ${valueCls}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink-subtle">{sub}</div>}
    </div>
  );
}

function summarizeDetails(details: Record<string, unknown>): string {
  const parts: string[] = [];
  if ("invoice_errors" in details && Number(details.invoice_errors) > 0) {
    parts.push(`${details.invoice_errors} Rechnungsfehler`);
  }
  if ("mail_errors" in details && Number(details.mail_errors) > 0) {
    parts.push(`${details.mail_errors} Mailfehler`);
  }
  const results = (details.results as unknown[]) ?? [];
  if (Array.isArray(results) && results.length > 0) {
    parts.push(`${results.length} Items`);
  }
  return parts.join(" · ") || "ok";
}
