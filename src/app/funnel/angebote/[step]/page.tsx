import { ANGEBOTE_STEPS } from "@/config/funnel-angebote";
import { notFound } from "next/navigation";
import { AngeboteFunnelClient } from "./angebote-funnel-client";

interface Props {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ plz?: string }>;
}

export default async function AngeboteStepPage({ params, searchParams }: Props) {
  const { step } = await params;
  const { plz } = await searchParams;

  const stepIndex = ANGEBOTE_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  return <AngeboteFunnelClient stepSlug={step} initialPlz={plz ?? ""} />;
}

export function generateStaticParams() {
  return ANGEBOTE_STEPS.map((s) => ({ step: s.slug }));
}
