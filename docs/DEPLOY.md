# Deployment: Dokploy + Cloudflare + Supabase

## 1. Supabase

### Einmalige Einrichtung

1. Neues Projekt in [Supabase Dashboard](https://supabase.com/dashboard) anlegen (Region: Frankfurt).
2. **Project Settings → API**: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` kopieren.
3. **Authentication → Providers → Email**: Magic Links aktivieren (oder E-Mail + Passwort).
4. **Authentication → URL configuration**:
   - **Site URL**: `https://küchenwert.de`
   - **Redirect URLs**: `http://localhost:3000/**`, `https://küchenwert.de/**`, `https://www.küchenwert.de/**`

### Migrations, Edge Functions & RLS (laufender Betrieb)

Alle Schema-/Policy-/Function-Änderungen laufen **via Cursor-Agent** (MCP `plugin-supabase-supabase`) direkt gegen Production — siehe `.cursor/rules/agent-workflow.mdc`. Kurz:

- SQL-Migration → versioniert in `supabase/migrations/NNN_*.sql`, dann via `apply_migration` ausgeführt.
- Edge Functions → `supabase/functions/<name>/index.ts`, deploy via `deploy_edge_function`.
- Types (`src/types/database.types.ts` o. ä.) nach jeder Schema-Änderung mit `generate_typescript_types` neu erzeugen und committen.

Manuelles Anwenden im SQL-Editor ist nur Fallback, wenn der MCP-Server nicht erreichbar ist.

## 2. Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com) → API keys kopieren.
2. Webhook Endpoint anlegen: `https://küchenwert.de/api/webhooks/stripe` (Events: `payment_intent.succeeded`, `invoice.paid`, `customer.subscription.*`).
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

4. Domain in Dokploy/Traefik konfigurieren, Deploy starten.

## 5. Cloudflare

- **DNS**: A/AAAA oder CNAME auf den Server.
- **SSL/TLS**: Full (strict).
- **Always HTTPS**: aktivieren.

## 6. Checkliste nach Go-Live

- [ ] Supabase Site URL und Redirect URLs auf echte HTTPS-Domain
- [ ] Stripe Webhook auf Produktions-URL
- [ ] Cookie-Banner / CMP testen
- [ ] Login + Funnel end-to-end testen
- [ ] `www` vs. non-`www` Redirect konsistent
