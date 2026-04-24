import type { Metadata } from "next";
import { COMPANY, PAYMENT_TERMS_DAYS, PENALTY_AMOUNT_EUR } from "@/config/company";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen – KüchenWert",
  description:
    "AGB der KüchenWert-Plattform für Verbraucher und Küchenfachhändler, inklusive Regeln für die 72-Stunden-Auktion und Zahlungsbedingungen.",
};

export default function AgbPage() {
  return (
    <div className="section-container py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight-2 text-ink sm:text-4xl">
        Allgemeine Geschäftsbedingungen
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Stand: April 2026 · Version 1.0 · Plattform küchenwert.de
      </p>
      <p className="mt-2 max-w-prose text-xs text-ink-subtle">
        Hinweis: Dieses Dokument wurde vom Betreiber in erster Fassung aufgesetzt und soll vor
        Go-Live durch einen Fachanwalt finalisiert werden. Alle Pflichten aus BGB, FernAG und DSGVO
        bleiben unberührt.
      </p>

      <div className="mt-10 max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink-muted [&_h2]:!mt-10 [&_h3]:!mt-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5">
        {/* ============================ § 1 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 1 Geltungsbereich</h2>
        <p>
          (1) Diese Allgemeinen Geschäftsbedingungen („AGB") gelten für die Nutzung der
          Vergleichs- und Vermittlungsplattform <strong className="text-ink">{COMPANY.brand_name}</strong>,
          betrieben von {COMPANY.legal_name}, {COMPANY.address}, {COMPANY.postal_code} {COMPANY.city}
          (nachfolgend „Betreiber" oder „wir").
        </p>
        <p>
          (2) Nutzer der Plattform sind zum einen Verbraucher im Sinne des § 13 BGB („Verbraucher"),
          die Kücheninteressen äußern, und zum anderen gewerbliche Küchenfachhändler („Händler"),
          die als Unternehmer im Sinne des § 14 BGB auftreten.
        </p>
        <p>
          (3) Abweichende, entgegenstehende oder ergänzende AGB der Händler werden nur Vertragsbestandteil,
          wenn wir ihrer Geltung ausdrücklich schriftlich zugestimmt haben.
        </p>

        {/* ============================ § 2 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 2 Leistungsgegenstand</h2>
        <p>
          (1) Der Betreiber stellt eine Online-Plattform zur Verfügung, auf der
        </p>
        <ul>
          <li>
            <strong>Funnel A („Angebot erhalten")</strong>: Verbraucher ein Interesse an einer neuen
            Küche artikulieren. Ihre Anfrage wird anonymisiert an passende Händler weitergeleitet.
            Ein einzelner Händler kann den Lead kostenpflichtig erwerben und erhält danach die
            vollständigen Kontaktdaten.
          </li>
          <li>
            <strong>Funnel B („Bestehendes Angebot vergleichen")</strong>: Verbraucher ein
            bestehendes Angebot eines Küchenstudios einstellen. Das Angebot durchläuft nach einer
            fachlichen Prüfung durch unseren Service eine 72-stündige Reverse-Auktion unter
            registrierten Händlern.
          </li>
        </ul>
        <p>
          (2) Der Betreiber wird nicht Vertragspartner des zwischen Verbraucher und Händler
          zustandekommenden Kaufvertrags über die Küche. Vertragspartner sind ausschließlich
          Verbraucher und Händler.
        </p>
        <p>
          (3) Der Betreiber erhebt von Verbrauchern kein Entgelt. Händler zahlen pro Lead-Kauf
          (Funnel A) oder im Erfolgsfall einer Auktion eine Provision (Funnel B).
        </p>

        {/* ============================ § 3 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 3 Registrierung der Händler</h2>
        <p>
          (1) Die Teilnahme an Auktionen und der Kauf von Leads setzen eine erfolgreiche
          Händler-Registrierung voraus. Registriert werden nur gewerblich tätige Küchenfachhändler
          mit nachvollziehbarem Handelsregister- bzw. Gewerbe-Eintrag. Der Betreiber behält sich die
          Prüfung und Ablehnung von Registrierungen ohne Angabe von Gründen vor.
        </p>
        <p>
          (2) Der Händler sichert zu, dass alle bei der Registrierung angegebenen Daten zutreffen und
          hält seine Angaben aktuell. Verstöße, insbesondere falsche Firmenangaben, berechtigen zur
          fristlosen Kündigung des Plattform-Zugangs.
        </p>

        {/* ============================ § 4 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 4 Lead-Kauf (Funnel A)</h2>
        <p>
          (1) Im Marktplatz bietet der Betreiber qualifizierte Verbraucher-Leads an. Der Händler sieht
          vor dem Kauf nur Postleitzahl, Budget, Küchenform und qualitative Tier-Kennzeichnung; Name,
          Adresse, Telefon und E-Mail des Verbrauchers werden erst nach Kauf freigeschaltet.
        </p>
        <p>
          (2) Der Lead-Preis ergibt sich aus einer vom Betreiber transparent geführten Preisstaffel
          (Budget-Bereich × Tier). Die jeweils gültige Staffel kann der Händler jederzeit im
          Händler-Portal einsehen.
        </p>
        <p>
          (3) Mit Klick auf „Lead kaufen" gibt der Händler ein verbindliches Angebot ab; der Vertrag
          kommt mit Bestätigungs-E-Mail und dem im Konto angezeigten Lead-Eintrag mit Status „gekauft"
          zustande. Ein Lead wird exklusiv an einen Händler verkauft.
        </p>
        <p>
          (4) Der Lead-Kauf ist nach Freigabe der Kontaktdaten bindend und nicht widerruflich, da es
          sich um eine digitale Dienstleistung handelt, die mit ausdrücklicher Zustimmung des
          Händlers unmittelbar erbracht wird (§ 356 Abs. 4 BGB analog / § 312g Abs. 2 Nr. 9 BGB für
          Verträge unter Unternehmern ohnehin ausgeschlossen).
        </p>

        {/* ============================ § 5 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 5 Reverse-Auktion (Funnel B)</h2>
        <p>
          (1) Stellt ein Verbraucher ein bestehendes Studio-Angebot ein, wird dieses nach interner
          Validierung für eine Dauer von <strong>72 Stunden</strong> anonymisiert als Auktion
          freigeschaltet. Alle registrierten Händler können innerhalb dieser Frist Gebote abgeben.
        </p>
        <p>
          (2) Gebote sind Festpreisangebote in Euro inklusive Umsatzsteuer und enthalten
          Verbindlichkeiten zur Lieferung, zum Aufbau und zum Zahlungsmodus entsprechend der vom
          Verbraucher vorgegebenen Parameter. Gebote können während der laufenden Auktion nur nach
          unten korrigiert werden; nach Auktionsende sind sie unwiderruflich.
        </p>
        <p>
          (3) Mit Abgabe eines Gebots erklärt der Händler, das Angebot im Falle eines Zuschlags
          <strong> innerhalb von 14 Kalendertagen</strong> in Form eines identischen schriftlichen
          Kaufvertrags dem Verbraucher zuzusenden.
        </p>
        <p>
          (4) Der Verbraucher wird ausdrücklich darauf hingewiesen, dass er durch das Einstellen der
          Auktion eine <strong>beidseitige Bindung</strong> begründet: Nach Auktionsende hat er den
          Kaufvertrag mit dem Gewinner-Händler zum gebotenen Preis abzuschließen, sofern die
          ausgeschriebenen Spezifikationen unverändert bleiben. Eine Annahmepflicht besteht nicht,
          wenn (a) sich die Spezifikation nachweislich geändert hat oder (b) sachliche Mängel am
          Gewinner-Angebot vorliegen (z. B. abweichende Liefermodalitäten, fehlende Montage).
        </p>
        <p>
          (5) Bricht eine Partei die durch den Zuschlag begründete Verpflichtung ohne wichtigen Grund
          ab, ist an die Gegenseite eine pauschale Bearbeitungsgebühr in Höhe von
          <strong> {PENALTY_AMOUNT_EUR.toLocaleString("de-DE")} €</strong> zu zahlen. Weitergehender
          Schadensersatz bleibt hiervon unberührt; der betroffenen Partei steht es frei, einen höheren
          Schaden nachzuweisen, ebenso der vertragswidrigen Partei der Nachweis eines geringeren
          Schadens.
        </p>
        <p>
          (6) Im Erfolgsfall zahlt der Gewinner-Händler dem Betreiber eine Provision nach der im
          Händler-Portal hinterlegten Staffel (Auktionswert × Prozentsatz, mindestens jedoch der
          staffelspezifische Mindestbetrag). Die Abrechnung erfolgt per Rechnung mit{" "}
          {PAYMENT_TERMS_DAYS} Tagen Zahlungsziel.
        </p>

        {/* ============================ § 6 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 6 Preise, Zahlung, Verzug</h2>
        <p>
          (1) Alle gegenüber Händlern ausgewiesenen Preise verstehen sich netto zuzüglich der
          gesetzlichen Umsatzsteuer.
        </p>
        <p>
          (2) Rechnungen sind innerhalb von <strong>{PAYMENT_TERMS_DAYS} Kalendertagen</strong> ab
          Zugang ohne Abzug per SEPA-Überweisung auf das auf der Rechnung genannte Konto zu zahlen.
          Die Rechnungsnummer ist als Verwendungszweck anzugeben.
        </p>
        <p>
          (3) Bei Zahlungsverzug ist der Betreiber berechtigt, die gesetzlichen Verzugszinsen in Höhe
          von 9 Prozentpunkten über dem Basiszinssatz (§ 288 Abs. 2 BGB) zu verlangen sowie
          Mahngebühren nach folgender Staffel in Rechnung zu stellen:
        </p>
        <ul>
          <li>1. Mahnung (Zahlungserinnerung): 0 €</li>
          <li>2. Mahnung (7 Tage nach Fälligkeit): 5 €</li>
          <li>3. Mahnung (21 Tage): 15 €</li>
          <li>4. Mahnung mit Inkasso-Androhung (35 Tage): 30 €</li>
          <li>Ab 49 Tage Verzug: Inkasso-Übergabe und Sperre des Händler-Accounts</li>
        </ul>
        <p>
          (4) Der Betreiber behält sich vor, den Plattform-Zugang des Händlers ab der vierten
          Mahnstufe temporär zu sperren, bis alle offenen Forderungen beglichen sind.
        </p>

        {/* ============================ § 7 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 7 Widerrufsrecht für Verbraucher</h2>
        <p>
          Verbraucher schließen mit dem Betreiber <strong>keinen</strong> entgeltlichen Vertrag; die
          Nutzung der Plattform ist für Verbraucher kostenlos. Ein klassisches Fernabsatz-Widerrufsrecht
          gegenüber dem Betreiber existiert daher nicht. Das gegenüber dem zuschlagenden Händler
          bestehende gesetzliche Widerrufsrecht richtet sich nach dem jeweiligen Kaufvertrag zwischen
          Verbraucher und Händler. Hinweise hierzu gibt der Händler in seinem individuellen Vertrag.
        </p>

        {/* ============================ § 8 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 8 Haftung</h2>
        <p>
          (1) Der Betreiber haftet unbeschränkt für Vorsatz, grobe Fahrlässigkeit, bei Verletzung von
          Leben, Körper und Gesundheit sowie nach den Vorschriften des Produkthaftungsgesetzes.
        </p>
        <p>
          (2) Für leichte Fahrlässigkeit haftet der Betreiber nur bei Verletzung einer wesentlichen
          Vertragspflicht (Kardinalpflicht), deren Erfüllung die Durchführung des Vertrags überhaupt
          erst ermöglicht und auf deren Einhaltung der Vertragspartner regelmäßig vertrauen darf. Die
          Haftung ist in diesem Fall der Höhe nach auf den bei Vertragsschluss typisch vorhersehbaren
          Schaden begrenzt.
        </p>
        <p>
          (3) Für die Inhalte, Richtigkeit oder Vollständigkeit der von Händlern oder Verbrauchern
          eingestellten Daten übernimmt der Betreiber keine Gewähr.
        </p>

        {/* ============================ § 9 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 9 Datenschutz</h2>
        <p>
          Es gelten die Regelungen der{" "}
          <a href="/datenschutz" className="text-brand-700 hover:underline">
            Datenschutzerklärung
          </a>
          . Diese ist Vertragsbestandteil.
        </p>

        {/* ============================ § 10 ============================ */}
        <h2 className="text-xl font-bold text-ink">§ 10 Schlussbestimmungen</h2>
        <p>
          (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Für
          Verbraucher gilt diese Rechtswahl nur, soweit ihnen dadurch nicht zwingende Schutzvorschriften
          ihres gewöhnlichen Aufenthaltsstaates entzogen werden.
        </p>
        <p>
          (2) Ausschließlicher Gerichtsstand für alle Streitigkeiten aus Vertragsverhältnissen mit
          Unternehmern ist der Sitz des Betreibers ({COMPANY.city}).
        </p>
        <p>
          (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies die Wirksamkeit
          der übrigen Bestimmungen nicht.
        </p>

        <p className="mt-8 text-xs text-ink-subtle">
          Stand: April 2026 · {COMPANY.legal_name} · {COMPANY.register_court} {COMPANY.register_no}
        </p>
      </div>
    </div>
  );
}
