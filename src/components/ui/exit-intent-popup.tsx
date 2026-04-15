"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const SESSION_KEY = "kw_exit_intent_shown";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [plz, setPlz] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const isFunnelPage = pathname.startsWith("/funnel/");

  const trigger = useCallback(() => {
    if (isFunnelPage) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, [isFunnelPage]);

  useEffect(() => {
    if (isFunnelPage) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) trigger();
    }

    let lastScrollY = window.scrollY;
    function handleScroll() {
      const currentY = window.scrollY;
      if (lastScrollY - currentY > 200 && currentY < 300) trigger();
      lastScrollY = currentY;
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFunnelPage, trigger]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (plz.length === 5) {
      sessionStorage.setItem("kw_funnel_angebote", JSON.stringify({ plz }));
      setOpen(false);
      router.push("/funnel/angebote/kuechenform");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-700"
          aria-label="Schließen"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
            <svg className="h-7 w-7 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-bold text-zinc-900">
            Warten Sie!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Sichern Sie sich jetzt <span className="font-semibold text-brand-700">kostenlose Küchenangebote</span> von geprüften Studios in Ihrer Nähe.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="Ihre Postleitzahl"
            value={plz}
            onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="input-field text-center text-lg font-semibold"
            autoFocus
          />
          <button
            type="submit"
            disabled={plz.length !== 5}
            className="btn-accent mt-3 w-full py-3.5 text-base"
          >
            Kostenlose Angebote erhalten
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          100% kostenlos &middot; Unverbindlich &middot; DSGVO-konform
        </p>
      </div>
    </div>
  );
}
