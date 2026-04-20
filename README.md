# KüchenWert

Lead-Generation und Rückwärts-Auktion für den Küchenmarkt.

Plattform mit zwei Eingangskanälen:

- **Funnel A · „Angebot erhalten"** — Klassische Lead-Generierung. Verbraucher konfiguriert Wunschküche, Lead wird (bei ausreichender Qualität) sofort im Marketplace freigeschaltet, registrierte Händler kaufen Leads per CPA.
- **Funnel B · „Bestehendes Angebot vergleichen"** — Verbraucher reicht ein bestehendes Studio-Angebot ein. Nach Experten-Check wird daraus eine 72-h-Rückwärts-Auktion. Händler unterbieten den Studio-Preis, Sieger zahlt Provision (Brutto-Staffel mit Mindestpreis).

Stack: Next.js 15 · React 19 · TypeScript · Tailwind · Supabase (Postgres + Auth + Storage) · Stripe · Resend.

---

## Schnellstart

```bash
npm install
cp .env.local.example .env.local   # falls vorhanden, sonst manuell anlegen (siehe unten)
npm run dev
```

Erforderliche Umgebungsvariablen (`.env.local`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (Wallet-Topups + Provisions-Abwicklung)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (Rechnungen + Mahnungen)
RESEND_API_KEY=
RESEND_FROM_EMAIL=billing@kuechenwert.de

# Cron-Manual-Trigger + Vercel-Cron
CRON_SECRET=

# HMAC für signierte Druck-Rechnungen
INVOICE_PRINT_SECRET=
```

---

## Datenbank

Migrationen liegen in `supabase/migrations/` und werden in numerischer Reihenfolge ausgeführt:

| Datei                                    | Inhalt                                                                |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `001_initial_schema.sql`                 | Profiles, Dealers, Leads, Auctions, Bids, Audit-Log, Disputes, RLS    |
| `002_funnel_b_pricing_stammdaten.sql`    | Stammdaten (Brands, Front-Materials, Worktops…), Pricing- + Provisions-Staffel |
| `003_storage_buckets.sql`                | Privater Bucket `lead-files` + RLS                                    |
| `004_invoices_dunning.sql`               | Invoices + Dunning-Levels + `generate_invoice_number()`               |
| `005_cron_runs.sql`                      | Cron-Run-Tracking für das Health-Dashboard                            |

Alle Migrationen via Supabase-CLI einspielen oder per SQL-Editor in der Reihenfolge ausführen.

---

## Architektur

```
src/
├── app/
│   ├── (public)/                    Startseite, Auktionen-Listing
│   ├── funnel/a/                    13-Step Funnel-A (Lead-Gen)
│   ├── funnel/b/                    9-Step Funnel-B (Auktion)
│   ├── admin/                       Admin-Backend (M6)
│   │   ├── leads/                   Triage-Queue + Detail + Quick-Actions
│   │   ├── auctions/                Auction-Editor (Spec-Items, Freigabe)
│   │   ├── dealers/                 Dealer-Aktivierung
│   │   ├── stammdaten/              Generic Catalog-Editor
│   │   ├── pricing-matrix/          Lead-Preis-Staffel
│   │   ├── commissions/             Provisions-Staffel
│   │   ├── invoices/                Rechnungs-Übersicht (mark_paid, cancel)
│   │   ├── audit/                   Audit-Log-Viewer (Filter, Pagination)
│   │   └── cron/                    Cron-Health (Status, Latenz, Manual-Trigger)
│   ├── dealer/                      Dealer-Backend (M7)
│   │   ├── dashboard/               Übersicht
│   │   ├── leads/                   Marketplace + Lead-Kauf
│   │   ├── auctions/                Aktive Auktionen + Bid-UI
│   │   ├── wallet/                  Stripe-Top-up + Saldo
│   │   └── profile/                 Stammdaten
│   └── api/
│       ├── leads/                   Funnel-A POST + Funnel-B Multipart
│       ├── admin/                   Admin-Mutationen (mit requireAdmin)
│       ├── dealer/                  Dealer-Mutationen (mit requireDealerApi)
│       ├── stripe/webhook/          Wallet-Top-up Webhooks
│       └── cron/                    finalize-auctions + dunning
├── components/
│   ├── funnel/                      Step-Komponenten
│   ├── admin/                       Editor-Komponenten + Quick-Actions
│   └── dealer/
├── lib/
│   ├── supabase/                    Server- + Admin-Clients, requireAdmin/Dealer
│   ├── invoices.ts                  createInvoice + sendDunningEmail
│   ├── stripe.ts                    Lazy Stripe-Client
│   └── cron-runner.ts               Wrapper mit Tracking + Auth
└── config/
    ├── funnel-a.ts / funnel-b-stammdaten.ts
    ├── regions.ts                   PLZ→Region-Mapping
    ├── company.ts                   Dunning-Levels, Mehrwertsteuer
    └── scoring-rules.ts             scoreLead({tier, score})
```

---

## Lead-Pipeline

### Funnel A (Lead-Gen)

```
[Verbraucher] → POST /api/leads
   → scoreLead() → tier in {hot, premium, qualified, standard}
   → Auto-Qualify wenn:
        funnel_type='a' UND
        tier ∈ {hot, premium, qualified} UND
        firstName + lastName + email + phone vorhanden UND
        housing_type vorhanden
   → status = 'qualified'  (sichtbar im Dealer-Marketplace)
     SONST  status = 'new' (Admin-Triage)

[Dealer] → /dealer/leads → kauft Lead
   → match_candidates.is_purchased = true
   → PII (Name, Adresse, Telefon) freigeschaltet
   → CPA wird vom Wallet abgebucht
```

### Funnel B (Auktion)

```
[Verbraucher] → POST /api/leads/funnel-b (Multipart mit Files)
   → leads INSERT (status='new', tier='premium', funnel_type='b')
   → auctions INSERT (status='draft', is_published=false)
   → auction_spec_items seed (Brand/Front/Griff/Arbeitsplatte/Geräte/Sanitär/Extras)
   → lead_files INSERT + Storage-Upload nach lead-files/{lead_id}/{cat}/...

[Admin/Experte] → /admin/leads/{id} → ruft Verbraucher an
   → Spec-Items im Auction-Editor verfeinern
   → Auction-Status 'draft' → 'active' + is_published=true
   → ends_at = now() + 72h

[Dealer] → /dealer/auctions → bietet (binding!)
   → Niedrigstes Gebot gewinnt

[Cron finalize-auctions, alle 5 Min]
   → ends_at <= now() && status='active' → status='completed'
   → niedrigstes bid → is_winning=true
   → lead.status = 'closed_won' / 'closed_lost'
   → calculate_commission_cents(orderValueCents) → Brutto-Provision
   → payments INSERT (cpa_commission, pending)
   → createInvoice() + Mailversand an Sieger (14 Tage Fälligkeit)

[Cron dunning, täglich 08:00]
   → invoices status ∈ {open, overdue} && due_at < today
   → DUNNING_LEVELS Stufen 1..5 (mit 299 € Penalty + Sperre auf Stufe 4)
   → sendDunningEmail() → invoices.dunning_level++
```

---

## Admin-Backend (M6)

| Sektion              | Pfad                           | Funktion                                         |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| Lead-Queue + Triage  | `/admin/leads`                 | Counter `new / qualified / in_auction / sold`, Quick-Actions („Qualifizieren", „Ablehnen", „Auktion-Entwurf") |
| Lead-Detail          | `/admin/leads/[id]`            | Editor + Files + Calls + Status-Header           |
| Auctions             | `/admin/auctions`              | Editor mit Spec-Items, Freigabe                  |
| Dealers              | `/admin/dealers`               | Aktivierung, Suspend                             |
| Stammdaten           | `/admin/stammdaten`            | Generic Editor für 8+ Kataloge                   |
| Lead-Preise          | `/admin/pricing-matrix`        | Range-Rules (Budget-Brackets, % + Min-Preis)     |
| Provisionen          | `/admin/commissions`           | Provisions-Staffel (Brutto, Min-Beträge)         |
| Rechnungen           | `/admin/invoices`              | Bezahlt-markieren, Stornieren, Druck-URL         |
| Audit-Log            | `/admin/audit`                 | Filter (Domain, Range, ID-Suche), Pagination     |
| Cron-Health          | `/admin/cron`                  | Status, Latenz, Erfolgsquote, Manual-Trigger     |

---

## Cron-Jobs

In `vercel.json` registrieren:

```json
{
  "crons": [
    { "path": "/api/cron/finalize-auctions", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/dunning",           "schedule": "0 8 * * *" }
  ]
}
```

Beide Jobs laufen durch den `runCronJob()`-Wrapper:

- Authentifiziert sich per `x-vercel-cron: 1` (Vercel) **oder** `Authorization: Bearer ${CRON_SECRET}` (manuell).
- Schreibt vor Ausführung einen `cron_runs`-Eintrag mit `status='running'`.
- Aktualisiert nach Lauf mit `success` + Dauer + Anzahl + Detail-JSON, oder mit `error` + Stack.
- Im Admin-Dashboard `/admin/cron` sichtbar (Healthy / Stale / Failing) inkl. Manual-Trigger-Button.

---

## End-to-End-Smoke-Test

Skript: `scripts/smoke-e2e.mjs`

```bash
# Voraussetzung: App läuft (npm run dev oder npm start) und .env.local ist gesetzt
npm run smoke
```

Was geprüft wird:

1. **Funnel-A „qualified"** (high budget, full contact) → erwartet `status='qualified'`, korrekte Region.
2. **Funnel-A „standard"** (low budget) → erwartet `status='new'`, kein Auto-Qualify.
3. **Funnel-B** (Multipart mit Dummy-PDF) → erwartet `status='new'`, Auction-Draft, ≥7 Spec-Items, 1 lead_files-Eintrag.
4. **Cron `finalize-auctions`** (mit `CRON_SECRET`) → erwartet `200`, `cron_runs`-Eintrag mit `status='success'`.
5. **Cron `dunning`** → analog.
6. **Cleanup** löscht alle Smoke-Daten (Filter `utm_source='smoke-test'`) inkl. abhängiger Auctions, Spec-Items, Bids, Files, Audit-Einträge.

Skript läuft mit Node 20+ ohne weitere Dev-Dependencies (nutzt natives `fetch` + bestehendes `@supabase/supabase-js`).

Beispiel-Output am Ende:

```
Ergebnis: 21 OK · 0 FAIL
```

---

## Deployment (Vercel)

1. Repo importieren, Framework `Next.js` (autodetect).
2. Alle Env-Vars (siehe oben) für **Production** und **Preview** setzen.
3. Stripe-Webhook-Endpoint anlegen: `https://<domain>/api/stripe/webhook` → Events `checkout.session.completed`, `payment_intent.payment_failed`.
4. `vercel.json` mit `crons`-Block committen (siehe oben).
5. Erste Deploy-Pipeline laufen lassen → anschließend in Supabase die Migrationen `001`–`005` ausführen.
6. Ersten Admin-User per SQL anlegen:

   ```sql
   update public.profiles set role = 'admin' where id = '<user-uuid>';
   ```

7. Smoke-Test gegen die Live-URL fahren:

   ```bash
   NEXT_PUBLIC_SITE_URL=https://kuechenwert.de \
   CRON_SECRET=... \
   SUPABASE_SERVICE_ROLE_KEY=... \
   NEXT_PUBLIC_SUPABASE_URL=... \
   node scripts/smoke-e2e.mjs --base https://kuechenwert.de
   ```

---

## Lizenz / Vertrauliches

Internes Repository — nicht für die Öffentlichkeit bestimmt.
