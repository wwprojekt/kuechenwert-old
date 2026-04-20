import Link from "next/link";

interface Props {
  searchParams: Promise<{ funnel?: string }>;
}

export default async function DankePage({ searchParams }: Props) {
  const { funnel } = await searchParams;

  const isFunnelA = funnel === "a";
  const isAngebote = funnel === "angebote";
  const isPlanung = funnel === "planung";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="card max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-zinc-900">
          Vielen Dank für Ihre Anfrage!
        </h1>

        <p className="mt-3 text-base leading-relaxed text-zinc-600">
          {isFunnelA || isAngebote
            ? "Wir haben Ihre Anfrage erhalten und suchen jetzt bis zu 3 passende Küchenstudios in Ihrer Region."
            : isPlanung
              ? "Ihre detaillierte Küchenplanung ist eingegangen. Unser Experten-Team erstellt jetzt Ihr individuelles Anforderungsprofil."
              : "Ihre Anfrage ist eingegangen. Unser Team wird sich schnellstmöglich bei Ihnen melden."}
        </p>

        {/* Next steps */}
        <div className="mt-8 rounded-lg bg-zinc-50 p-5 text-left">
          <p className="text-sm font-semibold text-zinc-800">
            So geht es weiter:
          </p>
          <ol className="mt-3 space-y-2.5">
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                1
              </span>
              <span>
                Unser Team prüft Ihre Angaben innerhalb von <strong>24 Stunden</strong>.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                2
              </span>
              <span>
                Wir kontaktieren Sie kurz telefonisch, um offene Fragen zu klären.
              </span>
            </li>
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                3
              </span>
              <span>
                Sie erhalten {isFunnelA || isAngebote ? "bis zu 3 " : ""}kostenlose und unverbindliche Angebote von geprüften Fachhändlern.
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/ratgeber" className="btn-primary">
            Ratgeber lesen
          </Link>
          <Link href="/" className="text-sm text-zinc-500 underline">
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
