"use client";

import { useRef } from "react";

/** The 8×8 "7" from the episode-1 deck. */
export function sevenSmall(): number[] {
  const g = new Array(64).fill(0);
  for (let c = 1; c <= 6; c++) g[c] = 1;
  [
    [1, 6],
    [2, 5],
    [3, 5],
    [4, 4],
    [5, 4],
    [6, 3],
    [7, 3],
  ].forEach(([r, c]) => (g[r * 8 + c] = 1));
  return g;
}

/** A smooth, anti-aliased "7" on a 28×28 grid (MNIST size). */
export function sevenLarge(): number[] {
  const N = 28;
  const segs = [
    [7, 7, 20, 6.5],
    [20, 6.5, 12, 23],
  ];
  const g = new Array(N * N).fill(0);
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      let d = Infinity;
      for (const [x1, y1, x2, y2] of segs) {
        const px = c + 0.5,
          py = r + 0.5;
        const dx = x2 - x1,
          dy = y2 - y1;
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
        d = Math.min(d, Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)));
      }
      g[r * N + c] = Math.max(0, Math.min(1, 1.9 - d)) ** 1.2;
    }
  return g.map((v) => Math.round(v * 100) / 100);
}

const shade = (v: number) => {
  const s = Math.round(v * 255);
  return `rgb(${s},${s},${s})`;
};

/**
 * Drawable grayscale grid. Click/drag paints, shift- or right-drag erases.
 * Hovering a pixel reports its flattened index via onHover.
 */
export function PixelGrid({
  n,
  values,
  onChange,
  hover,
  onHover,
  showNumbers = false,
  size = 420,
}: {
  n: number;
  values: number[];
  onChange: (v: number[]) => void;
  hover: number | null;
  onHover: (i: number | null) => void;
  showNumbers?: boolean;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const painting = useRef<null | "draw" | "erase">(null);

  const cellAt = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const c = Math.floor(((e.clientX - r.left) / r.width) * n);
    const row = Math.floor(((e.clientY - r.top) / r.height) * n);
    if (c < 0 || c >= n || row < 0 || row >= n) return null;
    return { r: row, c };
  };

  const paint = (e: React.PointerEvent) => {
    const cell = cellAt(e);
    if (!cell) return;
    onHover(cell.r * n + cell.c);
    if (!painting.current) return;
    const next = values.slice();
    const erase = painting.current === "erase";
    if (n <= 10) {
      next[cell.r * n + cell.c] = erase ? 0 : 1;
    } else {
      // soft brush for the 28×28 grid
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = cell.r + dr,
            cc = cell.c + dc;
          if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
          const k = rr * n + cc;
          const amt = dr === 0 && dc === 0 ? 1 : Math.abs(dr) + Math.abs(dc) === 1 ? 0.55 : 0.25;
          next[k] = erase ? Math.max(0, next[k] - amt) : Math.min(1, Math.max(next[k], amt));
          next[k] = Math.round(next[k] * 100) / 100;
        }
    }
    onChange(next);
  };

  return (
    <div
      ref={ref}
      className="relative grid cursor-crosshair touch-none overflow-hidden rounded-lg border border-border-strong select-none"
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${n}, 1fr)` }}
      onPointerDown={(e) => {
        painting.current = e.button === 2 || e.shiftKey ? "erase" : "draw";
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        paint(e);
      }}
      onPointerMove={paint}
      onPointerUp={() => (painting.current = null)}
      onPointerLeave={() => {
        painting.current = null;
        onHover(null);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {values.map((v, i) => (
        <div
          key={i}
          className="flex items-center justify-center font-mono"
          style={{
            background: shade(v),
            outline: hover === i ? "3px solid var(--purple)" : n <= 10 ? "1px solid rgba(120,130,150,.35)" : "none",
            outlineOffset: hover === i ? -3 : -1,
            fontSize: n <= 10 ? 18 : 0,
            color: v > 0.5 ? "#111" : "#9aa3b5",
          }}
        >
          {showNumbers && n <= 10 ? v.toFixed(1) : ""}
        </div>
      ))}
    </div>
  );
}

/** The same pixels as one long vector. */
export function FlatVector({
  values,
  hover,
  onHover,
  perRow,
  cell,
}: {
  values: number[];
  hover: number | null;
  onHover: (i: number | null) => void;
  perRow: number;
  cell: number;
}) {
  return (
    <div
      className="grid w-fit gap-px rounded-md border border-border-strong bg-[#30384a] p-px"
      style={{ gridTemplateColumns: `repeat(${perRow}, ${cell}px)` }}
      onPointerLeave={() => onHover(null)}
    >
      {values.map((v, i) => (
        <div
          key={i}
          onPointerEnter={() => onHover(i)}
          style={{
            height: cell,
            background: hover === i ? "var(--purple)" : shade(v),
          }}
        />
      ))}
    </div>
  );
}
