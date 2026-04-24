/**
 * Trust-Badges: dezente, einheitliche SVG-Mock-Logos im Stil bekannter Trust-Siegel.
 * Bewusst keine Original-Logos (Markenrecht) — neutralisierte Badge-Optik die wie
 * echte Prüf-Siegel wirkt: oval, mit Datum, mit Bewertung.
 */

export function BadgeTuevStyle() {
  return (
    <svg viewBox="0 0 110 44" className="h-10 w-auto" aria-label="Geprüfter Anbieter">
      <rect x="1" y="1" width="108" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <text x="55" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="11" fill="currentColor" letterSpacing="2">GEPRÜFT</text>
      <line x1="14" y1="22" x2="96" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <text x="55" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9" fill="currentColor" opacity="0.7">Anbieter 2026</text>
    </svg>
  );
}

export function BadgeEkomiStyle() {
  return (
    <svg viewBox="0 0 110 44" className="h-10 w-auto" aria-label="Kundenbewertungen 4,8/5">
      <rect x="1" y="1" width="108" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <g transform="translate(8, 12)">
        {[0, 1, 2, 3, 4].map((i) => (
          <text key={i} x={i * 12} y="10" fontSize="13" fill="currentColor">★</text>
        ))}
      </g>
      <text x="55" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" fill="currentColor">4,8 / 5,0</text>
    </svg>
  );
}

export function BadgeDsgvoStyle() {
  return (
    <svg viewBox="0 0 110 44" className="h-10 w-auto" aria-label="DSGVO-konform">
      <rect x="1" y="1" width="108" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <text x="55" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="13" fill="currentColor" letterSpacing="1">DSGVO</text>
      <text x="55" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9" fill="currentColor" opacity="0.7">konform · DE-Hosting</text>
    </svg>
  );
}

export function BadgeSslStyle() {
  return (
    <svg viewBox="0 0 110 44" className="h-10 w-auto" aria-label="SSL-verschlüsselt">
      <rect x="1" y="1" width="108" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <g transform="translate(40, 9)">
        <path d="M5 0 C 2 0, 0 2, 0 5 L 0 12 L 14 12 L 14 5 C 14 2, 12 0, 9 0 Z M 4 5 C 4 3, 5.5 2, 7 2 C 8.5 2, 10 3, 10 5 L 10 6 L 4 6 Z" fill="currentColor" opacity="0.85" />
      </g>
      <text x="55" y="36" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="currentColor">SSL · 256-Bit</text>
    </svg>
  );
}

/**
 * Handelsregister-Badge statt Zahlungsdienst — spiegelt die Rechnungs-
 * basierte Abrechnung (kein Online-Payment-Provider mehr).
 */
export function BadgeRechnungStyle() {
  return (
    <svg viewBox="0 0 110 44" className="h-10 w-auto" aria-label="Geprüftes Handelsregister">
      <rect x="1" y="1" width="108" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <text x="55" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="12" fill="currentColor" letterSpacing="0.5">HR-GEPRÜFT</text>
      <text x="55" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9" fill="currentColor" opacity="0.7">Kauf auf Rechnung</text>
    </svg>
  );
}
