"use client";

import { useEffect, useMemo, useState } from "react";
import { M } from "@/components/Math";

// Toy loss from the deck: L = (w − 3)², dL/dw = 2(w − 3)
const L = (w: number) => (w - 3) ** 2;
const dL = (w: number) => 2 * (w - 3);

// plot frame
const W = 760,
  H = 520,
  PAD = 50;
const WMIN = -1.5,
  WMAX = 7.5,
  LMAX = 22;
const sx = (w: number) => PAD + ((w - WMIN) / (WMAX - WMIN)) * (W - 2 * PAD);
const sy = (l: number) => H - PAD - (Math.min(l, LMAX) / LMAX) * (H - 2 * PAD);

export function GradientDescent() {
  const [eta, setEta] = useState(0.1);
  const [w0, setW0] = useState(0);
  const [path, setPath] = useState<number[]>([0]);
  const [playing, setPlaying] = useState(false);

  const w = path[path.length - 1];
  const step = () =>
    setPath((p) => {
      const cur = p[p.length - 1];
      if (Math.abs(cur) > 1e6 || p.length > 60) return p;
      return [...p, cur - eta * dL(cur)];
    });

  const reset = (start = w0) => {
    setPlaying(false);
    setPath([start]);
  };

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(step, 550);
    return () => clearInterval(t);
  });

  useEffect(() => {
    if (playing && (path.length > 40 || Math.abs(w - 3) < 1e-3 || Math.abs(w) > 1e4)) setPlaying(false);
  }, [path, playing, w]);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const ww = WMIN + ((WMAX - WMIN) * i) / 200;
      pts.push(`${sx(ww).toFixed(1)},${sy(L(ww)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, []);

  const verdict =
    eta >= 1.0 ? (eta === 1 ? "oscillates forever" : "diverges (overshoots)") : eta > 0.5 ? "zig-zags across the valley" : eta < 0.05 ? "crawls" : "converges smoothly";

  const visible = path.filter((p) => p >= WMIN - 0.5 && p <= WMAX + 0.5);

  return (
    <div className="grid h-full grid-cols-[760px_1fr] gap-12 text-[24px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border border-border bg-[#080b12]">
        {/* axes */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD + 10} y2={H - PAD} stroke="#5b657a" strokeWidth={2} />
        <line x1={sx(0)} y1={H - PAD} x2={sx(0)} y2={PAD - 20} stroke="#5b657a" strokeWidth={2} />
        <text x={W - PAD + 14} y={H - PAD + 8} fill="#8d97ab" fontSize={22} fontStyle="italic">w</text>
        <text x={sx(0) - 26} y={PAD - 22} fill="#8d97ab" fontSize={22} fontStyle="italic">L</text>
        {[0, 3, 6].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={H - PAD} x2={sx(t)} y2={H - PAD + 8} stroke="#5b657a" />
            <text x={sx(t)} y={H - PAD + 30} textAnchor="middle" fill="#8d97ab" fontSize={18} fontFamily="var(--font-jetbrains)">{t}</text>
          </g>
        ))}
        <line x1={sx(3)} y1={H - PAD} x2={sx(3)} y2={sy(0) - 6} stroke="var(--green)" strokeDasharray="4 6" />
        <polyline points={curve} fill="none" stroke="var(--blue)" strokeWidth={5} />
        {/* path */}
        {visible.map((p, i) =>
          i === 0 ? null : (
            <line
              key={`l${i}`}
              x1={sx(visible[i - 1])}
              y1={sy(L(visible[i - 1]))}
              x2={sx(p)}
              y2={sy(L(p))}
              stroke="var(--purple)"
              strokeWidth={3}
              strokeOpacity={0.8}
            />
          ),
        )}
        {visible.map((p, i) => (
          <circle key={`c${i}`} cx={sx(p)} cy={sy(L(p))} r={i === visible.length - 1 ? 13 : 6} fill="var(--purple)" opacity={i === visible.length - 1 ? 1 : 0.55} />
        ))}
        {/* tangent at current point */}
        {Math.abs(w) < 50 && (
          <line
            x1={sx(w - 0.9)}
            y1={sy(L(w) - 0.9 * dL(w))}
            x2={sx(w + 0.9)}
            y2={sy(L(w) + 0.9 * dL(w))}
            stroke="#ffb547"
            strokeWidth={2.5}
            strokeDasharray="6 5"
          />
        )}
      </svg>

      <div className="flex flex-col gap-5">
        <M>{String.raw`w \leftarrow w - \eta\,\frac{\partial L}{\partial w}, \qquad L=(w-3)^2`}</M>
        <label className="flex items-center gap-4">
          <span className="w-44 shrink-0">
            learning rate <M>\eta</M>
          </span>
          <input
            type="range"
            min={0.01}
            max={1.05}
            step={0.01}
            value={eta}
            onChange={(e) => {
              setEta(parseFloat(e.target.value));
              reset();
            }}
            className="tba-range purple"
          />
          <span className="w-20 text-right font-mono">{eta.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-4">
          <span className="w-44 shrink-0">
            start <M>w_0</M>
          </span>
          <input
            type="range"
            min={-1}
            max={7}
            step={0.5}
            value={w0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setW0(v);
              reset(v);
            }}
            className="tba-range"
          />
          <span className="w-20 text-right font-mono">{w0.toFixed(1)}</span>
        </label>
        <div className="flex gap-3 text-[22px]">
          <button onClick={step} className="rounded-full border border-border-strong px-5 py-2 hover:bg-surface-2">
            one step
          </button>
          <button onClick={() => setPlaying((p) => !p)} className="bg-gradient-brand rounded-full px-5 py-2 font-semibold text-white">
            {playing ? "pause" : "play"}
          </button>
          <button onClick={() => reset()} className="rounded-full border border-border-strong px-5 py-2 hover:bg-surface-2">
            reset
          </button>
        </div>

        <div className="rounded-2xl border border-border-strong bg-surface/70 p-4 font-mono text-[20px]">
          <div className="grid grid-cols-4 gap-2 border-b border-border pb-2 text-faint">
            <span>step</span>
            <span>w</span>
            <span>slope</span>
            <span>L</span>
          </div>
          {path.slice(-6).map((p, i, arr) => {
            const k = path.length - arr.length + i;
            const big = Math.abs(p) > 1e4;
            return (
              <div key={k} className={`grid grid-cols-4 gap-2 py-0.5 ${i === arr.length - 1 ? "text-text" : "text-muted"}`}>
                <span>{k}</span>
                <span>{big ? p.toExponential(1) : p.toFixed(3)}</span>
                <span>{big ? "…" : dL(p).toFixed(2)}</span>
                <span>{big ? "∞" : L(p).toFixed(3)}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[24px]">
          With <M>{`\\eta = ${eta.toFixed(2)}`}</M> the walk <b className="text-gradient">{verdict}</b>.
        </div>
      </div>
    </div>
  );
}
