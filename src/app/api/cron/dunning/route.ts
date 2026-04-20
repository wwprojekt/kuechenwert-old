import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDunningEmail } from "@/lib/invoices";
import { DUNNING_LEVELS } from "@/config/company";
import { runCronJob } from "@/lib/cron-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mahnwesen-Cron (taeglich).
 *
 * Iteriert ueber alle Rechnungen mit status in ('open','overdue') und
 * faelligkeit in der Vergangenheit. Bestimmt das passende Mahnstufe-Level
 * (1..5) abhaengig vom Tagesabstand zur Faelligkeit und dem aktuellen
 * dunning_level. Sendet eine Mahnung pro Stufe.
 */
export async function GET(req: Request) {
  return runCronJob("dunning", req, runDunning);
}

export const POST = GET;

async function runDunning() {
  const now = new Date();
  const todayIso = now.toISOString();

  const { data: invoices, error } = await supabaseAdmin
    .from("invoices")
    .select("id, dealer_id, dunning_level, due_at, status, gross_amount_cents")
    .in("status", ["open", "overdue"])
    .lte("due_at", todayIso)
    .limit(500);

  if (error) throw new Error(`invoices select failed: ${error.message}`);
  if (!invoices || invoices.length === 0) {
    return { processed: 0, details: { results: [] } };
  }

  const results: Array<Record<string, unknown>> = [];
  let mailErrors = 0;

  for (const inv of invoices) {
    if (!inv.due_at) continue;
    const overdueDays = Math.floor(
      (now.getTime() - new Date(inv.due_at).getTime()) / 86400000,
    );

    type DunningLevel = 1 | 2 | 3 | 4 | 5;
    let nextLevel: DunningLevel | null = null;
    for (const cfg of DUNNING_LEVELS) {
      if (overdueDays >= cfg.days_after_due && cfg.level > inv.dunning_level) {
        nextLevel = cfg.level as DunningLevel;
      }
    }
    if (!nextLevel) continue;

    try {
      const r = await sendDunningEmail(inv.id, nextLevel, "cron");
      if (!r.ok) mailErrors++;
      results.push({
        invoice_id: inv.id,
        level: nextLevel,
        overdue_days: overdueDays,
        email_ok: r.ok,
      });
    } catch (err) {
      mailErrors++;
      console.error("[dunning] failed:", inv.id, err);
      results.push({ invoice_id: inv.id, level: nextLevel, error: (err as Error).message });
    }
  }

  return {
    processed: results.length,
    details: { results, mail_errors: mailErrors },
  };
}
