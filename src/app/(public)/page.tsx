import Link from "next/link";
import { PlzInput } from "@/components/ui/plz-input";

const STEPS = [
  { num: "1", title: "Wünsche angeben", desc: "Beantworten Sie wenige Fragen zu Ihrer Traumküche – in unter 2 Minuten." },
  { num: "2", title: "Experten-Check", desc: "Unser Team prüft Ihre Angaben und findet passende Studios in Ihrer Region." },
  { num: "3", title: "Angebote vergleichen", desc: "Erhalten Sie bis zu 3 unverbindliche Angebote und wählen Sie das beste." },
];

const BENEFITS = [
  { title: "Zeitersparnis", desc: "Kein Klinkenputzen – passende Studios kommen zu Ihnen." },
  { title: "Preis-Transparenz", desc: "Vergleichbare Angebote auf Augenhöhe statt intransparenter Einzelgespräche." },
  { title: "Kein Risiko", desc: "100 % kostenlos und unverbindlich. Kein Kleingedrucktes." },
  { title: "Qualitätsgarantie", desc: "Nur geprüfte Fachhändler. Telefonische Vorqualifizierung jedes Leads." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white py-20 lg:py-28">
        <div className="section-container text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700">
            KüchenWert
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            Der einfachste Weg zu Ihrer <span className="text-brand-600">Traumküche</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600">
            Kostenlos, regional, unverbindlich – bis zu 3 Angebote von geprüften Küchenstudios aus Ihrer Nähe vergleichen und sparen.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <PlzInput size="large" />
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Transparenz schafft Wert. Keine versteckten Kosten.
          </p>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-3xl font-bold tracking-tight">So funktioniert&apos;s</h2>
          <p className="mt-3 text-center text-zinc-500">In 3 Schritten zur neuen Küche</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="card text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="bg-zinc-50 py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-3xl font-bold tracking-tight">Ihre Vorteile</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card">
                <h3 className="font-semibold text-zinc-900">{b.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 lg:py-20">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold tracking-tight">Bereit für Ihre Traumküche?</h2>
          <p className="mt-3 text-zinc-500">Starten Sie jetzt den kostenlosen Vergleich.</p>
          <div className="mx-auto mt-6 max-w-lg">
            <PlzInput size="large" />
          </div>
        </div>
      </section>
    </>
  );
}
