#!/usr/bin/env node
/**
 * KuechenWert End-to-End-Smoke-Test.
 *
 * Faehrt die komplette Lead-Pipeline durch (gegen die laufende Next-App):
 *   1. Funnel-A "qualified" (high budget, full contact)  -> erwartet status='qualified'
 *   2. Funnel-A "standard"  (low budget)                 -> erwartet status='new'
 *   3. Funnel-B mit dummy file                           -> erwartet status='new', Auction-Draft
 *   4. Cron finalize-auctions (mit CRON_SECRET)          -> 200 + cron_runs Eintrag
 *   5. Cron dunning           (mit CRON_SECRET)          -> 200 + cron_runs Eintrag
 *
 * Am Ende werden alle Smoke-Daten anhand utm_source='smoke-test' wieder
 * geloescht (per Service-Role-Client, falls Key vorhanden).
 *
 * Aufruf:
 *   node --env-file=.env.local scripts/smoke-e2e.mjs
 *   node --env-file=.env.local scripts/smoke-e2e.mjs --base http://localhost:3000
 *
 * Voraussetzungen (env):
 *   NEXT_PUBLIC_SITE_URL          (default: http://localhost:3000)
 *   NEXT_PUBLIC_SUPABASE_URL      (fuer Cleanup + Verifikation)
 *   SUPABASE_SERVICE_ROLE_KEY     (fuer Cleanup + Verifikation)
 *   CRON_SECRET                   (Cron-Trigger)
 */

import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const baseFlag = args.indexOf("--base");
const BASE_URL =
  (baseFlag >= 0 ? args[baseFlag + 1] : null) ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

const SMOKE_TAG = "smoke-test";
const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

let passed = 0;
let failed = 0;
const failures = [];

function step(name) {
  console.log(`\n${COLORS.cyan}${COLORS.bold}[STEP]${COLORS.reset} ${name}`);
}

function ok(msg) {
  passed++;
  console.log(`  ${COLORS.green}OK${COLORS.reset}  ${msg}`);
}

function fail(msg, err) {
  failed++;
  failures.push(msg);
  console.log(`  ${COLORS.red}FAIL${COLORS.reset} ${msg}`);
  if (err) console.log(`       ${err.message ?? err}`);
}

function warn(msg) {
  console.log(`  ${COLORS.yellow}WARN${COLORS.reset} ${msg}`);
}

function assert(cond, msg, ctx) {
  if (cond) {
    ok(msg);
  } else {
    fail(msg, ctx ? new Error(JSON.stringify(ctx)) : null);
  }
}

async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

async function postForm(path, fields, files = []) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, typeof v === "string" ? v : JSON.stringify(v));
  }
  files.forEach((f, i) => {
    fd.append(`file_${i}`, f.blob, f.name);
    fd.append(`file_${i}_category`, f.category);
  });
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

