import type { ReactNode } from "react";

/**
 * Custom SVG-Pictogramme fuer Funnel A — KP-Style (kuechenportal.de).
 *
 * Einheitlicher Stil:
 *  - viewBox 120 x 90 (4:3-artig, passt zum Card-Aspect)
 *  - strokeWidth 3, strokeLinecap/Linejoin "round"
 *  - Farbe via currentColor (Parent-Card setzt text-brand-500)
 *  - Fuellung: brand-100-aehnliche helle Flaeche fuer Kontrast, oder fill="none"
 *
 * Ziel: konsistente Familie, die sich vom Foto-Chaos abhebt und das Quiz-Feeling
 * von Kuechenportal imitiert (dort sind alle Pictogramme gruene Outline-Figuren).
 */

const SVG_PROPS = {
  viewBox: "0 0 120 90",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-full w-full",
};

/** Kreis fuer Kochstelle (fill) */
const Hob = ({ cx, cy, r = 4 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" />
);

// ==================================================================
// KUECHENFORM-PICTOGRAMME (Top-Down-Ansicht)
// ==================================================================

const KuechenformZeile = () => (
  <svg {...SVG_PROPS}>
    {/* Eine lange horizontale Kuechenzeile */}
    <rect x="10" y="35" width="100" height="22" rx="3" />
    {/* Kochfeld links */}
    <Hob cx={30} cy={46} />
    <Hob cx={42} cy={46} />
    {/* Spuele rechts */}
    <rect x="78" y="40" width="22" height="12" rx="2" fill="currentColor" fillOpacity={0.15} />
  </svg>
);

const KuechenformLForm = () => (
  <svg {...SVG_PROPS}>
    {/* L: horizontaler Teil oben + vertikaler Teil rechts */}
    <path d="M10 30 h70 v40 h22" />
    <path d="M10 52 h70 v18 h22 v-40" fill="currentColor" fillOpacity={0.08} />
    {/* Kochfeld am horizontalen Teil */}
    <Hob cx={25} cy={41} />
    <Hob cx={37} cy={41} />
    {/* Spuele am vertikalen Teil */}
    <rect x="86" y="38" width="14" height="14" rx="2" fill="currentColor" fillOpacity={0.15} />
  </svg>
);

const KuechenformUForm = () => (
  <svg {...SVG_PROPS}>
    {/* U-Form: links vertikal, oben horizontal, rechts vertikal */}
    <path
      d="M15 20 v50 M15 20 h90 M105 20 v50"
    />
    <path
      d="M15 45 v25 h90 v-25 M15 45 h90"
      fill="currentColor"
      fillOpacity={0.08}
    />
    {/* Kochfeld oben mitte */}
    <Hob cx={54} cy={33} />
    <Hob cx={66} cy={33} />
    {/* Spuele links */}
    <rect x="20" y="50" width="14" height="14" rx="2" fill="currentColor" fillOpacity={0.15} />
  </svg>
);

const KuechenformZweizeilig = () => (
  <svg {...SVG_PROPS}>
    {/* Zwei parallele Zeilen */}
    <rect x="10" y="18" width="100" height="18" rx="3" />
    <rect x="10" y="54" width="100" height="18" rx="3" />
    {/* Kochfeld oben */}
    <Hob cx={30} cy={27} />
    <Hob cx={42} cy={27} />
    {/* Spuele unten */}
    <rect x="75" y="58" width="22" height="10" rx="2" fill="currentColor" fillOpacity={0.15} />
  </svg>
);

const KuechenformKochinsel = () => (
  <svg {...SVG_PROPS}>
    {/* Kuechenzeile oben */}
    <rect x="10" y="15" width="100" height="18" rx="3" />
    {/* Kochinsel unten mittig */}
    <rect x="35" y="55" width="50" height="22" rx="3" fill="currentColor" fillOpacity={0.12} />
    {/* Kochfeld auf Insel */}
    <Hob cx={52} cy={66} />
    <Hob cx={68} cy={66} />
    {/* Spuele in der Zeile */}
    <rect x="75" y="19" width="22" height="10" rx="2" fill="currentColor" fillOpacity={0.15} />
  </svg>
);

const KuechenformUnsicher = () => (
  <svg {...SVG_PROPS}>
    {/* Fragezeichen gross und zentriert */}
    <path d="M45 32 a15 15 0 1 1 15 15 v8" />
    <circle cx={60} cy={70} r={3} fill="currentColor" stroke="none" />
  </svg>
);

// ==================================================================
// STIL-PICTOGRAMME (Elevation-View)
// ==================================================================

const StilModern = () => (
  <svg {...SVG_PROPS}>
    {/* 4 grifflose glatte Fronten, sehr clean */}
    <rect x="10" y="20" width="23" height="50" rx="2" />
    <rect x="36" y="20" width="23" height="50" rx="2" />
    <rect x="62" y="20" width="23" height="50" rx="2" />
    <rect x="88" y="20" width="23" height="50" rx="2" />
    {/* Arbeitsplatte */}
    <line x1="7" y1="20" x2="114" y2="20" strokeWidth={4} />
  </svg>
);

const StilLandhaus = () => (
  <svg {...SVG_PROPS}>
    {/* Sprossen-Fronten mit sichtbaren Griffen */}
    {[10, 44, 78].map((x) => (
      <g key={x}>
        <rect x={x} y={22} width="27" height="48" rx="2" />
        {/* Sprossen (Kreuz) */}
        <line x1={x + 13.5} y1={26} x2={x + 13.5} y2={66} strokeWidth={1.5} />
        <line x1={x + 3} y1={46} x2={x + 24} y2={46} strokeWidth={1.5} />
        {/* Griff */}
        <line x1={x + 5} y1={35} x2={x + 5} y2={41} strokeWidth={2.5} />
      </g>
    ))}
    <line x1="7" y1="22" x2="114" y2="22" strokeWidth={4} />
  </svg>
);

const StilKlassisch = () => (
  <svg {...SVG_PROPS}>
    {/* Kassetten-Tueren mit innerem Rahmen */}
    {[10, 44, 78].map((x) => (
      <g key={x}>
        <rect x={x} y={22} width="27" height="48" rx="2" />
        {/* innerer Kassettenrahmen */}
        <rect x={x + 4} y={27} width="19" height="18" rx="1" strokeWidth={1.5} />
        <rect x={x + 4} y={49} width="19" height="16" rx="1" strokeWidth={1.5} />
        {/* klassischer Griff rund */}
        <circle cx={x + 20} cy={46} r={1.5} fill="currentColor" />
      </g>
    ))}
    <line x1="7" y1="22" x2="114" y2="22" strokeWidth={4} />
  </svg>
);

const StilMinimalistisch = () => (
  <svg {...SVG_PROPS}>
    {/* Eine einzige glatte Fronten-Flaeche, nur feine Fuge */}
    <rect x="10" y="22" width="100" height="48" rx="2" />
    <line x1="60" y1="22" x2="60" y2="70" strokeWidth={1} />
    <line x1="7" y1="22" x2="114" y2="22" strokeWidth={4} />
  </svg>
);

const StilIndustrial = () => (
  <svg {...SVG_PROPS}>
    {/* Offene Regale oben + Schrank unten */}
    <line x1="10" y1="22" x2="110" y2="22" strokeWidth={2.5} />
    <line x1="10" y1="38" x2="110" y2="38" strokeWidth={2.5} />
    <line x1="10" y1="53" x2="110" y2="53" strokeWidth={2.5} />
    {/* Schrankfronten unten */}
    <rect x="10" y="53" width="32" height="17" rx="2" />
    <rect x="44" y="53" width="32" height="17" rx="2" />
    <rect x="78" y="53" width="32" height="17" rx="2" />
    {/* Deko-Elemente auf Regalen */}
    <circle cx={25} cy={30} r={3} fill="currentColor" fillOpacity={0.3} />
    <rect x={40} y={27} width={6} height={8} rx={1} fill="currentColor" fillOpacity={0.3} />
    <circle cx={60} cy={30} r={2.5} fill="currentColor" fillOpacity={0.3} />
    <rect x={80} y={44} width={8} height={6} rx={1} fill="currentColor" fillOpacity={0.3} />
  </svg>
);

const StilIndividuell = () => (
  <svg {...SVG_PROPS}>
    {/* Mix: verschiedene Front-Stile kombiniert */}
    {/* Glatte Front */}
    <rect x="10" y="22" width="30" height="48" rx="2" />
    {/* Sprossen-Front */}
    <rect x="43" y="22" width="30" height="48" rx="2" />
    <line x1={58} y1={26} x2={58} y2={66} strokeWidth={1.5} />
    <line x1={47} y1={46} x2={69} y2={46} strokeWidth={1.5} />
    {/* Offenes Regal */}
    <line x1={76} y1={22} x2={110} y2={22} strokeWidth={2} />
    <line x1={76} y1={38} x2={110} y2={38} strokeWidth={2} />
    <line x1={76} y1={54} x2={110} y2={54} strokeWidth={2} />
    <line x1={76} y1={70} x2={110} y2={70} strokeWidth={2} />
    <line x1={76} y1={22} x2={76} y2={70} strokeWidth={2} />
    <line x1={110} y1={22} x2={110} y2={70} strokeWidth={2} />
    <line x1="7" y1="22" x2="114" y2="22" strokeWidth={4} />
  </svg>
);

// ==================================================================
// ARBEITSPLATTEN-PICTOGRAMME (Material-Swatch mit Pattern)
// ==================================================================

const WorktopHolz = () => (
  <svg {...SVG_PROPS}>
    {/* Arbeitsplatten-Stueck */}
    <rect x="10" y="20" width="100" height="50" rx="4" />
    {/* Holzmaserung: wellige Linien */}
    <path d="M15 32 Q40 28 65 32 T110 32" strokeWidth={1.5} />
    <path d="M15 44 Q40 41 65 44 T110 44" strokeWidth={1.5} />
    <path d="M15 56 Q40 52 65 56 T110 56" strokeWidth={1.5} />
  </svg>
);

const WorktopNaturstein = () => (
  <svg {...SVG_PROPS}>
    <rect x="10" y="20" width="100" height="50" rx="4" />
    {/* Unregelmaessige Flecken wie Granit */}
    <circle cx={28} cy={35} r={5} fill="currentColor" fillOpacity={0.3} stroke="none" />
    <circle cx={55} cy={52} r={7} fill="currentColor" fillOpacity={0.25} stroke="none" />
    <circle cx={85} cy={38} r={6} fill="currentColor" fillOpacity={0.3} stroke="none" />
    <circle cx={42} cy={60} r={4} fill="currentColor" fillOpacity={0.35} stroke="none" />
    <circle cx={95} cy={58} r={3} fill="currentColor" fillOpacity={0.25} stroke="none" />
    <circle cx={22} cy={55} r={2.5} fill="currentColor" fillOpacity={0.3} stroke="none" />
    <circle cx={70} cy={32} r={3.5} fill="currentColor" fillOpacity={0.3} stroke="none" />
  </svg>
);

const WorktopQuarz = () => (
  <svg {...SVG_PROPS}>
    <rect x="10" y="20" width="100" height="50" rx="4" />
    {/* Feine gleichmaessige Punkte */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 12 }).map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={17 + col * 8}
          cy={28 + row * 7}
          r={0.8}
          fill="currentColor"
          stroke="none"
        />
      )),
    )}
  </svg>
);

