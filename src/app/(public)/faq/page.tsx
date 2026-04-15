import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Accordion } from "@/components/ui/accordion";
import { CTABanner } from "@/components/ui/cta-banner";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ – Häufig gestellte Fragen zum Küchenkauf",
  description:
    "Antworten auf die wichtigsten Fragen rund um KüchenWert, den Küchenkauf, Kosten, Planung und unseren Service.",
};

const FAQ_SECTIONS = [
  {
    title: "Über KüchenWert",
    items: [
      {
        question: "Was ist KüchenWert?",
        answer:
          "KüchenWert ist ein kostenloser Vergleichsservice für Kücheninteressenten. Wir verbinden Sie mit geprüften Küchenstudios in Ihrer Region und helfen Ihnen, das beste Angebot für Ihre Traumküche zu finden.",
      },
      {
        question: "Ist der Service wirklich kostenlos?",
        answer:
          "Ja, zu 100%. Für Sie als Kücheninteressent entstehen keinerlei Kosten. Unser Service wird von den teilnehmenden Küchenstudios finanziert.",
      },
      {
        question: "Wie verdient KüchenWert Geld?",
        answer:
          "Küchenstudios zahlen eine Vermittlungsgebühr, wenn ein von uns vermittelter Kontakt zu einem Auftrag führt. Für Sie als Kunden hat das keinerlei Auswirkung auf den Preis.",
      },
      {
        question: "Werden meine Daten verkauft?",
        answer:
          "Nein. Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage an ausgewählte Küchenstudios weitergegeben. Wir verkaufen keine Daten an Dritte.",
      },
    ],
  },
  {
    title: "Angebotsvergleich & Planung",
    items: [
      {
        question: "Wie viele Angebote erhalte ich?",
        answer:
          "Beim schnellen Angebotsvergleich erhalten Sie bis zu 3 individuelle Angebote von verschiedenen Studios. Die genaue Anzahl hängt von der Verfügbarkeit in Ihrer Region ab.",
      },
      {
        question: "Wie schnell bekomme ich die Angebote?",
        answer:
          "Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden. Die Angebote der Studios erhalten Sie in der Regel innerhalb von 48–72 Stunden.",
      },
      {
        question: "Muss ich mich an ein Angebot binden?",
        answer:
          "Nein. Alle Angebote sind komplett unverbindlich. Sie können jedes Angebot ablehnen, ohne Gründe anzugeben.",
      },
      {
        question: "Was ist der Unterschied zwischen den 3 Wegen?",
        answer:
          "Der 'Angebotsvergleich' ist schnell (5 Fragen, 2 Min), die 'Küchenplanung' ist detailliert (11 Fragen, 5 Min) und das 'Style-Quiz' ist visuell und inspirierend (7 Fragen, 2 Min). Alle drei führen zu kostenlosen Angeboten.",
      },
      {
        question: "Kann ich meinen Grundriss hochladen?",
        answer:
          "Ja, sowohl bei der detaillierten Küchenplanung als auch beim Style-Quiz können Sie Ihren Grundriss als PDF, JPG oder PNG hochladen. Das ist optional, hilft den Studios aber bei der Planung.",
      },
    ],
  },
  {
    title: "Küchenkosten & Budget",
    items: [
      {
        question: "Was kostet eine durchschnittliche Küche?",
        answer:
          "Eine gute Alltagsküche mit Markengeräten kostet zwischen 8.000 und 15.000 €. Einfache Küchenzeilen gibt es ab 3.000 €, Designerküchen mit Kochinsel können über 50.000 € kosten.",
      },
      {
        question: "Wie kann ich beim Küchenkauf sparen?",
        answer:
          "Vergleichen Sie mehrere Angebote (genau dafür sind wir da), achten Sie auf Ausstellungsabverkäufe und investieren Sie in gute Geräte statt in teure Fronten.",
      },
      {
        question: "Gibt es Finanzierungsmöglichkeiten?",
        answer:
          "Viele Küchenstudios bieten Finanzierung an, teils mit 0% Zinsen. Details erfragen Sie am besten direkt beim jeweiligen Studio.",
      },
    ],
  },
  {
    title: "Küchenstudios & Qualität",
    items: [
      {
        question: "Wie werden die Küchenstudios geprüft?",
        answer:
          "Alle Studios durchlaufen einen mehrstufigen Qualifizierungsprozess. Wir prüfen Gewerbeanmeldung, Kundenbewertungen, Erfahrung und Referenzen. Regelmäßige Bewertungen durch unsere Nutzer stellen dauerhaft hohe Qualität sicher.",
      },
      {
        question: "Was passiert, wenn ich mit einem Studio unzufrieden bin?",
        answer:
          "Kontaktieren Sie unser Team. Wir nehmen jede Beschwerde ernst und medieren bei Bedarf zwischen Ihnen und dem Studio. Im Wiederholungsfall können Studios aus unserem Netzwerk ausgeschlossen werden.",
      },
      {
        question: "Werden nur lokale Studios empfohlen?",
        answer:
          "Ja, wir empfehlen ausschließlich Studios in Ihrer Region. Die Entfernung beträgt in der Regel maximal 50 km, damit eine persönliche Beratung vor Ort möglich ist.",
      },
    ],
  },
  {
    title: "Datenschutz & Sicherheit",
    items: [
      {
        question: "Wie werden meine Daten geschützt?",
        answer:
          "Ihre Daten werden SSL-verschlüsselt übertragen und auf Servern in Deutschland gespeichert. Wir halten uns strikt an die DSGVO und verarbeiten Daten nur zweckgebunden.",
      },
      {
        question: "Kann ich meine Daten löschen lassen?",
        answer:
          "Ja, jederzeit. Schreiben Sie an datenschutz@kuechenwert.de und wir löschen Ihre Daten innerhalb von 30 Tagen vollständig.",
      },
    ],
  },
];

export default function FAQPage() {
  const allItems = FAQ_SECTIONS.flatMap((s) => s.items);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema(allItems) }}
      />
      {/* Hero */}
      <section className="bg-brand-950 py-14">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Häufig gestellte Fragen
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            Antworten auf die wichtigsten Fragen rund um KüchenWert und den
            Küchenkauf.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "FAQ" },
            ]}
          />
        </div>
      </div>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="section-container max-w-3xl space-y-12">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-zinc-900">
                {section.title}
              </h2>
              <div className="mt-4">
                <Accordion items={section.items} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="Noch Fragen?"
        description="Unser Team hilft Ihnen gerne persönlich weiter."
        primaryLabel="Kontakt aufnehmen"
        primaryHref="/kontakt"
        secondaryLabel="Kostenlos Angebote vergleichen"
        secondaryHref="/funnel/angebote/kuechenform"
        variant="light"
      />
    </div>
  );
}
