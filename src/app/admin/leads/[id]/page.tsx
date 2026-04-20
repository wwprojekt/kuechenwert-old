import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, MapPin, FileText, Image as ImgIcon, Map, Gavel } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LeadEditor } from "@/components/admin/lead-editor";
import { AuctionEditor } from "@/components/admin/auction-editor";
import { LeadQuickActions } from "@/components/admin/lead-quick-actions";

export const dynamic = "force-dynamic";

const FILE_ICONS: Record<string, React.ElementType> = {
  angebot: FileText,
  grundriss: Map,
  rendering: ImgIcon,
  kueche_bild: ImgIcon,
  sonstiges: FileText,
};

const FILE_LABELS: Record<string, string> = {
  angebot: "Studio-Angebot",
  grundriss: "Grundriss",
  rendering: "Rendering",
  kueche_bild: "Bild der Küche",
  sonstiges: "Sonstiges",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !lead) notFound();

  const [filesResult, auctionsResult, callsResult] = await Promise.all([
    supabaseAdmin
      .from("lead_files")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("auctions")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("qualification_calls")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const files = filesResult.data ?? [];
  const auctions = auctionsResult.data ?? [];
  const calls = callsResult.data ?? [];

  const auction = auctions[0] ?? null;
  let specItems: Array<Record<string, unknown> & { id: string }> = [];
  if (auction) {
    const { data } = await supabaseAdmin
      .from("auction_spec_items")
      .select("*")
      .eq("auction_id", auction.id)
      .order("sort_order", { ascending: true });
    specItems = data ?? [];
  }

  return (
    <div>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-700"
      >
        <ChevronLeft className="h-4 w-4" /> Zurück zur Lead-Queue
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Lead #{String(lead.id).slice(0, 8)}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <FunnelBadge type={lead.funnel_type} />
            <StatusBadge status={lead.status} />
            <TierBadge tier={lead.tier} />
            <span>Score: <strong className="text-ink">{lead.score}</strong></span>
            <span>· erstellt {new Date(lead.created_at).toLocaleString("de-DE")}</span>
          </div>
        </div>
        <LeadQuickActions
          leadId={lead.id}
          status={lead.status}
          funnelType={lead.funnel_type}
          hasAuction={auction !== null}
          variant="full"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div className="space-y-6">
          {/* Contact + core fields editor */}
          <section className="card">
            <h2 className="font-semibold text-ink">Kontakt & Kern-Daten</h2>
            <div className="mt-4">
              <LeadEditor
                leadId={lead.id}
                initial={{
                  status: lead.status,
                  tier: lead.tier,
                  score: lead.score,
                  first_name: lead.first_name ?? "",
                  last_name: lead.last_name ?? "",
                  email: lead.email ?? "",
                  phone: lead.phone ?? "",
                  postal_code: lead.postal_code ?? "",
                  city: lead.city ?? "",
                  address_line: lead.address_line ?? "",
                  housing_type: lead.housing_type ?? "",
                  budget_midpoint: lead.budget_midpoint ?? "",
                  existing_offer_studio: lead.existing_offer_studio ?? "",
                  existing_offer_price_eur:
                    lead.existing_offer_price_cents != null
                      ? Number(lead.existing_offer_price_cents) / 100
                      : "",
                  payment_down_payment_percent: lead.payment_down_payment_percent ?? "",
                  payment_financing: lead.payment_financing ?? "",
                  payment_financing_apr: lead.payment_financing_apr ?? "",
                  payment_financing_months: lead.payment_financing_months ?? "",
                  delivery_mode: lead.delivery_mode ?? "",
                  desired_delivery_at: lead.desired_delivery_at ?? "",
                  waste_separation_system:
                    lead.waste_separation_system === true
                      ? "yes"
                      : lead.waste_separation_system === false
                        ? "no"
                        : "",
                }}
              />
            </div>
          </section>

          {/* Auction */}
          {auction && (
            <section className="card">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-ink">
                  <Gavel className="h-4 w-4 text-brand-700" />
                  Auktion
                </h2>
                <AuctionStatusBadge status={auction.status} published={auction.is_published} />
              </div>
              <div className="mt-4">
                <AuctionEditor
                  auctionId={auction.id}
                  initial={{
                    offer_price_eur: auction.offer_price_eur ?? "",
                    duration_hours: auction.duration_hours ?? 72,
                    min_bid_eur: auction.min_bid_eur ?? "",
                    status: auction.status,
                  }}
                  startsAt={auction.starts_at}
                  endsAt={auction.ends_at}
                  initialSpecItems={specItems}
                />
              </div>
            </section>
          )}

          {/* Funnel-Answers (raw) */}
          {lead.funnel_answers && Object.keys(lead.funnel_answers).length > 0 && (
            <section className="card">
              <h2 className="font-semibold text-ink">Roh-Antworten aus dem Funnel</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Kompletter JSON-Blob, wie ihn der Funnel gesendet hat.
              </p>
              <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-surface-soft p-3 text-xs text-ink-muted">
                {JSON.stringify(lead.funnel_answers, null, 2)}
              </pre>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          <section className="card">
            <h3 className="text-sm font-semibold text-ink">Schnellinfo</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> {lead.email ?? <span className="text-ink-subtle">–</span>}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> {lead.phone ?? <span className="text-ink-subtle">–</span>}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {lead.postal_code} {lead.city ?? ""}
              </li>
              <li>UTM: <span className="font-mono text-xs">{lead.utm_source ?? "-"} / {lead.utm_campaign ?? "-"}</span></li>
              <li>Consent Anruf: {lead.consent_call ? "ja" : "nein"}</li>
              <li>Consent Marketing: {lead.consent_marketing ? "ja" : "nein"}</li>
            </ul>
          </section>

          <section className="card">
            <h3 className="text-sm font-semibold text-ink">Uploads ({files.length})</h3>
            {files.length === 0 ? (
              <p className="mt-2 text-xs text-ink-subtle">Keine Dateien.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {files.map((f) => {
                  const Icon = FILE_ICONS[f.category] ?? FileText;
                  return (
                    <li key={f.id} className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 text-brand-700" />
                      <div className="min-w-0 flex-1">
                        <a
                          href={`/api/admin/leads/${lead.id}/files/${f.id}`}
                          className="block truncate text-brand-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {f.file_name}
                        </a>
                        <div className="text-xs text-ink-subtle">
                          {FILE_LABELS[f.category] ?? f.category} ·{" "}
                          {(f.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card">
            <h3 className="text-sm font-semibold text-ink">Calls ({calls.length})</h3>
            {calls.length === 0 ? (
              <p className="mt-2 text-xs text-ink-subtle">Noch keine Calls dokumentiert.</p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {calls.map((c) => (
                  <li key={c.id} className="border-l-2 border-brand-200 pl-2">
                    <div className="font-medium text-ink">{c.outcome}</div>
                    <div className="text-xs text-ink-muted">
                      {new Date(c.created_at).toLocaleString("de-DE")}
                    </div>
                    {c.notes && <div className="mt-1 text-xs text-ink-muted">{c.notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FunnelBadge({ type }: { type: string }) {
  const isB = type === "b";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isB ? "bg-brand-100 text-brand-800" : "bg-accent-50 text-accent-700"
      }`}
    >
      Funnel {(type ?? "a").toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="chip">{status}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    hot: "bg-red-100 text-red-700",
    premium: "bg-amber-100 text-amber-700",
    qualified: "bg-blue-100 text-blue-700",
    standard: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[tier] ?? "bg-slate-100"}`}>
      {tier}
    </span>
  );
}

function AuctionStatusBadge({ status, published }: { status: string; published?: boolean }) {
  const map: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    active: "bg-accent-100 text-accent-700",
    completed: "bg-brand-100 text-brand-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className="flex items-center gap-2 text-xs">
      <span className={`rounded-full px-2 py-0.5 font-semibold ${map[status] ?? "bg-slate-100"}`}>{status}</span>
      {published && <span className="chip-success">live</span>}
    </span>
  );
}
