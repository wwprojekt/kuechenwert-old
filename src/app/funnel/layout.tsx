import Link from "next/link";

export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="section-container flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-700">
            KüchenWert
          </Link>
          <span className="text-xs text-zinc-400">100% kostenlos &amp; unverbindlich</span>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center py-8 sm:py-12">
        <div className="w-full max-w-2xl px-4">{children}</div>
      </main>
    </div>
  );
}
