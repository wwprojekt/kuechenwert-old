import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRegionByPlz } from "@/config/regions";
import { recordConsents, getClientIp } from "@/lib/consent";

export const runtime = "nodejs"; // need Node runtime for FormData with files

interface ApplianceInput {
  id?: string;
  categorySlug?: string;
  brandSlug?: string;
  model?: string;
}

interface FunnelBPayload {
  housingType?: string;
  purchaseReason?: string;
  timeframe?: string;
  desiredDeliveryDate?: string;
  brand?: string;
  brandCustom?: string;
  frontMaterialName?: string;
  frontMaterialCategory?: string;
  handleType?: string;
  worktopMaterial?: string;
  worktopDesign?: string;
  worktopDesignCustom?: string;
  appliances?: ApplianceInput[];
  sinkBrand?: string;
  sinkMaterial?: string;
  sinkDesignation?: string;
  wasteSeparationSystem?: "yes" | "no" | "";
  extras?: string[];
  extrasNotes?: string;
  deliveryMode?: string;
  paymentDownPaymentPercent?: string;
  paymentFinancing?: string;
  paymentFinancingApr?: string;
  paymentFinancingMonths?: string;
  existingOfferStudio?: string;
  existingOfferPriceEur?: string;
  postalCode?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  salutation?: string;
  consentCall?: boolean;
  consentMarketing?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const TIMEFRAME_TO_MONTHS: Record<string, number | null> = {
  "0-3": 2,
  "3-6": 5,
  "6-12": 9,
  "12+": 15,
  flexibel: null,
};

const FINANCING_VALID = new Set(["none", "zero_interest", "with_interest", "unknown"]);
const DELIVERY_VALID = new Set(["delivery_assembly", "delivery_only", "pickup", "unknown"]);
const HOUSING_VALID = new Set(["own", "rent", "unknown"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }
    const payload = JSON.parse(payloadRaw) as FunnelBPayload;

    // ---------------- Validation -----------------
    const offerPriceEur = Number(payload.existingOfferPriceEur);
    if (!Number.isFinite(offerPriceEur) || offerPriceEur <= 0) {
      return NextResponse.json(
        { error: "Angebotspreis (existingOfferPriceEur) ist Pflicht und muss > 0 sein." },
        { status: 400 },
      );
    }
    if (!payload.housingType) {
      return NextResponse.json({ error: "Wohnsituation ist Pflicht." }, { status: 400 });
    }
    if (!payload.postalCode || !/^\d{5}$/.test(payload.postalCode)) {
      return NextResponse.json({ error: "PLZ ungültig." }, { status: 400 });
    }
    if (!payload.firstName || !payload.lastName) {
      return NextResponse.json({ error: "Name ist Pflicht." }, { status: 400 });
    }
    if (!payload.email || !/\S+@\S+\.\S+/.test(payload.email)) {
      return NextResponse.json({ error: "E-Mail ungültig." }, { status: 400 });
    }
    if (!payload.phone) {
      return NextResponse.json({ error: "Telefon ist Pflicht." }, { status: 400 });
    }
    if (!payload.consentCall) {
      return NextResponse.json(
        { error: "Telefon-Einwilligung ist erforderlich." },
        { status: 400 },
      );
    }

    const housingType = HOUSING_VALID.has(payload.housingType) ? payload.housingType : "unknown";
    const financing =
      payload.paymentFinancing && FINANCING_VALID.has(payload.paymentFinancing)
        ? payload.paymentFinancing
        : null;
    const deliveryMode =
      payload.deliveryMode && DELIVERY_VALID.has(payload.deliveryMode)
        ? payload.deliveryMode
        : null;

    const region = getRegionByPlz(payload.postalCode);
    const timeframeMonths = payload.timeframe
      ? TIMEFRAME_TO_MONTHS[payload.timeframe] ?? null
      : null;

    const offerPriceCents = Math.round(offerPriceEur * 100);
    const budgetMidpoint = offerPriceEur; // for funnel B the offer price IS the budget anchor

    // ---------------- Insert lead -----------------
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("leads")
      .insert({
        funnel_type: "b",
        funnel_variant: "b",
        status: "new",
        score: 50, // default - will be updated by qualification call
        tier: "premium", // funnel B has upload + concrete offer => premium baseline
        postal_code: payload.postalCode,
        city: payload.city ?? null,
        region: region?.id ?? null,
        housing_type: housingType,
        kitchen_form: null,
        kitchen_style: null,
        purchase_reason: payload.purchaseReason ?? null,
        timeframe_months: timeframeMonths,
        budget_midpoint: budgetMidpoint,
        has_existing_offer: true,
        existing_offer_price_cents: offerPriceCents,
        existing_offer_studio: payload.existingOfferStudio ?? null,
        desired_delivery_at: payload.desiredDeliveryDate || null,
        delivery_mode: deliveryMode,
        payment_down_payment_percent: payload.paymentDownPaymentPercent
          ? Number(payload.paymentDownPaymentPercent)
          : null,
        payment_financing: financing,
        payment_financing_apr: payload.paymentFinancingApr
          ? Number(payload.paymentFinancingApr)
          : null,
        payment_financing_months: payload.paymentFinancingMonths
          ? Number(payload.paymentFinancingMonths)
          : null,
        waste_separation_system:
          payload.wasteSeparationSystem === "yes"
            ? true
            : payload.wasteSeparationSystem === "no"
              ? false
              : null,
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        consent_call: !!payload.consentCall,
        consent_marketing: !!payload.consentMarketing,
        funnel_answers: payload, // raw blob for audit / admin completion
        utm_source: payload.utm_source ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
        utm_term: payload.utm_term ?? null,
        utm_content: payload.utm_content ?? null,
      })
      .select("id")
      .single();

    if (leadErr || !lead) {
      console.error("Lead insert failed:", leadErr);
      return NextResponse.json(
        { error: leadErr?.message ?? "Lead-Speicherung fehlgeschlagen" },
        { status: 500 },
      );
    }

    // ---------------- Insert auction (draft) -----------------
    const { data: auction, error: auctionErr } = await supabaseAdmin
      .from("auctions")
      .insert({
        lead_id: lead.id,
        status: "draft",
        offer_price_eur: offerPriceEur,
        duration_hours: 72,
        spec_sheet: payload, // initial spec, admin/expert will refine
      })
      .select("id")
      .single();

    if (auctionErr) {
      console.error("Auction draft insert failed:", auctionErr);
      // non-fatal: admin can create later
    }

    // ---------------- Spec items (initial seed from payload) -----------------
    if (auction) {
      const specRows: Array<Record<string, unknown>> = [];

      if (payload.brand) {
        specRows.push({
          auction_id: auction.id,
          category: "fronten",
          label: "Hersteller / Marke",
          brand: payload.brand === "sonstiger" ? payload.brandCustom || "Sonstiger" : payload.brand,
          sort_order: 5,
        });
      }
      if (payload.frontMaterialName) {
        specRows.push({
          auction_id: auction.id,
          category: "fronten",
          label: "Frontmaterial",
          material: payload.frontMaterialName,
          notes: payload.frontMaterialCategory ?? null,
          sort_order: 10,
        });
      }
      if (payload.handleType) {
        specRows.push({
          auction_id: auction.id,
          category: "griffe",
          label: "Grifftyp",
          designation: payload.handleType,
          sort_order: 20,
        });
      }
      if (payload.worktopMaterial) {
        specRows.push({
          auction_id: auction.id,
          category: "arbeitsplatte",
          label: "Arbeitsplatte",
          material: payload.worktopMaterial,
          designation: payload.worktopDesign || payload.worktopDesignCustom || null,
          sort_order: 30,
        });
      }
      (payload.appliances ?? []).forEach((a, i) => {
        if (!a.categorySlug) return;
        specRows.push({
          auction_id: auction.id,
          category: "geraet",
          label: a.categorySlug,
          brand: a.brandSlug || null,
          model: a.model || null,
          sort_order: 40 + i,
        });
      });
      if (payload.sinkBrand || payload.sinkMaterial || payload.sinkDesignation) {
        specRows.push({
          auction_id: auction.id,
          category: "sanitaer",
          label: "Spüle",
          brand: payload.sinkBrand || null,
          material: payload.sinkMaterial || null,
          designation: payload.sinkDesignation || null,
          sort_order: 60,
        });
      }
      if (payload.wasteSeparationSystem === "yes") {
        specRows.push({
          auction_id: auction.id,
          category: "mülltrennung",
          label: "Mülltrennsystem",
          designation: "vorgesehen",
          sort_order: 65,
        });
      }
      (payload.extras ?? []).forEach((e, i) => {
        specRows.push({
          auction_id: auction.id,
          category: e.startsWith("beleuchtung")
            ? "beleuchtung"
            : e === "steckdosen"
              ? "steckdosen"
              : e === "besteckeinsatz"
                ? "besteckeinsatz"
                : "sonstiges",
          label: e,
          sort_order: 80 + i,
        });
      });
      if (payload.extrasNotes) {
        specRows.push({
          auction_id: auction.id,
          category: "sonstiges",
          label: "Sonstige Notizen",
          notes: payload.extrasNotes,
          sort_order: 100,
        });
      }

      if (specRows.length) {
        const { error: specErr } = await supabaseAdmin
          .from("auction_spec_items")
          .insert(specRows);
        if (specErr) console.error("spec_items insert failed:", specErr);
      }
    }

    // ---------------- Upload files -----------------
    let uploadCount = 0;
    let i = 0;
    while (true) {
      const file = formData.get(`file_${i}`);
      const category = formData.get(`file_${i}_category`);
      if (!file) break;
      i++;
      if (!(file instanceof File) || typeof category !== "string") continue;
      if (file.size === 0) continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${lead.id}/${category}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabaseAdmin.storage
        .from("lead-files")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (upErr) {
        console.error("Storage upload failed:", upErr);
        continue;
      }

      const { error: rowErr } = await supabaseAdmin.from("lead_files").insert({
        lead_id: lead.id,
        file_url: path,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size_bytes: file.size,
        category,
      });
      if (rowErr) {
        console.error("lead_files insert failed:", rowErr);
      } else {
        uploadCount++;
      }
    }

    // ---------------- Audit log -----------------
    // Anonyme Submission -> actor_id = null (Schema erlaubt NULL).
    const { error: auditErr } = await supabaseAdmin.from("audit_log").insert({
      actor_id: null,
      action: "lead.created",
      entity_type: "lead",
      entity_id: lead.id,
      details: {
        funnel: "b",
        files_uploaded: uploadCount,
        offer_price_eur: offerPriceEur,
        auction_id: auction?.id ?? null,
      },
    });
    if (auditErr) console.error("[funnel-b] audit_log insert failed:", auditErr);

    // DSGVO-Nachweis: Consent-Records persistieren (best-effort)
    await recordConsents(
      [
        { purpose: "privacy_policy", granted: true },
        { purpose: "marketing_call", granted: !!payload.consentCall },
        { purpose: "marketing_email", granted: !!payload.consentMarketing },
      ],
      {
        leadId: lead.id,
        source: "funnel_b",
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent"),
      },
    );

    return NextResponse.json({
      id: lead.id,
      auction_id: auction?.id ?? null,
      uploads: uploadCount,
    });
  } catch (err) {
    console.error("Funnel-B route fatal:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unbekannter Fehler" },
      { status: 500 },
    );
  }
}
