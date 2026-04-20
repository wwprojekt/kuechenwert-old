import Link from "next/link";
import { Clock, ShieldCheck, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Freischaltung läuft – KüchenWert" };

export default async function DealerPendingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("company_name, is_verified, is_active, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dealer?.is_verified && dealer.is_active) redirect("/dealer/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="card w-full max-w-xl text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">
          Freischaltung läuft
        </h1>
        <p className="mt-3 text-ink-muted">
          Vielen Dank für Ihre Registrierung
          {dealer?.company_name ? (
            <>, <strong className="text-ink">{dealer.company_name}</strong></>
          ) : null}
          . Unser Team prüft Ihre Angaben und schaltet Sie üblicherweise innerhalb
          von 1 Werktag frei.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-surface-soft p-4">
            <Mail className="h-4 w-4 text-brand-700" />
            <p className="mt-2 text-xs text-ink-muted">
              Sie erhalten eine E-Mail, sobald Ihr Account aktiv ist.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-surface-soft p-4">
            <ShieldCheck className="h-4 w-4 text-accent-600" />
            <p className="mt-2 text-xs text-ink-muted">
              Bis dahin sind keine Lead-Käufe oder Gebote möglich.
            </p>
          </div>
        </div>

        {!dealer?.is_active && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Ihr Account wurde von unserem Team deaktiviert. Bitte kontaktieren Sie
            uns für Details.
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">Zur Startseite</Link>
          <form action="/auth/logout" method="POST">
            <button type="submit" className="btn-ghost">Abmelden</button>
          </form>
        </div>
      </div>
    </div>
  );
}
