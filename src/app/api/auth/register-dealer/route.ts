import { NextResponse } from "next/server";
import { supabaseAdmin, audit } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface DealerRegInput {
  company_name?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  website?: string;
  service_radius_km?: number;
  brands?: string;
  consent_agb?: boolean;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const body = (await req.json()) as DealerRegInput;

  // ---------------- Validation -----------------
  if (!body.email || !/\S+@\S+\.\S+/.test(body.email)) {
    return NextResponse.json({ error: "E-Mail ungültig" }, { status: 400 });
  }
  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Passwort zu kurz" }, { status: 400 });
  }
  if (!body.company_name || !body.address || !body.postal_code || !body.city || !body.phone) {
    return NextResponse.json({ error: "Unternehmensdaten unvollständig" }, { status: 400 });
  }
  if (!body.contact_first_name || !body.contact_last_name) {
    return NextResponse.json({ error: "Ansprechpartner fehlt" }, { status: 400 });
  }
  if (!body.consent_agb) {
    return NextResponse.json({ error: "AGB-Zustimmung fehlt" }, { status: 400 });
  }
  if (!/^\d{5}$/.test(body.postal_code)) {
    return NextResponse.json({ error: "PLZ ungültig" }, { status: 400 });
  }

  // ---------------- Slug eindeutig machen -----------------
  const baseSlug = slugify(body.company_name) || `dealer-${Date.now()}`;
  let slug = baseSlug;
  for (let i = 2; i < 50; i++) {
    const { data: clash } = await supabaseAdmin
      .from("dealers")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  // ---------------- Auth-User anlegen -----------------
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: false,
    user_metadata: { role: "dealer" },
  });
  if (authErr || !authData.user) {
    if (authErr?.message?.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "E-Mail ist bereits registriert. Bitte anmelden." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: authErr?.message ?? "User-Anlage fehlgeschlagen" },
      { status: 500 },
    );
  }
  const userId = authData.user.id;

  // ---------------- Profile (sollte via Trigger entstehen, aber sicherheitshalber upsert) -----------------
  await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: "dealer",
        first_name: body.contact_first_name,
        last_name: body.contact_last_name,
        phone: body.phone,
      },
      { onConflict: "id" },
    );

  // ---------------- Dealer-Datensatz -----------------
  const brandsArr = (body.brands ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data: dealer, error: dealerErr } = await supabaseAdmin
    .from("dealers")
    .insert({
      user_id: userId,
      company_name: body.company_name,
      slug,
      address: body.address,
      postal_code: body.postal_code,
      city: body.city,
      phone: body.phone,
      email: body.email,
      website: body.website || null,
      brands: brandsArr,
      service_radius_km: body.service_radius_km ?? 50,
      plan: "basic",
      is_verified: false,
      is_active: true,
    })
    .select("*")
    .single();

  if (dealerErr) {
    console.error("dealer insert failed:", dealerErr);
    // Cleanup: User-Anlage rückgängig (best effort)
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    return NextResponse.json({ error: dealerErr.message }, { status: 500 });
  }

  // ---------------- Consent + Audit -----------------
  await supabaseAdmin.from("consent_records").insert({
    user_id: userId,
    purpose: "dealer_agb",
    granted: true,
  });
  await audit(null, "dealer.register", "dealer", dealer.id, {
    company: dealer.company_name,
    slug: dealer.slug,
  });

  return NextResponse.json({ ok: true, dealer_id: dealer.id });
}
