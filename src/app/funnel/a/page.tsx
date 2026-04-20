import { redirect } from "next/navigation";
import { FUNNEL_A_STEPS } from "@/config/funnel-a";

export const metadata = {
  title: "Angebot erhalten – KüchenWert",
};

export default function FunnelAEntryPage() {
  redirect(`/funnel/a/${FUNNEL_A_STEPS[0].slug}`);
}
