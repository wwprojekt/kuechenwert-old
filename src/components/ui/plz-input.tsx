"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface PlzInputProps {
  size?: "default" | "large";
  className?: string;
}

export function PlzInput({ size = "default", className }: PlzInputProps) {
  const [plz, setPlz] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (plz.length === 5) {
      router.push(`/funnel/kuechenform?plz=${plz}`);
    }
  }

  const isLarge = size === "large";

  return (
    <form onSubmit={onSubmit} className={clsx("flex gap-2", className)}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{5}"
        maxLength={5}
        placeholder="Ihre PLZ"
        value={plz}
        onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
        className={clsx(
          "w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
          isLarge ? "px-5 py-4 text-lg" : "px-4 py-2.5 text-sm",
        )}
        required
      />
      <button
        type="submit"
        disabled={plz.length !== 5}
        className={clsx(
          "btn-accent whitespace-nowrap",
          isLarge && "px-8 py-4 text-base",
        )}
      >
        Jetzt Studios finden
      </button>
    </form>
  );
}
