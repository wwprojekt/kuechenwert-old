/**
 * Cloudflare Turnstile Validation.
 *
 * Client sendet Turnstile-Token mit dem Generate-Request; dieser Helper
 * prueft den Token serverseitig gegen Cloudflare.
 *
 * Wenn TURNSTILE_SECRET_KEY nicht gesetzt ist (Dev / Test), geht die
 * Validierung "fail-open" durch. In Production ist die Konfiguration Pflicht.
 */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let _warnedMissingSecretInProd = false;

export interface TurnstileResult {
  success: boolean;
  skipped: boolean;
  errors?: string[];
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp: string | undefined,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  // Opt-in Security: Wenn kein Secret konfiguriert ist, skippen wir die
  // Validierung - auch in Production. Gedanke: Der Betreiber signalisiert
  // durch das Fehlen des Secrets bewusst, dass er keine Turnstile-Pruefung
  // aktivieren moechte (zB fuer internes Testing / soft-launch).
  //
  // Um zu warnen wenn prod ohne Bot-Schutz laeuft, loggen wir das einmal.
  if (!secret) {
    if (
      process.env.NODE_ENV === "production" &&
      !_warnedMissingSecretInProd
    ) {
      _warnedMissingSecretInProd = true;
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY fehlt in Production - Bot-Schutz ist DEAKTIVIERT. Fuer scharfe Prod-Deployments zwingend setzen.",
      );
    }
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, skipped: false, errors: ["missing-token"] };
  }

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp && remoteIp !== "unknown") form.set("remoteip", remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
      // kurzes Timeout - nicht den ganzen Request blocken
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) {
      return {
        success: false,
        skipped: false,
        errors: [`verify-http-${res.status}`],
      };
    }

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    return {
      success: !!data.success,
      skipped: false,
      errors: data["error-codes"],
    };
  } catch (e) {
    return {
      success: false,
      skipped: false,
      errors: [e instanceof Error ? e.message : "verify-exception"],
    };
  }
}

/**
 * Heuristische Bot-Erkennung anhand User-Agent.
 * Reicht nicht allein, aber ist ein guenstiger Cut fuer offensichtliche Crawler.
 */
export function looksLikeBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  const patterns = [
    "bot",
    "spider",
    "crawl",
    "scrape",
    "curl/",
    "wget/",
    "python-requests",
    "headlesschrome",
    "phantomjs",
    "axios/",
  ];
  return patterns.some((p) => ua.includes(p));
}
