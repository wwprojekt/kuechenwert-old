import Link from "next/link";
import { clsx } from "clsx";

interface CTABannerProps {
  headline: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Visual variant */
  variant?: "dark" | "light" | "accent";
  className?: string;
}

export function CTABanner({
  headline,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  variant = "dark",
  className,
}: CTABannerProps) {
  const variants = {
    dark: {
      bg: "bg-brand-950",
      headline: "text-white",
      description: "text-brand-300",
      primary: "btn-accent",
      secondary: "border-white/20 text-white hover:bg-white/10",
    },
    light: {
      bg: "bg-zinc-50",
      headline: "text-zinc-900",
      description: "text-zinc-600",
      primary: "btn-primary",
      secondary: "border-zinc-300 text-zinc-700 hover:bg-zinc-100",
    },
    accent: {
      bg: "bg-accent-500",
      headline: "text-white",
      description: "text-white/80",
      primary: "bg-white text-accent-700 hover:bg-zinc-100 font-bold",
      secondary: "border-white/30 text-white hover:bg-white/10",
    },
  };

  const v = variants[variant];

  return (
    <section className={clsx(v.bg, "py-14 lg:py-16", className)}>
      <div className="section-container text-center">
        <h2 className={clsx("text-2xl font-bold tracking-tight sm:text-3xl", v.headline)}>
          {headline}
        </h2>
        {description && (
          <p className={clsx("mx-auto mt-3 max-w-2xl text-base", v.description)}>
            {description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryHref}
            className={clsx(
              "inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-sm font-semibold shadow-sm transition",
              v.primary,
            )}
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className={clsx(
                "inline-flex items-center justify-center rounded-lg border px-7 py-3.5 text-sm font-semibold transition",
                v.secondary,
              )}
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
