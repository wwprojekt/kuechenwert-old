import type { Metadata } from "next";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = { title: "Impressum – KüchenWert" };

export default function ImpressumPage() {
  return (
    <div className="section-container py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight-2 text-ink sm:text-4xl">
        Impressum
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV
      </p>

      <div className="mt-10 max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink-muted [&_h2]:!mt-8 [&_p]:my-3">
        <h2 className="text-xl font-bold text-ink">Diensteanbieter</h2>
        <p>
          <strong className="text-ink">{COMPANY.legal_name}</strong>
          <br />
          {COMPANY.address}
          <br />
          {COMPANY.postal_code} {COMPANY.city}
          <br />
          {COMPANY.country}
        </p>
        <p>
          Betreibt die Plattform <strong className="text-ink">{COMPANY.brand_name}</strong>{" "}
          unter den Domains <em>küchenwert.de</em> bzw. <em>kuechenwert.de</em>.
        </p>

        <h2 className="text-xl font-bold text-ink">Handelsregister</h2>
        <p>
          {COMPANY.register_court}
          <br />
          Registernummer: {COMPANY.register_no}
        </p>

        <h2 className="text-xl font-bold text-ink">Vertretungsberechtigt</h2>
        <p>Geschäftsführerin: {COMPANY.director}</p>

        <h2 className="text-xl font-bold text-ink">Kontakt</h2>
        <p>
          Telefon: <a className="text-brand-700 hover:underline" href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`}>{COMPANY.phone}</a>
          <br />
          E-Mail:{" "}
          <a className="text-brand-700 hover:underline" href={`mailto:${COMPANY.email_ascii}`}>
            {COMPANY.email}
          </a>
        </p>

        <h2 className="text-xl font-bold text-ink">Umsatzsteuer-Identifikationsnummer</h2>
        <p>
          Gemäß § 27 a Umsatzsteuergesetz: {COMPANY.vat_id}
        </p>

        <h2 className="text-xl font-bold text-ink">
          Redaktionell verantwortlich nach § 18 Abs. 2 MStV
        </h2>
        <p>
          {COMPANY.editor_responsible}
          <br />
          {COMPANY.address}, {COMPANY.postal_code} {COMPANY.city}
        </p>

        <h2 className="text-xl font-bold text-ink">
          Streitschlichtung gemäß Verbraucherstreitbeilegungsgesetz
        </h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            className="text-brand-700 hover:underline"
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
          . Unsere E-Mail-Adresse finden Sie oben. Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2 className="text-xl font-bold text-ink">Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
          oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt.
        </p>

        <h2 className="text-xl font-bold text-ink">Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>

        <h2 className="text-xl font-bold text-ink">Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>
      </div>
    </div>
  );
}
