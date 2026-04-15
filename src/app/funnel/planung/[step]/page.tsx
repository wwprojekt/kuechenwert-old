import { PLANUNG_STEPS } from "@/config/funnel-planung";
import { notFound } from "next/navigation";
import { PlanungFunnelClient } from "./planung-funnel-client";

interface Props {
  params: Promise<{ step: string }>;
}

export default async function PlanungStepPage({ params }: Props) {
  const { step } = await params;

  const stepIndex = PLANUNG_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  return <PlanungFunnelClient stepSlug={step} />;
}

export function generateStaticParams() {
  return PLANUNG_STEPS.map((s) => ({ step: s.slug }));
}
