import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Clock3,
  ShieldCheck,
  BadgeEuro,
  ArrowRight,
  Wand2,
  ImagePlus,
  MessageSquareQuote,
  Phone,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { faqSchema } from "@/lib/schema";
import { AnalyticsProvider } from "@/components/analytics-provider";

export const metadata: Metadata = {
  title: "Deine Traumkueche - KI-Planer mit Moodboard & Preisrange",
  description:
    "KI-gestützter Küchen-Planer für Eigentümer und Bauherren. Stil, Farben, Geräte wählen - in 60 Sekunden ein persönliches Moodboard plus Preisrange und Experten-Einschätzung.",
};

const FAQ_ITEMS = [
  {
    question: "Ist der KI-Planer wirklich kostenlos?",
    answer:
      "Ja. Du planst, siehst dein Moodboard und bekommst eine erste Preisrange komplett kostenlos. Erst wenn du einen passenden Küchenstudio-Partner kontaktiert werden möchtest, setzen wir uns mit dir in Verbindung - unverbindlich.",
  },
  {
    question: "Wie genau ist die Preisrange?",
    answer:
      "Die angezeigte Range beruht auf realen Küchen-Projekten aus unserem Netzwerk (Stil-Segment, Geräte-Qualität, Arbeitsplatten-Material und Küchenform). Sie ist eine fundierte erste Einschätzung, die der Experte anschließend individuell auf dein Objekt zuspitzt.",
  },
  {
    question: "Was passiert mit meinen Daten?",
    answer:
      "Deine Daten werden DSGVO-konform verarbeitet. Die KI-Bildgenerierung verwendet deine Auswahl als Prompt, speichert aber keine personenbezogenen Daten beim Anbieter. Weitergabe an einen Küchenstudio-Partner erfolgt ausschließlich mit deiner ausdrücklichen Einwilligung.",
  },
  {
    question: "Ist das Moodboard 1:1 meine spätere Küche?",
    answer:
      "Das Moodboard ist ein fotorealistisches KI-Rendering deiner Wünsche - keine technische Planungszeichnung. Es dient der Entscheidungsfindung und als Briefing für das Küchenstudio. Die finale Planung erstellt dein Partner mit professioneller CAD-Software.",
  },
  {
    question: "Wie lange dauert die Planung?",
    answer:
      "Die Eingaben dauern ca. 60 Sekunden. Das KI-Moodboard wird in etwa 8-15 Sekunden generiert. Insgesamt: unter 2 Minuten bis zum fertigen Ergebnis.",
  },
  {
    question: "Kann ich das Ergebnis teilen?",
    answer:
      "Ja. Nach dem Sichern bekommst du einen dauerhaften Link zu deinem Moodboard, den du per E-Mail, WhatsApp oder Chat mit deinem Partner teilen kannst.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: <Wand2 className="h-5 w-5" />,
    title: "1. Wünsche wählen",
    desc: "Stil, Farbe, Oberfläche, Arbeitsplatte, Geräte, Stauraum - alles in wenigen Klicks.",
  },
  {
    icon: <ImagePlus className="h-5 w-5" />,
    title: "2. KI generiert dein Moodboard",
    desc: "Fotorealistisches Rendering deiner Traumkueche in unter 15 Sekunden.",
  },
  {
    icon: <MessageSquareQuote className="h-5 w-5" />,
    title: "3. Experte nimmt Kontakt auf",
    desc: "Preisrange, Tipps, passende Studios - kostenlos und unverbindlich.",
  },
];

const TRUST_ITEMS = [
  { icon: <BadgeEuro className="h-4 w-4" />, label: "Kostenlos & unverbindlich" },
  { icon: <Clock3 className="h-4 w-4" />, label: "Unter 2 Minuten" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "DSGVO · Deutsches Recht" },
];

