import { Metadata } from "next";
import { ImageCard } from "@/components/ui/image-card";
import { CTABanner } from "@/components/ui/cta-banner";
import { KITCHEN_FORMS } from "@/config/kitchen-forms";

export const metadata: Metadata = {
  title: "Küchenformen – Welche Form passt in Ihren Raum?",
  description:
    "Küchenzeile, L-Form, U-Form, Kochinsel oder G-Form? Entdecken Sie alle Küchenformen mit Vor-/Nachteilen, Mindestmaßen und Preisen.",
};

export default function KuechenformenHubPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 py-14 lg:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Küchenformen im Überblick
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-300">
            Von der kompakten Küchenzeile bis zur großzügigen Kochinsel –
            finden Sie die Form, die perfekt in Ihren Raum passt.
          </p>
        </div>
      </section>

      {/* Form Grid */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KITCHEN_FORMS.map((form) => (
              <ImageCard
                key={form.slug}
                href={`/kuechenformen/${form.slug}`}
                title={form.name}
                description={`${form.tagline} · ${form.priceRange}`}
                bgClass={`bg-gradient-to-br ${form.gradient}`}
                size="large"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Comparison */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            Küchenformen im Vergleich
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b-2 border-brand-600">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-800">
                    Form
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-800">
                    Mindestfläche
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-800">
                    Ideal für
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-800">
                    Ab Preis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {KITCHEN_FORMS.map((form) => (
                  <tr key={form.slug} className="hover:bg-white">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {form.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {form.minSpace}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {form.idealFor.slice(0, 2).join(", ")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {form.priceRange.split("–")[0].trim()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="Welche Küchenform passt zu Ihrem Raum?"
        description="Beantworten Sie 5 einfache Fragen und erhalten Sie kostenlose Angebote – genau passend für Ihren Grundriss."
        primaryLabel="Angebote vergleichen"
        primaryHref="/funnel/angebote/kuechenform"
        secondaryLabel="Küchenplanung starten"
        secondaryHref="/funnel/planung/kuechenform"
      />
    </div>
  );
}
