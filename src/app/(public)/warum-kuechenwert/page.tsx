import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Warum KüchenWert" };

const DIFFERENTIATORS = [
  {
    title: "Qualifizierung statt Kontaktweitergabe",
    desc: "Jeder Lead wird telefonisch geprüft. Händler erhalten nur ernsthafte, vollständige Anfragen – keine kalten Kontakte.",
  },
  {
    title: "Transparente Marktplatz-Mechanik",
    desc: "Anonymisiertes Matching, klare Lead-Preise, optionale Auktion – kein Black-Box-Vermittlungsmodell.",
  },
  {
    title: "Faire Abschluss-Ökonomie",
    desc: "Unsere Provision richtet sich nach dem tatsächlichen Auftragswert. Wir verdienen nur, wenn auch Sie zufrieden sind.",
  },
  {
    title: "Händler-Produktivität",
    desc: "CRM, Gebote, Status-Tracking, API-Anbindung – nicht nur ein PDF mit Kontaktdaten.",
  },
  {
    title: "Musterküchen-Zweitmarkt",
    desc: "Zusätzlicher Traffic durch Schnäppchenjäger, zusätzlicher Absatzkanal für Händler.",
  },
];

export default function WarumPage() {
  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold tracking-tight">Warum KüchenWert?</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-600">
        Transparenz schafft Wert. Wir sind keine reine Lead-Vermittlung – wir begleiten den gesamten Prozess von der Anfrage bis zum Einbau.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DIFFERENTIATORS.map((d) => (
          <div key={d.title} className="card">
            <h3 className="font-semibold text-zinc-900">{d.title}</h3>
            <p className="mt-2 text-sm text-zinc-500">{d.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/funnel/kuechenform" className="btn-primary">
          Jetzt kostenlos Angebote erhalten
        </Link>
      </div>
    </div>
  );
}
