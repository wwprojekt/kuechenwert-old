import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="section-container py-16">
      <h1 className="text-3xl font-bold">Impressum</h1>
      <div className="prose mt-8 max-w-none text-zinc-600">
        <p>Angaben gemäß § 5 TMG:</p>
        <p className="mt-4">
          <strong>KüchenWert</strong><br />
          [Firmenname eintragen]<br />
          [Straße Hausnummer]<br />
          [PLZ Ort]
        </p>
        <p className="mt-4">
          <strong>Kontakt:</strong><br />
          E-Mail: info@kuechenwert.de<br />
          Telefon: [Nummer eintragen]
        </p>
        <p className="mt-4">
          <strong>Vertretungsberechtigte Person:</strong><br />
          [Name eintragen]
        </p>
        <p className="mt-4">
          <strong>Umsatzsteuer-ID:</strong><br />
          [USt-IdNr. eintragen]
        </p>
        <p className="mt-4">
          <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
          [Name und Anschrift eintragen]
        </p>
      </div>
    </div>
  );
}
