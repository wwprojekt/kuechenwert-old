import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Gavel,
  Search,
  ClipboardCheck,
  Headphones,
  Wallet,
  Clock,
  Users,
  TrendingDown,
  Award,
  MapPin,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "Ist der Service wirklich kostenlos?",
    a: "Ja, für Sie als Verbraucher ist KüchenWert komplett kostenlos und unverbindlich. Wir finanzieren uns über Provisionen der Küchenstudios.",
  },
  {
    q: "Wie funktioniert der Vergleich eines bestehenden Angebots?",
    a: "Sie geben uns die Eckdaten Ihres Angebots (Hersteller, Fronten, Arbeitsplatte, Geräte usw.) und laden falls vorhanden Angebot, Grundriss oder Foto hoch. Ein Experte ruft Sie an und ergänzt fehlende Details. Anschließend stellen wir Ihre Anfrage neutralisiert in eine 72-Stunden-Auktion ein – verifizierte Händler unterbieten den Preis Ihres Studios.",
  },
  {
    q: "Wie verbindlich ist die Auktion?",
    a: "Beide Seiten sind verbindlich gebunden: Der Händler muss zum gebotenen Preis liefern, und Sie verpflichten sich, das beste Angebot anzunehmen. Bei grundlosem Abbruch wird eine Bearbeitungsgebühr fällig.",
  },
  {
    q: "Warum kann ein anderes Studio meine Küche günstiger anbieten?",
    a: "Küchenstudios kalkulieren mit unterschiedlichen Margen, Konditionen und Auslastung. Durch echten Wettbewerb auf einer neutralen Spec-Liste werden Preisunterschiede sichtbar – häufig zwischen 5 % und 25 %.",
  },
  {
    q: "Was passiert mit meinen Daten?",
    a: "Ihre Kontaktdaten (Name, Adresse, Telefon, E-Mail) sehen Händler erst nach erfolgter Lead-Freischaltung bzw. Auktions-Abschluss. SSL-Verschlüsselung, Server in Deutschland, DSGVO-konform.",
  },
  {
    q: "Welche Dokumente kann ich hochladen?",
    a: "Bei einem bestehenden Angebot: Angebotszettel/PDF, Grundriss, Fotos der konfigurierten Küche. Alle Formate gängig (JPG, PNG, PDF). Optional, aber empfohlen für treffsichere Gebote.",
  },
];

const KITCHEN_BRANDS = [
  "Nobilia",
  "Häcker",
  "Schüller",
  "Nolte",
  "Bauformat",
  "Bauknecht",
  "Pino",
  "Beckermann",
  "Burger",
  "ALNO",
  "Leicht",
  "next125",
];

type AuctionTeaser = {
  id: string;
  postal_code: string | null;
  region: string | null;
  tier: string | null;
  kitchen_form: string | null;
  budget_midpoint: number | null;
  offer_price_eur: number | null;
  ends_at: string | null;
};

