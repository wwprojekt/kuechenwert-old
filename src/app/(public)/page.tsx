import Link from "next/link";
import { StatCounter } from "@/components/ui/stat-counter";
import { Accordion } from "@/components/ui/accordion";
import { ImageCard } from "@/components/ui/image-card";
import { HeroPlzEntry } from "@/components/ui/hero-plz-entry";

const THREE_PATHS = [
  {
    href: "/angebote-vergleichen",
    funnelHref: "/funnel/angebote/kuechenform",
    tag: "Schnell",
    title: "Angebote vergleichen",
    desc: "5 Fragen, 2 Minuten. Erhalten Sie bis zu 3 kostenlose Angebote von geprüften Studios in Ihrer Nähe.",
    cta: "Angebote vergleichen",
    gradient: "from-brand-600 to-brand-800",
  },
  {
    href: "/kuechenplanung",
    funnelHref: "/funnel/planung/kuechenform",
    tag: "Detailliert",
    title: "Küchenplanung starten",
    desc: "11 Schritte, 5 Minuten. Von Küchenform über Stil und Ausstattung bis zum Grundriss – maximale Planungstiefe.",
    cta: "Planung starten",
    gradient: "from-brand-700 to-brand-950",
  },
  {
    href: "/style-quiz",
    funnelHref: "/funnel/quiz/stil",
    tag: "Inspirierend",
    title: "Style-Quiz",
    desc: "Bilder wählen, Stil entdecken. Unser visuelles Quiz findet Ihren persönlichen Küchenstil – spielerisch und schnell.",
    cta: "Quiz starten",
    gradient: "from-accent-500 to-accent-600",
  },
];

const SOCIAL_PROOF = [
  {
    text: "Endlich konnte ich Angebote wirklich vergleichen. 4.000 € gespart!",
    name: "Sabine M.",
    city: "München",
  },
  {
    text: "Das Style-Quiz hat mir gezeigt, dass Landhaus genau mein Ding ist. Die Angebote kamen prompt.",
    name: "Thomas K.",
    city: "Hamburg",
  },
  {
    text: "Die detaillierte Planung war Gold wert. Das Studio wusste genau, was ich wollte.",
    name: "Andrea L.",
    city: "Berlin",
  },
];

const KITCHEN_STYLES_PREVIEW = [
  {
    href: "/kuechenstile/modern",
    title: "Modern",
    description: "Klare Linien, grifflos, minimalistisch",
    bgClass: "bg-gradient-to-br from-zinc-800 to-zinc-950",
  },
  {
    href: "/kuechenstile/landhaus",
    title: "Landhaus",
    description: "Natürliche Materialien, warme Töne",
    bgClass: "bg-gradient-to-br from-amber-700 to-amber-900",
  },
  {
    href: "/kuechenstile/industrial",
    title: "Industrial",
    description: "Beton, Metall und rohes Holz",
    bgClass: "bg-gradient-to-br from-stone-600 to-stone-800",
  },
  {
    href: "/kuechenstile/skandinavisch",
    title: "Skandinavisch",
    description: "Hell, funktional, nordisch",
    bgClass: "bg-gradient-to-br from-sky-200 to-sky-400",
  },
];

const STATS = [
  { value: 12000, suffix: "+", label: "Vermittelte Anfragen" },
  { value: 800, suffix: "+", label: "Partner-Studios" },
  { value: 23, suffix: "%", label: "Ø Ersparnis" },
  { value: 48, suffix: "h", label: "Bis zum ersten Angebot" },
];

