/**
 * Brand-Logo-Komponente: stilisierte Wordmark-SVGs der wichtigsten deutschen Küchenmarken.
 * Monochrom (currentColor), bewusst NICHT die Original-Logos der Hersteller (Markenrecht),
 * sondern typografisch-charakteristische Anlehnungen für ein einheitliches Branding-Wand-Bild.
 * Echte Logos können später als <img>-Drop-In ersetzt werden.
 */

const STYLES: Record<string, { font: string; weight: number; letter?: number; transform?: string }> = {
  Nobilia:    { font: "Helvetica, Arial, sans-serif", weight: 700, letter: -0.5 },
  Häcker:     { font: "Georgia, serif",                weight: 700, letter: 0 },
  Schüller:   { font: "Georgia, serif",                weight: 600, letter: 0.5 },
  Nolte:      { font: "Helvetica, Arial, sans-serif", weight: 800, letter: 1 },
  Bauformat:  { font: "Helvetica, Arial, sans-serif", weight: 600, letter: 0 },
  Bauknecht:  { font: "Helvetica, Arial, sans-serif", weight: 700, letter: -0.3 },
  Pino:       { font: "Helvetica, Arial, sans-serif", weight: 800, letter: -1, transform: "lowercase" },
  Beckermann: { font: "Georgia, serif",                weight: 600, letter: 0 },
  Burger:     { font: "Helvetica, Arial, sans-serif", weight: 700, letter: 1 },
  ALNO:       { font: "Helvetica, Arial, sans-serif", weight: 800, letter: 2 },
  Leicht:     { font: "Helvetica, Arial, sans-serif", weight: 300, letter: 4, transform: "uppercase" },
  next125:    { font: "Helvetica, Arial, sans-serif", weight: 700, letter: -0.5, transform: "lowercase" },
};

export function BrandLogo({ name, className = "" }: { name: string; className?: string }) {
  const s = STYLES[name] ?? { font: "system-ui, sans-serif", weight: 600 };
  const display =
    s.transform === "uppercase" ? name.toUpperCase() :
    s.transform === "lowercase" ? name.toLowerCase() :
    name;

  return (
    <svg
      viewBox="0 0 160 40"
      className={className}
      role="img"
      aria-label={name}
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="80"
        y="28"
        textAnchor="middle"
        fontFamily={s.font}
        fontWeight={s.weight}
        fontSize={name.length > 9 ? 16 : 20}
        letterSpacing={s.letter ?? 0}
        fill="currentColor"
      >
        {display}
      </text>
    </svg>
  );
}
