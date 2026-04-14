# Deliverable-Prioritätsmatrix

Basierend auf Plan Abschnitt 10. Status: Must (P0) / Nice (P1) / Später (P2+).

## 10.1 Landingpages & Einstiegs-Surface

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Master-LP (/) | Must | ✅ Implementiert |
| Advertorial-LPs (/a/{slug}) | Must | ✅ 2 Templates |
| Intent-LPs (kaufen/renovieren/neubau) | Nice | Slug-Routing vorbereitet |
| Stil-LPs | Nice | Template vorbereitet via Ratgeber-Pattern |
| Regional-LPs | Später | Template + CMS nötig |
| Marken-Vergleichs-LPs | Später | Juristische Prüfung erst |
| Angebots-Vergleich-LP | Must | Im Funnel integriert (Angebots-Check Step) |
| Tool-LPs (Rechner) | Must | ✅ /rechner |
| Lead-Magnet-LPs | Nice | E-Mail-Gate + PDF-Delivery nötig |
| Ratgeber-Hub + Artikel | Must | ✅ 5 Artikel |
| Musterküchen-Hub | Must | ✅ /musterkuechen |
| Händler-Profilseiten (öffentlich) | Nice | Template nötig |
| Trust Center / Warum KüchenWert | Must | ✅ /warum-kuechenwert |
| Impressum / Datenschutz / AGB | Must | ✅ Platzhalter |
| Branded 404 | Nice | Standard Next.js 404 |

## 10.2 Funnel-Mechaniken

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Multi-Step mit Fortschritt | Must | ✅ |
| Save & Resume (sessionStorage) | Must | ✅ |
| Exit-Intent Modal | Nice | Vorbereitet |
| Dynamische Smart-Logik | Must | ✅ (Muldenlüfter/Dunstabzug: erweiterbar) |
| PLZ-Geocoding + Radius | Must | ✅ Region-Mapping |
| Uploads + Angebots-Check | Must | ✅ |
| Einwilligungen granular | Must | ✅ (Call + Marketing) |
| A/B-Tests + Feature Flags | Später | Infrastruktur nötig |

## 10.3 Lead-Magnete & Nurturing

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| PDFs (Guide, Checklisten) | Nice | Content-Erstellung nötig |
| E-Mail-Sequenzen (Drip) | Nice | E-Mail-Provider nötig |
| Webinar/Terminbuchung | Später | – |

## 10.4 Service Layer

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Telefonische Qualifizierung | Must | ✅ DB + Admin-UI |
| Experten-Check / Spec-Sheet | Must | ✅ Schema (auctions.spec_sheet) |
| Matching (regelbasiert) | Must | ✅ match_candidates Tabelle + Admin |
| Auktion | Nice | ✅ Schema + Bid-UI |
| Disputes | Must | ✅ Schema + Admin |

## 10.5 Händlerportal (BB)

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Registrierung / Login | Must | ✅ |
| Händlerprofil | Must | ✅ |
| Lead-Feed + Kauf | Must | ✅ |
| CRM-Pipeline | Must | ✅ Status-Felder |
| Gebote / Angebotsabgabe | Must | ✅ |
| Musterküchen-Upload | Must | ✅ |
| Review-Management | Must | ✅ |
| Abrechnung / Wallet | Must | ✅ |
| API/Webhooks | Später | Enterprise-Plan |

## 10.6 Endkundenportal (BC)

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Fortschritt / Phasen | Nice | DB vorbereitet (lead.status) |
| Nachrichten/Tasks | Später | – |
| Dokumenten-Tresor | Nice | lead_files Tabelle vorhanden |
| Bewertung nach Abschluss | Nice | reviews Tabelle vorhanden |

## 10.7 Admin/Ops

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Lead-Queues | Must | ✅ |
| Call-Disposition | Must | ✅ |
| Matching-Freigabe | Must | ✅ |
| Moderation | Must | ✅ |
| Pricing-Config | Must | ✅ |
| Disputes | Must | ✅ |
| Audit-Logs | Must | ✅ |

## 10.8–10.10 Datenmodell / Integrationen / Compliance

| Deliverable | Priorität | Status |
|-------------|-----------|--------|
| Vollständiges DB-Schema | Must | ✅ (001_initial_schema.sql) |
| Stripe Integration | Must | ✅ (lib/stripe) |
| E-Mail Provider | Nice | SendGrid/Mailgun anbinden |
| SMS Provider | Später | Twilio |
| CMP/Cookie-Banner | Must | Technisch: Frontend-Komponente nötig |
| AV-Verträge / Löschkonzept | Must | Jurist |
| Verbraucherrechtliche Texte | Must | Jurist (Platzhalter vorhanden) |
