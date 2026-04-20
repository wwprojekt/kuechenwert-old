import Link from "next/link";
import {
  BadgeTuevStyle,
  BadgeEkomiStyle,
  BadgeDsgvoStyle,
  BadgeSslStyle,
  BadgeStripeStyle,
} from "./trust-badges";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      {/* ==================== TRUST-STRIP ==================== */}
      <div className="border-b border-neutral-200 bg-surface-soft">
        <div className="section-container-wide flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 text-ink-subtle">
          <BadgeTuevStyle />
          <BadgeEkomiStyle />
          <BadgeDsgvoStyle />
          <BadgeSslStyle />
          <BadgeStripeStyle />
        </div>
      </div>

      <div className="section-container-wide py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-display text-lg font-bold tracking-tight-2 text-black"
            >
              <span>Küchen</span>
              <span>Wert</span>
              <span className="ml-0.5 inline-block h-1.5 w-1.5 translate-y-1 rounded-full bg-brand-500" aria-hidden />
            </Link>
            <p className="mt-3 text-sm text-ink-muted">
              Transparenz für Ihren Küchenkauf. Vergleichen Sie bestehende Angebote
              oder erhalten Sie neue von verifizierten Studios.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
              <span aria-hidden>🇩🇪</span> Made in Germany
            </div>
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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-xs text-ink-subtle md:flex-row">
          <span>© {new Date().getFullYear()} KüchenWert. Alle Rechte vorbehalten.</span>
          <span>Bezahlung gesichert via Stripe · DSGVO-konform</span>
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
