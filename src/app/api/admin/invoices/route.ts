import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import { createInvoice, type InvoiceType } from "@/lib/invoices";
import { PENALTY_AMOUNT_EUR } from "@/config/company";

export const runtime = "nodejs";

interface CreateBody {
  dealer_id?: string;
  type?: InvoiceType;
  description?: string;
  amount_gross_eur?: number;
  reference_type?: "lead" | "auction" | "bid" | "wallet" | "manual";
  reference_id?: string | null;
  due_in_days?: number;
}

// GET = Listing fuer Admin (mit Filter)
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const dealerId = url.searchParams.get("dealer_id");

  let q = supabaseAdmin
    .from("invoices")
    .select("id, invoice_number, dealer_id, type, status, gross_amount_cents, currency, issued_at, due_at, paid_at, dunning_level, recipient_company, recipient_email, email_sent")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  if (dealerId) q = q.eq("dealer_id", dealerId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

// POST = manuelle Rechnung / Penalty erstellen
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = (await req.json()) as CreateBody;

  if (!body.dealer_id) return NextResponse.json({ error: "dealer_id fehlt" }, { status: 400 });

  const isPenalty = body.type === "penalty";
  const grossEur = isPenalty ? PENALTY_AMOUNT_EUR : Number(body.amount_gross_eur);
  if (!grossEur || grossEur <= 0) {
    return NextResponse.json({ error: "Betrag ungültig" }, { status: 400 });
  }

  const description = body.description || (isPenalty ? "Vertragsstrafe gem. AGB §X (Stornierung nach Auktionssieg)" : "Manuelle Rechnungsposition");
  const grossCents = Math.round(grossEur * 100);
  const netCents = Math.round(grossCents / 1.19);

  const inv = await createInvoice({
    dealerId: body.dealer_id,
    type: body.type ?? "penalty",
    lines: [{ description, unit_price_cents: netCents }],
    reference_type: body.reference_type ?? "manual",
    reference_id: body.reference_id ?? null,
    due_in_days: body.due_in_days ?? 14,
    send_email: true,
  });

  return NextResponse.json({ invoice: inv });
}
