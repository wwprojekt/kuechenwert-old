import { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Küchenplanung starten – individuelle Beratung",
  description:
    "Planen Sie Ihre Traumküche mit individueller Beratung. Von der Formwahl über Materialien bis zur Ausstattung – wir finden das passende Studio für Sie.",
};

const FEATURES = [
  {
    title: "Detailgenaue Planung",
    desc: "Von Küchenform über Stil, Farben und Ausstattung bis hin zu Sonderwünschen – wir erfassen jeden Aspekt Ihrer Traumküche.",
  },
  {
    title: "Grundriss-Analyse",
    desc: "Laden Sie Ihren Grundriss hoch und erhalten Sie Planungsvorschläge, die perfekt in Ihren Raum passen.",
  },
  {
    title: "Persönliches Matching",
    desc: "Auf Basis Ihrer Angaben finden wir den Fachhändler, der genau Ihre Wünsche umsetzen kann.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Wie detailliert muss meine Planung sein?",
    answer:
      "Keine Sorge – Sie müssen kein Küchenexperte sein. Beantworten Sie einfach unsere Fragen nach Ihrem Gefühl. Je mehr Details Sie angeben, desto präziser können die Studios planen.",
  },
  {
    question: "Brauche ich einen Grundriss?",
    answer:
      "Ein Grundriss ist optional, hilft aber enorm bei der Planung. Falls Sie keinen haben, können die Studios diesen vor Ort aufnehmen.",
  },
  {
    question: "Wie unterscheidet sich das vom schnellen Angebotsvergleich?",
    answer:
      "Die Küchenplanung ist deutlich detaillierter. Statt 5 haben Sie 11 Schritte, in denen wir Stil, Farbe, Ausstattung und sogar Sonderwünsche erfassen. So erhalten Sie maßgeschneiderte Angebote.",
  },
  {
    question: "Ist die Küchenplanung wirklich kostenlos?",
    answer:
      "Ja, der gesamte Service ist für Sie kostenlos und unverbindlich. Erst wenn Sie sich für ein Studio entscheiden, entstehen für das Studio Kosten – nicht für Sie.",
  },
];

export default function KuechenplanungPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent_50%)]" />
        <div className="section-container relative text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">
            Individuelle Beratung
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ihre Küchenplanung
            <br />
            <span className="text-accent-400">Schritt für Schritt</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-300">
            Von der Küchenform über Materialien und Ausstattung bis zum Budget
            – in 11 Schritten erstellen wir Ihr persönliches Küchenprofil.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/funnel/planung/kuechenform"
              className="btn-accent px-10 py-4 text-base"
            >
              Küchenplanung starten
            </Link>
            <Link
              href="/angebote-vergleichen"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-300 underline underline-offset-4 transition hover:text-white"
            >
              Oder: Schneller Angebotsvergleich
            </Link>
          </div>
        </div>
      </section>

      {/* What gets planned */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            Was wir gemeinsam planen
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
            11 Fragen – 5 Minuten – ein maßgeschneidertes Küchenprofil.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Küchenform", desc: "Zeile, L-Form, U-Form, Insel…" },
              { label: "Stil & Farbe", desc: "Modern, Landhaus, Industrial…" },
              { label: "Raumtyp", desc: "Offen, geschlossen oder in Planung" },
              { label: "Ausstattung", desc: "Geräte, Arbeitsplatte, Extras" },
              { label: "Haushaltsgröße", desc: "Für Singles bis Großfamilien" },
              { label: "Budget & Zeitrahmen", desc: "Realistisch planen" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <p className="font-bold text-zinc-900">{item.label}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-16">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            Ihre Vorteile
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                  <svg
                    className="h-7 w-7 text-brand-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Häufig gestellte Fragen
          </h2>
          <div className="mt-8">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-950 py-14">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Starten Sie Ihre individuelle Küchenplanung
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            In 11 Schritten zum perfekten Küchenprofil – kostenlos und
            unverbindlich.
          </p>
          <div className="mt-8">
            <Link
              href="/funnel/planung/kuechenform"
              className="btn-accent px-10 py-4 text-base"
            >
              Küchenplanung starten
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
