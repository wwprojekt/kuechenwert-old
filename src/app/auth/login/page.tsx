import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Login – KüchenWert Händler" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string }>;
}) {
  const { next, registered } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-brand-900">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white">K</span>
          <span className="font-display text-lg font-bold">KüchenWert</span>
        </Link>
        <div className="card">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-ink">Anmelden</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Händler-Bereich · sicher per E-Mail + Passwort
            </p>
          </div>

          {registered === "1" && (
            <div className="mb-4 rounded-md border border-accent-200 bg-accent-50 p-3 text-sm text-accent-800">
              <strong>Registrierung erfolgreich!</strong> Bitte bestätigen Sie ggf. Ihre
              E-Mail. Ihre Freischaltung wird im Anschluss von unserem Team geprüft.
            </div>
          )}

          <LoginForm next={next} />

          <p className="mt-6 text-center text-xs text-ink-muted">
            Noch kein Account?{" "}
            <Link href="/auth/register-dealer" className="font-semibold text-brand-700 hover:underline">
              Als Händler registrieren
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-ink-subtle">
          <ShieldCheck className="mr-1 inline h-3 w-3 text-accent-600" />
          SSL-verschlüsselt · DSGVO-konform
        </p>
      </div>
    </div>
  );
}
