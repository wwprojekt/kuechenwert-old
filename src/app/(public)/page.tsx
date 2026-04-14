import Link from "next/link";
import { PlzInput } from "@/components/ui/plz-input";

const STEPS = [
  { num: "1", title: "Wünsche angeben", desc: "Beantworten Sie wenige Fragen zu Ihrer Traumküche – in unter 2 Minuten." },
  { num: "2", title: "Experten-Check", desc: "Unser Team prüft Ihre Angaben und findet die besten Studios in Ihrer Region." },
  { num: "3", title: "Angebote vergleichen", desc: "Erhalten Sie bis zu 3 unverbindliche Angebote und wählen Sie das beste." },
];

const BENEFITS = [
  { title: "Zeitersparnis", desc: "Kein Studio-Hopping – passende Händler kommen mit Angeboten zu Ihnen." },
  { title: "Preis-Transparenz", desc: "Vergleichbare Angebote auf Augenhöhe. Keine versteckten Kosten." },
  { title: "100% kostenlos", desc: "Unser Service ist für Sie komplett kostenfrei und unverbindlich." },
  { title: "Geprüfte Qualität", desc: "Nur verifizierte Fachhändler. Telefonische Qualifizierung jeder Anfrage." },
];

const SOCIAL_PROOF = [
  { text: "Endlich konnte ich Angebote wirklich vergleichen. 4.000 € gespart!", name: "Sabine M., München" },
  { text: "Schnell, unkompliziert und das Ergebnis war super. Sehr empfehlenswert.", name: "Thomas K., Hamburg" },
  { text: "Der Experten-Check hat versteckte Kosten im alten Angebot aufgedeckt.", name: "Andrea L., Berlin" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/30 via-brand-950 to-brand-950" />
        <div className="section-container relative text-center">
          <div className="mx-auto inline-block rounded-full bg-accent-500/10 px-4 py-1.5 text-xs font-semibold text-accent-400">
            Transparenz schafft Wert
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Der einfachste Weg zu Ihrer{" "}
            <span className="text-accent-400">Traumküche</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-200">
            Vergleichen Sie kostenlos bis zu 3 Angebote von geprüften Küchenstudios aus Ihrer Nähe – unverbindlich und in unter 2 Minuten.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <PlzInput size="large" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-300">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Kostenlos
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Unverbindlich
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Geprüfte Händler
            </span>
          </div>
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-3xl font-bold tracking-tight">So funktioniert&apos;s</h2>
          <p className="mt-3 text-center text-zinc-500">In 3 einfachen Schritten zur neuen Küche</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/25">
                  {step.num}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.desc}</p>
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
                <h3 className="font-semibold text-brand-800">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 lg:py-20">
        <div className="section-container">
          <h2 className="text-center text-3xl font-bold tracking-tight">Das sagen unsere Kunden</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SOCIAL_PROOF.map((review) => (
              <div key={review.name} className="card">
                <div className="flex gap-0.5 text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-3 text-xs font-medium text-zinc-400">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-brand-950 py-16 lg:py-20">
        <div className="section-container text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">Bereit für Ihre Traumküche?</h2>
          <p className="mt-3 text-brand-300">Starten Sie jetzt den kostenlosen Vergleich – unverbindlich und in unter 2 Minuten.</p>
          <div className="mx-auto mt-6 max-w-lg">
            <PlzInput size="large" />
          </div>
        </div>
      </section>
    </>
  );
}
