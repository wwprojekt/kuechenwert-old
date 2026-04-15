import { Metadata } from "next";
import Link from "next/link";
import { StatCounter } from "@/components/ui/stat-counter";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Über uns – Das Team hinter KüchenWert",
  description:
    "Lernen Sie KüchenWert kennen: Unsere Mission, unsere Werte und warum wir den Küchenkauf transparenter machen.",
};

const STATS = [
  { value: 12000, suffix: "+", label: "Vermittelte Anfragen" },
  { value: 800, suffix: "+", label: "Partner-Studios" },
  { value: 23, suffix: "%", label: "Ø Ersparnis" },
  { value: 98, suffix: "%", label: "Zufriedenheit" },
];

export default function UeberUnsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 py-14 lg:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Über KüchenWert
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-300">
            Wir machen den Küchenkauf transparent, fair und einfach.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "Über uns" },
            ]}
          />
        </div>
      </div>

      {/* Mission */}
      <section className="py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-2xl font-bold text-zinc-900">Unsere Mission</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Der Küchenkauf ist für die meisten Menschen eine der größten
            Anschaffungen im Leben – und gleichzeitig eine der
            intransparentesten. Preise variieren enorm, Qualitätsunterschiede
            sind für Laien kaum erkennbar und der Vergleich verschiedener
            Angebote ist mühsam.
          </p>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            KüchenWert wurde gegründet, um das zu ändern. Wir verbinden
            Kücheninteressenten mit geprüften Fachhändlern und schaffen
            Transparenz dort, wo sie am meisten gebraucht wird: beim Preis,
            bei der Qualität und bei der Beratung.
          </p>
        </div>
      </section>

      {/* Stats */}
      <StatCounter stats={STATS} />

      {/* Values */}
      <section className="py-16">
        <div className="section-container max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Unsere Werte
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Transparenz",
                desc: "Keine versteckten Kosten, keine Provisionen für den Kunden. Sie sehen immer, was Sie bekommen.",
              },
              {
                title: "Qualität",
                desc: "Jedes Küchenstudio in unserem Netzwerk durchläuft einen mehrstufigen Qualifizierungsprozess.",
              },
              {
                title: "Fairness",
                desc: "Wir verdienen nur, wenn unsere Partner zufrieden sind. Ihr Erfolg ist unser Erfolg.",
              },
            ].map((val) => (
              <div key={val.title} className="text-center">
                <h3 className="text-lg font-bold text-brand-700">
                  {val.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-950 py-14">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold text-white">
            Überzeugt? Starten Sie jetzt.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-8 py-3.5"
            >
              Kostenlos Angebote vergleichen
            </Link>
            <Link
              href="/partner"
              className="inline-flex items-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Partner werden
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
