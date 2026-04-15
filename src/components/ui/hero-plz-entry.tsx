"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

export function HeroPlzEntry() {
  const [plz, setPlz] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (plz.length === 5) {
      sessionStorage.setItem(
        "kw_funnel_angebote",
        JSON.stringify({ plz }),
      );
      router.push("/funnel/angebote/kuechenform");
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          placeholder="Ihre PLZ eingeben"
          value={plz}
          onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
          className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-5 py-4 text-lg font-semibold text-white placeholder-white/50 outline-none backdrop-blur-sm transition focus:border-accent-400 focus:bg-white/15"
          required
        />
        <button
          type="submit"
          disabled={plz.length !== 5}
          className={clsx(
            "shrink-0 rounded-xl px-6 py-4 text-base font-bold shadow-lg transition sm:px-8",
            plz.length === 5
              ? "bg-accent-500 text-white hover:bg-accent-600 shadow-accent-500/30"
              : "bg-white/10 text-white/40 cursor-not-allowed",
          )}
        >
          Angebote erhalten
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-3 text-sm text-brand-300">
        <span>Oder:</span>
        <Link
          href="/funnel/planung/kuechenform"
          className="font-medium text-white underline underline-offset-4 transition hover:text-accent-400"
        >
          Küchenplanung
        </Link>
        <span className="text-brand-500">|</span>
        <Link
          href="/funnel/quiz/stil"
          className="font-medium text-white underline underline-offset-4 transition hover:text-accent-400"
        >
          Style-Quiz
        </Link>
      </div>

      <p className="mt-3 text-center text-xs text-brand-400">
        Heute bereits <span className="font-semibold text-accent-400">47</span> Anfragen
        &middot; Kostenlos &middot; Unverbindlich
      </p>
    </div>
  );
}
