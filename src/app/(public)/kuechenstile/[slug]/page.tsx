import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CTABanner } from "@/components/ui/cta-banner";
import { KITCHEN_STYLES } from "@/config/kitchen-styles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const style = KITCHEN_STYLES.find((s) => s.slug === slug);
  if (!style) return {};

  return {
    title: style.seoTitle,
    description: style.seoDescription,
  };
}

export function generateStaticParams() {
  return KITCHEN_STYLES.map((s) => ({ slug: s.slug }));
}

export default async function KuechenstilDetailPage({ params }: Props) {
  const { slug } = await params;
  const style = KITCHEN_STYLES.find((s) => s.slug === slug);
  if (!style) notFound();

  return (
    <div>
      {/* Hero */}
      <section
        className={`bg-gradient-to-br ${style.gradient} py-16 lg:py-24`}
      >
        <div className="section-container text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Küchenstil
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {style.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {style.heroDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-8 py-3.5"
            >
              Angebote für {style.name} erhalten
            </Link>
            <Link
              href="/funnel/quiz/stil"
              className="inline-flex items-center rounded-lg border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Style-Quiz starten
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "Küchenstile", href: "/kuechenstile" },
              { label: style.name },
            ]}
          />
        </div>
      </div>

      {/* Characteristics */}
      <section className="py-16">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-bold text-zinc-900">
            Merkmale der {style.name}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {style.characteristics.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span className="text-sm text-zinc-700">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Content Sections */}
      {style.sections.map((section, i) => (
        <section
          key={i}
          className={i % 2 === 0 ? "bg-zinc-50 py-14" : "py-14"}
        >
          <div className="section-container max-w-4xl">
            <h2 className="text-xl font-bold text-zinc-900">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {section.content}
            </p>
          </div>
        </section>
      ))}

      {/* Materials & Price */}
      <section className="border-t border-zinc-200 bg-white py-14">
        <div className="section-container max-w-4xl">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Typische Materialien
              </h3>
              <ul className="mt-4 space-y-2">
                {style.materials.map((m) => (
                  <li
                    key={m}
                    className="flex items-center gap-2 text-sm text-zinc-600"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Preisrahmen
              </h3>
              <p className="mt-4 text-3xl font-bold text-brand-600">
                {style.priceRange}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Abhängig von Größe, Materialwahl und Geräteausstattung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Styles */}
      <section className="py-14">
        <div className="section-container">
          <h2 className="text-xl font-bold text-zinc-900">
            Andere Küchenstile entdecken
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {KITCHEN_STYLES.filter((s) => s.slug !== style.slug).map(
              (other) => (
                <Link
                  key={other.slug}
                  href={`/kuechenstile/${other.slug}`}
                  className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  {other.name}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        headline={`Ihre ${style.name} planen lassen?`}
        description="Erhalten Sie kostenlose Angebote von Küchenstudios, die sich auf diesen Stil spezialisiert haben."
        primaryLabel="Kostenlos Angebote erhalten"
        primaryHref="/funnel/angebote/kuechenform"
        secondaryLabel="Detaillierte Küchenplanung"
        secondaryHref="/funnel/planung/kuechenform"
      />
    </div>
  );
}
