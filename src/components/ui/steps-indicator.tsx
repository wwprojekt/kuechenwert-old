import { clsx } from "clsx";

interface StepsIndicatorProps {
  steps: { id: string; label: string }[];
  currentIndex: number;
}

export function StepsIndicator({ steps, currentIndex }: StepsIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={clsx(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition",
              i < currentIndex && "bg-brand-600 text-white",
              i === currentIndex && "bg-brand-600 text-white ring-2 ring-brand-300 ring-offset-2",
              i > currentIndex && "bg-zinc-200 text-zinc-500",
            )}
          >
            {i < currentIndex ? "✓" : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={clsx("h-0.5 w-6 rounded", i < currentIndex ? "bg-brand-600" : "bg-zinc-200")} />
          )}
        </div>
      ))}
    </div>
  );
}
