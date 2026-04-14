import Link from "next/link";

const NAV_LINKS = [
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/rechner", label: "Küchenrechner" },
  { href: "/musterkuechen", label: "Musterküchen" },
  { href: "/partner", label: "Für Händler" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="section-container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-brand-700">
          KüchenWert
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/funnel/kuechenform" className="btn-primary text-xs">
            Angebote erhalten
          </Link>
        </nav>
      </div>
    </header>
  );
}
