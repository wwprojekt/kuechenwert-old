import { QUIZ_STEPS } from "@/config/funnel-quiz";
import { notFound } from "next/navigation";
import { QuizFunnelClient } from "./quiz-funnel-client";

interface Props {
  params: Promise<{ step: string }>;
}

export default async function QuizStepPage({ params }: Props) {
  const { step } = await params;

  const stepIndex = QUIZ_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  return <QuizFunnelClient stepSlug={step} />;
}

export function generateStaticParams() {
  return QUIZ_STEPS.map((s) => ({ step: s.slug }));
}
