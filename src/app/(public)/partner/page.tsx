import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Für Händler – Partner werden",
  description: "Mehr Umsatz, weniger Akquise: Qualifizierte Küchen-Leads für Ihr Studio.",
};

const FEATURES = [
  { title: "Qualifizierte Leads", desc: "Telefonisch geprüfte Kunden mit echtem Kaufinteresse – kein Streuverlust." },
  { title: "Faires Pay-per-Lead", desc: "Sie zahlen nur für Leads, die zu Ihrem Profil passen. Transparente Preise." },
  { title: "Händlerprofil", desc: "Ihre Mini-Website auf KüchenWert: Logo, Galerie, Marken, Öffnungszeiten, Bewertungen." },
  { title: "Lead-Management", desc: "Dashboard mit CRM-Pipeline: Kontaktiert, Termin, Angebot, Abgeschlossen." },
  { title: "Musterküchen-Börse", desc: "Verkaufen Sie Ausstellungsstücke vergünstigt an Schnäppchenjäger." },
  { title: "Gebote & Auktionen", desc: "Geben Sie Angebote auf strukturierte Kundenanfragen ab – Transparenz für alle." },
];

export default function PartnerPage() {
  return (
    <div className="section-container py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Für Küchenstudios</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Mehr Umsatz, weniger Akquise
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Erhalten Sie vorqualifizierte Kundenanfragen aus Ihrer Region. Kein Streuverlust, faires Preismodell, volle Transparenz.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/partner/registrieren" className="btn-primary">Jetzt als Händler registrieren</Link>
          <Link href="/partner/dashboard" className="btn-secondary">Händler-Login</Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <h3 className="font-semibold text-zinc-900">{f.title}</h3>
            <p className="mt-2 text-sm text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
