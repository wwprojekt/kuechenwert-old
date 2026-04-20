import Link from "next/link";
import { CheckCircle2, Phone, Clock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Anfrage erhalten – Vielen Dank",
};

export default async function FunnelBThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="card w-full max-w-2xl text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-50 text-accent-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-ink">
          Vielen Dank – Ihre Anfrage ist eingegangen!
        </h1>
        <p className="mt-3 text-ink-muted">
          Ein Spec-Experte ruft Sie binnen 24&nbsp;h zurück, ergänzt fehlende Details
          und gibt anschließend Ihre neutralisierte Anfrage in die 72-Stunden-Auktion.
        </p>

        {id && (
          <p className="mt-2 text-xs text-ink-subtle">
            Vorgangsnummer: <span className="font-mono">{id}</span>
          </p>
        )}

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <Step icon={<Phone className="h-5 w-5" />} title="Schritt 1" text="Experten-Anruf < 24 h" />
          <Step icon={<Clock className="h-5 w-5" />} title="Schritt 2" text="72-h-Auktion verifizierter Händler" />
          <Step icon={<ShieldCheck className="h-5 w-5" />} title="Schritt 3" text="Bestes Gebot verbindlich annehmen" />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-secondary">Zur Startseite</Link>
          <Link href="/so-funktionierts" className="btn-primary">So geht es weiter</Link>
        </div>
      </div>
    </div>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-surface-soft p-4">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-100 text-brand-700">{icon}</span>
      <div className="mt-3 text-xs font-semibold uppercase text-ink-subtle">{title}</div>
      <div className="mt-1 text-sm text-ink">{text}</div>
    </div>
  );
}