const WorktopKeramik = () => (
  <svg {...SVG_PROPS}>
    <rect x="10" y="20" width="100" height="50" rx="4" />
    {/* Glatte Oberflaeche mit feinen Linien (Adern) */}
    <path d="M15 36 Q40 30 75 40 T108 34" strokeWidth={1} strokeDasharray="1 2" />
    <path d="M15 55 Q50 48 85 57" strokeWidth={1} strokeDasharray="1 2" />
  </svg>
);

const WorktopSchichtstoff = () => (
  <svg {...SVG_PROPS}>
    <rect x="10" y="20" width="100" height="50" rx="4" />
    {/* Kreuz-Pattern (Linoleum-artig) */}
    {Array.from({ length: 5 }).map((_, i) => (
      <line
        key={`h-${i}`}
        x1={15}
        x2={107}
        y1={28 + i * 10}
        y2={28 + i * 10}
        strokeWidth={0.6}
        strokeOpacity={0.7}
      />
    ))}
    {Array.from({ length: 10 }).map((_, i) => (
      <line
        key={`v-${i}`}
        y1={25}
        y2={67}
        x1={20 + i * 10}
        x2={20 + i * 10}
        strokeWidth={0.6}
        strokeOpacity={0.7}
      />
    ))}
  </svg>
);

