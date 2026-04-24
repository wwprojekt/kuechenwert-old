import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin, audit } from "@/lib/supabase/admin";
import { sendDunningEmail, sendInvoiceEmail } from "@/lib/invoices";

export const runtime = "nodejs";

interface PatchBody {
  action?: "mark_paid" | "cancel" | "resend" | "trigger_dunning";
  payment_method?: "bank_transfer" | "sepa" | "manual";
  dunning_level?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;
  const body = (await req.json()) as PatchBody;

  const { data: inv, error } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !inv) return NextResponse.json({ error: "Rechnung nicht gefunden" }, { status: 404 });

  if (body.action === "mark_paid") {
    if (inv.status === "paid") return NextResponse.json({ ok: true, already_paid: true });
    const { error: uErr } = await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_method: body.payment_method ?? "bank_transfer",
        notes: body.notes ?? inv.notes,
      })
      .eq("id", id);
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
    await audit(guard.userId, "invoice.mark_paid", "invoice", id, { paymentMethod: body.payment_method });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "cancel") {
    await supabaseAdmin.from("invoices").update({ status: "cancelled", notes: body.notes ?? inv.notes }).eq("id", id);
    await audit(guard.userId, "invoice.cancel", "invoice", id, {});
    return NextResponse.json({ ok: true });
  }

  if (body.action === "resend") {
    const r = await sendInvoiceEmail(id);
    return NextResponse.json({ ok: r.ok, error: r.error });
  }

  if (body.action === "trigger_dunning") {
    const lvl = (body.dunning_level ?? Math.min(inv.dunning_level + 1, 5)) as 1 | 2 | 3 | 4 | 5;
    const r = await sendDunningEmail(id, lvl, "admin");
    return NextResponse.json({ ok: r.ok, error: r.error, level: lvl });
  }

  return NextResponse.json({ error: "Unbekannte Aktion" }, { status: 400 });
}
