import Link from "next/link";

export default function DankePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="card max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Vielen Dank!</h1>
        <p className="mt-3 text-zinc-600">
          Ihre Anfrage ist eingegangen. Unser Experten-Team wird sich innerhalb von 24 Stunden bei Ihnen melden, um Ihre Wünsche zu besprechen und passende Studios zu finden.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/ratgeber" className="btn-secondary">
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