const FAQ_ITEMS = [
  {
    question: "Ist der Service wirklich kostenlos?",
    answer:
      "Ja, für Sie als Kücheninteressent ist unser Service zu 100% kostenlos und unverbindlich. Die Kosten werden von den teilnehmenden Küchenstudios getragen.",
  },
  {
    question: "Wie viele Angebote erhalte ich?",
    answer:
      "Beim schnellen Angebotsvergleich erhalten Sie bis zu 3 individuelle Angebote. Bei der detaillierten Küchenplanung finden wir den optimal passenden Fachhändler.",
  },
  {
    question: "Muss ich mich an ein Angebot binden?",
    answer:
      "Nein. Alle Angebote sind komplett unverbindlich. Sie entscheiden selbst, ob und mit welchem Studio Sie weiterarbeiten möchten.",
  },
  {
    question: "Wie werden die Küchenstudios geprüft?",
    answer:
      "Alle Studios in unserem Netzwerk durchlaufen einen mehrstufigen Qualifizierungsprozess. Wir prüfen Zertifizierungen, Kundenbewertungen und Erfahrung.",
  },
  {
    question: "Was passiert mit meinen Daten?",
    answer:
      "Ihre Daten werden SSL-verschlüsselt übertragen und ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Wir halten uns strikt an die DSGVO.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/30 via-brand-950 to-brand-950" />
        <div className="section-container relative text-center">
          <div className="mx-auto inline-block rounded-full bg-accent-500/10 px-4 py-1.5 text-xs font-semibold text-accent-400">
            Transparenz schafft Wert
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Drei Wege zu Ihrer{" "}
            <span className="text-accent-400">Traumküche</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-200">
            Ob schneller Angebotsvergleich, detaillierte Planung oder visuelles
            Style-Quiz – finden Sie Ihren Weg zur perfekten Küche.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-300">
            {["Kostenlos", "Unverbindlich", "Geprüfte Händler", "DSGVO-konform"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5 text-accent-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </span>
              ),
            )}
          </div>

          <HeroPlzEntry />
        </div>
      </section>

      {/* 3 Paths Section */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Wählen Sie Ihren Weg
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
            Jeder Weg führt zu kostenlosen Angeboten von geprüften
            Küchenstudios in Ihrer Nähe.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {THREE_PATHS.map((path) => (
              <div
                key={path.title}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                {/* Colored header */}
                <div
                  className={`bg-gradient-to-r ${path.gradient} px-6 py-8 text-white`}
                >
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {path.tag}
                  </span>
                  <h3 className="mt-3 text-xl font-bold">{path.title}</h3>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col px-6 py-5">
                  <p className="flex-1 text-sm leading-relaxed text-zinc-600">
                    {path.desc}
                  </p>
                  <div className="mt-5">
                    <Link
                      href={path.funnelHref}
                      className="btn-primary w-full text-center"
                    >
                      {path.cta}
                    </Link>
                    <Link
                      href={path.href}
                      className="mt-2 block text-center text-xs text-zinc-400 underline hover:text-zinc-600"
                    >
                      Mehr erfahren
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatCounter stats={STATS} />

      {/* Kitchen Styles Preview */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Küchenstile entdecken
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
            Lassen Sie sich inspirieren und finden Sie den Stil, der zu Ihnen
            passt.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {KITCHEN_STYLES_PREVIEW.map((style) => (
              <ImageCard
                key={style.title}
                href={style.href}
                title={style.title}
                description={style.description}
                bgClass={style.bgClass}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/kuechenstile"
              className="text-sm font-medium text-brand-600 underline underline-offset-4 hover:text-brand-800"
            >
              Alle Küchenstile ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Das sagen unsere Nutzer
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SOCIAL_PROOF.map((review) => (
              <div key={review.name} className="card">
                <div className="flex gap-0.5 text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="mt-3 text-xs font-medium text-zinc-400">
                  {review.name}, {review.city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            So funktioniert KüchenWert
          </h2>
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  num: "1",
                  title: "Weg wählen",
                  desc: "Wählen Sie zwischen schnellem Vergleich, detaillierter Planung oder Style-Quiz.",
                },
                {
                  num: "2",
                  title: "Fragen beantworten",
                  desc: "Beantworten Sie wenige Fragen zu Ihren Wünschen – in 2 bis 5 Minuten.",
                },
                {
                  num: "3",
                  title: "Angebote erhalten",
                  desc: "Geprüfte Studios erstellen kostenlose Angebote, die Sie in Ruhe vergleichen.",
                },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/25">
                    {step.num}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-zinc-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            Häufig gestellte Fragen
          </h2>
          <div className="mt-8">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-950 py-16 lg:py-20">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Bereit für Ihre Traumküche?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            Starten Sie jetzt – kostenlos und unverbindlich.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-8 py-3.5"
            >
              Angebote vergleichen
            </Link>
            <Link
              href="/funnel/planung/kuechenform"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Küchenplanung starten
            </Link>
            <Link
              href="/funnel/quiz/stil"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Style-Quiz
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
