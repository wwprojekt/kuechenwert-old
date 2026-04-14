import { FUNNEL_STEPS } from "@/config/funnel-steps";
import { notFound } from "next/navigation";
import { FunnelStepClient } from "./funnel-step-client";

interface Props {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ plz?: string }>;
}

export default async function FunnelStepPage({ params, searchParams }: Props) {
  const { step } = await params;
  const { plz } = await searchParams;

  const stepIndex = FUNNEL_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  return <FunnelStepClient stepSlug={step} initialPlz={plz ?? ""} />;
}

export function generateStaticParams() {
  return FUNNEL_STEPS.map((s) => ({ step: s.slug }));
}
