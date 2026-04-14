import type { Metadata } from "next";

export const metadata: Metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>
      <div className="prose mt-8 max-w-none text-zinc-600">
        <p>
          [AGB-Text durch Rechtsanwalt erstellen lassen. Platzhalter für die folgenden Abschnitte:]
        </p>
        <ol className="list-decimal pl-6 space-y-2 mt-4">
          <li>Geltungsbereich</li>
          <li>Vertragsgegenstand</li>
          <li>Leistungsbeschreibung (Endkunden / Händler)</li>
          <li>Preise und Zahlungsbedingungen</li>
          <li>Widerrufsbelehrung (soweit anwendbar)</li>
          <li>Haftung und Gewährleistung</li>
          <li>Datenschutz (Verweis auf Datenschutzerklärung)</li>
          <li>Schlussbestimmungen</li>
        </ol>
        <p className="mt-8 text-sm text-zinc-400">
          Dieser Text ist ein Platzhalter und muss juristisch erstellt werden.
        </p>
      </div>
    </div>
  );
}
