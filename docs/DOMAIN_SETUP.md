# Domain-Setup: küchenwert.de + kuechenwert24.de

Schritt-für-Schritt-Anleitung zum Aktivieren beider Domains.
Voraussetzung: beide Domains sind registriert und im Cloudflare-Account
als Zonen angelegt (Nameserver auf Cloudflare umgestellt).

## Rollenverteilung

| Domain | Rolle | MX | Website |
|---|---|---|---|
| `küchenwert.de` | Primär (Brand, Canonical, SEO) | ❌ | ✅ |
| `kuechenwert24.de` | Sekundär (E-Mail + 301-Redirect) | ✅ | ❌ (nur Redirect) |
| `kuechenwert.de` (ohne `24`) | **Nicht unsere** | — | — |

---

## 1. DNS (Cloudflare) für `küchenwert.de`

```
A     @        <dokploy-server-ip>      Proxied
A     www      <dokploy-server-ip>      Proxied
```

Kein MX, kein SPF-include für Mail. Diese Zone ist **mail-frei**.

Optional (anti-spoof, damit niemand Mails in deinem Namen verschickt):
```
TXT   @        "v=spf1 -all"
TXT   _dmarc   "v=DMARC1; p=reject; rua=mailto:dmarc@kuechenwert24.de"
```

## 2. DNS (Cloudflare) für `kuechenwert24.de`

### 2a. Redirect-Basis (Pflicht)

```
A     @        <dokploy-server-ip>      Proxied
A     www      <dokploy-server-ip>      Proxied
```

### 2b. E-Mail — wähle EINEN Mailanbieter

**Variante A: Google Workspace**
```
MX   @   1   smtp.google.com.   DNS only (grey cloud)
TXT  @       "v=spf1 include:_spf.google.com include:amazonses.com ~all"
```
(`amazonses.com` = Resend für Transaktions-Mails; weglassen, wenn du
Resend nicht einsetzt.)

**Variante B: Mailbox.org**
```
MX   @   10  mxext1.mailbox.org.   DNS only
MX   @   10  mxext2.mailbox.org.   DNS only
TXT  @       "v=spf1 include:mailbox.org include:amazonses.com ~all"
```

**Variante C: Resend-only (keine "normalen" Postfächer, nur Transaktion)**
```
MX   send   10  feedback-smtp.eu-west-1.amazonses.com.   DNS only
TXT  send       "v=spf1 include:amazonses.com ~all"
```
→ E-Mail-Adressen dann `@send.kuechenwert24.de`, nicht empfehlenswert als
Haupt-Kontaktadresse.

### 2c. DKIM (egal welche Variante)

Nach Verifizierung im Resend-Dashboard bekommst du 3 CNAME-Records —
Form:
```
CNAME   resend._domainkey         resend._domainkey.resend.com.   DNS only
CNAME   resend2._domainkey        resend2._domainkey.resend.com.  DNS only
CNAME   resend3._domainkey        resend3._domainkey.resend.com.  DNS only
```
(Die konkreten Werte kommen aus Resend → Domains → Add.)

Bei Google/Mailbox zusätzlich deren DKIM-TXT-Record.

### 2d. DMARC (Pflicht, sonst Spam-Risiko)

```
TXT   _dmarc   "v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@kuechenwert24.de; adkim=s; aspf=s"
```

Nach 2 Wochen Monitoring (rua-Reports checken) auf `p=reject` ziehen.

---

## 3. Cloudflare Redirect Rule (`kuechenwert24.de` → `küchenwert.de`)

**Cloudflare Dashboard → Rules → Redirect Rules → Create rule:**

- **Name**: `kuechenwert24 → küchenwert (301)`
- **If incoming requests match**:
  - Field: `Hostname`
  - Operator: `equals`
  - Value: `kuechenwert24.de`
  - *oder* add: `Hostname` `equals` `www.kuechenwert24.de`
- **Then**:
  - Type: `Dynamic`
  - Expression: `concat("https://xn--kchenwert-q9a.de", http.request.uri.path, if(len(http.request.uri.query) > 0, concat("?", http.request.uri.query), ""))`
  - Status code: `301`
  - Preserve query string: `on`

> Wir redirecten auf **Punycode** `xn--kchenwert-q9a.de`, nicht auf die
> Umlaut-Form — Cloudflare Location-Header vertragen keine UTF-8-Hosts.
> Browser rendern daraus automatisch `küchenwert.de` in der Adresszeile.

**Wichtig**: Die Redirect Rule darf **nicht** für `*/.well-known/acme-challenge/*`
greifen, sonst kann Let's Encrypt kein Zertifikat ausstellen.
Optional Ausnahme:
```
(http.host eq "kuechenwert24.de" or http.host eq "www.kuechenwert24.de")
and not starts_with(http.request.uri.path, "/.well-known/")
```

---

## 4. Dokploy / Traefik-Konfiguration

Dokploy verwaltet die Labels automatisch, wenn du im Dashboard die Domain
einträgst. Du brauchst **zwei Domain-Einträge** auf derselben App:

1. **Primary**: `küchenwert.de` + `www.küchenwert.de`
   - HTTPS: ✅
   - Redirect `www` → apex: ✅
   - Let's Encrypt: ✅
