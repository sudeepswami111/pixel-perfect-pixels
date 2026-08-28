import { useEffect, useState } from "react";
import { formatCountdown, msUntilLocalMidnight } from "@/lib/day-theme";
import { cn } from "@/lib/utils";

export function ResetCountdown({ className }: { className?: string }) {
  const [ms, setMs] = useState(() => msUntilLocalMidnight(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilLocalMidnight(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={cn("font-mono tabular-nums", className)}>{formatCountdown(ms)}</span>
  );
}

export function SplitBar({
  agreePct,
  total,
  animate = true,
}: {
  agreePct: number;
  total: number;
  animate?: boolean;
}) {
  const [width, setWidth] = useState(animate ? 50 : agreePct);
  useEffect(() => {
    const id = window.setTimeout(() => setWidth(agreePct), 30);
    return () => window.clearTimeout(id);
  }, [agreePct]);

  return (
    <div>
      <div className="flex h-10 w-full overflow-hidden border border-border bg-secondary">
        <div
          className="motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
          style={{ width: `${width}%`, backgroundColor: "var(--day-accent)" }}
        />
        <div className="flex-1 bg-muted" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <span style={{ color: "var(--day-accent)" }}>{agreePct}% AGREE</span>
        <span>{total} VOTES</span>
        <span>{100 - agreePct}% DISAGREE</span>
      </div>
    </div>
  );
}

export function CoinPips({ left, total }: { left: number; total: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const spent = i >= left;
        return (
          <span
            key={i}
            className={cn(
              "h-3 w-3 rounded-full motion-safe:transition-all motion-safe:duration-300",
              spent && "scale-75 opacity-30",
            )}
            style={{
              backgroundColor: spent ? "var(--muted)" : "var(--day-accent)",
              boxShadow: spent ? "none" : "0 0 0 3px var(--day-accent-soft)",
            }}
          />
        );
      })}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}