async function fetchTeaserAuctions(): Promise<AuctionTeaser[]> {
  try {
    const { data } = await supabaseAdmin
      .from("auctions")
      .select(
        "id, offer_price_eur, ends_at, leads!inner(postal_code, region, tier, kitchen_form, budget_midpoint)"
      )
      .eq("status", "active")
      .eq("is_published", true)
      .order("ends_at", { ascending: true })
      .limit(3);

    type Row = {
      id: string;
      offer_price_eur: number | null;
      ends_at: string | null;
      leads: {
        postal_code: string | null;
        region: string | null;
        tier: string | null;
        kitchen_form: string | null;
        budget_midpoint: number | null;
      } | null;
    };
    const rows = (data ?? []) as unknown as Row[];
    return rows.map((r) => ({
      id: r.id,
      postal_code: r.leads?.postal_code ?? null,
      region: r.leads?.region ?? null,
      tier: r.leads?.tier ?? null,
      kitchen_form: r.leads?.kitchen_form ?? null,
      budget_midpoint: r.leads?.budget_midpoint ?? null,
      offer_price_eur: r.offer_price_eur,
      ends_at: r.ends_at,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const liveAuctions = await fetchTeaserAuctions();

  return (
    <>
      {/* ======================== HERO ======================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-soft via-white to-surface-soft pb-16 pt-12 lg:pb-24 lg:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.10),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_at_top_left,_rgba(15,118,110,0.08),_transparent_55%)]" />

        <div className="section-container relative">
          {/* Live-Trust-Strip */}
          <div className="mx-auto mb-8 flex max-w-fit items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            </span>
            <span className="text-xs font-medium text-ink-muted">
              <span className="font-semibold text-ink">12 Händler</span> suchen
              gerade Küchen-Anfragen in Ihrer Region
            </span>
          </div>

          {/* MOBILE-FIRST: Wahl-Wizard zuerst, Text danach */}
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            {/* LINKS: Headline + Trust */}
            <div className="order-2 lg:order-1">
              <span className="eyebrow">Transparenz für Ihren Küchenkauf</span>
              <h1 className="mt-3 h-display">
                Ihre neue Küche.
                <br />
                Zum{" "}
                <span className="hl-mark">besten Preis</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
                Vergleichen Sie ein bestehendes Studio-Angebot oder erhalten Sie
                neue Angebote von verifizierten Händlern in Ihrer Region –
                kostenlos, unverbindlich, in 72 Stunden Klarheit.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link href="/funnel/b" className="btn-primary">
                  Angebot vergleichen
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/funnel/a" className="btn-secondary">
                  Angebot erhalten
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-md">
                {[
                  { icon: <CheckCircle2 className="h-4 w-4" />, text: "100 % kostenlos" },
                  { icon: <ShieldCheck className="h-4 w-4" />, text: "DSGVO-konform" },
                  { icon: <Award className="h-4 w-4" />, text: "Verifizierte Händler" },
                  { icon: <Clock className="h-4 w-4" />, text: "72-h-Auktion" },
                ].map((item) => (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-2 text-sm text-ink-muted"
                  >
                    <span className="text-success-600">{item.icon}</span>
                    {item.text}
                  </span>
                ))}
              </div>

              <div className="mt-8 hidden items-center gap-4 lg:flex">
                <div className="flex -space-x-2">
                  {["#dbe7f4", "#d1fae5", "#fde68a", "#fecaca"].map((bg, i) => (
                    <span
                      key={i}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-semibold text-ink"
                      style={{ background: bg }}
                    >
                      {["MK", "JS", "TL", "AB"][i]}
                    </span>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-ink">2.400+ Verbraucher</div>
                  <div className="text-xs text-ink-muted">
                    haben bereits gespart – Ø 18 % Ersparnis
                  </div>
                </div>
              </div>
            </div>

            {/* RECHTS: Wahl-Wizard-Card */}
            <div className="relative order-1 lg:order-2">
              {/* Visual-Composition (Küchen-Tile-Look) hinter der Card */}
              <div
                className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100/80 via-teal-50/40 to-transparent blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-6 -top-6 -z-10 hidden h-32 w-32 rotate-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 opacity-90 shadow-card-active lg:block"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-6 -left-6 -z-10 hidden h-24 w-24 -rotate-6 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 opacity-90 shadow-card-active lg:block"
                aria-hidden
              />

              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card-elevated sm:p-8">
                <div className="mb-1 text-sm font-semibold text-brand-700">
                  Wie möchten Sie starten?
                </div>
                <div className="mb-6 text-xs text-ink-muted">
                  Kostenloses Angebot in 2 Minuten · Geprüfte Händler aktuell
                  in Ihrer Region
                </div>

                <div className="grid gap-3">
                  <Link
                    href="/funnel/b"
                    className="group flex items-start gap-4 rounded-xl border-2 border-neutral-200 bg-surface-soft p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:bg-white hover:shadow-card-hover"
                  >
                    <span className="mt-0.5 grid h-11 w-11 flex-none place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-base font-semibold text-ink">
                          Bestehendes Angebot vergleichen
                        </div>
                        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-800">
                          Ø –18 %
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        Sie haben schon ein Angebot? Wir starten eine 72-h-Auktion.
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                        Auktion starten
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/funnel/a"
                    className="group flex items-start gap-4 rounded-xl border-2 border-neutral-200 bg-surface-soft p-5 transition hover:-translate-y-0.5 hover:border-accent-500 hover:bg-white hover:shadow-card-hover"
                  >
                    <span className="mt-0.5 grid h-11 w-11 flex-none place-items-center rounded-lg bg-accent-100 text-accent-700">
                      <Search className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-base font-semibold text-ink">
                          Angebot erhalten
                        </div>
                        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-800">
                          2 Min
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        Sie planen neu? Bis zu 3 Studios erstellen Angebote
                        für Sie.
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent-700 group-hover:text-accent-800">
                        Anfrage starten
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-ink-subtle">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-success-600" />
                    100 % kostenlos
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    Unverbindlich
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-success-600" />
                    In 2 Min. fertig
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== STATS-STRIP (slim, Zahlen-fokussiert) ======================== */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="section-container">
          <div className="grid grid-cols-2 gap-4 py-8 text-center sm:py-10 md:grid-cols-4">
            <Stat value="72 h" label="Auktionsdauer" />
            <Stat value="bis 25 %" label="Ø Ersparnis" />
            <Stat value="0 €" label="für Verbraucher" />
            <Stat value="100 %" label="verifizierte Händler" />
          </div>
        </div>
      </section>

      {/* ======================== MARKEN-WAND ======================== */}
      <section className="bg-surface-soft py-12 lg:py-16">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Marken &amp; Hersteller</span>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight-2 text-ink sm:text-3xl">
              Alle führenden deutschen Küchenmarken
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Egal welche Marke Ihnen Ihr Studio angeboten hat – unsere
              Partner-Händler beziehen direkt vom Hersteller.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {KITCHEN_BRANDS.map((brand) => (
              <div
                key={brand}
                className="flex h-16 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-center font-display text-sm font-semibold text-ink-muted shadow-card transition hover:border-brand-300 hover:text-brand-700 hover:shadow-card-hover"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== ZWEI WEGE EXPLAINER ======================== */}
      <section className="section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Flexibel &amp; transparent</span>
            <h2 className="mt-2 h-section">Zwei Wege zum besten Preis</h2>
            <p className="mt-3 text-lead">
              Egal ob Sie schon ein konkretes Angebot haben oder bei null
              starten – wir bringen Sie zum fairen Marktpreis.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PathExplainer
              num={1}
              icon={<ClipboardCheck className="h-6 w-6" />}
              tone="brand"
              tag="Reverse-Auktion"
              title="Bestehendes Angebot vergleichen"
              steps={[
                "Eckdaten erfassen (Hersteller, Fronten, Arbeitsplatte, Geräte, Sanitär, Lieferung, Zahlung)",
                "Optional: Angebot, Grundriss und Foto hochladen",
                "Experte ruft Sie an und ergänzt Details",
                "72-h-Auktion: verifizierte Händler unterbieten Ihr Angebot",
                "Sie nehmen das beste Gebot verbindlich an",
              ]}
              cta={{ href: "/funnel/b", label: "Auktion starten" }}
            />
            <PathExplainer
              num={2}
              icon={<Search className="h-6 w-6" />}
              tone="accent"
              tag="Lead-Vermittlung"
              title="Angebot erhalten"
              steps={[
                "Küchenform und Stil wählen",
                "Anlass, Wünsche und Zeitrahmen angeben",
                "Budget &amp; Wohnsituation (Miete / Eigentum) angeben",
                "PLZ und Kontaktdaten",
                "Bis zu 3 verifizierte Studios erstellen kostenlose Angebote",
              ]}
              cta={{ href: "/funnel/a", label: "Anfrage starten" }}
            />
          </div>
        </div>
      </section>

      {/* ======================== LIVE-AUKTIONEN-STRIP ======================== */}
      <section className="bg-surface-strong section-padding">
        <div className="section-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="relative inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-accent-500 align-middle">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent-500 opacity-75" />
                </span>{" "}
                Live aus der Plattform
              </span>
              <h2 className="mt-2 h-section">
                {liveAuctions.length > 0
                  ? "Aktuelle Küchen-Auktionen"
                  : "Beispiel-Auktionen"}
              </h2>
              <p className="mt-2 text-ink-muted">
                {liveAuctions.length > 0
                  ? "Verifizierte Händler bieten gerade auf diese anonymisierten Anfragen."
                  : "So sehen aktive Auktionen auf KüchenWert aus. Ihre Auktion startet in 2 Minuten."}
              </p>
            </div>
            <Link href="/auktionen" className="btn-secondary">
              Alle Auktionen ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {liveAuctions.length > 0
              ? liveAuctions.map((a) => (
                  <AuctionTeaserCard key={a.id} auction={a} live />
                ))
              : DEMO_AUCTIONS.map((a) => (
                  <AuctionTeaserCard key={a.id} auction={a} live={false} />
                ))}
          </div>
        </div>
      </section>

      {/* ======================== VORTEILE 6-GRID ======================== */}
      <section className="section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Ihre Vorteile</span>
            <h2 className="mt-2 h-section">Warum KüchenWert?</h2>
            <p className="mt-3 text-lead">
              Wir kombinieren Marktdruck mit echtem Service – damit Sie nicht
              raten müssen, ob Ihr Preis fair ist.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Benefit
              icon={<Gavel className="h-5 w-5" />}
              title="Echte Reverse-Auktion"
              text="Verifizierte Händler unterbieten sich auf eine neutrale Spec-Liste – kein Vergleich von Äpfeln mit Birnen."
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Verbindlich für beide Seiten"
              text="Der Sieger liefert zum Auktionspreis, Sie nehmen das beste Gebot an. Kein faules Spiel."
            />
            <Benefit
              icon={<Headphones className="h-5 w-5" />}
              title="Persönlicher Experte"
              text="Vor jeder Auktion ruft Sie ein Spec-Experte an und ergänzt fehlende Details."
            />
            <Benefit
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="0 € für Verbraucher"
              text="Keine versteckten Kosten, keine Monatsgebühr. Wir verdienen ausschließlich an erfolgreichen Vermittlungen."
            />
            <Benefit
              icon={<Wallet className="h-5 w-5" />}
              title="Transparente Provision"
              text="Wir kommunizieren offen, was Händler an uns zahlen. Keine versteckte Marge auf Ihrer Küche."
            />
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="DSGVO-konform"
              text="Daten in Deutschland gehostet. Kontaktdaten erst nach verbindlichem Lead-/Auktions-Abschluss sichtbar für Händler."
            />
          </div>
        </div>
      </section>

      {/* ======================== 4-SCHRITTE-PROZESS ======================== */}
      <section className="bg-surface-soft section-padding">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Einfach &amp; schnell</span>
            <h2 className="mt-2 h-section">In 4 Schritten zum besten Preis</h2>
            <p className="mt-3 text-lead">
              Unser optimierter Prozess macht den Vergleich so einfach und
              stressfrei wie möglich.
            </p>
          </div>

          <ol className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Step num={1} time="2 Min" title="Pfad wählen &amp; Daten eingeben" text="Bestehendes Angebot vergleichen oder neues erhalten." />
            <Step num={2} time="optional" title="Dokumente hochladen" text="Angebot, Grundriss oder Foto Ihrer Küche – beschleunigt die Bewertung." />
            <Step num={3} time="24 h" title="Experten-Check" text="Wir prüfen, rufen Sie an und ergänzen fehlende Details kostenlos." />
            <Step num={4} time="72 h" title="Angebote / Auktion" text="Verifizierte Händler bieten – Sie wählen das beste Angebot." />
          </ol>
        </div>
      </section>

      {/* ======================== TESTIMONIAL ======================== */}
      <section className="bg-white py-14">
        <div className="section-container grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">Verifizierte Händler</span>
            <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight-2 text-ink sm:text-3xl">
              Geprüfte Küchenstudios deutschlandweit
            </h3>
            <p className="mt-3 text-ink-muted">
              Alle unsere Partner durchlaufen ein Prüfverfahren (Gewerbeschein,
              Referenzen, Bonität). So profitieren Sie von professionellem
              Service und fairen Preisen durch echten Wettbewerb.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="font-display text-3xl font-extrabold text-brand-900">
                  100 %
                </div>
                <div className="text-sm text-ink-muted">geprüfte Partner</div>
              </div>
              <div>
                <div className="font-display text-3xl font-extrabold text-brand-900">
                  Mo–Fr
                </div>
                <div className="text-sm text-ink-muted">persönlicher Support</div>
              </div>
            </div>
          </div>
          <div className="rounded-card border border-neutral-200 bg-white p-7 shadow-card-elevated">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <span key={i} aria-hidden>★</span>
              ))}
            </div>
            <p className="mt-4 text-base italic text-ink">
              „Hatte ein Angebot über 21.500 € von meinem Küchenstudio. Über
              KüchenWert haben drei Händler geboten – am Ende habe ich die
              gleiche Küche für 17.890 € bekommen. 3.610 € gespart in 72
              Stunden."
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                MK
              </span>
              <div className="text-sm">
                <div className="font-semibold text-ink">Martin K.</div>
                <div className="text-xs text-ink-muted">
                  München · Auktion #1247
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== FAQ ======================== */}
      <section className="border-t border-neutral-200 bg-surface-soft section-padding">
        <div className="section-container max-w-3xl">
          <div className="text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-2 h-section">Häufig gestellte Fragen</h2>
          </div>
          <div className="mt-10 divide-y divide-neutral-200 rounded-card border border-neutral-200 bg-white px-6">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {item.q}
                  <span className="text-2xl font-light text-ink-subtle transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== BOTTOM-CTA ======================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-black py-16 text-white lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.18),_transparent_60%)]" />
        <div className="section-container relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-accent-200 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
            </span>
            Bereit für den fairen Küchenpreis?
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight-2 sm:text-4xl">
            Starten Sie jetzt – kostenlos und in 2 Minuten
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-300">
            Wählen Sie Ihren Pfad und vergleichen Sie schon heute Ihr Angebot
            mit verifizierten Küchenstudios.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/funnel/b" className="btn-accent">
              Bestehendes Angebot vergleichen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/funnel/a"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Angebot erhalten
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-400" />
              Kostenlos &amp; unverbindlich
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-400" />
              Kein Login zum Starten
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent-400" />
              Ergebnis in 72 h
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------- Sub-components ---------------------- */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-display text-3xl font-extrabold tracking-tight-2 text-brand-900 sm:text-4xl lg:text-5xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-muted sm:text-sm">
        {label}
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-accent-50 text-accent-700">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

function Step({
  num,
  time,
  title,
  text,
}: {
  num: number;
  time: string;
  title: string;
  text: string;
}) {
  return (
    <li className="relative rounded-card border border-neutral-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 font-bold text-white shadow-card-active">
          {num}
        </span>
        <span className="rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-700">
          {time}
        </span>
      </div>
      <h3
        className="mt-4 text-base font-semibold text-ink"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
    </li>
  );
}

function PathExplainer({
  num,
  icon,
  tone,
  tag,
  title,
  steps,
  cta,
}: {
  num: number;
  icon: React.ReactNode;
  tone: "brand" | "accent";
  tag: string;
  title: string;
  steps: string[];
  cta: { href: string; label: string };
}) {
  const toneClasses =
    tone === "brand"
      ? "bg-brand-100 text-brand-700"
      : "bg-accent-100 text-accent-700";
  return (
    <div className="card flex flex-col gap-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <span
          className={`grid h-12 w-12 flex-none place-items-center rounded-lg ${toneClasses}`}
        >
          {icon}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                tone === "brand"
                  ? "bg-brand-700 text-white"
                  : "bg-accent-600 text-white"
              }`}
            >
              {num}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              {tag}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
        </div>
      </div>
      <ol className="space-y-2.5 text-sm text-ink-muted">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-surface-strong text-xs font-semibold text-ink">
              {i + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: s }} />
          </li>
        ))}
      </ol>
      <Link
        href={cta.href}
        className={tone === "brand" ? "btn-primary" : "btn-accent"}
      >
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ---------------------- Auction Teaser ---------------------- */

const DEMO_AUCTIONS: AuctionTeaser[] = [
  {
    id: "demo-1",
    postal_code: "80331",
    region: "München",
    tier: "premium",
    kitchen_form: "L-Form, modern",
    budget_midpoint: 22000,
    offer_price_eur: 22500,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "demo-2",
    postal_code: "50667",
    region: "Köln",
    tier: "hot",
    kitchen_form: "Kochinsel, premium",
    budget_midpoint: 38000,
    offer_price_eur: 38900,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 64).toISOString(),
  },
  {
    id: "demo-3",
    postal_code: "20095",
    region: "Hamburg",
    tier: "standard",
    kitchen_form: "Küchenzeile",
    budget_midpoint: 14000,
    offer_price_eur: 14300,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
];

function AuctionTeaserCard({
  auction,
  live,
}: {
  auction: AuctionTeaser;
  live: boolean;
}) {
  const endsIn = auction.ends_at
    ? msToHuman(new Date(auction.ends_at).getTime() - Date.now())
    : null;
  const plzPrefix = auction.postal_code?.slice(0, 3) ?? "—";
  const tierLabel = (auction.tier ?? "standard").toUpperCase();

  return (
    <article className="group relative flex flex-col rounded-card border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-elevated">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-800">
          {tierLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
          <Clock className="h-3 w-3" />
          {endsIn ?? "—"}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg font-bold text-ink">
        {auction.kitchen_form ?? "Küche"}
      </h3>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
        <MapPin className="h-3 w-3" />
        {auction.region ?? "—"} · PLZ {plzPrefix}xx
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
            Studio-Preis
          </dt>
          <dd className="mt-0.5 font-display text-base font-bold text-ink">
            {auction.offer_price_eur
              ? `${Number(auction.offer_price_eur).toLocaleString("de-DE")} €`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
            Budget
          </dt>
          <dd className="mt-0.5 font-display text-base font-bold text-ink">
            {auction.budget_midpoint
              ? `~${Number(auction.budget_midpoint).toLocaleString("de-DE")} €`
              : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 pt-4 border-t border-neutral-100">
        {live ? (
          <Link
            href={`/auktionen`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Auktion ansehen
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-subtle">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-subtle" />
            Beispiel-Auktion
          </span>
        )}
      </div>
    </article>
  );
}

function msToHuman(ms: number): string {
  if (ms <= 0) return "endet jetzt";
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h >= 24) return `endet in ${Math.floor(h / 24)}d ${h % 24}h`;
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `endet in ${h}h ${m}m`;
}
