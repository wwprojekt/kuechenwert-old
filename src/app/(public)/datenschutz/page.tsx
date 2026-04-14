import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function DatenschutzPage() {
  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
      <div className="prose mt-8 max-w-none text-zinc-600">
        <p>
          Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen.
          Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener
          Daten auf unserer Website gemäß der DSGVO und dem BDSG.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-zinc-900">1. Verantwortlicher</h2>
        <p>[Firmenname, Adresse, E-Mail – identisch mit Impressum]</p>

        <h2 className="mt-8 text-xl font-semibold text-zinc-900">2. Erhobene Daten</h2>
        <p>Wir verarbeiten personenbezogene Daten, die Sie uns im Rahmen der Nutzung unserer Plattform bereitstellen, insbesondere:</p>
        <ul className="list-disc pl-6">
          <li>Kontaktdaten (Name, E-Mail, Telefon, PLZ)</li>
          <li>Angaben zu Küchenwünschen (Form, Stil, Budget, Zeitrahmen)</li>
          <li>Hochgeladene Dokumente (Grundrisse, bestehende Angebote)</li>
          <li>Nutzungsdaten (IP-Adresse, Browser, Referrer)</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-zinc-900">3. Zweck und Rechtsgrundlage</h2>
        <p>Die Verarbeitung erfolgt zur Vermittlung von Küchenangeboten (Art. 6 Abs. 1 lit. b DSGVO) sowie auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) für Marketing-Kommunikation.</p>

        <h2 className="mt-8 text-xl font-semibold text-zinc-900">4. Weitergabe an Dritte</h2>
        <p>Ihre Daten werden ausschließlich an von Ihnen ausgewählte bzw. passende Küchenfachhändler weitergegeben. Eine Weitergabe an Dritte erfolgt nur mit Ihrer ausdrücklichen Einwilligung oder auf Basis eines berechtigten Interesses.</p>

        <h2 className="mt-8 text-xl font-semibold text-zinc-900">5. Cookies</h2>
        <p>Wir setzen technisch notwendige Cookies ein. Analyse-Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt (Consent-Banner).</p>

        <h2 className="mt-8 text-xl font-semibold text-zinc-900">6. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Kontaktieren Sie uns unter info@kuechenwert.de.</p>

        <p className="mt-8 text-sm text-zinc-400">
          Diese Datenschutzerklärung ist ein Platzhalter und muss von einem Fachanwalt geprüft und ergänzt werden.
        </p>
      </div>
    </div>
  );
}
