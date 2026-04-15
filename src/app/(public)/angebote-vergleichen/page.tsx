import { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/accordion";
import { InlineCardEntry } from "@/components/funnel/inline-card-entry";
import { ANGEBOTE_KITCHEN_FORMS } from "@/config/funnel-angebote";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Bis zu 3 Küchenangebote vergleichen – kostenlos",
  description:
    "Erhalten Sie bis zu 3 kostenlose und unverbindliche Angebote von geprüften Küchenstudios in Ihrer Region. In nur 2 Minuten.",
};

const STEPS = [
  {
    num: "1",
    title: "Wünsche angeben",
    desc: "5 einfache Fragen zu Küchenform, Budget und Zeitrahmen – in unter 2 Minuten.",
  },
  {
    num: "2",
    title: "Experten-Matching",
    desc: "Wir finden bis zu 3 geprüfte Küchenstudios in Ihrer Region, die zu Ihren Anforderungen passen.",
  },
  {
    num: "3",
    title: "Angebote vergleichen",
    desc: "Erhalten Sie kostenlose Angebote, vergleichen Sie in Ruhe und sparen Sie beim Küchenkauf.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Was kostet der Angebotsvergleich?",
    answer:
      "Nichts. Unser Service ist für Sie als Kücheninteressent zu 100% kostenlos und unverbindlich. Die Kosten werden von den teilnehmenden Küchenstudios getragen.",
  },
  {
    question: "Wie viele Angebote erhalte ich?",
    answer:
      "Sie erhalten bis zu 3 individuelle Angebote von verschiedenen Küchenstudios in Ihrer Region. Die genaue Anzahl hängt von der Verfügbarkeit in Ihrem Gebiet ab.",
  },
  {
    question: "Wie schnell bekomme ich die Angebote?",
    answer:
      "Unser Team bearbeitet Ihre Anfrage in der Regel innerhalb von 24 Stunden. Die Angebote der Küchenstudios erhalten Sie üblicherweise innerhalb von 48–72 Stunden.",
  },
  {
    question: "Muss ich mich an ein Angebot binden?",
    answer:
      "Nein. Alle Angebote sind komplett unverbindlich. Sie entscheiden selbst, ob und mit welchem Studio Sie weiterarbeiten möchten.",
  },
];

const TRUST_STATS = [
  { value: "12.000+", label: "Zufriedene Nutzer" },
  { value: "800+", label: "Partner-Studios" },
  { value: "100%", label: "Kostenlos" },
  { value: "Ø 23%", label: "Ersparnis" },
];

export default function AngeboteVergleichenPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema(FAQ_ITEMS) }}
      />
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 to-brand-900 py-16 lg:py-24">
        <div className="section-container text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">
            In nur 2 Minuten
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Bis zu 3 Küchenangebote
            <br />
            <span className="text-accent-400">kostenlos vergleichen</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-300">
            Beantworten Sie 5 einfache Fragen und erhalten Sie individuelle
            Angebote von geprüften Küchenstudios in Ihrer Nähe.
          </p>
          <p className="mx-auto mt-8 max-w-lg text-sm font-medium text-brand-200">
            Welche Küchenform schwebt Ihnen vor?
          </p>
          <div className="mx-auto mt-4 max-w-2xl">
            <InlineCardEntry
              options={[...ANGEBOTE_KITCHEN_FORMS]}
              sessionKey="kw_funnel_angebote"
              dataField="kitchenForm"
              nextUrl="/funnel/angebote/budget"
            />
          </div>

          {/* Trust stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-brand-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            So funktioniert es
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
            3 Schritte zu Ihrer Traumküche – schnell, einfach und
            transparent.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-primary px-8 py-3.5"
            >
              Jetzt starten – kostenlos
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-16">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Darum vertrauen Kücheninteressenten KüchenWert
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "100% kostenlos & unverbindlich",
                desc: "Für Sie entstehen keinerlei Kosten. Sie entscheiden, ob und wann Sie aktiv werden.",
              },
              {
                title: "Geprüfte Fachhändler",
                desc: "Alle Küchenstudios in unserem Netzwerk werden sorgfältig geprüft und regelmäßig bewertet.",
              },
              {
                title: "Persönliche Beratung",
                desc: "Unser Experten-Team qualifiziert jede Anfrage persönlich und findet die besten Matches.",
              },
              {
                title: "DSGVO-konform",
                desc: "Ihre Daten werden SSL-verschlüsselt übertragen und nach deutschem Datenschutzrecht verarbeitet.",
              },
              {
                title: "Keine Wartezeit",
                desc: "Erste Angebote erhalten Sie in der Regel innerhalb von 48 Stunden nach Ihrer Anfrage.",
              },
              {
                title: "Transparente Preise",
                desc: "Vergleichen Sie Angebote verschiedener Studios und erkennen Sie sofort faire Preise.",
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
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
            Bereit für Ihre Traumküche?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            Starten Sie jetzt den kostenlosen Vergleich und erhalten Sie bis zu
            3 Angebote von geprüften Studios in Ihrer Nähe.
          </p>
          <div className="mt-8">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-10 py-4 text-base"
            >
              Angebote vergleichen – kostenlos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
