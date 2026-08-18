function seededRatio(i: number, seed: number) {
  return Math.abs(Math.sin(i * 12.9898 + seed * 78.233));
}

export function WaveformBars({
  count,
  seed = 0,
  minHeight = 20,
  className = "",
  barClassName = "",
  active = true,
  sync = false,
  speed = 1,
  flatHeight = 14,
}: {
  count: number;
  seed?: number;
  minHeight?: number;
  className?: string;
  barClassName?: string;
  /** When false, bars sit at a flat, non-animated height (e.g. idle/ended states). */
  active?: boolean;
  /** When true, all bars move in the same phase (a single "breathing" pulse) instead of a staggered, lively pattern. */
  sync?: boolean;
  /** Multiplies the per-bar animation duration - lower is livelier, higher is slower. */
  speed?: number;
  flatHeight?: number;
}) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        if (!active) {
          return (
            <span
              key={i}
              className={`origin-bottom ${barClassName}`}
              style={{ height: `${flatHeight}%` }}
            />
          );
        }

        const h = minHeight + seededRatio(i, seed) * (100 - minHeight);
        const duration = (1.1 + seededRatio(i, seed + 1) * 1.3) * speed;
        const delay = sync ? 0 : -(seededRatio(i, seed + 2) * 2);
        return (
          <span
            key={i}
            className={`origin-bottom motion-safe:animate-[wave-bar_ease-in-out_infinite] ${barClassName}`}
            style={{
              height: `${h.toFixed(1)}%`,
              animationDuration: `${duration.toFixed(2)}s`,
              animationDelay: `${delay.toFixed(2)}s`,
            }}
          />
        );
      })}
    </div>
  );
}
