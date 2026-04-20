import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DealerRegisterForm } from "@/components/auth/dealer-register-form";

export const metadata = { title: "Händler werden – KüchenWert" };

export default function RegisterDealerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-brand-900">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white">K</span>
          <span className="font-display text-lg font-bold">KüchenWert</span>
        </Link>

        <div className="card">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-ink">Als Händler registrieren</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Sie sind Küchenstudio oder -händler? Nach der Registrierung prüft unser
              Team Ihre Angaben und schaltet Sie für Leads &amp; Auktionen frei
              (typischerweise innerhalb von 1 Werktag).
            </p>
          </div>

          <DealerRegisterForm />

          <p className="mt-6 text-center text-xs text-ink-muted">
            Bereits registriert?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-700 hover:underline">
              Zum Login
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-ink-subtle">
          <ShieldCheck className="mr-1 inline h-3 w-3 text-accent-600" />
          Ihre Daten werden DSGVO-konform verarbeitet.
        </p>
      </div>
    </div>
  );
}
