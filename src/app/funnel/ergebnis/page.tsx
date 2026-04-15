"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface QuizResult {
  styleSlug: string;
  styleLabel: string;
  description: string;
}

const STYLE_GRADIENTS: Record<string, string> = {
  modern: "from-zinc-800 to-zinc-950",
  landhaus: "from-amber-700 to-amber-900",
  industrial: "from-stone-600 to-stone-800",
  skandinavisch: "from-sky-200 to-sky-400",
};

export default function ErgebnisPage() {
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kw_quiz_result");
      if (raw) {
        setResult(JSON.parse(raw));
        sessionStorage.removeItem("kw_quiz_result");
      }
    } catch {
      // ignore
    }
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold">Vielen Dank!</h1>
          <p className="mt-3 text-zinc-600">
            Ihre Anfrage ist eingegangen. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const gradient = STYLE_GRADIENTS[result.styleSlug] ?? STYLE_GRADIENTS.modern;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="section-container flex h-14 items-center">
          <Link href="/" className="text-lg font-bold">
            <span className="text-accent-400">Küchen</span>
            <span className="text-brand-800">Wert</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-2xl">
          {/* Result Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
            {/* Style Header */}
            <div
              className={`bg-gradient-to-br ${gradient} flex items-center justify-center px-6 py-14`}
            >
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-white/60">
                  Ihr Küchenstil
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  {result.styleLabel}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-base leading-relaxed text-zinc-700">
                {result.description}
              </p>

              {/* Next Steps */}
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-bold text-zinc-900">
                  Und so geht es weiter:
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      num: "1",
                      title: "Experten-Check",
                      desc: "Unser Team prüft Ihre Angaben und findet die besten Studios in Ihrer Region.",
                    },
                    {
                      num: "2",
                      title: "3 Angebote erhalten",
                      desc: "Innerhalb von 48 Stunden erhalten Sie bis zu 3 individuelle Angebote.",
                    },
                    {
                      num: "3",
                      title: "Entscheiden",
                      desc: "Vergleichen Sie in Ruhe und entscheiden Sie sich – ohne Zeitdruck.",
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {step.num}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {step.title}
                        </p>
                        <p className="text-sm text-zinc-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 rounded-lg bg-brand-50 p-5 text-center">
                <p className="text-sm text-brand-700">
                  Möchten Sie mehr über den{" "}
                  <strong>{result.styleLabel}</strong>-Stil erfahren?
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/kuechenstile/${result.styleSlug}`}
                    className="btn-primary text-sm"
                  >
                    {result.styleLabel} entdecken
                  </Link>
                  <Link href="/" className="btn-secondary text-sm">
                    Zur Startseite
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
