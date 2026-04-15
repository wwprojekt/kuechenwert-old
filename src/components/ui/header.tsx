"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/angebote-vergleichen", label: "Angebote vergleichen" },
  { href: "/kuechenplanung", label: "Küchenplanung" },
  { href: "/kuechenstile", label: "Küchenstile" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/rechner", label: "Küchenrechner" },
  { href: "/partner", label: "Für Händler" },
];

const LANDING_PAGES: Record<string, { step: string; total: number }> = {
  "/angebote-vergleichen": { step: "1", total: 5 },
  "/kuechenplanung": { step: "1", total: 11 },
  "/style-quiz": { step: "1", total: 7 },
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const landingInfo = LANDING_PAGES[pathname];

  if (landingInfo) {
    return (
      <header className="sticky top-0 z-50 border-b border-brand-900/10 bg-brand-950 text-white">
        <div className="section-container flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-lg font-bold tracking-tight"
          >
            <span className="text-accent-400">Küchen</span>
            <span className="text-white">Wert</span>
          </Link>
          <span className="text-xs font-medium text-brand-300">
            Schritt {landingInfo.step} von {landingInfo.total}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-accent-400">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            100% kostenlos
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-900/10 bg-brand-950 text-white">
      <div className="section-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-bold tracking-tight"
        >
          <span className="text-accent-400">Küchen</span>
          <span className="text-white">Wert</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/funnel/angebote/kuechenform"
            className="btn-accent text-xs"
          >
            Kostenlos starten
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 lg:hidden"
          aria-label="Menü öffnen"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="border-t border-brand-900/20 bg-brand-950 px-4 pb-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/funnel/angebote/kuechenform"
            onClick={() => setMenuOpen(false)}
            className="btn-accent mt-2 block text-center text-xs"
          >
            Kostenlos starten
          </Link>
        </nav>
      )}
    </header>
  );
}
