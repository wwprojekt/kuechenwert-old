/**
 * Dealer-Benachrichtigungen (E-Mail via Resend).
 *
 * Zwei Trigger:
 *
 *   1. Neuer Funnel-A-Lead (status='qualified')
 *      → `notifyDealersOfNewLead(leadId)`
 *      → findet aktive, verifizierte Händler mit passender PLZ-Region
 *        (2-stellige Leitzone ODER großer Service-Radius ≥ 100 km)
 *      → schickt kurze Mail mit neutralisiertem Preview und Marketplace-Link.
 *
 *   2. Neue Funnel-B-Auktion freigeschaltet (status='active', is_published=true)
 *      → `notifyDealersOfNewAuction(auctionId)`
 *      → schickt an ALLE aktiven + verifizierten Händler eine Mail mit
 *        Auktions-Eckdaten und Link zur Gebots-Seite.
 *
 * Alle Funktionen sind best-effort: Fehler werden geloggt, brechen aber nie
 * den aufrufenden API-Flow ab. Jede Mail wird zusätzlich im audit_log
 * festgehalten.
 */
import { supabaseAdmin, audit } from "@/lib/supabase/admin";
import { sendMail, esc } from "@/lib/email";
import { siteUrl } from "@/lib/site-url";
import { COMPANY } from "@/config/company";

interface DealerRow {
  id: string;
  company_name: string;
  email: string;
  postal_code: string | null;
  service_radius_km: number | null;
}

/**
 * Liefert alle aktiven + verifizierten Händler, deren PLZ eine der
 * ersten zwei Ziffern der Lead-PLZ teilt (Leitzone) oder die einen
 * Service-Radius ≥ 100 km hinterlegt haben (Überregionale).
 */
async function findMatchingDealers(
  leadPostalCode: string | null | undefined,
): Promise<DealerRow[]> {
  const { data, error } = await supabaseAdmin
    .from("dealers")
    .select("id, company_name, email, postal_code, service_radius_km, is_active, is_verified")
    .eq("is_active", true)
    .eq("is_verified", true);

  if (error) {
    console.error("[dealer-notify] dealer query failed:", error.message);
    return [];
  }

  const leadZone = (leadPostalCode ?? "").replace(/\D/g, "").slice(0, 2);
  return (data ?? []).filter((d) => {
    if (!d.email) return false;
    if ((d.service_radius_km ?? 0) >= 100) return true;
    if (!leadZone) return false;
    const dealerZone = (d.postal_code ?? "").replace(/\D/g, "").slice(0, 2);
    return dealerZone === leadZone;
  });
}

// =====================================================================
// FUNNEL A – Neuer Lead
// =====================================================================
export async function notifyDealersOfNewLead(leadId: string): Promise<void> {
  try {
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select(
        "id, postal_code, city, budget_midpoint, tier, kitchen_form, kitchen_style, timeframe_months, region, funnel_type, status",
      )
      .eq("id", leadId)
      .single();
    if (error || !lead) {
      console.error("[dealer-notify:lead] lead not found:", leadId, error?.message);
      return;
    }
    if (lead.funnel_type !== "a" || lead.status !== "qualified") {
      return;
    }

    const dealers = await findMatchingDealers(lead.postal_code);
    if (dealers.length === 0) {
      console.log("[dealer-notify:lead] no matching dealers for PLZ", lead.postal_code);
      return;
    }

    const budget = lead.budget_midpoint
      ? `${Math.round(Number(lead.budget_midpoint)).toLocaleString("de-DE")} €`
      : "nicht angegeben";
    const timeframe = lead.timeframe_months
      ? `${lead.timeframe_months} Monate`
      : "offen";
    const plzRegion = (lead.postal_code ?? "").slice(0, 2) + "xxx";

    const marketplaceUrl = siteUrl("/dealer/marketplace");
    const leadUrl = siteUrl(`/dealer/leads/${leadId}`);

    const html = renderLeadAlertHtml({
      tier: String(lead.tier ?? "qualified"),
      plzRegion,
      city: lead.city,
      budget,
      timeframe,
      kitchenForm: lead.kitchen_form,
      kitchenStyle: lead.kitchen_style,
      marketplaceUrl,
      leadUrl,
    });

    const subject = `Neuer KüchenWert-Lead in PLZ ${plzRegion} · Budget ${budget}`;

    // Ein Send pro Händler, damit Addresse personalisiert bleibt und keine
    // fremden Händler untereinander sichtbar werden.
    const recipients = dealers.map((d) => d.email);
    const results = await Promise.allSettled(
      recipients.map((to) => sendMail({ to, subject, html })),
    );
    const okCount = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;

    await audit(null, "lead.notify_dealers", "lead", leadId, {
      sent: okCount,
      total: recipients.length,
      plzRegion,
    });
  } catch (err) {
    console.error("[dealer-notify:lead] unexpected error:", err);
  }
}

