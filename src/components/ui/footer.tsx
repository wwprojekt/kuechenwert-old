import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Service",
    links: [
      { href: "/funnel/kuechenform", label: "Angebote vergleichen" },
      { href: "/rechner", label: "Küchenrechner" },
      { href: "/musterkuechen", label: "Musterküchen" },
      { href: "/ratgeber", label: "Ratgeber" },
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
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="section-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-brand-700">KüchenWert</p>
            <p className="mt-2 text-sm text-zinc-500">
              Transparenz schafft Wert. Ihre Traumküche zum Bestpreis.
            </p>
          </div>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold text-zinc-900">{section.title}</p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-800">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} KüchenWert. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
