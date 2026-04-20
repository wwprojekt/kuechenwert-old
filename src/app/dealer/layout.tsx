import Link from "next/link";
import { requireDealer } from "@/lib/supabase/dealer";
import {
  LayoutDashboard,
  Inbox,
  Gavel,
  Wallet,
  User,
  LogOut,
  FileText,
} from "lucide-react";

const NAV = [
  { href: "/dealer/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dealer/leads", label: "Leads kaufen", icon: Inbox },
  { href: "/dealer/auctions", label: "Auktionen", icon: Gavel },
  { href: "/dealer/wallet", label: "Wallet", icon: Wallet },
  { href: "/dealer/invoices", label: "Rechnungen", icon: FileText },
  { href: "/dealer/profile", label: "Profil", icon: User },
];

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireDealer("/dealer/dashboard");

  return (
    <div className="flex min-h-screen bg-surface-soft">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 text-sm font-bold text-white">K</span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-ink">KüchenWert</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-subtle">Händler-Bereich</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted transition hover:bg-brand-50 hover:text-brand-800"
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 px-5 py-3">
          <div className="text-xs font-medium text-ink truncate">{ctx.dealer.company_name}</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-subtle">{ctx.dealer.plan}</div>
          <div className="mt-2 text-xs text-ink-muted">
            Wallet:{" "}
            <strong className="text-ink">
              {(ctx.dealer.wallet_balance_cents / 100).toLocaleString("de-DE", {
                maximumFractionDigits: 2,
              })}{" "}
              €
            </strong>
          </div>
          <form action="/auth/logout" method="POST" className="mt-3">
            <button type="submit" className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
              <LogOut className="h-3 w-3" /> Abmelden
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
    </div>
  );
}