export default function TraumkuecheLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <AnalyticsProvider />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema(FAQ_ITEMS) }}
      />

      {/* Minimaler Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="section-container flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-display text-lg font-bold tracking-tight-2 text-black"
          >
            <span>Küchen</span>
            <span>Wert</span>
            <span
              className="ml-0.5 inline-block h-1.5 w-1.5 translate-y-1 rounded-full bg-brand-500"
              aria-hidden
            />
          </Link>
          <a
            href="tel:+493055580100"
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 sm:text-sm"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Fragen? </span>
            <span>+49 30 - 555 80 100</span>
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 to-brand-900 py-14 text-white lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_55%)]" />
        <div className="section-container relative">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Neu: KI-Küchen-Planer
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold leading-[1.1] tracking-tight-2 sm:text-4xl lg:text-[3rem]">
                Deine Traumkueche.
                <br />
                <span className="text-accent-300">In unter 2 Minuten.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-brand-100 sm:text-base">
                Stil, Farbe, Geräte, Ausstattung - wähle deine Wünsche. Unsere
                KI rendert dein persönliches Moodboard fotorealistisch und du
                bekommst eine erste Preisrange plus Experten-Einschätzung.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/funnel/traumkueche/stil"
                  className="btn-primary-lg inline-flex items-center gap-2 text-base"
                >
                  Jetzt planen
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <span className="text-[13px] text-brand-200">
                  Kostenlos · Keine Anmeldung nötig
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-brand-200">
                {TRUST_ITEMS.map((it) => (
                  <span key={it.label} className="inline-flex items-center gap-1.5">
                    <span className="text-accent-300">{it.icon}</span>
                    {it.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-accent-500/20 to-transparent blur-2xl" aria-hidden />
              <div className="relative grid grid-cols-3 gap-2 rounded-2xl bg-white/5 p-3 backdrop-blur">
                <HeroTile src="/traumkueche/examples/hero-1.webp" alt="Moderne grifflose Küche in Anthrazit" />
                <HeroTile src="/traumkueche/examples/hero-2.webp" alt="Landhauskueche in Creme" />
                <HeroTile src="/traumkueche/examples/hero-3.webp" alt="Industrial Küche mit Holz" />
                <HeroTile src="/traumkueche/examples/hero-4.webp" alt="Skandi-Küche mit Insel" />
                <HeroTile src="/traumkueche/examples/hero-5.webp" alt="Luxus klassisch in Marmor" />
                <HeroTile src="/traumkueche/examples/hero-6.webp" alt="Modern mit Salbeigrün" />
              </div>
              <div className="mt-2 text-center text-[11px] text-brand-300">
                Beispiel-Renderings aus dem KI-Planer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-14 lg:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
              So funktioniert's
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight-2 text-black sm:text-3xl">
              Von der Idee zum Moodboard - in 3 Schritten.
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  {step.icon}
                </div>
                <div className="mt-3 font-display text-base font-bold text-black">
                  {step.title}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted sm:text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/funnel/traumkueche/stil"
              className="btn-primary-lg inline-flex items-center gap-2"
            >
              Kostenlos starten
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ BEISPIEL-RENDERS / GALLERY ============ */}
      <section className="border-y border-neutral-200 bg-surface-soft py-14 lg:py-20">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
              Beispiele
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight-2 text-black sm:text-3xl">
              Was die KI rendert - in fotorealistischer Qualität.
            </h2>
            <p className="mt-2 text-[14px] text-ink-muted">
              Alle Bilder wurden vom KI-Planer auf Basis realer Kombinations-
              Wünsche generiert.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              "hero-1.webp",
              "hero-2.webp",
              "hero-3.webp",
              "hero-4.webp",
              "hero-5.webp",
              "hero-6.webp",
            ].map((f) => (
              <div
                key={f}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200"
              >
                <Image
                  src={`/traumkueche/examples/${f}`}
                  alt="Beispiel-Moodboard"
                  fill
                  sizes="(max-width: 640px) 50vw, 320px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST / MARKTPLATZ ============ */}
      <section className="py-14">
        <div className="section-container">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            <TrustCard
              label="2.400+"
              description="geplante Küchen im Jahr über unser Partner-Netzwerk"
            />
            <TrustCard
              label="150+"
              description="verifizierte Küchenstudios deutschlandweit"
            />
            <TrustCard
              label="4,8 / 5"
              description="durchschnittliche Kundenbewertung"
            />
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-t border-neutral-200 bg-surface-soft py-14 lg:py-20">
        <div className="section-container max-w-3xl">
          <div className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
              Fragen
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight-2 text-black sm:text-3xl">
              Häufig gefragt
            </h2>
          </div>
          <div className="mt-8">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bg-brand-950 py-14 text-white">
        <div className="section-container text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Bereit für deine Traumkueche?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-200">
            Start in 10 Sekunden. Kein Account, keine Verpflichtung.
          </p>
          <div className="mt-7">
            <Link
              href="/funnel/traumkueche/stil"
              className="btn-primary-lg inline-flex items-center gap-2"
            >
              KI-Moodboard erstellen
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="section-container flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-muted">
          <div>(C) KüchenWert - made in Berlin</div>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:underline">
              AGB
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-800">
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 33vw, 180px" className="object-cover" />
    </div>
  );
}

function TrustCard({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm">
      <div className="font-display text-3xl font-bold tracking-tight-2 text-brand-700">
        {label}
      </div>
      <div className="mt-2 text-[13px] leading-relaxed text-ink-muted">
        {description}
      </div>
    </div>
  );
}
