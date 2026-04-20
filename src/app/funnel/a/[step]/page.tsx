import { notFound } from "next/navigation";
import { FUNNEL_A_STEPS, type FunnelAStammdaten } from "@/config/funnel-a";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FunnelAClient } from "./funnel-a-client";

export const metadata = {
  title: "Angebot erhalten – KüchenWert",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ plz?: string }>;
}

export default async function FunnelAStepPage({ params, searchParams }: Props) {
  const { step } = await params;
  const { plz } = await searchParams;

  const stepIndex = FUNNEL_A_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  const stammdaten = await loadStammdaten();

  return (
    <FunnelAClient
      stepSlug={step}
      initialPlz={plz ?? ""}
      stammdaten={stammdaten}
    />
  );
}

export function generateStaticParams() {
  return FUNNEL_A_STEPS.map((s) => ({ step: s.slug }));
}

async function loadStammdaten(): Promise<FunnelAStammdaten> {
  const [fronts, worktops, appliances] = await Promise.all([
    supabaseAdmin
      .from("catalog_front_materials")
      .select("id, name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabaseAdmin
      .from("catalog_worktop_materials")
      .select("id, name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabaseAdmin
      .from("catalog_appliance_brands")
      .select("id, name, sort_order")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return {
    frontMaterials: (fronts.data ?? []).map((r) => ({ id: r.id, name: r.name })),
    worktopMaterials: (worktops.data ?? []).map((r) => ({ id: r.id, name: r.name })),
    applianceBrands: (appliances.data ?? []).map((r) => ({ id: r.id, name: r.name })),
  };
}
