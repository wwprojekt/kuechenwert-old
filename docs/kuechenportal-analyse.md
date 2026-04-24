# Konkurrenzanalyse: kuechenportal.de / Aroundhome Lead-Formular

**Analysiert am:** 24.04.2026  
**URL:** https://www.kuechenportal.de/formular/  
**Technologie:** Next.js (SSR), Questionnaire-Engine `@aroundhome`, Unleash Feature Flags  
**Markenbetreiber:** be Around GmbH / Aroundhome (White-Label für diverse "Küchenportal"-Branddomains)

---

## 1. Kernbefund zum Thema "mehrere Pfade"

**Der Funnel ist inhaltlich linear, nicht verzweigt.** Jeder Nutzer durchläuft dieselben 18 Bildschirme, unabhängig von den Antworten. Ich habe das empirisch in mehreren Durchläufen getestet mit folgenden Varianten:

| Getestete Abzweigung | Ergebnis |
|----------------------|----------|
| Küchenform: `Steht noch nicht fest` | Identischer Pfad, keine Fragen übersprungen |
| Küchenraum: `Noch in Planung` | Identischer Pfad, keine Fragen übersprungen |
| Stil/Farbe/Material/…: `Weiß nicht` (7×) | Komplett durchläufbar ohne Pfadabbruch |
| Wohnsituation: `Mieter` | Identischer Pfad zu `Eigentümer` |
| Entscheider: `Nein` | **Keine** Disqualifikation, normale Weiterleitung zur PLZ |
| Grund: `Neubau – Erstmaliger Einbau` | Identischer Pfad zu `Renovierung` |
| Zeitrahmen: `Nur Beratung` | **Keine** Disqualifikation, normale Weiterleitung |

Die „Mehrere Pfade"-Idee deines Auftraggebers ist also **keine Frage von If-Then-Logik, sondern von Option-Vielfalt pro Frage** (2–4 Optionen × 14 Fragen = 16 Mio. rein kombinatorische Pfade). Die Engine heißt bei Aroundhome intern `questionnaire` (siehe Unleash-App-Name) und verwaltet URLs der Form `#/<funnel-id>/<step-index>/<session-token>`.

