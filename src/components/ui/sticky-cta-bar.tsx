"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const FUNNEL_PATHS = ["/funnel/", "/funnel/danke", "/funnel/ergebnis"];

export function StickyCTABar() {
  const [visible, setVisible] = useState(false);
  const [plz, setPlz] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const isFunnelPage = FUNNEL_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isFunnelPage) return;

    function handleScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const nearBottom = scrollY + winHeight > docHeight - 200;

      setVisible(scrollY > 300 && !nearBottom);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFunnelPage]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (plz.length === 5) {
      sessionStorage.setItem("kw_funnel_angebote", JSON.stringify({ plz }));
      router.push("/funnel/angebote/kuechenform");
    }
  }

  if (isFunnelPage) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="border-t border-brand-800 bg-brand-950/95 px-4 py-3 backdrop-blur-lg">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-xl items-center gap-2"
        >
          <span className="hidden text-sm font-medium text-white sm:block">
            Traumküche finden:
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="PLZ"
            value={plz}
            onChange={(e) =>
              setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white placeholder-white/40 outline-none transition focus:border-accent-400 sm:w-32"
          />
          <button
            type="submit"
            disabled={plz.length !== 5}
            className="shrink-0 rounded-lg bg-accent-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-40"
          >
            Angebote erhalten
          </button>
        </form>
      </div>
    </div>
  );
}
