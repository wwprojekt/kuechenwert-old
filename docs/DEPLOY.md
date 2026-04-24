# Deployment: Dokploy + Cloudflare + Supabase

## 0. Domain-Aufstellung

- **`küchenwert.de`** (Umlaut, Punycode `xn--kchenwert-q9a.de`) — primäre Website-Domain.
  Alles was User im Browser sehen; SEO-Canonical.
- **`kuechenwert24.de`** (ASCII) — E-Mail-Versand (`@kuechenwert24.de`),
  Cron-Trigger aus GitHub Actions, 301-Redirect → Hauptdomain.
- **`kuechenwert.de`** (ohne Umlaut, ohne `24`) gehört uns **nicht**. Nie im
  Code, in E-Mail-Adressen, oder in DNS-/Mail-Config verwenden.

## 1. Supabase

### Einmalige Einrichtung

1. Neues Projekt in [Supabase Dashboard](https://supabase.com/dashboard) anlegen (Region: Frankfurt).
2. **Project Settings → API**: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` kopieren.
3. **Authentication → Providers → Email**: Magic Links aktivieren (oder E-Mail + Passwort).
4. **Authentication → URL configuration**:
   - **Site URL**: `https://küchenwert.de`
   - **Redirect URLs** (alle Varianten whitelisten, damit Magic-Links aus
     beiden Domains + Punycode-Fallback funktionieren):
     - `http://localhost:3000/**`
     - `https://küchenwert.de/**`
     - `https://www.küchenwert.de/**`
     - `https://xn--kchenwert-q9a.de/**` (Punycode-Variante)
     - `https://kuechenwert24.de/**` (Redirect-Domain)
5. **Authentication → Email Templates**: Absender-Adresse auf
   `noreply@kuechenwert24.de` setzen (ASCII-Domain für zuverlässige
   Zustellung — nicht `@küchenwert.de`).

### Migrations, Edge Functions & RLS (laufender Betrieb)

Alle Schema-/Policy-/Function-Änderungen laufen **via Cursor-Agent** (MCP `plugin-supabase-supabase`) direkt gegen Production — siehe `.cursor/rules/agent-workflow.mdc`. Kurz:

- SQL-Migration → versioniert in `supabase/migrations/NNN_*.sql`, dann via `apply_migration` ausgeführt.
- Edge Functions → `supabase/functions/<name>/index.ts`, deploy via `deploy_edge_function`.
- Types (`src/types/database.types.ts` o. ä.) nach jeder Schema-Änderung mit `generate_typescript_types` neu erzeugen und committen.

Manuelles Anwenden im SQL-Editor ist nur Fallback, wenn der MCP-Server nicht erreichbar ist.

## 2. Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com) → API keys kopieren.
2. Webhook Endpoint anlegen: `https://xn--kchenwert-q9a.de/api/webhooks/stripe`
   (Punycode-Form verwenden — Stripe liefert Webhooks über strikt RFC-konforme
   HTTP-Clients aus, die Umlaut-Hostnamen nicht akzeptieren.)
   Events: `payment_intent.succeeded`, `invoice.paid`, `customer.subscription.*`.
3. Webhook Secret in `.env` als `STRIPE_WEBHOOK_SECRET` eintragen.

## 3. GitHub

```bash
cd C:\Users\PCUser\Projects\kuechenwert
git init
git add .
git commit -m "Initial KüchenWert platform scaffold"
git remote add origin git@github.com:DEIN_USER/kuechenwert.git
git branch -M main
git push -u origin main
```

## 4. Dokploy

1. Neue **Application** aus GitHub-Repo.
2. **Build**: Dockerfile im Repo-Root.
3. **Environment Variables** (identisch mit `.env.example`):

| Name | Quelle |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (service_role, nur serverseitig) |
| `STRIPE_SECRET_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `NEXT_PUBLIC_SITE_URL` | `https://küchenwert.de` |
| `EMAIL_FROM` | `KüchenWert <info@kuechenwert24.de>` |
| `EMAIL_BCC_BUCHHALTUNG` | `buchhaltung@kuechenwert24.de` |
| `RESEND_API_KEY` | Resend (Domain `kuechenwert24.de` dort verifizieren) |

4. Domain in Dokploy/Traefik konfigurieren: **beide** Hostnamen auf denselben
   Container leiten — `küchenwert.de` als Primary, `kuechenwert24.de` als
   301-Redirect auf die Primary (in Traefik-Labels oder via Cloudflare Page Rule).
5. Deploy starten.

## 5. Cloudflare

- **DNS** (beide Domains):
  - `küchenwert.de` → A/AAAA oder CNAME auf den Server.
  - `kuechenwert24.de` → A/AAAA oder CNAME auf den Server (wegen Redirect + MX).
- **SSL/TLS** (beide Zonen): Full (strict).
- **Always HTTPS**: aktivieren.
- **Page Rule / Redirect Rule** auf `kuechenwert24.de`:
  `*kuechenwert24.de/*` → 301 → `https://küchenwert.de/$2` (Status 301,
  Querystrings erhalten).

## 6. E-Mail (kuechenwert24.de)

Alle produktiven Absender (Resend, ggf. Google Workspace) laufen über
`kuechenwert24.de`. Folgende DNS-Einträge im Cloudflare für `kuechenwert24.de`:

- **MX**: Mailanbieter-Records (z. B. Google Workspace, Mailbox.org, Resend Inbound).
- **SPF** (TXT, `@`): `v=spf1 include:_spf.<mailanbieter>.com include:amazonses.com ~all`
  (`amazonses.com` nur, falls Resend als ausschließlicher Transaktions-Sender dient;
  Resend selbst verifiziert zusätzlich via eigenen TXT + CNAME.)
- **DKIM**: CNAME-Records laut Resend + Mailanbieter-Dashboard.
- **DMARC** (TXT, `_dmarc`): `v=DMARC1; p=quarantine; rua=mailto:dmarc@kuechenwert24.de; adkim=s; aspf=s`
  (nach 2 Wochen Monitoring auf `p=reject` ziehen.)

`küchenwert.de` bekommt **keine** MX-Records — dort läuft ausschließlich die
Website, kein Mail-Versand, kein Mail-Empfang.

## 7. Checkliste nach Go-Live

- [ ] Supabase Site URL und Redirect URLs auf echte HTTPS-Domain(s)
- [ ] Stripe Webhook auf Punycode-URL (`xn--kchenwert-q9a.de`)
- [ ] Resend-Domain `kuechenwert24.de` verifiziert (SPF/DKIM grün)
- [ ] DMARC-Record auf `kuechenwert24.de` gesetzt (`p=quarantine` startphase)
- [ ] Test-Mail an externe Adresse (Gmail/Outlook) → nicht in Spam
- [ ] 301-Redirect `kuechenwert24.de` → `küchenwert.de` funktioniert
- [ ] Cookie-Banner / CMP testen
- [ ] Login + Funnel end-to-end testen (Magic Link kommt an!)
- [ ] `www` vs. non-`www` Redirect konsistent
