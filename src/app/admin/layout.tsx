import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Phone,
  Gavel,
  Users,
  Database,
  Coins,
  Percent,
  AlertTriangle,
  ScrollText,
  ShieldAlert,
  FileText,
  Gauge,
} from "lucide-react";

const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Übersicht", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin/auctions", label: "Auktionen", icon: Gavel },
      { href: "/admin/dealers", label: "Händler", icon: Users },
      { href: "/admin/calls", label: "Calls", icon: Phone },
    ],
  },
  {
    label: "Konfiguration",
    items: [
      { href: "/admin/stammdaten", label: "Stammdaten", icon: Database },
      { href: "/admin/pricing-matrix", label: "Lead-Preise", icon: Coins },
      { href: "/admin/commissions", label: "Provisionen", icon: Percent },
    ],
  },
  {
    label: "Finanzen",
    items: [
      { href: "/admin/invoices", label: "Rechnungen", icon: FileText },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
      { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
      { href: "/admin/audit", label: "Audit-Log", icon: ScrollText },
      { href: "/admin/cron", label: "Cron-Health", icon: Gauge },
      { href: "/admin/matching", label: "Matching", icon: LayoutDashboard },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, email")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-surface-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white">
              K
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink">KüchenWert</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-subtle">Admin</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="mb-5">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                {g.label}
              </div>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition hover:bg-brand-50 hover:text-brand-800"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-5 py-3 text-xs text-ink-muted">
          <div className="font-medium text-ink">
            {profile?.first_name} {profile?.last_name}
          </div>
          <div className="truncate">{profile?.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
    </div>
  );
}
