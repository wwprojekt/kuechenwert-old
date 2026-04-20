import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Mail, Phone, User, ShieldAlert } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LeadBuyButton } from "@/components/dealer/lead-buy-button";

export const dynamic = "force-dynamic";

export default async function DealerLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireDealer(`/dealer/leads/${id}`);

  // Lead laden (admin-rechte, RLS sieht der Dealer eh nur teilweise – wir filtern Felder selbst)
  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();
  if (!lead) notFound();

  // Bereits von diesem Dealer gekauft?
  const { data: ownPurchase } = await supabaseAdmin
    .from("match_candidates")
    .select("id, is_purchased, purchased_at, price_cents")
    .eq("lead_id", id)
    .eq("dealer_id", ctx.dealer.id)
    .maybeSingle();

  // Bereits von einem ANDEREN Dealer first-come gekauft?
  const { data: anyPurchase } = await supabaseAdmin
    .from("match_candidates")
    .select("id, dealer_id, purchased_at, is_purchased")
    .eq("lead_id", id)
    .eq("is_purchased", true)
    .maybeSingle();

  const isOwn = ownPurchase?.is_purchased === true;
  const isSoldElsewhere = !!anyPurchase && !isOwn;

  // Preis berechnen
  let priceCents: number | null = null;
  if (lead.budget_midpoint && lead.tier) {
    const { data: p } = await supabaseAdmin.rpc("calculate_lead_price_cents", {
      p_budget_cents: Number(lead.budget_midpoint) * 100,
      p_tier: lead.tier,
    });
    priceCents = p as number | null;
  }

  // View-Tracking (best effort)
  if (!isOwn) {
    await supabaseAdmin.from("lead_views").insert({ lead_id: id, dealer_id: ctx.dealer.id });
  }

  return (
    <div>
      <Link href="/dealer/leads" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-700">
        <ChevronLeft className="h-4 w-4" /> Zurück zum Lead-Marktplatz
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">
          Lead {String(lead.id).slice(0, 8)}
        </h1>
        <span className="chip uppercase">{lead.tier}</span>
        <span className="text-sm text-ink-muted">
          PLZ {lead.postal_code} · {lead.region ?? ""}
        </span>
      </div>

      {isSoldElsewhere && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <ShieldAlert className="mr-1 inline h-4 w-4" />
          Dieser Lead wurde am {new Date(anyPurchase!.purchased_at!).toLocaleString("de-DE")} bereits exklusiv von einem anderen Händler gesichert.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div className="space-y-6">
          {/* Konfiguration */}
          <section className="card">
            <h2 className="mb-3 font-semibold text-ink">Küchen-Konfiguration</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Item label="Form" value={lead.kitchen_form} />
              <Item label="Stil" value={lead.kitchen_style} />
              <Item label="Budget" value={lead.budget_midpoint ? `~${Number(lead.budget_midpoint).toLocaleString("de-DE")} €` : null} />
              <Item label="Wohnsituation" value={lead.housing_type === "owned" ? "Eigentum" : lead.housing_type === "rented" ? "Miete" : null} />
              <Item label="Zeitrahmen" value={lead.timeframe_months ? `${lead.timeframe_months} Monate` : null} />
              <Item label="Bereits Angebot vorliegend" value={lead.has_existing_offer ? "ja" : "nein"} />
              <Item label="Anlass" value={lead.purchase_reason} />
              <Item label="Score" value={String(lead.score ?? 0)} />
            </dl>
            {Array.isArray(lead.special_wishes) && lead.special_wishes.length > 0 && (
              <div className="mt-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Wünsche</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {lead.special_wishes.map((w: string) => (
                    <span key={w} className="rounded-full bg-surface-strong px-2 py-0.5 text-xs">{w}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Kontakt – nur nach Kauf */}
          <section className="card">
            <h2 className="mb-3 font-semibold text-ink">Kontaktdaten</h2>
            {isOwn ? (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-ink-muted" /> {lead.first_name} {lead.last_name}</p>
                {lead.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-muted" /> <a href={`mailto:${lead.email}`} className="text-brand-700 hover:underline">{lead.email}</a></p>}
                {lead.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-muted" /> <a href={`tel:${lead.phone}`} className="text-brand-700 hover:underline">{lead.phone}</a></p>}
                {(lead.address_line || lead.city) && (
                  <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-ink-muted" />
                    <span>{lead.address_line ?? ""}<br />{lead.postal_code} {lead.city ?? ""}</span>
                  </p>
                )}
                <p className="text-xs text-ink-subtle">
                  {lead.consent_call ? "✓ Anruf-Einwilligung erteilt" : "⚠ keine Anruf-Einwilligung"}
                </p>
              </div>
            ) : (
              <div className="rounded-md bg-surface-soft p-4 text-sm text-ink-muted">
                <ShieldAlert className="mr-1 inline h-4 w-4 text-amber-600" />
                Kontaktdaten (Name, E-Mail, Telefon, Adresse) werden erst nach Lead-Kauf freigegeben.
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          <section className="card">
            <div className="text-xs uppercase tracking-wider text-ink-subtle">Lead-Preis</div>
            <div className="mt-1 text-3xl font-bold text-ink">
              {priceCents != null ? `${(priceCents / 100).toFixed(2)} €` : "k. A."}
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Wird vom Wallet abgezogen. Exklusiv für Sie nach Kauf.
            </p>
            <div className="mt-4">
              {isOwn ? (
                <div className="rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-800">
                  ✓ Sie haben diesen Lead am{" "}
                  {ownPurchase?.purchased_at && new Date(ownPurchase.purchased_at).toLocaleString("de-DE")}{" "}
                  gekauft.
                </div>
              ) : isSoldElsewhere ? (
                <button disabled className="btn-primary w-full opacity-50">Bereits verkauft</button>
              ) : priceCents == null ? (
                <button disabled className="btn-primary w-full opacity-50">Preis noch nicht konfiguriert</button>
              ) : ctx.dealer.wallet_balance_cents < priceCents ? (
                <div className="space-y-2">
                  <button disabled className="btn-primary w-full opacity-50">Wallet zu gering</button>
                  <Link href="/dealer/wallet" className="block text-center text-xs text-brand-700 hover:underline">
                    → Wallet aufladen
                  </Link>
                </div>
              ) : (
                <LeadBuyButton leadId={id} priceCents={priceCents} />
              )}
            </div>
          </section>

          <section className="card text-xs text-ink-muted">
            <strong className="text-ink">Wichtig:</strong> Nach dem Kauf liegt der Lead exklusiv bei
            Ihnen (First-come). Der Verbraucher hat einer Kontaktaufnahme zugestimmt.
          </section>
        </aside>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="text-ink">{value ?? "–"}</dd>
    </div>
  );
}
