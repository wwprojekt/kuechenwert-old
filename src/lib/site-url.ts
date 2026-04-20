/**
 * Site-URL-Helper.
 *
 * Hintergrund: Unsere Domain ist `küchenwert.de` (mit Umlaut). DNS kann
 * historisch nur ASCII, deshalb existiert die Domain technisch zusätzlich
 * als Punycode `xn--kchenwert-y5a.de` — exakt dieselbe Zone, beide Namen
 * lösen auf den gleichen Server auf.
 *
 * Wir wollen:
 *  - In E-Mails, UI, Rechnungen etc. die schöne Form `küchenwert.de`
 *    (Kunden sehen das in jedem aktuellen Browser sauber)
 *  - In Server-zu-Server `fetch()`, `Host:`-Headern und externen Webhooks
 *    die ASCII-Form, weil ältere Node-fetch-Implementierungen sowie viele
 *    HTTP-Libs (RFC 7230) auf reinen ASCII-Hostnames bestehen
 *
 * Quelle der Wahrheit: NEXT_PUBLIC_SITE_URL → soll als „pretty" Form
 * gespeichert werden (z.B. https://küchenwert.de).
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
 * URL für Server-zu-Server Aufrufe (`fetch()`, Stripe-Webhooks, Cron-Trigger).
 * Konvertiert den Host nach Punycode (IDN → ASCII), Pfad/Port bleiben.
 *
 * Beispiel:
 *   getSiteUrlAscii("https://küchenwert.de/api/x")
 *   → "https://xn--kchenwert-y5a.de/api/x"
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
 * abgerufen wird (Stripe-Webhooks, eigene Cron-Trigger).
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
