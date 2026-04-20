import Link from "next/link";
import { ShieldCheck, Lock, MapPin, BadgeCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* ==================== TRUST-STRIP ==================== */}
      <div className="border-b border-neutral-200 bg-surface-soft">
        <div className="section-container-wide flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-xs text-ink-muted">
          <TrustItem icon={<ShieldCheck className="h-4 w-4 text-success-600" />} label="DSGVO-konform" />
          <TrustItem icon={<Lock className="h-4 w-4 text-success-600" />} label="SSL-verschlüsselt" />
          <TrustItem icon={<MapPin className="h-4 w-4 text-success-600" />} label="Server in Deutschland" />
          <TrustItem icon={<BadgeCheck className="h-4 w-4 text-success-600" />} label="Verifizierte Händler" />
          <TrustItem icon={<span className="text-[10px] font-bold text-success-700">€</span>} label="Stripe-gesicherte Zahlungen" />
        </div>
      </div>

      <div className="section-container-wide py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight-2 text-black"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                K
              </span>
              KüchenWert
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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-ink-subtle md:flex-row">
          <span>© {new Date().getFullYear()} KüchenWert. Alle Rechte vorbehalten.</span>
          <span>Bezahlung gesichert via Stripe · DSGVO-konform</span>
        </div>
      </div>
    </footer>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium">
      {icon}
      {label}
    </span>
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
