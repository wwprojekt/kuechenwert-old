import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Gavel,
  Clock,
  MapPin,
  ShieldCheck,
  Trophy,
  User,
  Mail,
  Phone,
  Home,
} from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BidForm } from "@/components/dealer/bid-form";

export const dynamic = "force-dynamic";

export default async function DealerAuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireDealer(`/dealer/auctions/${id}`);

  // ACHTUNG: Schema hat min_bid_eur, NICHT min_bid_amount.
  const { data: auction } = await supabaseAdmin
    .from("auctions")
    .select(`
      id, status, offer_price_eur, duration_hours, min_bid_eur,
      starts_at, ends_at, is_published, won_bid_id,
      leads (
        id, postal_code, city, region, tier, housing_type,
        kitchen_form, kitchen_style, budget_midpoint,
        existing_offer_price_cents, payment_financing,
        delivery_mode, desired_delivery_at, waste_separation_system,
        funnel_answers,
        first_name, last_name, email, phone, address_line
      )
    `)
    .eq("id", id)
    .single();
  if (!auction || !auction.is_published) notFound();

  const lead = (auction as unknown as { leads: Record<string, unknown> | null }).leads;
  const [specsResult, bidsResult] = await Promise.all([
    supabaseAdmin
      .from("auction_spec_items")
      .select("*")
      .eq("auction_id", id)
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("bids")
      .select("id, dealer_id, price_eur, delivery_weeks, montage_included, created_at, is_winning")
      .eq("auction_id", id)
      .order("price_eur", { ascending: true }),
  ]);
  const specs = specsResult.data ?? [];
  const bids = bidsResult.data ?? [];

  const lowestBid = bids[0];
  const ownBids = bids.filter((b) => b.dealer_id === ctx.dealer.id);
  const ownLowest = ownBids[0];

  const isActive = auction.status === "active" && auction.ends_at && new Date(auction.ends_at) > new Date();
  const isCompleted = auction.status === "completed";
  const isWinner = isCompleted && auction.won_bid_id && bids.some((b) => b.id === auction.won_bid_id && b.dealer_id === ctx.dealer.id);

  // Maximaler Bid = aktuelles Lowest (oder Studio-Preis - 1€); Default-Mindeststep
  const minBidStep = Number(auction.min_bid_eur) || 50;
  const maxAllowedEur = lowestBid
    ? Math.max(0, Number(lowestBid.price_eur) - minBidStep)
    : auction.offer_price_eur
      ? Math.max(0, Number(auction.offer_price_eur) - minBidStep)
      : null;

  return (
    <div>
      <Link href="/dealer/auctions" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-700">
        <ChevronLeft className="h-4 w-4" /> Zurück zur Auktions-Übersicht
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Gavel className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">
          Auktion {String(auction.id).slice(0, 8)}
        </h1>
        <span className="chip uppercase">{lead?.tier as string}</span>
        <span className="text-sm text-ink-muted">
          <MapPin className="mr-1 inline h-3 w-3" />
          {lead?.postal_code as string} {(lead?.city as string) ?? ""}
        </span>
      </div>

      {isWinner && (
        <section className="mt-4 overflow-hidden rounded-2xl border-2 border-success-500/40 bg-gradient-to-br from-success-500/10 via-white to-brand-50 shadow-card">
          <header className="flex items-center gap-3 border-b border-success-500/20 bg-success-500/5 px-5 py-3">
            <Trophy className="h-5 w-5 text-success-700" />
            <h2 className="font-display text-lg font-bold text-success-700">
              Sie haben gewonnen — Kundendaten freigeschaltet
            </h2>
          </header>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <ContactRow
              icon={<User className="h-4 w-4" />}
              label="Name"
              value={[lead?.first_name, lead?.last_name].filter(Boolean).join(" ") || "–"}
            />
            <ContactRow
              icon={<Phone className="h-4 w-4" />}
              label="Telefon"
              value={
                lead?.phone ? (
                  <a href={`tel:${lead.phone}`} className="font-bold text-brand-700 hover:underline">
                    {lead.phone as string}
                  </a>
                ) : (
                  "–"
                )
              }
            />
            <ContactRow
              icon={<Mail className="h-4 w-4" />}
              label="E-Mail"
              value={
                lead?.email ? (
                  <a href={`mailto:${lead.email}`} className="font-bold text-brand-700 hover:underline">
                    {lead.email as string}
                  </a>
                ) : (
                  "–"
                )
              }
            />
            <ContactRow
              icon={<Home className="h-4 w-4" />}
              label="Lieferadresse"
              value={[lead?.address_line, [lead?.postal_code, lead?.city].filter(Boolean).join(" ")]
                .filter(Boolean)
                .join(", ") || "–"}
            />
          </div>
          <footer className="border-t border-success-500/20 bg-success-500/5 px-5 py-3 text-xs text-ink-muted">
            <strong>Verbindlichkeitshinweis:</strong> Mit dem gewonnenen Gebot ist die
            Auftragserteilung verbindlich. Bitte kontaktieren Sie den Kunden binnen
            48 Stunden zur Auftragsabwicklung.
          </footer>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* MAIN */}
        <div className="space-y-6">
          {/* Lead-Specs */}
          <section className="card">
            <h2 className="mb-3 font-semibold text-ink">Eckdaten der Küche</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Item label="Form" value={lead?.kitchen_form as string} />
              <Item label="Stil" value={lead?.kitchen_style as string} />
              <Item label="Budget" value={lead?.budget_midpoint ? `~${Number(lead.budget_midpoint).toLocaleString("de-DE")} €` : null} />
              <Item label="Studio-Preis (Vergleich)" value={lead?.existing_offer_price_cents ? `${(Number(lead.existing_offer_price_cents) / 100).toLocaleString("de-DE")} €` : null} />
              <Item label="Wohnsituation" value={lead?.housing_type === "owned" ? "Eigentum" : lead?.housing_type === "rented" ? "Miete" : null} />
              <Item label="Gewünschte Lieferung" value={lead?.desired_delivery_at ? new Date(lead.desired_delivery_at as string).toLocaleDateString("de-DE") : null} />
              <Item label="Lieferung & Montage" value={lead?.delivery_mode as string} />
              <Item label="Zahlung / Finanzierung" value={lead?.payment_financing as string} />
              <Item label="Mülltrennsystem" value={lead?.waste_separation_system === true ? "ja" : lead?.waste_separation_system === false ? "nein" : null} />
            </dl>
          </section>

          {/* Auction spec items */}
          <section className="card">
            <h2 className="mb-3 font-semibold text-ink">Auktions-Positionen ({specs.length})</h2>
            {specs.length === 0 ? (
              <p className="text-sm text-ink-muted">Keine Positionen erfasst.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-soft text-ink-subtle">
                    <tr>
                      <th className="px-3 py-2">Kategorie</th>
                      <th className="px-3 py-2">Bezeichnung</th>
                      <th className="px-3 py-2">Marke / Modell</th>
                      <th className="px-3 py-2">Material / Design</th>
                      <th className="px-3 py-2">Menge</th>
                      <th className="px-3 py-2">Notizen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specs.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 font-medium">{s.category}</td>
                        <td className="px-3 py-2">{s.label}</td>
                        <td className="px-3 py-2">{[s.brand, s.model].filter(Boolean).join(" · ") || "–"}</td>
                        <td className="px-3 py-2">{[s.material, s.designation].filter(Boolean).join(" · ") || "–"}</td>
                        <td className="px-3 py-2">{s.quantity ?? 1}</td>
                        <td className="px-3 py-2 text-ink-subtle">{s.notes ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Alle Gebote */}
          <section className="card">
            <h2 className="mb-3 font-semibold text-ink">Aktuelle Gebote ({bids.length})</h2>
            {bids.length === 0 ? (
              <p className="text-sm text-ink-muted">Noch keine Gebote.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {bids.slice(0, 10).map((b, i) => {
                  const isOwn = b.dealer_id === ctx.dealer.id;
                  return (
                    <li key={b.id} className={`flex items-center justify-between rounded-md border p-3 ${isOwn ? "border-brand-300 bg-brand-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-strong text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>
                          <strong className="text-ink">{Number(b.price_eur).toLocaleString("de-DE")} €</strong>
                          {b.delivery_weeks && <span className="ml-2 text-xs text-ink-muted">· {b.delivery_weeks} Wochen Lieferzeit</span>}
                          {b.montage_included && <span className="ml-2 text-xs text-ink-muted">· inkl. Montage</span>}
                          {isOwn && <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Sie</span>}
                          {b.is_winning && <span className="ml-2 rounded-full bg-accent-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Sieger</span>}
                        </span>
                      </div>
                      <span className="text-xs text-ink-subtle">{new Date(b.created_at).toLocaleString("de-DE")}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {/* SIDEBAR – Bid form */}
        <aside className="space-y-4">
          <section className="card">
            <div className="text-xs uppercase tracking-wider text-ink-subtle">Status</div>
            <div className="mt-1 text-2xl font-bold text-ink">
              {isCompleted ? "Beendet" : isActive ? "Live" : "Geschlossen"}
            </div>
            {auction.ends_at && (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                <Clock className="h-3 w-3" />
                {isCompleted ? "endete am" : "endet"} {new Date(auction.ends_at).toLocaleString("de-DE")}
              </p>
            )}

            <hr className="my-4 border-slate-200" />

            <div className="text-xs uppercase tracking-wider text-ink-subtle">Studio-Vergleichspreis</div>
            <div className="text-lg font-semibold text-ink">
              {auction.offer_price_eur ? `${Number(auction.offer_price_eur).toLocaleString("de-DE")} €` : "–"}
            </div>

            {lowestBid && (
              <>
                <div className="mt-3 text-xs uppercase tracking-wider text-ink-subtle">Aktuell niedrigstes Gebot</div>
                <div className="text-lg font-semibold text-accent-700">
                  {Number(lowestBid.price_eur).toLocaleString("de-DE")} €
                </div>
              </>
            )}

            {ownLowest && (
              <p className="mt-2 rounded-md bg-brand-50 p-2 text-xs text-brand-800">
                Ihr bestes Gebot: <strong>{Number(ownLowest.price_eur).toLocaleString("de-DE")} €</strong>
              </p>
            )}
          </section>

          {isActive && (
            <section className="card">
              <h3 className="mb-2 font-semibold text-ink">Verbindliches Gebot abgeben</h3>
              <p className="mb-3 text-xs text-ink-muted">
                Ihr Gebot ist nach Abgabe verbindlich. Mindeststep:{" "}
                <strong>{minBidStep} €</strong> unter dem aktuell besten Preis.
              </p>
              <BidForm
                auctionId={auction.id}
                maxAllowedEur={maxAllowedEur}
                minBidStep={minBidStep}
                offerPriceEur={auction.offer_price_eur ? Number(auction.offer_price_eur) : null}
                lowestBidEur={lowestBid ? Number(lowestBid.price_eur) : null}
              />
            </section>
          )}

          <section className="card text-xs text-ink-muted">
            <ShieldCheck className="mb-1 h-4 w-4 text-accent-600" />
            Niedrigstes Gebot bei Auktionsende gewinnt automatisch. Beide Seiten
            (Verbraucher + Händler) sind dann verbindlich gebunden.
          </section>
        </aside>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="text-ink">{value ?? "–"}</dd>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-success-500/15 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-subtle">
        <span className="text-success-700">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}
