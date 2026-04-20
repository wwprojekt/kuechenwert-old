import Link from "next/link";
import { Phone } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="section-container-wide flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-brand-900"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 text-white">K</span>
          KüchenWert
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-muted md:flex">
          <Link href="/so-funktionierts" className="hover:text-ink">So funktioniert&apos;s</Link>
          <Link href="/auktionen" className="hover:text-ink">Aktive Auktionen</Link>
          <Link href="/partner" className="hover:text-ink">Für Händler</Link>
          <Link href="/faq" className="hover:text-ink">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+4900000000"
            className="hidden items-center gap-1.5 text-sm text-ink-muted hover:text-ink lg:inline-flex"
          >
            <Phone className="h-4 w-4" /> Beratung
          </a>
          <Link href="/auth/login" className="btn-secondary px-4 py-2 text-xs">
            Händler-Login
          </Link>
        </div>
      </div>
    </header>
  );
}
