import { notFound, redirect } from "next/navigation";
import { TRAUMKUECHE_STEPS } from "@/config/funnel-traumkueche";
import { FunnelTraumkuecheClient } from "./funnel-traumkueche-client";

export const metadata = {
  title: "Deine Traumküche in 30 Sekunden – KüchenWert",
  description:
    "KI-gestützter Küchen-Planer. Stil, Farben, Geräte wählen – dein persönliches Moodboard mit Preisrange in unter einer Minute.",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ step: string }>;
}

export default async function FunnelTraumkuechePage({ params }: Props) {
  const { step } = await params;

  if (!step || step.length === 0) {
    redirect(`/funnel/traumkueche/${TRAUMKUECHE_STEPS[0]!.slug}`);
  }

  const stepIndex = TRAUMKUECHE_STEPS.findIndex((s) => s.slug === step);
  if (stepIndex === -1) notFound();

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <FunnelTraumkuecheClient
      stepSlug={step}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}

export function generateStaticParams() {
  return TRAUMKUECHE_STEPS.map((s) => ({ step: s.slug }));
}
