import Link from "next/link";
import { clsx } from "clsx";

interface ImageCardProps {
  href: string;
  title: string;
  description?: string;
  /** Tailwind gradient or bg color class used as placeholder when no image */
  bgClass?: string;
  /** Optional image URL */
  imageSrc?: string;
  /** Size variant */
  size?: "default" | "large";
  className?: string;
}

export function ImageCard({
  href,
  title,
  description,
  bgClass = "bg-gradient-to-br from-brand-700 to-brand-900",
  imageSrc,
  size = "default",
  className,
}: ImageCardProps) {
  const isLarge = size === "large";

  return (
    <Link
      href={href}
      className={clsx(
        "group relative overflow-hidden rounded-xl shadow-sm transition hover:shadow-lg",
        isLarge ? "aspect-[16/10]" : "aspect-[4/3]",
        className,
      )}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className={clsx("absolute inset-0", bgClass)} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3
          className={clsx(
            "font-bold text-white",
            isLarge ? "text-xl" : "text-lg",
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-white/80 line-clamp-2">
            {description}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-400 transition group-hover:gap-2">
          Mehr erfahren
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
