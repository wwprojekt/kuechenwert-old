import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PriceTable } from "@/components/ui/price-table";
import { CTABanner } from "@/components/ui/cta-banner";
import { Accordion } from "@/components/ui/accordion";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Was kostet eine Küche? – Preise, Faktoren & Spartipps",
  description:
    "Kompletter Kostenüberblick: Was kostet eine neue Küche 2026? Preisfaktoren, Beispielrechnungen und Tipps zum Sparen.",
};

const PRICE_COLUMNS = [
  { key: "category", label: "Preiskategorie", align: "left" as const },
  { key: "range", label: "Preisspanne", align: "right" as const },
  { key: "includes", label: "Das ist dabei", align: "left" as const },
];

const PRICE_ROWS = [
  { category: "Einfach", range: "3.000 – 6.000 €", includes: "Standardfronten, Basis-Geräte, Laminat-Arbeitsplatte" },
  { category: "Mittelklasse", range: "6.000 – 15.000 €", includes: "Qualitätsfronten, Markengeräte, Stein-Komposit-Platte" },
  { category: "Premium", range: "15.000 – 30.000 €", includes: "Design-Fronten, Premiumgeräte, Naturstein/Keramik" },
  { category: "Luxus", range: "30.000 – 80.000+ €", includes: "Maßanfertigung, Designermarken, Kochinsel, Naturmaterialien" },
];

const COST_FACTORS = [
  {
    title: "Fronten & Korpus (30–40%)",
    content:
      "Die Fronten sind der größte Einzelposten. Folienfronten ab 80 €/lfm, Lackfronten ab 200 €/lfm, Massivholz ab 350 €/lfm. Der Korpus besteht meist aus Spanplatte und macht preislich weniger aus.",
  },
  {
    title: "Elektrogeräte (20–30%)",
    content:
      "Herd, Backofen, Kühlschrank, Geschirrspüler und Dunstabzug. Basis-Sets ab 2.000 €, Markengeräte von Siemens/Bosch ab 3.500 €, Premium-Geräte von Miele/Gaggenau ab 6.000 €.",
  },
  {
    title: "Arbeitsplatte (10–15%)",
    content:
      "Laminat ab 50 €/lfm, Quarz-Komposit ab 200 €/lfm, Granit ab 250 €/lfm, Keramik ab 350 €/lfm. Die Arbeitsplatte beeinflusst die Optik enorm – hier lohnt sich die Investition.",
  },
  {
    title: "Spüle & Armatur (5–8%)",
    content:
      "Edelstahl-Spüle ab 100 €, Granit-Spüle ab 250 €, Keramik-Spüle ab 350 €. Premium-Armaturen (Quooker, Blanco) können allein 500 – 2.000 € kosten.",
  },
  {
    title: "Lieferung & Montage (5–10%)",
    content:
      "Professionelle Lieferung und Montage kosten typischerweise 500 – 2.000 €. Nicht daran sparen! Falsch eingebaute Küchen verursachen Folgekosten und Ärger.",
  },
  {
    title: "Planung & Extras",
    content:
      "Innenorganisation (Auszüge, Besteckeinsätze), Beleuchtung, Rückwand und Sockelblenden. Diese Details machen oft 5–10% der Gesamtkosten aus, erhöhen aber den Komfort erheblich.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Wie viel sollte man für eine gute Küche ausgeben?",
    answer:
      "Eine gute Alltagsküche mit Markengeräten und ordentlicher Verarbeitung kostet zwischen 8.000 und 15.000 €. Das ist der Sweet Spot zwischen Qualität und Preis-Leistung.",
  },
  {
    question: "Sind Küchen aus dem Internet günstiger?",
    answer:
      "Online-Küchen können 20–30% günstiger sein, aber: Sie haben keinen Aufmaß-Service, keine Planungsberatung und oft Probleme mit Lieferung und Montage. Qualitätsmängel sind ohne Vor-Ort-Kontrolle schwer feststellbar.",
  },
  {
    question: "Wie kann ich beim Küchenkauf sparen?",
    answer:
      "Vergleichen Sie mehrere Angebote (unser Service ist dafür da). Achten Sie auf Küchenausstellungen und Abverkäufe. Investieren Sie in gute Geräte, aber sparen Sie ggf. bei den Fronten. Vermeiden Sie unnötige Extras.",
  },
  {
    question: "Lohnt sich eine Finanzierung?",
    answer:
      "Viele Küchenstudios bieten 0%-Finanzierung an. Das kann sinnvoll sein, wenn Sie eine höherwertige Küche wollen, ohne sofort die volle Summe aufzubringen. Achten Sie auf die effektiven Zinsen nach der Sonderaktion.",
  },
];

export default function KostenPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema(FAQ_ITEMS) }}
      />
      {/* Hero */}
      <section className="bg-brand-950 py-14 lg:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Was kostet eine neue Küche?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-300">
            Der komplette Preisüberblick 2026: Von der einfachen Küchenzeile
            bis zur Designerküche mit Kochinsel.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "Küchenkosten" },
            ]}
          />
        </div>
      </div>

      {/* Price Table */}
      <section className="py-16">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-bold text-zinc-900">
            Küchenpreise im Überblick
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            Die folgenden Preise beziehen sich auf eine durchschnittliche
            Küche mit ca. 3 Metern Arbeitsfläche inkl. Geräte.
          </p>
          <div className="mt-8">
            <PriceTable
              columns={PRICE_COLUMNS}
              rows={PRICE_ROWS}
              highlightIndex={1}
              caption="Stand: April 2026. Preise inkl. MwSt., exkl. Lieferung und Montage."
            />
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="bg-zinc-50 py-16">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-bold text-zinc-900">
            Kostenfaktoren im Detail
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            So setzt sich der Preis Ihrer Küche zusammen.
          </p>
          <div className="mt-8">
            <Accordion items={COST_FACTORS.map(f => ({ question: f.title, answer: f.content }))} allowMultiple />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="section-container max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Häufige Fragen zu Küchenkosten
          </h2>
          <div className="mt-8">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="Kostenlose Angebote erhalten"
        description="Vergleichen Sie bis zu 3 Angebote von geprüften Küchenstudios – kostenlos und unverbindlich."
        primaryLabel="Angebote vergleichen"
        primaryHref="/funnel/angebote/kuechenform"
        secondaryLabel="Küchenrechner nutzen"
        secondaryHref="/rechner"
      />
    </div>
  );
}
