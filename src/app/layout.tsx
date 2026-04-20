import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

const fira = Fira_Sans({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KüchenWert – Küchenangebot vergleichen oder erhalten",
    template: "%s | KüchenWert",
  },
  description:
    "Bestehendes Küchenangebot prüfen oder neue Angebote von verifizierten Küchenstudios erhalten. Transparent, kostenlos, unverbindlich.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={fira.variable}>
      <body className="font-sans">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
