/**
 * Site-URL-Helper.
 *
 * Domain-Aufstellung:
 *  - `küchenwert.de` (mit Umlaut) = primäre Website-Domain.
 *    Punycode (ASCII-Äquivalent, gleiche Zone): `xn--kchenwert-q9a.de`.
 *  - `kuechenwert24.de` = sekundäre ASCII-Domain für E-Mail-Versand und
 *    als 301-Redirect auf die Hauptdomain. Wird separat verwaltet, siehe
 *    `src/config/company.ts` bzw. `EMAIL_FROM` in der .env.
 *  - `kuechenwert.de` (ohne Umlaut, ohne 24) gehört uns NICHT — nie verwenden.
 *
 * Site-URL-Wahl:
 *  - In E-Mails, UI, Rechnungen, SEO-Canonical → die Pretty-Form
 *    `küchenwert.de` (Kunden sehen das in jedem aktuellen Browser sauber).
 *  - In Server-zu-Server `fetch()`, `Host:`-Headern und eigenen Webhooks
 *    die Punycode-Form `xn--kchenwert-q9a.de`, weil ältere Node-fetch-
 *    Implementierungen sowie viele HTTP-Libs (RFC 7230) auf reinen
 *    ASCII-Hostnames bestehen.
 *
 * Quelle der Wahrheit: NEXT_PUBLIC_SITE_URL → als Pretty-Form speichern
 * (z.B. https://küchenwert.de). Die ASCII-Variante wird zur Laufzeit
 * aus der URL gerechnet.
 */

const FALLBACK_PRETTY = "https://küchenwert.de";
const FALLBACK_LOCAL = "http://localhost:3000";

/**
 * URL für Anzeige-Zwecke (E-Mail, UI, Rechnungen). Liefert die Domain
 * im Original mit Umlaut, sofern konfiguriert.
 */
export function getSiteUrlPretty(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return stripTrailingSlash(env);
  if (process.env.NODE_ENV === "production") return FALLBACK_PRETTY;
  return FALLBACK_LOCAL;
}

/**
 * URL für Server-zu-Server Aufrufe (`fetch()`, Cron-Trigger, Webhooks).
 * Konvertiert den Host nach Punycode (IDN → ASCII), Pfad/Port bleiben.
 *
 * Beispiel:
 *   getSiteUrlAscii("https://küchenwert.de/api/x")
 *   → "https://xn--kchenwert-q9a.de/api/x"
 */
export function getSiteUrlAscii(input?: string): string {
  const raw = (input ?? getSiteUrlPretty()).trim();
  try {
    const url = new URL(raw);
    // URL-Konstruktor von Node konvertiert IDN-Hostnamen automatisch
    // zu Punycode in `url.hostname`. Wir bauen die URL daraus neu zusammen.
    const ascii = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}${url.search}${url.hash}`;
    return stripTrailingSlash(ascii);
  } catch {
    return stripTrailingSlash(raw);
  }
}

/**
 * Baut eine absolute URL aus einem relativen Pfad in der Pretty-Form.
 * Verwendung: Links in E-Mails, Rechnungs-PDFs, Marketing-Material.
 */
export function siteUrl(path: string): string {
  const base = getSiteUrlPretty();
  return joinUrl(base, path);
}

/**
 * Baut eine absolute URL aus einem relativen Pfad in der ASCII-Form.
 * Verwendung: alles was per `fetch()` oder von externen Diensten
 * abgerufen wird (Cron-Trigger, eigene Webhooks).
 */
export function siteUrlAscii(path: string): string {
  const base = getSiteUrlAscii();
  return joinUrl(base, path);
}

function joinUrl(base: string, path: string): string {
  if (!path) return base;
  if (/^https?:\/\//.test(path)) return path;
  return `${stripTrailingSlash(base)}/${path.replace(/^\//, "")}`;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
