import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { TrustBar } from "@/components/ui/trust-bar";
import { StickyCTABar } from "@/components/ui/sticky-cta-bar";
import { ExitIntentPopup } from "@/components/ui/exit-intent-popup";
import { SocialProofToast } from "@/components/ui/social-proof-toast";
import { UtmCapture } from "@/components/ui/utm-capture";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrustBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <StickyCTABar />
      <ExitIntentPopup />
      <SocialProofToast />
      <UtmCapture />
    </>
  );
}