const WorktopUnsicher = () => (
  <svg {...SVG_PROPS}>
    <rect x="10" y="20" width="100" height="50" rx="4" />
    <path d="M52 35 a10 10 0 1 1 8 10 v4" />
    <circle cx={60} cy={57} r={2.2} fill="currentColor" stroke="none" />
  </svg>
);

// ==================================================================
// EXPORTS — Maps fuer Config
// ==================================================================

export const KITCHEN_FORM_PICTOGRAMS: Record<string, ReactNode> = {
  zeile: <KuechenformZeile />,
  "l-form": <KuechenformLForm />,
  "u-form": <KuechenformUForm />,
  zweizeilig: <KuechenformZweizeilig />,
  kochinsel: <KuechenformKochinsel />,
  unsicher: <KuechenformUnsicher />,
};

export const KITCHEN_STYLE_PICTOGRAMS: Record<string, ReactNode> = {
  modern: <StilModern />,
  landhaus: <StilLandhaus />,
  klassisch: <StilKlassisch />,
  minimalistisch: <StilMinimalistisch />,
  industrial: <StilIndustrial />,
  individuell: <StilIndividuell />,
};

export const WORKTOP_PICTOGRAMS: Record<string, ReactNode> = {
  holz: <WorktopHolz />,
  naturstein: <WorktopNaturstein />,
  quarz: <WorktopQuarz />,
  keramik: <WorktopKeramik />,
  schichtstoff: <WorktopSchichtstoff />,
  unsicher: <WorktopUnsicher />,
};
