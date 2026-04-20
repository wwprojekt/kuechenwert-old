import Link from "next/link";
import { Phone, Mail, ShieldCheck, Clock } from "lucide-react";

const SUPPORT_PHONE_DISPLAY = "+49 30 - 555 80 100";
const SUPPORT_PHONE_TEL = "+493055580100";
const SUPPORT_EMAIL = "info@küchenwert.de";

export function Header() {
  return (
    <>
      {/* ==================== TOP-BAR (Desktop) ==================== */}
      <div className="topbar">
        <div className="section-container-wide flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
              100 % kostenlos für Verbraucher
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-accent-400" />
              Mo–Fr 9–18 Uhr
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="topbar-link">
              <Mail className="h-3.5 w-3.5" />
              {SUPPORT_EMAIL}
            </a>
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="topbar-link">
              <Phone className="h-3.5 w-3.5" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="section-container-wide flex h-[68px] items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-[1.35rem] font-extrabold tracking-tight-2 text-brand-900"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-700 to-brand-800 text-white shadow-sm">
              K
            </span>
            KüchenWert
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex">
            <Link href="/so-funktionierts" className="transition hover:text-ink">
              So funktioniert&apos;s
            </Link>
            <Link href="/auktionen" className="transition hover:text-ink">
              Aktive Auktionen
            </Link>
            <Link href="/partner" className="transition hover:text-ink">
              Für Händler
            </Link>
            <Link href="/faq" className="transition hover:text-ink">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 lg:inline-flex"
            >
              <Phone className="h-4 w-4" />
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <Link
              href="/auth/login"
              className="btn-secondary px-3.5 py-2 text-xs"
            >
              Händler-Login
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
