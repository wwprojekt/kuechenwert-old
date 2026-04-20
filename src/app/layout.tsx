import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="de" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