// =====================================================================
// FUNNEL B – Neue Auktion
// =====================================================================
export async function notifyDealersOfNewAuction(auctionId: string): Promise<void> {
  try {
    const { data: auction, error } = await supabaseAdmin
      .from("auctions")
      .select(
        "id, lead_id, offer_price_eur, min_bid_eur, duration_hours, starts_at, ends_at, status, is_published, lead:leads(id, postal_code, city, kitchen_form, kitchen_style, budget_midpoint)",
      )
      .eq("id", auctionId)
      .single();
    if (error || !auction) {
      console.error("[dealer-notify:auction] auction not found:", auctionId, error?.message);
      return;
    }
    if (auction.status !== "active" || !auction.is_published) {
      return;
    }

    const { data: dealers, error: dErr } = await supabaseAdmin
      .from("dealers")
      .select("id, email, company_name")
      .eq("is_active", true)
      .eq("is_verified", true);
    if (dErr) {
      console.error("[dealer-notify:auction] dealer query failed:", dErr.message);
      return;
    }
    const recipients = (dealers ?? []).filter((d) => !!d.email).map((d) => d.email);
    if (recipients.length === 0) return;

    const lead = Array.isArray(auction.lead) ? auction.lead[0] : auction.lead;
    const plzRegion = (lead?.postal_code ?? "").slice(0, 2) + "xxx";
    const benchmark = auction.offer_price_eur
      ? `${Number(auction.offer_price_eur).toLocaleString("de-DE")} €`
      : "—";
    const endsAt = auction.ends_at
      ? new Date(auction.ends_at).toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : `${auction.duration_hours ?? 72} Stunden`;

    const auctionUrl = siteUrl(`/dealer/auctions/${auctionId}`);

    const html = renderAuctionAlertHtml({
      plzRegion,
      benchmark,
      endsAt,
      kitchenForm: lead?.kitchen_form,
      kitchenStyle: lead?.kitchen_style,
      auctionUrl,
    });

    const subject = `Neue 72-h-Auktion · Benchmark ${benchmark} · PLZ ${plzRegion}`;

    const results = await Promise.allSettled(
      recipients.map((to) => sendMail({ to, subject, html })),
    );
    const okCount = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;

    await audit(null, "auction.notify_dealers", "auction", auctionId, {
      sent: okCount,
      total: recipients.length,
      plzRegion,
    });
  } catch (err) {
    console.error("[dealer-notify:auction] unexpected error:", err);
  }
}

// =====================================================================
// HTML TEMPLATES
// =====================================================================
const baseStyle = `font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1f2937;background:#f1f5f9;padding:24px`;

interface LeadAlertInput {
  tier: string;
  plzRegion: string;
  city: string | null;
  budget: string;
  timeframe: string;
  kitchenForm: string | null;
  kitchenStyle: string | null;
  marketplaceUrl: string;
  leadUrl: string;
}

