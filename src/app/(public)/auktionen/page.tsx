import Link from "next/link";
import { Gavel, Clock, MapPin, ShieldCheck, Lock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Aktive Küchen-Auktionen – KüchenWert",
};

export const dynamic = "force-dynamic";

export default async function AuctionsPublicPage() {
  // Eingeloggter Dealer? Dann optional CTA „Mein Bereich"
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isDealer = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isDealer = profile?.role === "dealer" || profile?.role === "admin";
  }

  const { data: auctionsRaw } = await supabaseAdmin
    .from("auctions")
    .select("id, status, offer_price_eur, ends_at, leads!inner(postal_code, region, tier, kitchen_form, kitchen_style, budget_midpoint, funnel_type)")
    .eq("status", "active")
    .eq("is_published", true)
    .order("ends_at", { ascending: true })
    .limit(60);

  type AuctionRow = {
    id: string;
    status: string;
    offer_price_eur: number | null;
    ends_at: string | null;
    leads: {
      postal_code: string;
      region: string | null;
      tier: string;
      kitchen_form: string | null;
      budget_midpoint: number | null;
    } | null;
  };
  const auctions = (auctionsRaw ?? []) as unknown as AuctionRow[];

  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-brand-100 text-brand-700">
            <Gavel className="h-6 w-6" />
          </div>
          <h1 className="mt-4 h-section">Aktive Küchen-Auktionen</h1>
          <p className="mt-3 text-lead mx-auto max-w-2xl">
            Verifizierte Händler bieten in 72h-Rückwärtsauktionen auf bestehende
            Kunden-Angebote. Verbraucherdaten werden erst nach Auktionssieg sichtbar.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {isDealer ? (
              <Link href="/dealer/auctions" className="btn-primary"><Lock className="h-4 w-4" /> Zu meinem Händler-Bereich</Link>
            ) : (
              <Link href="/auth/login" className="btn-primary"><Lock className="h-4 w-4" /> Händler-Login zum Bieten</Link>
            )}
            <Link href="/funnel/b" className="btn-secondary">Eigene Auktion starten</Link>
          </div>
        </div>

        <div className="mt-12">
          {auctions.length === 0 ? (
            <div className="rounded-card border-2 border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Gavel className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                Gerade keine offenen Auktionen
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                Neue 72-Stunden-Auktionen entstehen, sobald Verbraucher ihr
                bestehendes Kuechenstudio-Angebot bei uns einreichen.
                Schauen Sie spaeter wieder vorbei oder lassen Sie sich
                benachrichtigen.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {isDealer ? (
                  <Link href="/dealer/dashboard" className="btn-secondary">
                    Zum Haendler-Dashboard
                  </Link>
                ) : (
                  <Link href="/auth/register-dealer" className="btn-secondary">
                    Als Haendler registrieren
                  </Link>
                )}
                <Link href="/funnel/b" className="btn-primary">
                  Eigene Auktion starten
                </Link>
              </div>
              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-left">
                <PreviewTeaser
                  title="L-Form, modern"
                  plz="80xxx"
                  studioPrice="22.500 €"
                />
                <PreviewTeaser
                  title="Kochinsel, premium"
                  plz="50xxx"
                  studioPrice="38.900 €"
                />
                <PreviewTeaser
                  title="Kuechenzeile"
                  plz="20xxx"
                  studioPrice="14.300 €"
                />
              </div>
              <p className="mt-3 text-xs text-ink-subtle">
                Beispiele - so sehen aktive Auktionen aus.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {auctions.map((a) => {
                const lead = a.leads;
                const endsIn = a.ends_at ? msToHuman(new Date(a.ends_at).getTime() - Date.now()) : null;
                return (
                  <article key={a.id} className="card flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="chip uppercase">{lead?.tier ?? "standard"}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Clock className="h-3 w-3" />
                        {endsIn ?? "–"}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold text-ink">
                      {lead?.kitchen_form ?? "Küche"} · {lead?.region ?? ""}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                      <MapPin className="h-3 w-3" />
                      PLZ-Bereich {lead?.postal_code?.slice(0, 3)}xx
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-ink-subtle uppercase tracking-wider">Studio-Preis</dt>
                        <dd className="font-semibold text-ink">{a.offer_price_eur ? `${Number(a.offer_price_eur).toLocaleString("de-DE")} €` : "–"}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-subtle uppercase tracking-wider">Budget</dt>
                        <dd className="font-semibold text-ink">{lead?.budget_midpoint ? `~${Number(lead.budget_midpoint).toLocaleString("de-DE")} €` : "–"}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto pt-4">
                      {isDealer ? (
                        <Link href={`/dealer/auctions/${a.id}`} className="btn-secondary w-full">Zur Auktion & bieten</Link>
                      ) : (
                        <Link href={`/auth/login?next=/dealer/auctions/${a.id}`} className="btn-secondary w-full"><Lock className="h-4 w-4" /> Login zum Bieten</Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 rounded-card border border-slate-200 bg-white p-6 text-center text-sm text-ink-muted">
          <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-accent-600" />
          Niedrigstes Gebot bei Auktionsende gewinnt automatisch. Alle Gebote sind
          verbindlich · DSGVO-konform.
        </div>
      </div>
    </section>
  );
}

function PreviewTeaser({
  title,
  plz,
  studioPrice,
}: {
  title: string;
  plz: string;
  studioPrice: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-slate-200 bg-surface-soft p-3">
      <div className="text-xs font-semibold text-ink">{title}</div>
      <div className="mt-1 text-[11px] text-ink-muted">{plz}</div>
      <div className="mt-2 text-[11px] text-ink-subtle">Studio-Preis</div>
      <div className="text-sm font-semibold text-ink">{studioPrice}</div>
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" aria-hidden="true" />
    </div>
  );
}

function msToHuman(ms: number): string {
  if (ms <= 0) return "endet jetzt";
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${h}h ${m}m`;
}
