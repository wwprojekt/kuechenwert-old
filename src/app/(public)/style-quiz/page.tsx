import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Küchen Style-Quiz – Finden Sie Ihren Stil",
  description:
    "Entdecken Sie in 2 Minuten Ihren persönlichen Küchenstil. Unser visuelles Quiz hilft Ihnen, die perfekte Küche zu finden.",
};

const STYLES = [
  {
    slug: "modern",
    label: "Modern",
    desc: "Klare Linien, grifflos, minimalistisch",
    gradient: "from-zinc-800 to-zinc-950",
  },
  {
    slug: "landhaus",
    label: "Landhaus",
    desc: "Warm, natürlich, einladend",
    gradient: "from-amber-700 to-amber-900",
  },
  {
    slug: "industrial",
    label: "Industrial",
    desc: "Rau, urban, charakterstark",
    gradient: "from-stone-600 to-stone-800",
  },
  {
    slug: "skandinavisch",
    label: "Skandinavisch",
    desc: "Hell, funktional, gemütlich",
    gradient: "from-sky-200 to-sky-400",
  },
];

export default function StyleQuizPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.1),_transparent_60%)]" />
        <div className="section-container relative text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">
            In 2 Minuten
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Welcher Küchenstil
            <br />
            <span className="text-accent-400">passt zu Ihnen?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-300">
            Wählen Sie Bilder, die Sie ansprechen – unser Quiz findet Ihren
            persönlichen Küchenstil und passende Studios.
          </p>
          <div className="mt-8">
            <Link
              href="/funnel/quiz/stil"
              className="btn-accent px-10 py-4 text-base"
            >
              Quiz starten
            </Link>
          </div>
        </div>
      </section>

      {/* Style Preview Grid */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            Vier Küchenstile – einer ist Ihrer
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
            Jeder Stil erzählt eine andere Geschichte. Finden Sie heraus,
            welche zu Ihnen passt.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {STYLES.map((style) => (
              <div
                key={style.slug}
                className="group relative overflow-hidden rounded-xl"
              >
                <div
                  className={`bg-gradient-to-br ${style.gradient} flex aspect-[16/9] items-end p-6`}
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {style.label}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{style.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/funnel/quiz/stil"
              className="btn-primary px-8 py-3.5"
            >
              Welcher bin ich? Quiz starten
            </Link>
          </div>
        </div>
      </section>

      {/* How the quiz works */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-16">
        <div className="section-container">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            So funktioniert das Style-Quiz
          </h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-6">
            {[
              {
                num: "1",
                title: "Bilder wählen",
                desc: "Wählen Sie Küchen und Farben, die Sie ansprechen – ganz intuitiv.",
              },
              {
                num: "2",
                title: "Prioritäten setzen",
                desc: "Sagen Sie uns, was Ihnen wichtig ist: Stauraum, Design, Geräte?",
              },
              {
                num: "3",
                title: "Ergebnis erhalten",
                desc: "Ihr persönlicher Küchenstil + passende Angebote von Studios in Ihrer Nähe.",
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
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Neugierig geworden?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            Finden Sie in 2 Minuten Ihren Küchenstil – und erhalten Sie direkt
            passende Angebote.
          </p>
          <div className="mt-8">
            <Link
              href="/funnel/quiz/stil"
              className="btn-accent px-10 py-4 text-base"
            >
              Style-Quiz starten
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