function renderLeadAlertHtml(i: LeadAlertInput): string {
  return `<!doctype html>
<html><body style="${baseStyle}">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:6px;border:1px solid #e2e8f0;padding:28px">
    <h1 style="margin:0 0 4px;font-size:20px;color:#1f88a3">Neuer Lead für Ihre Region</h1>
    <p style="color:#64748b;margin:0 0 20px;font-size:13px">${esc(COMPANY.brand_name)} · PLZ-Region ${esc(i.plzRegion)}</p>

    <div style="padding:14px 16px;background:#ecf7fa;border-left:4px solid #1f88a3;border-radius:4px;margin:16px 0">
      <table style="width:100%;font-size:13px">
        <tr><td style="color:#64748b;padding:3px 0;width:140px">Tier</td><td><strong style="color:#1f88a3">${esc(i.tier).toUpperCase()}</strong></td></tr>
        <tr><td style="color:#64748b;padding:3px 0">Region</td><td>PLZ ${esc(i.plzRegion)}${i.city ? " · " + esc(i.city) : ""}</td></tr>
        <tr><td style="color:#64748b;padding:3px 0">Budget</td><td><strong>${esc(i.budget)}</strong></td></tr>
        <tr><td style="color:#64748b;padding:3px 0">Zeitrahmen</td><td>${esc(i.timeframe)}</td></tr>
        ${i.kitchenForm ? `<tr><td style="color:#64748b;padding:3px 0">Küchenform</td><td>${esc(i.kitchenForm)}</td></tr>` : ""}
        ${i.kitchenStyle ? `<tr><td style="color:#64748b;padding:3px 0">Stil</td><td>${esc(i.kitchenStyle)}</td></tr>` : ""}
      </table>
    </div>

    <p style="font-size:13px;color:#475569;margin:16px 0">
      Name, Adresse und Telefon des Kunden werden erst nach Lead-Kauf freigeschaltet.
      Der Lead wird exklusiv an einen Händler verkauft — schnell sein lohnt sich.
    </p>

    <p style="text-align:center;margin:24px 0">
      <a href="${esc(i.leadUrl)}"
         style="display:inline-block;background:#1f88a3;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
        Lead-Details ansehen
      </a>
    </p>

    <p style="text-align:center;margin:12px 0">
      <a href="${esc(i.marketplaceUrl)}" style="color:#1f88a3;font-size:12px;text-decoration:underline">
        Zum gesamten Marktplatz →
      </a>
    </p>

    <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="font-size:11px;color:#94a3b8;margin:0">
      Sie erhalten diese Mail als verifizierter Händler auf ${esc(COMPANY.brand_name)}.
      ${esc(COMPANY.legal_name)} · ${esc(COMPANY.address)} · ${esc(COMPANY.postal_code)} ${esc(COMPANY.city)}
    </p>
  </div>
</body></html>`;
}

interface AuctionAlertInput {
  plzRegion: string;
  benchmark: string;
  endsAt: string;
  kitchenForm: string | null | undefined;
  kitchenStyle: string | null | undefined;
  auctionUrl: string;
}

function renderAuctionAlertHtml(i: AuctionAlertInput): string {
  return `<!doctype html>
<html><body style="${baseStyle}">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:6px;border:1px solid #e2e8f0;padding:28px">
    <h1 style="margin:0 0 4px;font-size:20px;color:#1f88a3">Neue 72-h-Auktion freigeschaltet</h1>
    <p style="color:#64748b;margin:0 0 20px;font-size:13px">${esc(COMPANY.brand_name)} · PLZ-Region ${esc(i.plzRegion)}</p>

    <div style="padding:14px 16px;background:#ecf7fa;border-left:4px solid #1f88a3;border-radius:4px;margin:16px 0">
      <table style="width:100%;font-size:13px">
        <tr><td style="color:#64748b;padding:3px 0;width:140px">Region</td><td>PLZ ${esc(i.plzRegion)}</td></tr>
        <tr><td style="color:#64748b;padding:3px 0">Benchmark-Angebot</td><td><strong>${esc(i.benchmark)}</strong> (zu unterbieten)</td></tr>
        <tr><td style="color:#64748b;padding:3px 0">Läuft bis</td><td><strong>${esc(i.endsAt)}</strong></td></tr>
        ${i.kitchenForm ? `<tr><td style="color:#64748b;padding:3px 0">Küchenform</td><td>${esc(i.kitchenForm)}</td></tr>` : ""}
        ${i.kitchenStyle ? `<tr><td style="color:#64748b;padding:3px 0">Stil</td><td>${esc(i.kitchenStyle)}</td></tr>` : ""}
      </table>
    </div>

    <p style="font-size:13px;color:#475569;margin:16px 0">
      Die vollständige Spec-Liste (Fronten, Arbeitsplatte, Geräte, Sanitär, Extras,
      Lieferung, Zahlung) finden Sie im Auktionsblatt. Gebote sind nach Auktionsende
      verbindlich gemäß unseren AGB.
    </p>

    <p style="text-align:center;margin:24px 0">
      <a href="${esc(i.auctionUrl)}"
         style="display:inline-block;background:#1f88a3;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
        Auktion ansehen &amp; bieten
      </a>
    </p>

    <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="font-size:11px;color:#94a3b8;margin:0">
      Sie erhalten diese Mail als verifizierter Händler auf ${esc(COMPANY.brand_name)}.
      ${esc(COMPANY.legal_name)} · ${esc(COMPANY.address)} · ${esc(COMPANY.postal_code)} ${esc(COMPANY.city)}
    </p>
  </div>
</body></html>`;
}
