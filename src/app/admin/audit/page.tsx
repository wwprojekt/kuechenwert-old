import Link from "next/link";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  ShieldAlert,
  X,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AuditDetailToggle } from "@/components/admin/audit-detail-toggle";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: {
    id: string;
    role: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

// Domain-Buckets fuer Schnellfilter (action-Prefix vor dem ersten Punkt).
const DOMAINS: { id: string; label: string; tone: string }[] = [
  { id: "lead", label: "Leads", tone: "bg-brand-50 text-brand-700 border-brand-200" },
  { id: "auction", label: "Auktionen", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "bid", label: "Gebote", tone: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "spec_item", label: "Spec-Items", tone: "bg-slate-50 text-slate-700 border-slate-200" },
  { id: "invoice", label: "Rechnungen", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "wallet", label: "Wallet", tone: "bg-violet-50 text-violet-700 border-violet-200" },
  { id: "stripe", label: "Stripe", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "dealer", label: "Haendler", tone: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "pricing_rule", label: "Pricing", tone: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "commission_tier", label: "Provision", tone: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "catalog", label: "Stammdaten", tone: "bg-zinc-50 text-zinc-700 border-zinc-200" },
];

const RANGES: { id: string; label: string; days: number | null }[] = [
  { id: "1d", label: "Heute", days: 1 },
  { id: "7d", label: "7 Tage", days: 7 },
  { id: "30d", label: "30 Tage", days: 30 },
  { id: "all", label: "Alle", days: null },
];

function rangeToSinceIso(rangeId: string | undefined): string | null {
  const range = RANGES.find((r) => r.id === rangeId);
  if (!range || range.days == null) return null;
  return new Date(Date.now() - range.days * 24 * 60 * 60 * 1000).toISOString();
}

function entityHref(row: AuditRow): string | null {
  if (!row.entity_id) return null;
  switch (row.entity_type) {
    case "lead":
      return `/admin/leads/${row.entity_id}`;
    case "auction":
    case "auction_spec_item":
      return `/admin/auctions`;
    case "invoice":
      return `/admin/invoices`;
    case "dealer":
      return `/admin/dealers`;
    case "lead_pricing_rules":
      return `/admin/pricing-matrix`;
    case "commission_tiers":
      return `/admin/commissions`;
    default:
      return null;
  }
}

function actionTone(action: string): string {
  if (action.includes("delete") || action.includes("cancel") || action.includes("suspend"))
    return "bg-red-50 text-red-700 border-red-200";
  if (action.includes("create") || action.includes("publish") || action.includes("register"))
    return "bg-accent-50 text-accent-700 border-accent-200";
  if (action.includes("update")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (action.includes("paid") || action.includes("completed") || action.includes("finalize"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (action.includes("dunning") || action.includes("failed"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function buildHref(params: {
  domain?: string;
  range?: string;
  entity?: string;
  q?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (params.domain) sp.set("domain", params.domain);
  if (params.range && params.range !== "all") sp.set("range", params.range);
  if (params.entity) sp.set("entity", params.entity);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 0) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/audit?${qs}` : "/admin/audit";
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    domain?: string;
    range?: string;
    entity?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const domain = sp.domain;
  const range = sp.range ?? "7d";
  const entity = sp.entity;
  const q = sp.q?.trim();
  const page = Math.max(0, Number(sp.page ?? 0));
  const sinceIso = rangeToSinceIso(range);

  // Hauptquery
  let query = supabaseAdmin
    .from("audit_log")
    .select(
      "id, actor_id, action, entity_type, entity_id, details, ip_address, created_at, actor:profiles!audit_log_actor_id_fkey(id, role, first_name, last_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (sinceIso) query = query.gte("created_at", sinceIso);
  if (domain) query = query.like("action", `${domain}.%`);
  if (entity) query = query.eq("entity_type", entity);
  if (q) {
    // ID-Suche oder Action-Substring
    if (/^[0-9a-f-]{8,}$/i.test(q)) {
      query = query.eq("entity_id", q);
    } else {
      query = query.ilike("action", `%${q}%`);
    }
  }

  // Top-Stats parallel
  const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [rowsResult, statsDay, stats7, stats30, statsTotal] = await Promise.all([
    query,
    supabaseAdmin
      .from("audit_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sinceDay),
    supabaseAdmin
      .from("audit_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since7),
    supabaseAdmin
      .from("audit_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30),
    supabaseAdmin.from("audit_log").select("*", { count: "exact", head: true }),
  ]);

  const rows = (rowsResult.data ?? []) as unknown as AuditRow[];
  const totalCount = rowsResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasFilters = !!(domain || entity || q || (range && range !== "7d"));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-brand-700" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Audit-Log</h1>
            <p className="text-sm text-ink-muted">
              Lueckenlose Aktivitaets-Historie aller Admin- und System-Aktionen.
            </p>
          </div>
        </div>
        {hasFilters && (
          <Link
            href="/admin/audit"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-muted hover:border-slate-300 hover:text-ink"
          >
            <X className="h-3 w-3" />
            Filter zuruecksetzen
          </Link>
        )}
      </div>

      {/* Top-Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Letzte 24 h" value={statsDay.count ?? 0} tone="brand" />
        <StatCard label="Letzte 7 Tage" value={stats7.count ?? 0} tone="accent" />
        <StatCard label="Letzte 30 Tage" value={stats30.count ?? 0} tone="amber" />
        <StatCard label="Gesamt" value={statsTotal.count ?? 0} tone="slate" />
      </div>

      {/* Range-Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
          <Filter className="h-3 w-3" />
          Zeitraum
        </span>
        {RANGES.map((r) => {
          const active = (range ?? "7d") === r.id;
          return (
            <Link
              key={r.id}
              href={buildHref({ domain, range: r.id, entity, q })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {/* Domain-Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
          <Activity className="h-3 w-3" />
          Domain
        </span>
        <Link
          href={buildHref({ range, entity, q })}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
            !domain
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
          }`}
        >
          Alle
        </Link>
        {DOMAINS.map((d) => {
          const active = domain === d.id;
          return (
            <Link
              key={d.id}
              href={buildHref({ domain: d.id, range, entity, q })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                active ? d.tone : "border-slate-200 bg-white text-ink-muted hover:border-slate-300"
              }`}
            >
              {d.label}
            </Link>
          );
        })}
      </div>

      {/* Such-Form */}
      <form
        action="/admin/audit"
        method="get"
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        {domain && <input type="hidden" name="domain" value={domain} />}
        {range && range !== "all" && <input type="hidden" name="range" value={range} />}
        {entity && <input type="hidden" name="entity" value={entity} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Aktion (z. B. publish) oder Entity-ID"
          className="w-72 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-ink focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
        >
          Suchen
        </button>
      </form>

      {/* Tabelle */}
      <div className="mt-6 overflow-x-auto rounded-card border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Aktion</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Akteur</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-muted">
                  <ShieldAlert className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  Keine Eintraege fuer diese Filter.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const href = entityHref(r);
                const actor = r.actor;
                const actorLabel = actor
                  ? `${actor.first_name ?? ""} ${actor.last_name ?? ""}`.trim() ||
                    actor.role ||
                    actor.id.slice(0, 8)
                  : "System";
                return (
                  <tr key={r.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-mono ${actionTone(r.action)}`}
                      >
                        {r.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-ink">
                        <span className="font-medium">{r.entity_type}</span>
                      </div>
                      {r.entity_id && (
                        <div className="mt-0.5 font-mono text-[11px] text-ink-subtle">
                          {href ? (
                            <Link href={href} className="text-brand-700 hover:underline">
                              {r.entity_id.slice(0, 8)}
                            </Link>
                          ) : (
                            r.entity_id.slice(0, 8)
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-ink">{actorLabel}</div>
                      {actor?.role && (
                        <div className="mt-0.5 text-[11px] uppercase text-ink-subtle">
                          {actor.role}
                        </div>
                      )}
                      {!actor && (
                        <div className="mt-0.5 text-[11px] uppercase text-ink-subtle">
                          system / cron
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {new Date(r.created_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <AuditDetailToggle details={r.details} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
          <div>
            Seite <span className="font-semibold text-ink">{page + 1}</span> von{" "}
            <span className="font-semibold text-ink">{totalPages}</span> ·{" "}
            {totalCount.toLocaleString("de-DE")} Eintraege
          </div>
          <div className="flex items-center gap-2">
            {page > 0 ? (
              <Link
                href={buildHref({ domain, range, entity, q, page: page - 1 })}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink hover:border-slate-300"
              >
                <ChevronLeft className="h-3 w-3" />
                Zurueck
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 font-medium text-slate-300">
                <ChevronLeft className="h-3 w-3" />
                Zurueck
              </span>
            )}
            {page + 1 < totalPages ? (
              <Link
                href={buildHref({ domain, range, entity, q, page: page + 1 })}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-ink hover:border-slate-300"
              >
                Weiter
                <ChevronRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 font-medium text-slate-300">
                Weiter
                <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TONE_MAP: Record<string, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-700",
  accent: "border-accent-200 bg-accent-50 text-accent-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONE_MAP | string;
}) {
  const cls = TONE_MAP[tone] ?? TONE_MAP.slate;
  return (
    <div className={`rounded-card border ${cls} p-4`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value.toLocaleString("de-DE")}</div>
    </div>
  );
}