async function postCron(jobPath) {
  if (!CRON_SECRET) {
    warn(`CRON_SECRET nicht gesetzt - Skip ${jobPath}`);
    return null;
  }
  const res = await fetch(`${BASE_URL}${jobPath}`, {
    method: "POST",
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

const supabase =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
    : null;

async function preflight() {
  step("Preflight");
  console.log(`  Base-URL: ${BASE_URL}`);
  try {
    const res = await fetch(BASE_URL, { method: "GET" });
    if (res.ok || res.status === 404) {
      ok("App erreichbar");
    } else {
      fail(`App antwortet mit HTTP ${res.status}`);
    }
  } catch (err) {
    fail("App nicht erreichbar - laeuft `next dev` / `next start`?", err);
    return false;
  }
  if (!supabase) warn("SUPABASE_SERVICE_ROLE_KEY fehlt - keine DB-Verifikation/Cleanup");
  if (!CRON_SECRET) warn("CRON_SECRET fehlt - Cron-Schritte werden uebersprungen");
  return true;
}

async function testFunnelAQualified() {
  step("Funnel-A: qualified-Tier (high budget, full contact)");
  const payload = {
    funnel_type: "a",
    plz: "10115",
    city: "Berlin",
    addressLine: "Smokestrasse 1",
    housing_type: "own",
    budget: "25k-40k",
    timeframe: "1-3",
    kitchenForm: "l-form",
    style: "modern",
    reason: "renovierung",
    hasExistingOffer: false,
    firstName: "Smoke",
    lastName: "Test-Q",
    email: `smoke+q+${Date.now()}@kuechenwert.test`,
    phone: "+49 30 123456",
    consentCall: true,
    utm_source: SMOKE_TAG,
  };
  const r = await postJson("/api/leads", payload);
  assert(r.ok, "POST /api/leads -> 200", r);
  if (!r.ok) return null;
  ok(`Lead-ID: ${r.json.id} · score=${r.json.score} · tier=${r.json.tier}`);

  if (supabase) {
    const { data: lead, error } = await supabase
      .from("leads")
      .select("status, tier, score, funnel_type, postal_code, region")
      .eq("id", r.json.id)
      .single();
    assert(!error, "Lead in DB lesbar", error ?? {});
    assert(lead?.funnel_type === "a", "funnel_type='a'", lead);
    assert(lead?.status === "qualified", "status='qualified' (Auto-Qualify)", lead);
    assert(["qualified", "premium", "hot"].includes(lead?.tier), "tier qualified+", lead);
    assert(!!lead?.region, "Region per PLZ aufgeloest", lead);
  }
  return r.json.id;
}

async function testFunnelAStandard() {
  step("Funnel-A: standard-Tier (low budget) -> Manual-Triage");
  const payload = {
    funnel_type: "a",
    plz: "20095",
    city: "Hamburg",
    housing_type: "rent",
    budget: "unter-5k",
    timeframe: "12+",
    firstName: "Smoke",
    lastName: "Test-S",
    email: `smoke+s+${Date.now()}@kuechenwert.test`,
    phone: "+49 40 999999",
    consentCall: true,
    utm_source: SMOKE_TAG,
  };
  const r = await postJson("/api/leads", payload);
  assert(r.ok, "POST /api/leads -> 200", r);
  if (!r.ok) return null;

  if (supabase) {
    const { data: lead } = await supabase
      .from("leads")
      .select("status, tier")
      .eq("id", r.json.id)
      .single();
    assert(lead?.status === "new", "status='new' (kein Auto-Qualify)", lead);
    assert(lead?.tier === "standard", "tier='standard'", lead);
  }
  return r.json.id;
}

async function testFunnelB() {
  step("Funnel-B: Lead mit Upload + Auction-Draft");
  const dummyPdf = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], {
    type: "application/pdf",
  });

  const payload = {
    housingType: "own",
    timeframe: "3-6",
    desiredDeliveryDate: null,
    brand: "nobilia",
    frontMaterialName: "Mattlack weiss",
    frontMaterialCategory: "uv-lack",
    handleType: "grifflos",
    worktopMaterial: "schichtstoff",
    worktopDesign: "Kalakata Roma",
    appliances: [
      { id: "a1", categorySlug: "backofen", brandSlug: "miele", model: "H 7264 BP" },
      { id: "a2", categorySlug: "kuehlschrank", brandSlug: "liebherr", model: "ICBP 3266" },
    ],
    sinkBrand: "blanco",
    sinkMaterial: "silgranit",
    sinkDesignation: "ZIA 9",
    wasteSeparationSystem: "yes",
    extras: ["beleuchtung_unter", "besteckeinsatz", "steckdosen"],
    extrasNotes: "Steckdose Bankside",
    deliveryMode: "delivery_assembly",
    paymentDownPaymentPercent: "30",
    paymentFinancing: "none",
    existingOfferStudio: "Smoke Studio",
    existingOfferPriceEur: "18500",
    postalCode: "50667",
    city: "Koeln",
    firstName: "Smoke",
    lastName: "Test-B",
    email: `smoke+b+${Date.now()}@kuechenwert.test`,
    phone: "+49 221 5555",
    salutation: "herr",
    consentCall: true,
    consentMarketing: false,
    utm_source: SMOKE_TAG,
  };

  const r = await postForm(
    "/api/leads/funnel-b",
    { payload: JSON.stringify(payload) },
    [{ blob: dummyPdf, name: "smoke-angebot.pdf", category: "angebot" }],
  );
  assert(r.ok, "POST /api/leads/funnel-b -> 200", r);
  if (!r.ok) return null;
  ok(`Lead-ID: ${r.json.id} · Auction: ${r.json.auction_id} · Uploads: ${r.json.uploads}`);
  assert(r.json.uploads === 1, "Genau 1 File hochgeladen", r.json);
  assert(!!r.json.auction_id, "Auction-Draft erstellt", r.json);

  if (supabase) {
    const { data: lead } = await supabase
      .from("leads")
      .select("status, funnel_type, tier, has_existing_offer, existing_offer_price_cents")
      .eq("id", r.json.id)
      .single();
    assert(lead?.funnel_type === "b", "funnel_type='b'", lead);
    assert(lead?.status === "new", "status='new' (Experte muss reviewen)", lead);
    assert(lead?.tier === "premium", "tier='premium'", lead);
    assert(lead?.has_existing_offer === true, "has_existing_offer=true", lead);
    assert(
      lead?.existing_offer_price_cents === 1850000,
      "existing_offer_price_cents korrekt",
      lead,
    );

    const { data: auction } = await supabase
      .from("auctions")
      .select("status, is_published, offer_price_eur")
      .eq("id", r.json.auction_id)
      .single();
    assert(auction?.status === "draft", "Auction status='draft'", auction);
    assert(auction?.is_published === false, "Auction is_published=false", auction);

    const { count: specCount } = await supabase
      .from("auction_spec_items")
      .select("*", { count: "exact", head: true })
      .eq("auction_id", r.json.auction_id);
    assert((specCount ?? 0) >= 7, `Spec-Items geseedet (${specCount})`, { specCount });

    const { count: fileCount } = await supabase
      .from("lead_files")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", r.json.id);
    assert(fileCount === 1, `lead_files Eintrag vorhanden (${fileCount})`, { fileCount });
  }
  return { leadId: r.json.id, auctionId: r.json.auction_id };
}

async function testCronJobs() {
  step("Cron: finalize-auctions (Manual-Trigger)");
  const r1 = await postCron("/api/cron/finalize-auctions");
  if (r1) {
    assert(r1.ok, "Cron finalize-auctions -> 200", r1);
    assert(typeof r1.json.processed === "number", "processed-Zaehler vorhanden", r1.json);
  }

  step("Cron: dunning (Manual-Trigger)");
  const r2 = await postCron("/api/cron/dunning");
  if (r2) {
    assert(r2.ok, "Cron dunning -> 200", r2);
    assert(typeof r2.json.processed === "number", "processed-Zaehler vorhanden", r2.json);
  }

  if (supabase && CRON_SECRET) {
    step("Cron-Run-Tracking");
    const since = new Date(Date.now() - 60_000).toISOString();
    const { data: runs } = await supabase
      .from("cron_runs")
      .select("job, status, processed, duration_ms")
      .gte("started_at", since)
      .in("job", ["finalize-auctions", "dunning"])
      .order("started_at", { ascending: false });
    const finalizeRun = runs?.find((r) => r.job === "finalize-auctions");
    const dunningRun = runs?.find((r) => r.job === "dunning");
    assert(!!finalizeRun, "cron_runs-Eintrag fuer finalize-auctions", { runs });
    assert(!!dunningRun, "cron_runs-Eintrag fuer dunning", { runs });
    assert(finalizeRun?.status === "success", "finalize-auctions Run = success", finalizeRun);
    assert(dunningRun?.status === "success", "dunning Run = success", dunningRun);
  }
}

async function cleanup() {
  if (!supabase) return;
  step("Cleanup (utm_source='smoke-test')");
  const { data: leads } = await supabase
    .from("leads")
    .select("id")
    .eq("utm_source", SMOKE_TAG);
  const ids = (leads ?? []).map((l) => l.id);
  if (ids.length === 0) {
    ok("Keine Smoke-Leads zu loeschen");
    return;
  }

  // Auctions, spec items, files vorher haendisch loeschen (kein Cascade)
  const { data: auctions } = await supabase
    .from("auctions")
    .select("id")
    .in("lead_id", ids);
  const auctionIds = (auctions ?? []).map((a) => a.id);
  if (auctionIds.length) {
    await supabase.from("auction_spec_items").delete().in("auction_id", auctionIds);
    await supabase.from("bids").delete().in("auction_id", auctionIds);
    await supabase.from("auctions").delete().in("id", auctionIds);
  }

  // Storage-Files inkl. lead_files Rows
  const { data: files } = await supabase
    .from("lead_files")
    .select("file_url")
    .in("lead_id", ids);
  for (const f of files ?? []) {
    await supabase.storage.from("lead-files").remove([f.file_url]).catch(() => {});
  }
  await supabase.from("lead_files").delete().in("lead_id", ids);
  await supabase.from("audit_log").delete().in("entity_id", ids);
  await supabase.from("match_candidates").delete().in("lead_id", ids).catch(() => {});
  await supabase.from("qualification_calls").delete().in("lead_id", ids).catch(() => {});

  const { error: leadDelErr } = await supabase.from("leads").delete().in("id", ids);
  if (leadDelErr) {
    fail("Lead-Cleanup fehlgeschlagen", leadDelErr);
  } else {
    ok(`${ids.length} Smoke-Leads + abhaengige Daten geloescht`);
  }
}

async function main() {
  console.log(`${COLORS.bold}KuechenWert E2E-Smoke${COLORS.reset}`);
  const ready = await preflight();
  if (!ready) {
    process.exit(1);
  }

  try {
    await testFunnelAQualified();
    await testFunnelAStandard();
    await testFunnelB();
    await testCronJobs();
  } catch (err) {
    fail("Unerwarteter Crash im Smoke-Lauf", err);
  } finally {
    await cleanup();
  }

  console.log(
    `\n${COLORS.bold}Ergebnis:${COLORS.reset} ` +
      `${COLORS.green}${passed} OK${COLORS.reset} · ${COLORS.red}${failed} FAIL${COLORS.reset}`,
  );
  if (failed > 0) {
    console.log("\nFehlgeschlagene Checks:");
    for (const f of failures) console.log(` - ${f}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
