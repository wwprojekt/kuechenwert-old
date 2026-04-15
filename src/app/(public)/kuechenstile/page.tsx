import { Metadata } from "next";
import { ImageCard } from "@/components/ui/image-card";
import { CTABanner } from "@/components/ui/cta-banner";
import { KITCHEN_STYLES } from "@/config/kitchen-styles";

export const metadata: Metadata = {
  title: "Küchenstile – Inspiration für Ihre Traumküche",
  description:
    "Entdecken Sie die beliebtesten Küchenstile: Modern, Klassisch, Landhaus, Industrial, Skandinavisch und Design. Mit Preisen, Materialien und Planungstipps.",
};

export default function KuechenstileHubPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 py-14 lg:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Küchenstile im Überblick
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-300">
            Welcher Küchenstil passt zu Ihnen? Entdecken Sie 6 beliebte Stile
            mit Materialien, Preisen und Planungstipps.
          </p>
        </div>
      </section>

      {/* Style Grid */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KITCHEN_STYLES.map((style) => (
              <ImageCard
                key={style.slug}
                href={`/kuechenstile/${style.slug}`}
                title={style.name}
                description={style.tagline}
                bgClass={`bg-gradient-to-br ${style.gradient}`}
                size="large"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline="Nicht sicher, welcher Stil zu Ihnen passt?"
        description="Unser Style-Quiz findet es in 2 Minuten heraus – spielerisch und kostenlos."
        primaryLabel="Style-Quiz starten"
        primaryHref="/funnel/quiz/stil"
        secondaryLabel="Angebote vergleichen"
        secondaryHref="/funnel/angebote/kuechenform"
      />
    </div>
  );
}