2. **Secondary**: `kuechenwert24.de` + `www.kuechenwert24.de`
   - HTTPS: ✅
   - Redirect: nicht in Dokploy setzen (macht Cloudflare via Redirect Rule)
   - Let's Encrypt: ✅ (Dokploy holt Zert, auch wenn Cloudflare proxyd — dafür
     Cloudflare SSL/TLS auf **Full (strict)** stellen)

**Wenn du den Redirect lieber in Traefik statt Cloudflare möchtest**,
füge im Dokploy-Advanced-Tab unter "Traefik Custom Labels" hinzu:

```yaml
# Router, der nur kuechenwert24.de matched
traefik.http.routers.kw-redirect.rule: Host(`kuechenwert24.de`) || Host(`www.kuechenwert24.de`)
traefik.http.routers.kw-redirect.entrypoints: websecure
traefik.http.routers.kw-redirect.tls: true
traefik.http.routers.kw-redirect.tls.certresolver: letsencrypt
traefik.http.routers.kw-redirect.middlewares: kw-to-primary
traefik.http.routers.kw-redirect.service: noop@internal
traefik.http.routers.kw-redirect.priority: "100"

traefik.http.middlewares.kw-to-primary.redirectregex.regex: ^https?://(?:www\.)?kuechenwert24\.de/(.*)$
traefik.http.middlewares.kw-to-primary.redirectregex.replacement: https://xn--kchenwert-q9a.de/$${1}
traefik.http.middlewares.kw-to-primary.redirectregex.permanent: "true"
```

> `$${1}` ist korrekt: Docker-Compose expandiert `$$` zu `$`, Traefik sieht
> dann `$1`. Bei direkter `traefik.yml`-Config nur `$1`.

Entweder-oder: **Cloudflare-Rule oder Traefik-Middleware**, nicht beides
(sonst Redirect-Loop-Risiko).

---

## 5. Supabase (Auth-URLs)

Dashboard → Authentication → URL Configuration:

**Site URL**:
```
https://küchenwert.de
```

**Redirect URLs** (alle eintragen):
```
http://localhost:3000/**
https://küchenwert.de/**
https://www.küchenwert.de/**
https://xn--kchenwert-q9a.de/**
https://kuechenwert24.de/**
https://www.kuechenwert24.de/**
```

Supabase speichert Site URL als UTF-8 — falls das Feld den Umlaut
nicht akzeptiert, stattdessen `https://xn--kchenwert-q9a.de` eintragen
(im Redirect-Link schreibt Supabase dann die Punycode-Form, der Browser
rendert sie trotzdem als `küchenwert.de`).

**Email Templates** → Absender-Adresse: `noreply@kuechenwert24.de`
(nicht `@küchenwert.de` — führt zu Spam-Classification beim Empfänger).

---

## 6. Resend (Transaktionsmails)

1. Resend Dashboard → Domains → Add Domain → `kuechenwert24.de`
2. Region: **EU (Frankfurt)** wählen
3. Die 3 DKIM-CNAMEs + SPF-TXT in Cloudflare kopieren
4. Warten bis alle 3 Checks grün sind (~5-30 min nach DNS-Propagation)
5. In Dokploy ENV eintragen:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM="KüchenWert <info@kuechenwert24.de>"
   EMAIL_BCC_BUCHHALTUNG=buchhaltung@kuechenwert24.de
   ```

---

## 7. Go-Live-Test (15 Minuten)

```bash
# 1. Redirect funktioniert
curl -I https://kuechenwert24.de
# → erwartet: HTTP/2 301, location: https://xn--kchenwert-q9a.de/

curl -I https://www.kuechenwert24.de/foo?bar=baz
# → erwartet: Location erhält /foo?bar=baz

# 2. Hauptdomain antwortet (Punycode-Form für curl!)
curl -I https://xn--kchenwert-q9a.de
# → erwartet: HTTP/2 200

# 3. SSL-Check (beide Domains)
curl -vI https://küchenwert.de 2>&1 | grep -E "subject|issuer"
curl -vI https://kuechenwert24.de 2>&1 | grep -E "subject|issuer"

# 4. E-Mail-Check: Test-Mail an Gmail schicken (aus Supabase Auth)
#    → in Gmail auf "Original anzeigen" → SPF=PASS, DKIM=PASS, DMARC=PASS

# 5. DMARC-Check: https://mxtoolbox.com/dmarc.aspx?domain=kuechenwert24.de

# 6. Mail-Server-Score: https://www.mail-tester.com
#    → aus der App eine Test-Mail an die dort angegebene Adresse schicken
#    → Ziel: Score ≥ 9/10
```

---

## 8. SEO-Hinweis

- **Google Search Console**: beide Domains **separat** als Properties anlegen
  (sowohl `https://küchenwert.de` als auch `https://kuechenwert24.de`),
  damit du siehst ob jemand irrtümlich die 24er-Variante verlinkt.
- **Canonical-Tags**: Next.js rendert via `NEXT_PUBLIC_SITE_URL=https://küchenwert.de`
  automatisch die richtige Canonical-URL. Nicht manuell überschreiben.
- **sitemap.xml**: enthält nur `küchenwert.de`-URLs.
