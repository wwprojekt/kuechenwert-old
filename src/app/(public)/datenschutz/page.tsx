import type { Metadata } from "next";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – KüchenWert",
  description:
    "Datenschutzerklärung der KüchenWert-Plattform gemäß DSGVO und BDSG. Informationen zur Verarbeitung personenbezogener Daten.",
};

export default function DatenschutzPage() {
  return (
    <div className="section-container py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight-2 text-ink sm:text-4xl">
        Datenschutzerklärung
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Stand: April 2026 · Version 1.0 · Gilt für die Plattform küchenwert.de
      </p>

      <div className="mt-10 max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink-muted [&_h2]:!mt-10 [&_h3]:!mt-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5">
        <h2 className="text-xl font-bold text-ink">1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          <br />
          <strong className="text-ink">
            {COMPANY.legal_name}
            <br />
            {COMPANY.address}
            <br />
            {COMPANY.postal_code} {COMPANY.city}, {COMPANY.country}
            <br />
          </strong>
          Telefon: {COMPANY.phone}
          <br />
          E-Mail:{" "}
          <a className="text-brand-700 hover:underline" href={`mailto:${COMPANY.email_ascii}`}>
            {COMPANY.email}
          </a>
          <br />
          Vertretungsberechtigt: {COMPANY.director} (Geschäftsführerin)
          <br />
          Handelsregister: {COMPANY.register_court}, {COMPANY.register_no}
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">2. Hosting &amp; technische Bereitstellung</h2>
        <p>
          Die Website wird auf Servern eines Auftragsverarbeiters (Hetzner Online GmbH bzw. Dokploy
          Self-Hosting) in Deutschland betrieben. Datenbank- und Storage-Services werden durch die
          Supabase Inc. (USA) im EU-Region-Cluster (Frankfurt) bereitgestellt; ein
          Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO mit Standardvertragsklauseln liegt vor.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">3. Erhobene Daten und Verarbeitungszwecke</h2>
        <h3 className="mt-6 text-base font-bold text-ink">a) Lead-Generierung (Funnel A „Angebot erhalten")</h3>
        <ul>
          <li>
            <strong>Pflichtangaben:</strong> Postleitzahl, Wohnsituation, Küchenform, Küchenstil,
            Budget, Zeitrahmen, Vor- und Nachname, E-Mail, Telefonnummer, Adresse
          </li>
          <li>
            <strong>Zweck:</strong> Vermittlung Ihres Anliegens an passende Küchenfachhändler in
            Ihrer Region
          </li>
          <li>
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie
            Art. 6 Abs. 1 lit. a DSGVO (Einwilligung in die Weitergabe an Drittunternehmen)
          </li>
        </ul>

        <h3 className="mt-6 text-base font-bold text-ink">b) Reverse-Auktion (Funnel B „Angebot vergleichen")</h3>
        <ul>
          <li>
            <strong>Zusätzliche Daten:</strong> bestehender Angebotspreis, hochgeladene Dokumente
            (Grundriss, Angebot, Bilder der konfigurierten Küche), Geräteliste mit Hersteller und
            Modellbezeichnung, Wunschtermin, Liefer- und Zahlungsmodalitäten
          </li>
          <li>
            <strong>Zweck:</strong> Durchführung einer 72-stündigen Auktion mit registrierten
            Küchenstudios; Auswahl des günstigsten verbindlichen Angebots
          </li>
          <li>
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchführung)
          </li>
          <li>
            <strong>Hinweis:</strong> Während der Auktion werden Ihre PII (Name, E-Mail, Telefon,
            Adresse) <strong>nicht</strong> an die bietenden Händler übermittelt. Nur der gewinnende
            Händler erhält nach Auktionsende Ihre Kontaktdaten.
          </li>
        </ul>

        <h3 className="mt-6 text-base font-bold text-ink">c) Logfiles &amp; technische Daten</h3>
        <p>
          Bei jedem Aufruf werden automatisch IP-Adresse, Datum, Uhrzeit, User-Agent und Referrer
          erfasst und für maximal 14 Tage zur Sicherstellung des Betriebs und Abwehr von Angriffen
          gespeichert (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">4. Empfänger der Daten</h2>
        <p>
          Wir geben Ihre Daten ausschließlich an folgende Empfängergruppen weiter:
        </p>
        <ul>
          <li>
            <strong>Küchenfachhändler:</strong> Funnel A → bis zu drei vorausgewählte Händler nach
            erfolgtem Lead-Kauf. Funnel B → ausschließlich der gewinnende Händler.
          </li>
          <li>
            <strong>Auftragsverarbeiter:</strong> Hosting (Hetzner / Dokploy), Datenbank (Supabase Inc., USA;
            EU-Region Frankfurt), E-Mail-Versand (Resend). Mit allen Anbietern besteht ein AVV gemäß Art. 28 DSGVO.
            Zahlungen an uns erfolgen ausschließlich per SEPA-Überweisung; es werden keine externen
            Zahlungsdienstleister eingebunden.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-ink">5. Speicherdauer</h2>
        <ul>
          <li>Lead-Daten ohne Vertragsabschluss: 6 Monate ab letzter Aktivität, danach Löschung</li>
          <li>Vertragsdaten (gewonnene Auktionen): 10 Jahre (handelsrechtliche Aufbewahrungspflicht)</li>
          <li>Rechnungs- und Buchhaltungsdaten: 10 Jahre (§ 147 AO)</li>
          <li>Cookie-Einwilligungen / Consent-Records: 3 Jahre (Nachweispflicht Art. 7 DSGVO)</li>
          <li>Server-Logs: 14 Tage</li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-ink">6. Cookies und Tracking</h2>
        <p>
          Wir setzen ausschließlich technisch notwendige Cookies (Session-Cookie, CSRF-Token,
          Funnel-Fortschritt) auf Basis von Art. 6 Abs. 1 lit. f DSGVO i.V.m. § 25 Abs. 2 Nr. 2 TTDSG.
          Analyse- oder Marketing-Cookies werden nur nach Ihrer ausdrücklichen Einwilligung über
          das Cookie-Banner gesetzt; die Einwilligung kann jederzeit widerrufen werden über den
          Footer-Link „Cookie-Einstellungen".
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">7. Ihre Rechte</h2>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO), soweit keine Aufbewahrungspflicht besteht</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
          <li>
            Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO), z. B. der für unseren Sitz
            zuständigen Datenschutzbehörde
          </li>
        </ul>
        <p>
          Anfragen senden Sie bitte an{" "}
          <a className="text-brand-700 hover:underline" href="mailto:datenschutz@kuechenwert24.de">
            datenschutz@kuechenwert24.de
          </a>
          . Wir reagieren binnen 30 Tagen.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">8. Datensicherheit</h2>
        <p>
          Sämtliche Datenübertragungen erfolgen TLS-verschlüsselt (HTTPS). Zugriffe auf die
          Datenbank sind durch Row-Level-Security und rollenbasierte Berechtigungen abgesichert.
          Passwörter werden ausschließlich als gesalzene Hashes gespeichert.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">9. Änderungen dieser Erklärung</h2>
        <p>
          Wir passen diese Datenschutzerklärung bei Änderungen unserer Verarbeitungstätigkeiten oder
          rechtlichen Vorgaben an. Die jeweils aktuelle Version finden Sie auf dieser Seite.
        </p>

        <p className="mt-12 rounded-lg border border-warning-500/30 bg-warning-500/5 p-4 text-xs text-warning-600">
          <strong>Hinweis:</strong> Diese Datenschutzerklärung enthält Platzhalter für
          Verantwortlichen-Adresse und Geschäftsführer. Diese müssen vor Live-Schaltung mit echten
          Firmendaten gefüllt und durch einen Fachanwalt für Datenschutzrecht geprüft werden.
        </p>
      </div>
    </div>
  );
}