**Implikation für uns:** Wir brauchen keine komplexe Branch-Logik. Die Stärke der Seite liegt in der UX pro Frage (große Bildkarten, Auto-Advance, „Weiß-nicht"-Ausstieg) und der Kürze.

---

## 2. Vollständige Funnel-Map (18 Screens)

URL-Muster: `#/0/<n>/<token>` — `n` ist die Stepnummer.

| # | URL | H2-Frage | Antwort-Typ | Optionen / Felder | Auto-Advance |
|---|-----|----------|-------------|-------------------|:-:|
| 0 | `/0/0` | Welche Form soll Ihre Küche haben? | Card-Grid 2×2 | Küchenzeile · L-Form · U-Form · Steht noch nicht fest | ✓ |
| 1 | `/0/1` | Wie sieht Ihr Küchenraum aus? | Card-Grid 1×3 | Geschlossen · Offen · Noch in Planung | ✓ |
| 2 | `/0/2` | Welcher Stil gefällt Ihnen? | Card-Grid 2×2 | Modern · Klassisch · Landhaus · Weiß nicht | ✓ |
| 3 | `/0/3` | Welche Farbe soll Ihre Küche haben? | Card-Grid 2×2 | Hell · Dunkel · Farbig · Weiß nicht | ✓ |
| 4 | `/0/4` | Aus welchem Material soll Ihre Arbeitsplatte sein? | Card-Grid 2×2 | Holz · Granit · Edelstahl · Weiß nicht | ✓ |
| 5 | `/0/5` | Auf welcher Höhe soll der Backofen angebracht sein? | Card-Grid 1×3 | Unter dem Kochfeld · Auf Augenhöhe · Weiß nicht | ✓ |
| 6 | `/0/6` | Wie stellen Sie sich den Kühlschrank vor? | Card-Grid 1×3 | Standgerät · Integriert · Weiß nicht | ✓ |
| 7 | `/0/7` | Welches Kühlgerät entspricht Ihren Vorstellungen? | Card-Grid 2×2 | Kühlschrank · Kühl-Gefrier-Kombination · Side-by-Side · Weiß nicht | ✓ |
| 8 | `/0/8` | Welches Kochfeld wünschen Sie? | Card-Grid 2×2 | Cerankochfeld · Gas · Induktion · Weiß nicht | ✓ |
| 9 | `/0/9` | Wie kochen Sie am liebsten? | Card-Grid 2×2 | Eine Person kocht · Wir kochen zu zweit · Unsere Kinder helfen mit · Wir kochen mit Freunden | ✓ |
| 10 | `/0/10` | Sind Sie Eigentümer oder Mieter? | Card-Grid 1×2 | Eigentümer · Mieter | ✓ |
| 11 | `/0/11` | Haben Sie sich schon Gedanken zum Budget für Ihre neue Küche gemacht? | **Slider** + Textfeld | Range 3.000–40.000 €, Step 500 €, Default **8.000 €**. „Weiter"-Button nötig | ✗ |
| 12 | `/0/12` | Sind Sie Entscheider:In? | Card-Grid 1×2 | Ja · Nein | ✓ |
| 13 | `/0/13` | Weshalb benötigen Sie eine neue Küche? | Card-Grid 1×2 | Renovierung (Austausch der alten Küche) · Neubau (Erstmaliger Einbau) | ✓ |
| 14 | `/0/14` | Wann soll die Küche spätestens eingebaut sein? | Card-Grid 2×2 | Innerhalb 3 Monate · 4–6 Monate · Später als 6 Monate · Nur Beratung | ✓ |
| 15 | `/0/15` | Gleich geschafft, bitte geben Sie Ihre Postleitzahl an: | Text-Input (tel, Pattern `[0-9]{5}`) | Postleitzahl* + versteckte Autofill-Inputs | ✗ |
| 16 | `/0/16` | Wer soll die Angebote erhalten? | Radio + 3 Inputs | Herr/Frau-Radio · Vorname* · Nachname* · E-Mail* · AGB+Datenschutz-Text | ✗ |
| 17 | `/0/17` | Zur Verifizierung Ihrer Angaben benötigen wir Ihre Telefonnummer | Tel-Input mit Ländercode | +49-Flagge · Telefonnummer* · Trust-Zeile (Schloss-Icon) | ✗ |
| 18 | Danke-Seite | (nicht eingereicht, um keinen echten Lead zu generieren) | — | — | — |

**14 Frage-Screens + 1 Slider + 1 PLZ + 1 Kontakt + 1 Telefon = 17 Pflicht-Screens bis zur Lead-Übergabe.**

---

## 3. Clevere UX-Details, die stark konvertieren

1. **Auto-Advance auf allen Single-Choice-Screens.** Klick = sofort weiter. Kein extra „Weiter"-Button bei 14 von 15 Fragen. Das ist der wichtigste UX-Hebel.
2. **„Weiß nicht"-Ausstieg** bei 7 Fragen (Stil, Farbe, Material, Backofen, Kühlschrank-Bauart, Kühlgerät, Kochfeld). Löst die Blockade, wenn der User unsicher ist — Abbrüche sinken drastisch.
3. **Große illustrierte Karten (~4:3)** mit SVG-Piktogrammen in Brand-Grün. Visuell statt textuell — entscheidet sich schneller, fühlt sich nicht wie ein „Formular" an.
4. **Budget als Slider mit Alternative „Genaue Angabe"-Textfeld.** Slider liefert immer einen validen Wert (Default 8.000 €) → man kann mit einem Klick „Weiter" drücken. Kein Hard-Stopper wie „Bitte Zahl eingeben".
5. **Keine Disqualifikation.** Auch „Nur Beratung" + „Nein, nicht Entscheider" + Budget < 3.000 € führen in die Kontaktaufnahme. Monetarisierung passiert anschließend per Lead-Scoring im Backend, nicht durch den User-Abbruch vorne.
6. **Kontaktformular maximal schlank:** Anrede-Radio, Vorname, Nachname, E-Mail. **Kein** Adress-, Straßen-, Hausnummer-Feld. Phone ist auf einen **eigenen Screen** ausgelagert („Zur Verifizierung") — getarnt als Sicherheitsfeature, erhöht aber die Telefon-Quote.
7. **Trust-Signale direkt am kritischen Screen:** 
   - Auf der PLZ-Seite: „Auf Basis Ihrer Postleitzahl suchen wir passende Fachfirmen in Ihrer Region."
   - Auf der Telefon-Seite: Schloss-Icon + „Wir behandeln Ihre Daten vertraulich und leiten Sie nur an Ihre ausgewählten Anbieter weiter."
8. **Ständig sichtbares Service-Branding** im Footer-Bereich: „Ein Service von **Aroundhome**", Partner-Logo-Reihe (nobilia, pino, Schüller, Marquardt, XXXLutz, Nolte, Höffner, mömax), 3 Trust-Sätze („100% kostenlos", „Einfach und sicher", „Kostenlose Beratung").
9. **Kein Progress-Bar sichtbar auf dem Hauptscreen** — nur ein dezenter grüner Fortschrittsstreifen im Footer-Bereich. Kein Fortschrittsstress.
10. **Telefon-Header ändert den Tonfall:** „Haben Sie Fragen? 0800 29 29 29 4" gratis-Nummer permanent sichtbar — signalisiert menschlichen Support.
11. **Autofill-Vorbereitung:** Auf der PLZ-Seite sind bereits 9 unsichtbare `autocomplete`-Inputs (given-name, family-name, email, tel, organization, address-level2, address-line1, postal-code, street-address) vorhanden, damit der Browser bei Google-Autofill alle Felder füllt, bevor der User sie überhaupt sieht.

---

## 4. Design-Spezifikation (aus Live-DOM extrahiert)

### Farben
| Rolle | Wert | Einsatz |
|-------|------|---------|
| **CTA-Primary** | `#028062` (rgb 2, 128, 98) | Haupt-Button „Weiter", Links im Fließtext, Marken-Logo |
| CTA-Tiefton | `#01503e` | Aroundhome-Logo-Text (dunklere Variante) |
| Akzent-Mint | `#66bba8` | Slider-Track (aktiv) |
| Slider-Track Inaktiv | `#e8e9e2` | Leerer Teil des Sliders |
| Ink (H2-Text) | `rgb(28, 29, 22)` ≈ `#1c1d16` | Headlines, fast-schwarz mit Grün-Stich |
| Body-Text | `#000000` | Fließtext |
| Background | `#f8f8f4` (vermutlich) | Sehr helles Creme/Off-White |
| Error-Red | Inline-Validierung für ungültige PLZ | — |

Die Marke nutzt ein **dunkles Tannengrün** als einziger Brand-Akzent — sehr ruhig, naturnah, passt zu Küche/Handwerk. Kein Blau.

### Typografie
| Rolle | Familie | Größe | Weight |
|-------|---------|-------|--------|
| Display / H2 | **„Booster Next FY"** → Fallback Roboto | `32px` | 700 |
| Body | „Booster Next FY" → Helvetica Neue / Arial | `16px` | 400 |
| Button-Label | Roboto → Arial | `15px` | 500-600 |
| Line-Height Body | 1.15 (`18.4px` / `16px`) | — | — |

**Booster Next FY** (von Fontyou) ist eine moderne Grotesk mit charakteristischen runden Terminationen (das `ü` mit ausgeprägten Umlauten fällt auf). Kommerziell lizenzpflichtig — für uns ist ein Open-Source-Ersatz (Plus Jakarta Sans, Manrope, DM Sans) visuell sehr nah dran.

### Komponenten-Maße
| Element | Wert |
|---------|------|
| Primary-Button Höhe | `48px` |
| Primary-Button Breite (max) | `468px` (≈ 29 rem, passt zu `--item-width: 32rem`) |
| Button Border-Radius | `9px` |
| Container max-width | ~32 rem = 512px |
| Gap zwischen Karten | `2rem` (CSS-Var `--gap`) |
| Karten-Größe | quadratisch, ~240×240 px bei Desktop |
| Karten Border-Radius | ~`12px` |
| Input-Höhe | ~52 px (Material-Design-Style mit floating Label) |

---

## 5. Technischer Stack (beobachtet)

| Komponente | Tool |
|-----------|------|
| Frontend | Next.js 13+ (Pages Router, `_app.js` + `[[...slug]].js`) |
| Form-Engine | In-House „Questionnaire" (`appName=questionnaire`) |
| Feature Flags | Unleash Edge (`unleash-edge.aroundhome-production.de`) |
| Analytics | Data Vortex (eigener Server), GTM, GA4, Meta Pixel, TikTok, Taboola, Clarity, Usercentrics CMP |
| Error-Tracking | Sentry (`sentry.aroundhome-services.de`) |
| Bot-Schutz | `fraud0` |
| Assets-CDN | `cms.assets.aroundhome-production.de` + Cloudinary (`media.aroundhome.de`) |
| Telefoneingabe | `intl-tel-input` (intl-telefon-Flag-Dropdown) |
| Autocomplete-PLZ | Google Maps API (`googleMapApiKey` im `runtimeConfig`) |

---

## 6. Visual-Referenz-Screenshots

Im Repo unter `docs/kp-screenshots/` als Arbeitsreferenz:

| Datei | Zeigt |
|-------|-------|
| `kp-01-kuechenform.png` | Start/Küchenform Screen — Card-Grid 2×2 mit SVG-Pikto |
| `kp-16-contact.png` | Kontakt-Screen (Herr/Frau + Name + E-Mail) |
| `kp-17-phone.png` | Telefon-Verifizierung-Screen mit Trust-Zeile |

---

## 7. Gap-Analyse: Unser Funnel B vs. Küchenportal

Unser Funnel B ist in `src/app/funnel/b/page.tsx` (37 kB) + `src/config/funnel-b-stammdaten.ts` (14 kB) implementiert und hat **9 Steps** (Step 0–8). Folgende strukturelle Unterschiede:

### Was wir schon gut machen
- Wir haben **dedizierte Stammdaten** (`KITCHEN_BRANDS`, `FRONT_MATERIALS` …) — KP hat keine vergleichbare Marken-/Material-Granularität.
- Unser Datenmodell `FunnelBData` erfasst mehr **B2B-relevante Attribute** (Frontmaterial-Kategorie, Mülltrennsystem, Extras, Finanzierung, Upload-Kategorien) → bessere Basis für tatsächliche Küchen-Angebote.
- Upload-Funktionalität für Angebote / Grundriss / Bild — das hat KP **nicht**.

### Wo wir verlieren (Conversion-UX)
| Punkt | KP | Wir (B aktuell) | Handlungsempfehlung |
|-------|----|-----------------|--------------------|
| **Auto-Advance** | ja, immer | nein, meist „Weiter" | Single-Choice-Felder: sofort zum nächsten Step |
| **Fragen-Anzahl bis Lead** | 15 leichte Klicks + 3 Kontakt-Screens | 9 Screens mit viel Content pro Screen | Chunking: viele Mini-Fragen statt wenige lange Steps |
| **Budget-Eingabe** | Slider mit Default 8.000 € | Textfelder | Slider übernehmen, mit alternativem Textfeld |
| **„Weiß nicht"-Ausweg** | 7 von 14 Fragen | teilweise | Auf jeder Choice-Frage eine Weiß-nicht-Card |
| **Kontakt-Split** | Name+Email ↔ Telefon auf 2 Screens | eine Seite | Telefon auf eigenen „Verifizierung"-Step legen |
| **Kein Progress-Bar vorn** | minimalistischer grüner Balken unten | Step-Anzahl oben | Progress visuell dezenter gestalten |
| **Illustrationen** | eigene SVG-Piktos pro Option | Text-Optionen | Jede Option bekommt ein SVG-/Icon-Asset |
| **Trust-Signale** | Partner-Logos + Zertifikate permanent | vorhanden, weniger prominent | Persistent in Sidebar/Footer |
| **Call-Center-Telefon** | gratis Nummer im Header | nicht sichtbar | 0800-Nummer rechts oben |
| **Single-CTA-Button** | immer grüner Primary | unterschiedlich | Konsequent `btn-accent` (Vivid Green) |

### Was wir bewusst **anders** machen sollten (Differenzierung)
1. **Unser USP: Mehr Daten → bessere Matches** — Upload von Bestandsangeboten, Front-Typ, Finanzierung usw. ist B2B-Qualität. Das muss **hinter** einer KP-ähnlich schlanken Einstiegs-Conversion sitzen: Erst schnelle Basis-Qualifizierung (≤ 10 Klicks), dann optional tiefergehende Aufwertung.
2. **Transparenz über den Service** — KP versteckt, dass 3 Fachfirmen kontaktiert werden. Wir können offensiver mit „Bis zu 3 Top-Angebote im Vergleich" kommunizieren.
3. **Kein Lock-In in eine Telefonnummer** — wir können E-Mail-only als Default anbieten und Telefon erst optional in einem späteren Onboarding sammeln.

---

## 8. Konkreter Umsetzungsvorschlag

### Phase 1 — Funnel B Flow-Refactor (1–2 Tage Entwicklung)
1. **Auto-Advance-Mechanik** einbauen in allen Single-Choice-Steps (`onChange` → direkt `setStep(current+1)` statt „Weiter"-Klick).
2. **Budget-Slider** (`Step5` oder eigener Step) — Range 3.000–50.000 €, Step 500, Default 10.000, mit inline Textfeld als Alternative.
3. **„Weiß nicht"-Option** in `FRONT_MATERIALS`, `HOUSING_TYPES`, `DELIVERY_MODES`, `FINANCING_OPTIONS` einpflegen, falls fehlt.
4. **Kontakt-Split:** Letzte Seite in drei kurze Screens teilen: (a) PLZ, (b) Anrede + Vor-/Nachname + E-Mail, (c) Telefon mit Trust-Icon.
5. **Progress-Bar** umbauen zu dünner, dezenter Linie im Footer-Bereich.

### Phase 2 — Visual-Upgrade (2–3 Tage)
1. **Illustrierte Option-Karten** für alle Choice-Fragen (Küchenform, Raum, Stil, Farbe, Arbeitsplatte, Kochfeld, Kühlschrank, …). Stil: flache Piktogramme in Brand-Grün auf hellem Hintergrund. Siehe Aroundhomes CMS (contentful). Wir erstellen eigene im gleichen Stil.
2. **Karten-Hover/Selected-States** verbessern: Grüner 2-px Border + leichter Shadow bei Auswahl.
3. **Trust-Row unten persistent** mit 3 Icons + Kurztext („100% kostenlos", „Einfach", „Unverbindlich").
4. **Service-Call-To-Call** im Header: `0800`-Telefonnummer mit Telefon-Icon.
5. **Partner-Logo-Reihe** aufbauen (unsere Netzwerkpartner, ggf. Stock-Logos wie Nobilia, Nolte usw. — Freigabe prüfen).

### Phase 3 — Differenzierung (laufend)
- Transparenter Live-Ticker: „X Anfragen heute, Y aktive Fachfirmen in Ihrer Region"
- Optional-Step „Bestehendes Angebot hochladen" erst **nach** dem Lead-Abschluss anbieten
- Dankeseite mit Preview der ersten Matches

---

## 9. Offene Fragen / Tests, die noch sinnvoll wären

- **A/B-Test intern:** KP-Clone-Funnel vs. Unser aktueller B-Funnel → Conversion-Vergleich auf identischem Traffic.
- **Mobile-Verhalten:** Alle Screenshots sind Desktop (1200 px). Mobile dürfte der noch wichtigere Case sein — separate Analyse empfohlen.
- **Danke-Seite & Lead-Empfang:** Ohne Submit eines echten Leads konnte ich Seite 18 (Thank-You) nicht validieren. Falls wichtig, können wir mit einer Wegwerf-E-Mail + falscher Telefonnummer submiten und die Bestätigungsseite dokumentieren.
- **„Steht-noch-nicht-fest"-Sonderfall:** KP stellt trotzdem die Raum-, Backofen-, Kochfeld-Fragen, was bei völlig unentschlossenen Nutzern fragwürdig ist. Wir könnten hier smarter vorgehen und bei „Steht noch nicht fest" + „Noch in Planung" einige technische Detailfragen überspringen → echter Branch-Pfad, den KP **nicht** hat.

---

**Kurzfassung für den Auftraggeber:**

> Der Funnel von küchenportal.de ist ein linearer 17-Screen-Fragebogen ohne dynamische Pfade — er gewinnt durch sehr schnelle, bildbasierte Single-Choice-Interaktion mit Auto-Advance, einen Budget-Slider mit Default-Wert, einen „Weiß-nicht"-Ausweg bei fast allen Fragen, und einen entkoppelten Telefon-Screen nach dem Namen/E-Mail. Um das Niveau zu erreichen oder zu überbieten, müssen wir in Funnel B (a) Auto-Advance einbauen, (b) Budget als Slider umstellen, (c) Kontakt in 2–3 Mini-Screens splitten, (d) illustrierte Option-Karten produzieren und (e) Progress dezenter darstellen. Unser struktureller Vorteil (Stammdaten-Tiefe, Uploads) bleibt bestehen, sollte aber hinter einer schlankeren Basis-Qualifizierung liegen.
