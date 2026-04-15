import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "So funktioniert KüchenWert – 3 Wege zur Traumküche",
  description:
    "Erfahren Sie Schritt für Schritt, wie KüchenWert funktioniert: Schneller Angebotsvergleich, detaillierte Küchenplanung oder visuelles Style-Quiz.",
};

const PATHS = [
  {
    name: "Angebote vergleichen",
    tag: "Schnell · 2 Min",
    funnelHref: "/funnel/angebote/kuechenform",
    steps: [
      "Küchenform auswählen",
      "Budget-Bereich angeben",
      "Zeitrahmen festlegen",
      "PLZ eingeben",
      "Kontaktdaten hinterlassen",
    ],
    result: "Bis zu 3 kostenlose Angebote von geprüften Küchenstudios in Ihrer Region.",
    bestFor: "Nutzer, die schnell und unkompliziert Angebote vergleichen möchten.",
  },
  {
    name: "Küchenplanung starten",
    tag: "Detailliert · 5 Min",
    funnelHref: "/funnel/planung/kuechenform",
    steps: [
      "Küchenform und Stil wählen",
      "Raum, Farbe und Ausstattung bestimmen",
      "Haushaltsgröße und Anlass angeben",
      "Budget und Zeitrahmen festlegen",
      "Optionaler Grundriss-Upload",
      "Kontaktdaten für maßgeschneiderte Beratung",
    ],
    result: "Ein individuelles Küchenprofil und Angebote von spezialisierten Studios.",
    bestFor: "Nutzer, die genau wissen, was sie wollen – oder es gemeinsam herausfinden möchten.",
  },
  {
    name: "Style-Quiz",
    tag: "Inspirierend · 2 Min",
    funnelHref: "/funnel/quiz/stil",
    steps: [
      "Küchenstil-Bilder auswählen",
      "Farbwelt bestimmen",
      "Küchenform angeben",
      "Prioritäten setzen (max. 3)",
      "Optional: Grundriss hochladen",
      "PLZ und Kontaktdaten eingeben",
    ],
    result: "Ihr persönlicher Küchenstil-Match + passende Angebote von Studios in Ihrer Nähe.",
    bestFor: "Nutzer, die sich inspirieren lassen möchten und noch keinen festen Stil haben.",
  },
];

export default function SoFunktionierts() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 py-14 lg:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            So funktioniert KüchenWert
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-300">
            Drei Wege zur Traumküche – wählen Sie den, der am besten zu
            Ihnen passt.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "So funktioniert's" },
            ]}
          />
        </div>
      </div>

      {/* Three Paths Detail */}
      <section className="py-16">
        <div className="section-container max-w-4xl space-y-16">
          {PATHS.map((path, idx) => (
            <div key={path.name}>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {idx + 1}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    {path.name}
                  </h2>
                  <span className="text-sm text-zinc-500">{path.tag}</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Schritte
                </h3>
                <ol className="mt-4 space-y-3">
                  {path.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-700">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-400">
                      Ergebnis
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {path.result}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-400">
                      Am besten für
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {path.bestFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={path.funnelHref}
                    className="btn-primary"
                  >
                    {path.name} starten
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What happens after */}
      <section className="bg-zinc-50 py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Was passiert danach?
          </h2>
          <div className="mt-10 space-y-6">
            {[
              {
                num: "1",
                title: "Experten-Check (24 Stunden)",
                desc: "Unser Team prüft Ihre Angaben, stellt bei Bedarf Rückfragen und erstellt ein Anforderungsprofil.",
              },
              {
                num: "2",
                title: "Studio-Matching",
                desc: "Wir finden Küchenstudios in Ihrer Region, die zu Ihren Anforderungen und Ihrem Budget passen.",
              },
              {
                num: "3",
                title: "Angebote erhalten",
                desc: "Sie erhalten kostenlose und unverbindliche Angebote, die Sie in Ruhe vergleichen können.",
              },
              {
                num: "4",
                title: "Entscheidung treffen",
                desc: "Kein Zeitdruck, keine Verpflichtung. Sie entscheiden, ob und wann Sie aktiv werden.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-950 py-14">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold text-white">
            Bereit? Wählen Sie Ihren Weg.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-8 py-3.5"
            >
              Angebote vergleichen
            </Link>
            <Link
              href="/funnel/planung/kuechenform"
              className="inline-flex items-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Küchenplanung
            </Link>
            <Link
              href="/funnel/quiz/stil"
              className="inline-flex items-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Style-Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
