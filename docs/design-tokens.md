# Design-Tokens KüchenWert

Inspiriert vom CaravanWert-Auftritt: vertrauenswürdige Lead-/Auktions-Plattform.
Ziel: seriös, modern, klar, transparent. Akzent für CTAs auf Erfolg/Go.

> **Hinweis:** Konkrete Hex-Werte sind sinnvolle Defaults, bis vom User
> die finalen CaravanWert-Hex-Codes/Logo-Farben geliefert werden.
> Tausch ist trivial in `tailwind.config.ts`.

---

## Farben

### Brand (Primary) — tiefes Marineblau
Bedeutung: Vertrauen, Stabilität, Expertise. Für Header, Primär-Buttons,
Links, aktive Zustände, Logo.

| Token | Hex | Einsatz |
|-------|-----|---------|
| `brand-50`  | `#f0f5fb` | Soft-Hintergrund, Hover |
| `brand-100` | `#dbe7f4` | Banner, Outline |
| `brand-300` | `#86aed8` | Border-Highlights |
| `brand-500` | `#3169ad` | Standard-Brand |
| `brand-700` | `#1a4276` | Primary-Button, Header-Text |
| `brand-900` | `#11284a` | Display-Headline auf Dunkel |
| `brand-950` | `#0a1a32` | Dark-Backgrounds, Footer |

### Accent (CTA / Success) — Vivid Green
Bedeutung: Action, Sicher, Go. Für High-Intent-Buttons ("Jetzt starten",
"Angebot vergleichen"), Erfolgs-Badges, Progress-Fortschritt.

| Token | Hex | Einsatz |
|-------|-----|---------|
| `accent-50`  | `#ecfdf5` | Trust-Pill-Background |
| `accent-500` | `#1fb97a` | Standard-Accent |
| `accent-600` | `#16a065` | Hover |
| `accent-700` | `#127f52` | Trust-Pill-Text |

### Semantik
- `success-500` = `accent-500`
- `warning-500` = `#f59e0b`
- `danger-500` = `#ef4444`

### Neutrale / Surface
| Token | Hex | Einsatz |
|-------|-----|---------|
| `surface` (white) | `#ffffff` | Karten, Inputs |
| `surface-soft`    | `#f8fafc` | Body-Hintergrund |
| `surface-strong`  | `#f1f5f9` | Sektion-Trennung, Hover |
| `ink`             | `#0f172a` | Standardtext |
| `ink-muted`       | `#475569` | Sekundärtext |
| `ink-subtle`      | `#94a3b8` | Captions, Placeholder |

---

## Typografie

- **Familie:** Inter (variable, latin) — vertrauenserweckend, gut lesbar in
  allen Größen, im Web allgegenwärtig.
- **Display-Größen** (Headlines):
  - `h-display` → 4xl/5xl/6xl, bold, tight tracking — für Hero
  - `h-section` → 3xl/4xl, bold, tight tracking — für Sektionen
  - `h-card` → xl, semibold — für Karten-Headlines
- **Body:** `text-base` (16 px), `leading-relaxed` für Fließtext
- **Lead-Absatz:** `text-lead` → 16 px / 18 px sm:lg, ink-muted

---

## Komponenten-Klassen (`globals.css`)

| Klasse | Zweck |
|--------|-------|
| `btn-primary` | Standard-Aktion (Marineblau) |
| `btn-accent`  | CTA mit höchster Conversion-Priorität (Grün, fett) |
| `btn-secondary` | Sekundär (weiß mit Border) |
| `btn-ghost` | Inline / Tertiär, auf Surface-Soft |
| `card` | Standard-Container (Border + Schatten) |
| `card-clickable` | Auswahlkarte (Funnel-Optionen) mit selected-State |
| `hero-choice-card` | Große Wahl-Karten auf der Startseite |
| `input-field`, `label-field`, `helper-text` | Formular-Tokens |
| `progress-track` + `progress-fill` | Funnel-Fortschrittsbalken |
| `trust-pill`, `chip-*` | Trust-Badges, Status-Chips |
| `section-container`, `section-padding` | Layout-Helfer |

---

## Layout-Patterns (von CaravanWert übernommen)

1. **Hero mit 2-Card-Wahl direkt in der Hero** — keine langen Marketing-
   Texte, der User soll sofort wählen können.
2. **Wizard mit Fortschrittsbalken oben + Sidebar rechts** ("Ihre Vorteile",
   "Aktuelle Nachfrage").
3. **Trust-Badges-Row direkt unter Hero und über jedem CTA-Block.**
4. **3-Card-Grid für "Drei Wege" / "Wie es funktioniert"** mit Nummerierung
   und Kurzkennzahlen (z. B. "72h Auktionsdauer").
5. **6-Card-Vorteile-Grid** mit Icons + Kurztext.
6. **FAQ-Akkordeon** kompakt im unteren Drittel.
7. **Footer-CTA** wiederholt die Hero-Wahl.

---

## Border-Radius / Schatten

- `rounded-card` (0.875 rem) — überall einheitlich für Karten-artige Container.
- `shadow-card` Standard, `shadow-card-hover` bei Hover, `shadow-card-active`
  bei Selektion (mit Brand-Tint).

---

## To-do (sobald CaravanWert-Originalfarben vorliegen)

- [ ] Brand-Palette neu generieren (Hex von Logo)
- [ ] Accent ggf. tauschen, falls CaravanWert nicht Grün nutzt
- [ ] Custom-Font ersetzen, falls Marken-Font definiert
