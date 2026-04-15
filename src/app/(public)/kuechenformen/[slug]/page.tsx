import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CTABanner } from "@/components/ui/cta-banner";
import { KITCHEN_FORMS } from "@/config/kitchen-forms";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const form = KITCHEN_FORMS.find((f) => f.slug === slug);
  if (!form) return {};

  return {
    title: form.seoTitle,
    description: form.seoDescription,
  };
}

export function generateStaticParams() {
  return KITCHEN_FORMS.map((f) => ({ slug: f.slug }));
}

export default async function KuechenformDetailPage({ params }: Props) {
  const { slug } = await params;
  const form = KITCHEN_FORMS.find((f) => f.slug === slug);
  if (!form) notFound();

  return (
    <div>
      {/* Hero */}
      <section
        className={`bg-gradient-to-br ${form.gradient} py-16 lg:py-24`}
      >
        <div className="section-container text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Küchenform
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {form.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {form.heroDescription}
          </p>
          <div className="mt-8">
            <Link
              href="/funnel/angebote/kuechenform"
              className="btn-accent px-8 py-3.5"
            >
              Angebote für {form.name} erhalten
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
              { label: "Küchenformen", href: "/kuechenformen" },
              { label: form.name },
            ]}
          />
        </div>
      </div>

      {/* Key Facts */}
      <section className="py-14">
        <div className="section-container max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mindestfläche
              </p>
              <p className="mt-2 text-xl font-bold text-brand-600">
                {form.minSpace}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Preisrahmen
              </p>
              <p className="mt-2 text-xl font-bold text-brand-600">
                {form.priceRange}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Ideal für
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-700">
                {form.idealFor[0]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-zinc-50 py-14">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-bold text-zinc-900">
            Vorteile der {form.name}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {form.advantages.map((a) => (
              <li key={a} className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
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
                <span className="text-sm text-zinc-700">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Content Sections */}
      {form.sections.map((section, i) => (
        <section
          key={i}
          className={i % 2 === 1 ? "bg-zinc-50 py-14" : "py-14"}
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

      {/* Other Forms */}
      <section className="py-14">
        <div className="section-container">
          <h2 className="text-xl font-bold text-zinc-900">
            Andere Küchenformen entdecken
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {KITCHEN_FORMS.filter((f) => f.slug !== form.slug).map(
              (other) => (
                <Link
                  key={other.slug}
                  href={`/kuechenformen/${other.slug}`}
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
        headline={`${form.name} planen lassen?`}
        description="Erhalten Sie kostenlose und unverbindliche Angebote von Fachhändlern in Ihrer Region."
        primaryLabel="Kostenlos Angebote erhalten"
        primaryHref="/funnel/angebote/kuechenform"
        secondaryLabel="Detaillierte Küchenplanung"
        secondaryHref="/funnel/planung/kuechenform"
      />
    </div>
  );
}
