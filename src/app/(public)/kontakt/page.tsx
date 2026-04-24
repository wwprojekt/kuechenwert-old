import { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Kontakt – KüchenWert",
  description:
    "Kontaktieren Sie das KüchenWert-Team. Wir helfen Ihnen bei Fragen rund um den Küchenkauf, Angebote und Partnerschaften.",
};

export default function KontaktPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-950 py-14">
        <div className="section-container text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Kontakt
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-brand-300">
            Haben Sie Fragen? Unser Team hilft Ihnen gerne weiter.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="section-container">
          <Breadcrumb
            items={[
              { label: "Startseite", href: "/" },
              { label: "Kontakt" },
            ]}
          />
        </div>
      </div>

      <section className="py-16">
        <div className="section-container max-w-4xl">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                So erreichen Sie uns
              </h2>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">E-Mail</p>
                  <a
                    href="mailto:info@kuechenwert24.de"
                    className="mt-1 text-sm text-brand-600 hover:underline"
                  >
                    info@kuechenwert24.de
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Telefon
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Mo–Fr 9:00–18:00 Uhr
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Antwortzeit
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Wir antworten in der Regel innerhalb von 24 Stunden.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-bold text-zinc-900">
                  Für Küchenstudios
                </h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Sie sind Küchenstudio und möchten Partner werden? Erfahren
                  Sie mehr über unser Partnerprogramm.
                </p>
                <a
                  href="/partner"
                  className="mt-3 inline-block text-sm font-medium text-brand-600 underline hover:text-brand-800"
                >
                  Zum Partnerprogramm
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Häufige Anliegen
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  {
                    q: "Ich habe eine Anfrage gestellt – wann höre ich etwas?",
                    a: "Wir bearbeiten jede Anfrage innerhalb von 24 Stunden. Prüfen Sie auch Ihren Spam-Ordner.",
                  },
                  {
                    q: "Ich möchte meine Anfrage ändern oder zurückziehen",
                    a: "Schreiben Sie uns eine E-Mail mit Ihrer Anfrage-ID. Wir passen alles an.",
                  },
                  {
                    q: "Mein Datenschutz-Auskunftsrecht",
                    a: "Gemäß DSGVO haben Sie das Recht auf Auskunft, Berichtigung und Löschung. Schreiben Sie an datenschutz@kuechenwert24.de.",
                  },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="rounded-lg border border-zinc-200 bg-white p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.q}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
