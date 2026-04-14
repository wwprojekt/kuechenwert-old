import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { TrustBar } from "@/components/ui/trust-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TrustBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
