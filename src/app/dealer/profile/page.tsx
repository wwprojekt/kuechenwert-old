import { User } from "lucide-react";
import { requireDealer } from "@/lib/supabase/dealer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DealerProfilePage() {
  const ctx = await requireDealer("/dealer/profile");

  const { data: dealer } = await supabaseAdmin
    .from("dealers")
    .select("*")
    .eq("id", ctx.dealer.id)
    .single();

  return (
    <div>
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Mein Profil</h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Stammdaten Ihres Händler-Accounts. Änderungen am Profil bitte vorerst per
        E-Mail an unser Team.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title="Unternehmen">
          <Row label="Firma" value={dealer?.company_name} />
          <Row label="Slug" value={dealer?.slug} />
          <Row label="Adresse" value={dealer?.address} />
          <Row label="PLZ / Stadt" value={`${dealer?.postal_code ?? ""} ${dealer?.city ?? ""}`} />
          <Row label="Service-Radius" value={`${dealer?.service_radius_km ?? "–"} km`} />
          <Row label="Marken" value={(dealer?.brands ?? []).join(", ") || "–"} />
          <Row label="Website" value={dealer?.website ?? "–"} />
        </Section>

        <Section title="Account">
          <Row label="E-Mail" value={dealer?.email} />
          <Row label="Telefon" value={dealer?.phone ?? "–"} />
          <Row label="Plan" value={dealer?.plan} />
          <Row label="Status" value={dealer?.is_verified ? (dealer?.is_active ? "Verifiziert" : "Gesperrt") : "Pending"} />
          <Row label="Wallet" value={`${(Number(dealer?.wallet_balance_cents ?? 0) / 100).toFixed(2)} €`} />
          <Row label="Mitglied seit" value={dealer?.created_at ? new Date(dealer.created_at).toLocaleDateString("de-DE") : "–"} />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="mb-3 font-semibold text-ink">{title}</h2>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-ink-subtle">{label}</dt>
      <dd className="text-right text-ink">{value ?? "–"}</dd>
    </div>
  );
}
