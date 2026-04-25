import { redirect } from "next/navigation";
import { TRAUMKUECHE_STEPS } from "@/config/funnel-traumkueche";

export default function FunnelTraumkuecheIndex() {
  redirect(`/funnel/traumkueche/${TRAUMKUECHE_STEPS[0]!.slug}`);
}
