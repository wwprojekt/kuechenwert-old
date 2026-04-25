/**
 * Server-seitige Conversions-API (Meta CAPI) + Google Enhanced Conversions.
 *
 * Fire-and-forget. Fehler werden nur geloggt, niemals in den Request-Flow
 * propagiert. Gated durch das Vorhandensein der jeweiligen Env-Vars.
 */

import crypto from "node:crypto";

interface LeadPayload {
  leadId: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  plz?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  valueEur?: number | null;
  funnel?: string;
  timestampSec?: number;
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

export async function emitLeadConversion(lead: LeadPayload): Promise<void> {
  const ts = lead.timestampSec ?? Math.floor(Date.now() / 1000);
  await Promise.all([
    sendMetaCapiLead(lead, ts).catch((e) =>
      console.warn("[capi] meta lead failed:", e),
    ),
    sendGoogleEnhancedLead(lead, ts).catch((e) =>
      console.warn("[capi] google lead failed:", e),
    ),
  ]);
}

async function sendMetaCapiLead(lead: LeadPayload, ts: number): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData: Record<string, unknown> = {
    em: [sha256(lead.email)],
  };
  if (lead.phone) userData.ph = [sha256(lead.phone.replace(/\D/g, ""))];
  if (lead.firstName) userData.fn = [sha256(lead.firstName)];
  if (lead.lastName) userData.ln = [sha256(lead.lastName)];
  if (lead.plz) userData.zp = [sha256(lead.plz)];
  if (lead.ip) userData.client_ip_address = lead.ip;
  if (lead.userAgent) userData.client_user_agent = lead.userAgent;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: ts,
        event_id: `lead_${lead.leadId}`,
        action_source: "website",
        event_source_url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kuechenwert.de",
        user_data: userData,
        custom_data: {
          funnel: lead.funnel ?? "traumkueche",
          currency: "EUR",
          value: lead.valueEur ?? undefined,
          lead_id: lead.leadId,
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn("[capi] meta status", res.status, body.slice(0, 500));
  }
}

async function sendGoogleEnhancedLead(lead: LeadPayload, _ts: number): Promise<void> {
  const measurementId = process.env.GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_MEASUREMENT_API_SECRET;
  if (!measurementId || !apiSecret) return;

  const clientId = lead.leadId;

  const payload = {
    client_id: clientId,
    user_id: sha256(lead.email),
    events: [
      {
        name: "generate_lead",
        params: {
          lead_id: lead.leadId,
          funnel: lead.funnel ?? "traumkueche",
          currency: "EUR",
          value: lead.valueEur ?? 0,
        },
      },
    ],
    user_data: {
      sha256_email_address: [sha256(lead.email)],
      ...(lead.phone
        ? { sha256_phone_number: [sha256(lead.phone.replace(/\D/g, ""))] }
        : {}),
      address: [
        {
          ...(lead.firstName ? { sha256_first_name: sha256(lead.firstName) } : {}),
          ...(lead.lastName ? { sha256_last_name: sha256(lead.lastName) } : {}),
          ...(lead.plz ? { postal_code: lead.plz } : {}),
          country: "DE",
        },
      ],
    },
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    measurementId,
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn("[capi] google status", res.status, body.slice(0, 500));
  }
}
