import Link from "next/link";

const NAV_LINKS = [
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/rechner", label: "Küchenrechner" },
  { href: "/musterkuechen", label: "Musterküchen" },
  { href: "/partner", label: "Für Händler" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-900/10 bg-brand-950 text-white">
      <div className="section-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-accent-400">Küchen</span>
          <span className="text-white">Wert</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/funnel/kuechenform" className="btn-accent text-xs">
            Kostenlos vergleichen
          </Link>
        </nav>
      </div>
    </header>
  );
}
