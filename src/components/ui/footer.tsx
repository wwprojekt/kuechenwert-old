import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Service",
    links: [
      { href: "/angebote-vergleichen", label: "Angebote vergleichen" },
      { href: "/kuechenplanung", label: "Küchenplanung" },
      { href: "/style-quiz", label: "Style-Quiz" },
      { href: "/rechner", label: "Küchenrechner" },
      { href: "/so-funktionierts", label: "So funktioniert's" },
    ],
  },
  {
    title: "Inspiration",
    links: [
      { href: "/kuechenstile", label: "Küchenstile" },
      { href: "/kuechenformen", label: "Küchenformen" },
      { href: "/ratgeber", label: "Ratgeber" },
      { href: "/kosten", label: "Küchenkosten" },
    ],
  },
  {
    title: "Für Händler",
    links: [
      { href: "/partner", label: "Partner werden" },
      { href: "/partner/dashboard", label: "Händler-Login" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-950 text-zinc-400">
      <div className="section-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold">
              <span className="text-accent-400">Küchen</span>
              <span className="text-white">Wert</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              Transparenz schafft Wert. Vergleichen Sie kostenlos regionale
              Küchenangebote und sparen Sie beim Küchenkauf.
            </p>
          </div>

          {/* Link sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                {section.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} KüchenWert. Alle Rechte
          vorbehalten.
        </div>
      </div>
    </footer>
  );
}
