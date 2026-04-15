"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

interface StatCounterProps {
  stats: Stat[];
  className?: string;
}

function useCountUp(target: number, duration = 1600, shouldStart: boolean) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let rafId: number;

    function tick(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, shouldStart]);

  return current;
}

function StatItem({ stat, shouldAnimate }: { stat: Stat; shouldAnimate: boolean }) {
  const count = useCountUp(stat.value, 1600, shouldAnimate);

  return (
    <div className="text-center">
      <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {stat.prefix}
        {count.toLocaleString("de-DE")}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-brand-200">{stat.label}</p>
    </div>
  );
}

export function StatCounter({ stats, className }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        "bg-brand-900 py-12",
        className,
      )}
    >
      <div className="section-container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} shouldAnimate={visible} />
        ))}
      </div>
    </div>
  );
}
