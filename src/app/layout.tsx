import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
    <html lang="de" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
