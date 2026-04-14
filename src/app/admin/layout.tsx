import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/calls", label: "Calls" },
  { href: "/admin/matching", label: "Matching" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/audit", label: "Audit-Log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block">
        <Link href="/admin" className="text-lg font-bold text-red-700">KW Admin</Link>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-zinc-50 p-6 lg:p-8">{children}</main>
    </div>
  );
}
