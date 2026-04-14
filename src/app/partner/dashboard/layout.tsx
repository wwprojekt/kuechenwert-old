import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/partner/dashboard", label: "Übersicht" },
  { href: "/partner/dashboard/leads", label: "Leads" },
  { href: "/partner/dashboard/gebote", label: "Gebote" },
  { href: "/partner/dashboard/profil", label: "Profil" },
  { href: "/partner/dashboard/musterkuechen", label: "Musterküchen" },
  { href: "/partner/dashboard/bewertungen", label: "Bewertungen" },
  { href: "/partner/dashboard/abrechnung", label: "Abrechnung" },
];

export default async function DealerDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/partner/registrieren");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "dealer") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block">
        <Link href="/" className="text-lg font-bold text-brand-700">KüchenWert</Link>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-zinc-50 p-6 lg:p-8">{children}</main>
    </div>
  );
}
