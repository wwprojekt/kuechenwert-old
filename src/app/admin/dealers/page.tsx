import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DealerVerifyButton } from "@/components/admin/dealer-verify-button";

export const dynamic = "force-dynamic";

export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  let q = supabaseAdmin
    .from("dealers")
    .select("id, company_name, slug, postal_code, city, email, phone, plan, is_verified, is_active, wallet_balance_cents, brands, service_radius_km, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "pending") q = q.eq("is_verified", false);
  else if (filter === "verified") q = q.eq("is_verified", true);
  else if (filter === "suspended") q = q.eq("is_active", false);

  const { data: dealers = [] } = await q;

  const counts = await Promise.all([
    supabaseAdmin.from("dealers").select("*", { count: "exact", head: true }).eq("is_verified", false),
    supabaseAdmin.from("dealers").select("*", { count: "exact", head: true }).eq("is_verified", true),
    supabaseAdmin.from("dealers").select("*", { count: "exact", head: true }).eq("is_active", false),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-brand-700" />
        <h1 className="font-display text-2xl font-bold text-ink">Händler</h1>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Selbstregistrierte Händler erscheinen hier mit Status „pending". Erst nach
        Freischaltung sehen sie Leads &amp; Auktionen.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <FilterChip href="/admin/dealers" active={!filter} label="Alle" />
        <FilterChip
          href="/admin/dealers?filter=pending"
          active={filter === "pending"}
          label={`Wartend (${counts[0].count ?? 0})`}
        />
        <FilterChip
          href="/admin/dealers?filter=verified"
          active={filter === "verified"}
          label={`Verifiziert (${counts[1].count ?? 0})`}
        />
        <FilterChip
          href="/admin/dealers?filter=suspended"
          active={filter === "suspended"}
          label={`Gesperrt (${counts[2].count ?? 0})`}
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-surface-soft text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Firma</th>
              <th className="px-4 py-3">Standort</th>
              <th className="px-4 py-3">Kontakt</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">Reg.</th>
              <th className="px-4 py-3 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dealers?.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-ink-muted">Keine Händler.</td></tr>
            )}
            {dealers?.map((d) => (
              <tr key={d.id} className="hover:bg-surface-soft">
                <td className="px-4 py-3">
                  {!d.is_active ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">gesperrt</span>
                  ) : d.is_verified ? (
                    <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">verifiziert</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">pending</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{d.company_name}</div>
                  <div className="text-xs text-ink-subtle">/{d.slug}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {d.postal_code} {d.city}
                  <div className="text-ink-subtle">Radius {d.service_radius_km} km</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div>{d.email}</div>
                  <div className="text-ink-subtle">{d.phone}</div>
                </td>
                <td className="px-4 py-3 text-xs">{d.plan}</td>
                <td className="px-4 py-3 text-xs">
                  {(Number(d.wallet_balance_cents) / 100).toLocaleString("de-DE")} €
                </td>
                <td className="px-4 py-3 text-xs text-ink-subtle">
                  {new Date(d.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs">
                  <DealerVerifyButton dealerId={d.id} isVerified={d.is_verified} isActive={d.is_active} />
                  <Link
                    href={`/haendler/${d.slug}`}
                    target="_blank"
                    className="ml-2 inline-flex items-center gap-1 text-brand-700 hover:underline"
                  >
                    Profil <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 transition ${
        active ? "bg-brand-700 text-white" : "bg-white text-ink-muted ring-1 ring-slate-200 hover:bg-surface-strong"
      }`}
    >
      {label}
    </Link>
  );
}
