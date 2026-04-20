import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="section-container-wide py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-bold text-brand-900"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-700 text-white">K</span>
              KüchenWert
            </Link>
            <p className="mt-3 text-sm text-ink-muted">
              Transparenz für Ihren Küchenkauf. Vergleichen Sie bestehende Angebote oder
              erhalten Sie neue von verifizierten Studios.
            </p>
          </div>

          <FooterCol title="Service">
            <FooterLink href="/funnel/b">Angebot vergleichen</FooterLink>
            <FooterLink href="/funnel/a">Angebot erhalten</FooterLink>
            <FooterLink href="/auktionen">Aktive Auktionen</FooterLink>
            <FooterLink href="/so-funktionierts">So funktioniert&apos;s</FooterLink>
          </FooterCol>

          <FooterCol title="Für Händler">
            <FooterLink href="/partner">Übersicht</FooterLink>
            <FooterLink href="/partner/registrieren">Registrieren</FooterLink>
            <FooterLink href="/partner/login">Login</FooterLink>
          </FooterCol>

          <FooterCol title="Rechtliches">
            <FooterLink href="/impressum">Impressum</FooterLink>
            <FooterLink href="/datenschutz">Datenschutz</FooterLink>
            <FooterLink href="/agb">AGB</FooterLink>
            <FooterLink href="/kontakt">Kontakt</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-ink-subtle md:flex-row">
          <span>© {new Date().getFullYear()} KüchenWert. Alle Rechte vorbehalten.</span>
          <span>Made in Germany. DSGVO-konform.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-ink-muted hover:text-ink">
        {children}
      </Link>
    </li>
  );
}
