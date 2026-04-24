import Link from "next/link";
import Image from "next/image";
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
  MapPin,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  BadgeTuevStyle,
  BadgeEkomiStyle,
  BadgeDsgvoStyle,
  BadgeSslStyle,
  BadgeRechnungStyle,
} from "@/components/ui/trust-badges";
import { KITCHEN_IMAGES, AVATARS, imageForKitchenForm } from "@/lib/images";

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
  "Nobilia", "Häcker", "Schüller", "Nolte",
  "Bauformat", "Bauknecht", "Pino", "Beckermann",
  "Burger", "ALNO", "Leicht", "next125",
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
      {/* ======================== HERO (CaravanWert-Style) ======================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/40 via-white to-white pb-12 pt-10 lg:pb-20 lg:pt-16">
        <div className="section-container relative">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            {/* ======= LINKS: Headline + Trust-Pills + Sub-CTAs ======= */}
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Küchenkauf leicht gemacht
              </span>

              <h1 className="mt-3 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight-2 text-black sm:text-[3rem] lg:text-[3.4rem]">
                Küche kaufen.
              </h1>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-ink-muted sm:text-3xl">
                Schnell. Einfach. Online.
              </h2>

              <p className="mt-5 text-lead">
                Vergleichen Sie Ihr Studio-Angebot oder erhalten Sie neue
                Angebote von verifizierten Küchenstudios — bundesweit,
                kostenlos und in 72&nbsp;Stunden.
              </p>

              {/* 3 Trust-Pills */}
              <ul className="mt-6 space-y-2.5 text-[15px]">
                <li className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-5 w-5 flex-none text-success-600" />
                  In unter 72 Stunden zum besten Angebot
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-5 w-5 flex-none text-success-600" />
                  100&nbsp;% sicher &amp; seriös — verifizierte Händler
                </li>
                <li className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-5 w-5 flex-none text-success-600" />
                  Faire Marktpreise durch echten Wettbewerb
                </li>
              </ul>

              {/* Sekundäre Text-Links (optional) */}
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <Link
                  href="#so-funktionierts"
                  className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brand-700"
                >
                  So funktioniert's
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/auktionen"
                  className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brand-700"
                >
                  Live-Auktionen ansehen
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Social Proof: Avatare + Sterne */}
              <div className="mt-8 flex items-center gap-4 border-t border-neutral-200 pt-6">
                <div className="flex -space-x-2">
                  {[AVATARS.martin, AVATARS.julia, AVATARS.thomas, AVATARS.anna].map(
                    (src, i) => (
                      <span
                        key={i}
                        className="relative inline-block h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm"
                      >
                        <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    ),
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500" aria-hidden>
                    {"★★★★★"}
                    <span className="ml-1 text-xs font-bold text-ink">4,8 / 5,0</span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    aus 2.400+ Verbraucher-Bewertungen
                  </div>
                </div>
              </div>
            </div>

            {/* ======= RECHTS: „Jetzt starten" Box mit 2 Auswahl-Karten ======= */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-card-elevated sm:p-7">
                {/* Header der Box */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight-2 text-black sm:text-[1.4rem]">
                      Jetzt starten
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Kostenloses Ergebnis in nur 2&nbsp;Minuten
                    </p>
                  </div>
                  <span className="hidden items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-700 sm:inline-flex">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-success-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
                    </span>
                    12 Händler online
                  </span>
                </div>

                <p className="mt-4 text-[13px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Was möchten Sie tun?
                </p>

                {/* Die 2 Auswahl-Karten */}
                <div className="mt-3 space-y-3">
                  <HeroChoiceCard
                    href="/funnel/b"
                    icon={<ClipboardCheck className="h-6 w-6" />}
                    title="Bestehendes Angebot vergleichen"
                    subtitle="Reverse-Auktion: Händler unterbieten Ihr Studio-Angebot in 72&nbsp;h"
                    isPrimary
                  />
                  <HeroChoiceCard
                    href="/funnel/a"
                    icon={<Search className="h-6 w-6" />}
                    title="Neues Angebot erhalten"
                    subtitle="Bis zu 3 verifizierte Küchenstudios erstellen kostenlose Angebote"
                  />
                </div>

                {/* Footer-Trust */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-neutral-100 pt-4 text-[12px] font-semibold text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    100&nbsp;% kostenlos
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    Unverbindlich
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                    In 2 Min. fertig
                  </span>
                </div>
              </div>

              {/* Decoration: warmer Wand-Tint dahinter */}
              <div
                className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand-100 via-brand-50 to-transparent blur-2xl"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================== TRUST-BADGES-STRIP ======================== */}
      <section className="border-y border-neutral-200 bg-surface-soft">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 text-ink-subtle">
            <BadgeTuevStyle />
            <span className="hidden h-6 w-px bg-neutral-300 md:block" />
            <BadgeEkomiStyle />
            <span className="hidden h-6 w-px bg-neutral-300 md:block" />
            <BadgeDsgvoStyle />
            <span className="hidden h-6 w-px bg-neutral-300 md:block" />
            <BadgeSslStyle />
            <span className="hidden h-6 w-px bg-neutral-300 md:block" />
            <BadgeRechnungStyle />
          </div>
        </div>
      </section>

      {/* ======================== STATS ======================== */}
      <section className="bg-white">
        <div className="section-container">
          <div className="grid grid-cols-2 gap-4 py-12 text-center md:grid-cols-4 md:gap-8">
            <Stat value="72 h" label="Auktionsdauer" />
            <Stat value="bis 25 %" label="Ø Ersparnis" />
            <Stat value="0 €" label="für Verbraucher" />
            <Stat value="2.400+" label="zufriedene Kunden" />
          </div>
        </div>
      </section>

      {/* ======================== MARKEN-WAND ======================== */}
      <section className="bg-surface-soft section-tight">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Marken &amp; Hersteller</span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight-2 text-black sm:text-3xl">
              Alle führenden deutschen Küchenmarken
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Egal welche Marke Ihnen Ihr Studio angeboten hat – unsere
              Partner-Händler beziehen direkt vom Hersteller.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 items-center gap-x-2 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {KITCHEN_BRANDS.map((brand) => (
              <div
                key={brand}
                className="flex h-12 items-center justify-center px-2 text-neutral-400 transition hover:text-black"
                title={brand}
              >
                <BrandLogo name={brand} className="h-7 w-auto opacity-80 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== SO LÄUFT'S IM DETAIL ======================== */}
      <section id="so-funktionierts" className="section-padding bg-white">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">So läuft es im Detail</span>
            <h2 className="mt-2 h-section">Was Sie im jeweiligen Pfad erwartet</h2>
            <p className="mt-3 text-lead">
              Beide Wege sind kostenlos und unverbindlich. Hier sehen Sie,
              welche Schritte konkret auf Sie zukommen.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PathExplainer
              num={1}
              icon={<ClipboardCheck className="h-6 w-6" />}
              tag="Reverse-Auktion · Beliebter Pfad"
              title="Bestehendes Angebot vergleichen"
              steps={[
                "Eckdaten erfassen (Hersteller, Fronten, Arbeitsplatte, Geräte, Sanitär, Lieferung, Zahlung)",
                "Optional: Angebot, Grundriss und Foto hochladen",
                "Experte ruft Sie an und ergänzt Details",
                "72-h-Auktion: verifizierte Händler unterbieten Ihr Angebot",
                "Sie nehmen das beste Gebot verbindlich an",
              ]}
              cta={{ href: "/funnel/b", label: "Auktion starten" }}
              isPrimary
            />
            <PathExplainer
              num={2}
              icon={<Search className="h-6 w-6" />}
              tag="Lead-Vermittlung"
              title="Neues Angebot erhalten"
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
      <section className="bg-surface-soft section-padding">
        <div className="section-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="eyebrow inline-flex items-center gap-1.5">
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success-500">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success-500 opacity-75" />
                </span>
                Live aus der Plattform
              </span>
              <h2 className="mt-2 h-section">
                {liveAuctions.length > 0
                  ? "Aktuelle Küchen-Auktionen"
                  : "So sehen Auktionen aus"}
              </h2>
              <p className="mt-3 text-lead">
                {liveAuctions.length > 0
                  ? "Verifizierte Händler bieten gerade auf diese anonymisierten Anfragen."
                  : "Beispiel-Auktionen — Ihre eigene startet in nur 2 Minuten."}
              </p>
            </div>
            <Link href="/auktionen" className="btn-secondary">
              Alle Auktionen ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
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
      <section className="section-padding bg-white">
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
            <Benefit icon={<Gavel className="h-5 w-5" />} title="Echte Reverse-Auktion"
              text="Verifizierte Händler unterbieten sich auf eine neutrale Spec-Liste – kein Vergleich von Äpfeln mit Birnen." />
            <Benefit icon={<ShieldCheck className="h-5 w-5" />} title="Verbindlich für beide Seiten"
              text="Der Sieger liefert zum Auktionspreis, Sie nehmen das beste Gebot an. Kein faules Spiel." />
            <Benefit icon={<Headphones className="h-5 w-5" />} title="Persönlicher Experte"
              text="Vor jeder Auktion ruft Sie ein Spec-Experte an und ergänzt fehlende Details." />
            <Benefit icon={<CheckCircle2 className="h-5 w-5" />} title="0 € für Verbraucher"
              text="Keine versteckten Kosten, keine Monatsgebühr. Wir verdienen ausschließlich an erfolgreichen Vermittlungen." />
            <Benefit icon={<Wallet className="h-5 w-5" />} title="Transparente Provision"
              text="Wir kommunizieren offen, was Händler an uns zahlen. Keine versteckte Marge auf Ihrer Küche." />
            <Benefit icon={<ShieldCheck className="h-5 w-5" />} title="DSGVO-konform"
              text="Daten in Deutschland gehostet. Kontaktdaten erst nach verbindlichem Lead-/Auktions-Abschluss sichtbar für Händler." />
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
      <section className="bg-white py-20">
        <div className="section-container grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="eyebrow">Kunden-Stimmen</span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight-2 text-black sm:text-[2rem]">
              3.610 € gespart in 72 Stunden
            </h3>
            <p className="mt-4 text-lead">
              Über 2.400 Verbraucher haben bereits über KüchenWert ihren
              fairen Küchenpreis gefunden – durch echten Wettbewerb auf
              identischer Spec-Liste.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-6 border-t border-neutral-100 pt-6">
              <div>
                <div className="font-display text-3xl font-bold text-black">100 %</div>
                <div className="mt-1 text-sm text-ink-muted">geprüfte Partner</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-black">Mo–Fr</div>
                <div className="mt-1 text-sm text-ink-muted">persönlicher Support</div>
              </div>
            </div>
          </div>
          <figure className="relative rounded-2xl border border-neutral-200 bg-white p-8 shadow-card-elevated">
            <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-success-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <CheckCircle2 className="h-3 w-3" />
              Verifizierte Bewertung
            </span>
            <div className="flex items-center gap-1 text-amber-500" aria-hidden>
              {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
            </div>
            <blockquote className="mt-4 text-lg italic leading-relaxed text-ink">
              „Hatte ein Angebot über 21.500 € von meinem Küchenstudio.
              Über KüchenWert haben drei Händler geboten – am Ende habe
              ich die gleiche Küche für 17.890 € bekommen.{" "}
              <span className="font-semibold not-italic">3.610 € gespart in 72 Stunden.</span>"
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src={AVATARS.martin} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <div className="text-sm">
                <div className="font-semibold text-ink">Martin K.</div>
                <div className="text-xs text-ink-muted">München · Auktion #1247 · Nov. 2025</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ======================== FAQ ======================== */}
      <section className="bg-surface-soft section-padding">
        <div className="section-container max-w-3xl">
          <div className="text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-2 h-section">Häufig gestellte Fragen</h2>
          </div>
          <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white px-6">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
                  {item.q}
                  <span className="text-2xl font-light text-ink-subtle transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== BOTTOM-CTA mit Foto-BG ======================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={KITCHEN_IMAGES.ctaBackground}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/70" />
        </div>
        <div className="section-container relative py-24 text-center text-white sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Bereit für den fairen Küchenpreis?
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[2rem] font-bold leading-[1.1] tracking-tight-2 sm:text-[2.5rem]">
            Starten Sie jetzt – kostenlos und in 2 Minuten
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-200">
            Wählen Sie Ihren Pfad und vergleichen Sie schon heute Ihr
            Angebot mit verifizierten Küchenstudios deutschlandweit.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/funnel/b" className="btn-primary-lg">
              Bestehendes Angebot vergleichen
              <ArrowRight className="h-5 w-5 btn-icon-arrow" />
            </Link>
            <Link
              href="/funnel/a"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Angebot erhalten
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-400" />
              Kostenlos &amp; unverbindlich
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-400" />
              Kein Login zum Starten
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-400" />
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
      <div className="font-display text-3xl font-bold tracking-tight-2 text-black sm:text-[2.5rem] lg:text-[3rem]">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-ink-muted sm:text-sm">
        {label}
      </div>
    </div>
  );
}

function Benefit({
  icon, title, text,
}: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-card-hover">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold text-black">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

function Step({
  num, time, title, text,
}: { num: number; time: string; title: string; text: string }) {
  return (
    <li className="relative rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black font-bold text-white">
          {num}
        </span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
          {time}
        </span>
      </div>
      <h3
        className="mt-5 text-lg font-semibold text-black"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{text}</p>
    </li>
  );
}

function HeroChoiceCard({
  href,
  icon,
  title,
  subtitle,
  isPrimary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isPrimary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 ${
        isPrimary
          ? "border-brand-500/40 bg-brand-50/40 hover:border-brand-500 hover:bg-brand-50/70 hover:shadow-card"
          : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-card"
      }`}
    >
      <span
        className={`grid h-12 w-12 flex-none place-items-center rounded-lg ${
          isPrimary ? "bg-brand-500 text-white" : "bg-neutral-100 text-ink"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-display text-[15px] font-bold leading-tight text-black sm:text-base">
            {title}
          </h4>
          {isPrimary && (
            <span className="inline-flex items-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Beliebt
            </span>
          )}
        </div>
        <p
          className="mt-1 text-xs leading-snug text-ink-muted sm:text-[13px]"
          dangerouslySetInnerHTML={{ __html: subtitle }}
        />
      </div>
      <span
        className={`inline-flex flex-none items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
          isPrimary
            ? "bg-brand-500 text-white group-hover:bg-brand-600"
            : "bg-neutral-900 text-white group-hover:bg-black"
        }`}
      >
        Start
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function PathExplainer({
  num, icon, tag, title, steps, cta, isPrimary = false,
}: {
  num: number;
  icon: React.ReactNode;
  tag: string;
  title: string;
  steps: string[];
  cta: { href: string; label: string };
  isPrimary?: boolean;
}) {
  return (
    <div className={`relative flex flex-col gap-6 rounded-2xl border ${isPrimary ? "border-brand-300 bg-brand-50/40" : "border-neutral-200 bg-white"} p-8 transition hover:-translate-y-0.5 hover:shadow-card-hover`}>
      {isPrimary && (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
          Beliebter Pfad
        </span>
      )}
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${isPrimary ? "bg-brand-500 text-white" : "bg-neutral-900 text-white"}`}>
          {icon}
        </span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{tag}</span>
          <h3 className="mt-1 text-xl font-bold text-black">{title}</h3>
        </div>
      </div>
      <ol className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-bold ${isPrimary ? "bg-brand-500 text-white" : "bg-neutral-200 text-black"}`}>
              {i + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: s }} />
          </li>
        ))}
      </ol>
      <Link
        href={cta.href}
        className={isPrimary ? "btn-primary mt-2 self-start" : "btn-secondary mt-2 self-start"}
      >
        {cta.label}
        <ArrowRight className="h-4 w-4 btn-icon-arrow" />
      </Link>
    </div>
  );
}

/* ---------------------- Auction Teaser ---------------------- */

const DEMO_AUCTIONS: AuctionTeaser[] = [
  { id: "demo-1", postal_code: "80331", region: "München", tier: "premium", kitchen_form: "L-Form modern", budget_midpoint: 22000, offer_price_eur: 22500, ends_at: new Date(Date.now() + 1000*60*60*28).toISOString() },
  { id: "demo-2", postal_code: "50667", region: "Köln", tier: "hot", kitchen_form: "Kochinsel premium", budget_midpoint: 38000, offer_price_eur: 38900, ends_at: new Date(Date.now() + 1000*60*60*64).toISOString() },
  { id: "demo-3", postal_code: "20095", region: "Hamburg", tier: "standard", kitchen_form: "Küchenzeile", budget_midpoint: 14000, offer_price_eur: 14300, ends_at: new Date(Date.now() + 1000*60*60*12).toISOString() },
];

function AuctionTeaserCard({ auction, live }: { auction: AuctionTeaser; live: boolean }) {
  const endsIn = auction.ends_at ? msToHuman(new Date(auction.ends_at).getTime() - Date.now()) : null;
  const plzPrefix = auction.postal_code?.slice(0, 3) ?? "—";
  const tierLabel = (auction.tier ?? "standard").toUpperCase();
  const img = imageForKitchenForm(auction.kitchen_form);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-elevated">
      {/* Bild-Header */}
      <div className="relative aspect-[5/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={img}
          alt={auction.kitchen_form ?? "Küche"}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {tierLabel}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
          <Clock className="h-3 w-3" />
          {endsIn ?? "—"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-black">
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
            <dd className="mt-0.5 font-display text-base font-bold text-black">
              {auction.offer_price_eur
                ? `${Number(auction.offer_price_eur).toLocaleString("de-DE")} €`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-subtle">
              Budget
            </dt>
            <dd className="mt-0.5 font-display text-base font-bold text-black">
              {auction.budget_midpoint
                ? `~${Number(auction.budget_midpoint).toLocaleString("de-DE")} €`
                : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          {live ? (
            <Link
              href="/auktionen"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800"
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
