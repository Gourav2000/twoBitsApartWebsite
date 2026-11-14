"use client";

/**
 * A 1-D loss curve with two valleys, to show local vs global minima.
 * L(u) = 0.12u⁴ − 1.1u² + 0.35u + 3.2 has a deep valley on the left and a
 * shallower one on the right; both are found numerically below.
 */

const L = (u: number) => 0.12 * u ** 4 - 1.1 * u ** 2 + 0.35 * u + 3.2;

const W = 760;
const H = 360;
const AXIS = 320;
const PAD = 50;
const U0 = -3.3;
const U1 = 3.3;
const N = 240;

const us = Array.from({ length: N + 1 }, (_, i) => U0 + ((U1 - U0) * i) / N);
const ls = us.map(L);
const lMin = Math.min(...ls);
const lMax = Math.max(...ls);
const sx = (u: number) => PAD + ((u - U0) / (U1 - U0)) * (W - 2 * PAD);
const sy = (l: number) => 230 - ((l - lMin) / (lMax - lMin)) * 200;

// local minima on the sampled curve
const minima = us
  .map((u, i) => ({ u, l: ls[i], i }))
  .filter(({ i }) => i > 0 && i < N && ls[i] < ls[i - 1] && ls[i] < ls[i + 1]);
const globalMin = minima.reduce((a, b) => (b.l < a.l ? b : a));
const localMin = minima.find((m) => m !== globalMin)!;

export function MinimaPlot() {
  const path = us.map((u, i) => `${i ? "L" : "M"}${sx(u).toFixed(1)},${sy(ls[i]).toFixed(1)}`).join(" ");
  // rounded, so server and browser render identical numbers (no hydration mismatch)
  const r2 = (v: number) => Math.round(v * 100) / 100;
  const g = { x: r2(sx(globalMin.u)), y: r2(sy(globalMin.l)) };
  const l = { x: r2(sx(localMin.u)), y: r2(sy(localMin.l)) };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="A loss curve with a local minimum and a deeper global minimum" className="block">
      <line x1={PAD} y1={AXIS} x2={W - PAD + 10} y2={AXIS} stroke="#5b657a" strokeWidth={2} />
      <line x1={PAD} y1={AXIS} x2={PAD} y2={20} stroke="#5b657a" strokeWidth={2} />
      <text x={W - PAD + 10} y={AXIS + 24} textAnchor="end" fill="#8d97ab" fontSize={16} fontStyle="italic">
        weight
      </text>
      <text x={PAD - 8} y={14} fill="#8d97ab" fontSize={16} fontStyle="italic">
        loss
      </text>

      <path d={path} fill="none" stroke="var(--blue)" strokeWidth={4} />

      {/* the deepest valley */}
      <circle cx={g.x} cy={g.y} r={8} fill="var(--green)" />
      <text x={g.x} y={g.y + 32} textAnchor="middle" fill="var(--green)" fontSize={16} fontWeight={700}>
        global minimum
      </text>
      <text x={g.x} y={g.y + 50} textAnchor="middle" fill="#8d97ab" fontSize={13}>
        the lowest loss anywhere
      </text>

      {/* local minimum, with a ball resting in it */}
      <circle cx={l.x} cy={l.y - 13} r={11} fill="var(--purple)" />
      <text x={l.x} y={l.y + 32} textAnchor="middle" fill="#c08bff" fontSize={16} fontWeight={700}>
        local minimum
      </text>
      <text x={l.x} y={l.y + 50} textAnchor="middle" fill="#8d97ab" fontSize={13}>
        downhill stops here too: the slope is 0
      </text>
    </svg>
  );
}
