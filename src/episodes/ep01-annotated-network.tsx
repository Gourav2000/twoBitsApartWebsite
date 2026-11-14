"use client";

import { sevenSmall } from "@/components/widgets/PixelGrid";

/**
 * Pictures of the episode's network: 784 → 128 → 64 → 10.
 * Layers are named x (input), y (hidden 1), z (hidden 2), o (output scores);
 * p = softmax(o) are the probabilities. Both SVGs scale with their container.
 */

const C = {
  line: "rgba(148,163,196,.16)",
  faint: "#5b657a",
  muted: "#8d97ab",
  text: "#e9edf5",
  blue: "#3d8bff",
  purple: "#a45cff",
  lilac: "#c08bff",
  amber: "#ffb547",
  node: "#0f1420",
};

/** Example output for a "7": probabilities that sum to 1. */
const PROBS = [0.0, 0.01, 0.02, 0.01, 0.0, 0.0, 0.0, 0.93, 0.01, 0.02];
const PRED = 7;

function Dots({ x, y, gap = 13 }: { x: number; y: number; gap?: number }) {
  return (
    <g fill={C.faint}>
      {[-gap, 0, gap].map((d) => (
        <circle key={d} cx={x} cy={y + d} r={3} />
      ))}
    </g>
  );
}

/** A node labelled like x₇₈₄: letter + small subscript. */
function Node({
  x,
  y,
  r,
  name,
  sub,
  color,
  fill = C.node,
  width = 2.5,
  bold = false,
}: {
  x: number;
  y: number;
  r: number;
  name: string;
  sub: string;
  color: string;
  fill?: string;
  width?: number;
  bold?: boolean;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={width} />
      <text
        x={x - (sub.length > 2 ? 3 : 1)}
        y={y + r * 0.22}
        textAnchor="middle"
        fill={C.text}
        fontSize={r * 0.68}
        fontStyle="italic"
        fontWeight={bold ? 700 : 400}
      >
        {name}
        <tspan fontSize={Math.max(10, r * 0.45)} dy={r * 0.2} fontStyle="normal">
          {sub}
        </tspan>
      </text>
    </g>
  );
}

function LayerTitle({ x, title, lines, color }: { x: number; title: string; lines: string[]; color: string }) {
  return (
    <g textAnchor="middle">
      <text x={x} y={30} fill={color} fontSize={14} fontWeight={700} letterSpacing="0.12em">
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x} y={50 + i * 17} fill={C.muted} fontSize={13}>
          {l}
        </text>
      ))}
    </g>
  );
}

/** Callout: dashed leader from a dot on the thing to a title + lines of text. */
function Note({
  x,
  y,
  to,
  title,
  lines,
  color,
  anchor = "middle",
}: {
  x: number;
  y: number;
  to: [number, number];
  title: string;
  lines: string[];
  color: string;
  anchor?: "start" | "middle";
}) {
  const end: [number, number] = anchor === "start" ? [x - 6, y - 5] : [x, y - 18];
  return (
    <g>
      <line x1={to[0]} y1={to[1]} x2={end[0]} y2={end[1]} stroke={color} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={to[0]} cy={to[1]} r={3.5} fill={color} />
      <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={15} fontWeight={700}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + 19 + i * 18} textAnchor={anchor} fill={C.muted} fontSize={13.5}>
          {l}
        </text>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Annotated network: "So what exactly is a neural network?"
// ─────────────────────────────────────────────────────────────────────────

export function AnnotatedNetwork() {
  const X = 235;
  const Y = 405;
  const Z = 575;
  const O = 745;
  const xs = [125, 185, 245, 385, 445];
  const ys = [140, 205, 270, 430];
  const zs = [160, 230, 300, 410];
  const os = Array.from({ length: 10 }, (_, i) => 100 + i * 40);
  const xLabels = ["1", "2", "3", "783", "784"];
  const yLabels = ["1", "2", "3", "128"];
  const zLabels = ["1", "2", "3", "64"];

  const W_FROM = 4; // x₇₈₄
  const W_TO = 3; // y₁₂₈
  const NEURON = 3; // y₁₂₈ is the neuron we explain

  const px = sevenSmall();
  const cell = 11;
  const imgX = 20;
  const imgY = 245;

  return (
    <svg viewBox="0 0 1040 660" width="100%" role="img" aria-label="A neural network with its parts labelled" className="block">
      <defs>
        <marker id="annArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={C.muted} />
        </marker>
        <radialGradient id="annGlow">
          <stop offset="0%" stopColor={C.purple} stopOpacity={0.45} />
          <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
        </radialGradient>
      </defs>

      <LayerTitle x={X} title="INPUT · x" lines={["784 neurons", "one per pixel"]} color={C.blue} />
      <LayerTitle x={Y} title="HIDDEN 1 · y" lines={["128 neurons"]} color={C.lilac} />
      <LayerTitle x={Z} title="HIDDEN 2 · z" lines={["64 neurons"]} color={C.lilac} />
      <LayerTitle x={O} title="OUTPUT · o" lines={["10 neurons", "one per digit"]} color={C.text} />

      {/* every node connects to every node in the next layer */}
      {xs.map((a) => ys.map((b) => <line key={`xy${a}-${b}`} x1={X} y1={a} x2={Y} y2={b} stroke={C.line} />))}
      {ys.map((a) => zs.map((b) => <line key={`yz${a}-${b}`} x1={Y} y1={a} x2={Z} y2={b} stroke={C.line} />))}
      {zs.map((a) => os.map((b) => <line key={`zo${a}-${b}`} x1={Z} y1={a} x2={O} y2={b} stroke={C.line} />))}

      {/* highlighted weight, and the strongest evidence flowing into "7" */}
      <line x1={X} y1={xs[W_FROM]} x2={Y} y2={ys[W_TO]} stroke={C.amber} strokeWidth={3.5} />
      {zs.map((b) => (
        <line key={`p${b}`} x1={Z} y1={b} x2={O} y2={os[PRED]} stroke={C.purple} strokeOpacity={0.45} strokeWidth={1.6} />
      ))}

      {/* input image */}
      <rect x={imgX - 4} y={imgY - 4} width={cell * 8 + 8} height={cell * 8 + 8} rx={6} fill="#080b12" stroke="#30384a" />
      {px.map((v, i) => (
        <rect
          key={i}
          x={imgX + (i % 8) * cell}
          y={imgY + Math.floor(i / 8) * cell}
          width={cell - 1}
          height={cell - 1}
          fill={v > 0.5 ? "#e9edf5" : "#141a26"}
        />
      ))}
      <text x={imgX + cell * 4} y={imgY - 14} textAnchor="middle" fill={C.muted} fontSize={13}>
        the image
      </text>
      <line
        x1={imgX + cell * 8 + 10}
        y1={imgY + cell * 4}
        x2={X - 32}
        y2={imgY + cell * 4}
        stroke={C.muted}
        strokeWidth={2}
        markerEnd="url(#annArrow)"
      />
      <text x={(imgX + cell * 8 + X) / 2 - 8} y={imgY + cell * 4 - 9} textAnchor="middle" fill={C.muted} fontSize={12}>
        pixels
      </text>

      {/* nodes */}
      {xs.map((y, i) => (
        <Node key={y} x={X} y={y} r={22} name="x" sub={xLabels[i]} color={C.blue} />
      ))}
      <Dots x={X} y={315} />

      <circle cx={Y} cy={ys[NEURON]} r={42} fill="url(#annGlow)" />
      {ys.map((y, i) => (
        <Node key={y} x={Y} y={y} r={22} name="y" sub={yLabels[i]} color={C.purple} width={i === NEURON ? 4 : 2.5} />
      ))}
      <Dots x={Y} y={350} />
      {/* what happens inside that neuron */}
      <g>
        <rect x={Y + 30} y={ys[NEURON] - 48} width={78} height={24} rx={12} fill="rgba(164,92,255,.18)" stroke={C.purple} />
        <text x={Y + 69} y={ys[NEURON] - 31} textAnchor="middle" fill={C.text} fontSize={13}>
          Σ → ReLU
        </text>
      </g>

      {zs.map((y, i) => (
        <Node key={y} x={Z} y={y} r={22} name="z" sub={zLabels[i]} color={C.purple} />
      ))}
      <Dots x={Z} y={355} />

      {os.map((y, d) => {
        const win = d === PRED;
        return (
          <g key={y}>
            <Node
              x={O}
              y={y}
              r={18}
              name="o"
              sub={String(d)}
              color={win ? C.lilac : C.faint}
              fill={win ? "rgba(164,92,255,.3)" : C.node}
              width={win ? 3 : 1.8}
              bold={win}
            />
            <text
              x={O + 28}
              y={y + 5}
              fill={win ? C.text : C.muted}
              fontSize={win ? 16 : 14}
              fontWeight={win ? 700 : 400}
              fontFamily="var(--font-jetbrains), monospace"
            >
              {PROBS[d].toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* annotations */}
      <Note
        x={O + 100}
        y={os[PRED] + 5}
        to={[O + 80, os[PRED]]}
        anchor="start"
        title="Prediction: 7"
        lines={["highest probability", "wins"]}
        color={C.lilac}
      />
      <Note
        x={O + 100}
        y={os[1] + 5}
        to={[O + 80, os[1]]}
        anchor="start"
        title="Probabilities"
        lines={["softmax turns the 10", "scores o₀…o₉ into", "probabilities that", "add up to 1"]}
        color={C.muted}
      />
      <Note x={75} y={545} to={[imgX + cell * 4, imgY + cell * 8 + 6]} title="Input" lines={["28×28 image =", "784 numbers, 0 to 1"]} color={C.blue} />
      <Note
        x={290}
        y={545}
        to={[(X + Y) / 2, (xs[W_FROM] + ys[W_TO]) / 2]}
        title="Weight"
        lines={["every line is one number", "the network learns"]}
        color={C.amber}
      />
      <Note
        x={530}
        y={545}
        to={[Y + 14, ys[NEURON] + 17]}
        title="Neuron"
        lines={["Σ means “add up”: w₁x₁ + w₂x₂ + … + b,", "then ReLU decides how", "strongly it fires"]}
        color={C.lilac}
      />
      <Note
        x={790}
        y={545}
        to={[Z + 10, zs[3] + 21]}
        title="Hidden layers"
        lines={["learned features:", "nobody designs them"]}
        color={C.lilac}
      />

      {/* whole-network bracket */}
      <path d={`M${X - 22},622 L${X - 22},630 L${O + 22},630 L${O + 22},622`} fill="none" stroke={C.faint} strokeWidth={1.5} />
      <text x={(X + O) / 2} y={652} textAnchor="middle" fill={C.muted} fontSize={13.5}>
        the whole thing is one function f(x) with 109,386 knobs (weights + biases), tuned by training
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Plain network: "Many neurons, layers: the forward pass"
// ─────────────────────────────────────────────────────────────────────────

const LAYERS = [
  { x: 110, name: "x", title: "Input", sub: "784 pixels", ys: [95, 165, 235, 375], labels: ["1", "2", "3", "784"], dots: 305, color: C.text, fill: C.node },
  { x: 350, name: "y", title: "Hidden layer 1", sub: "128 neurons (ReLU)", ys: [110, 180, 250, 360], labels: ["1", "2", "3", "128"], dots: 305, color: C.blue, fill: "rgba(61,139,255,.2)" },
  { x: 590, name: "z", title: "Hidden layer 2", sub: "64 neurons (ReLU)", ys: [110, 180, 250, 360], labels: ["1", "2", "3", "64"], dots: 305, color: C.blue, fill: "rgba(61,139,255,.2)" },
  { x: 830, name: "o", title: "Output layer", sub: "10 scores, one per digit", ys: [95, 165, 305, 375], labels: ["0", "1", "8", "9"], dots: 235, color: C.purple, fill: "rgba(164,92,255,.22)" },
];

export function LayersDiagram() {
  return (
    <svg viewBox="0 0 940 410" width="100%" role="img" aria-label="Input, two hidden layers and an output layer, fully connected" className="block">
      {LAYERS.slice(0, -1).map((c, i) => {
        const n = LAYERS[i + 1];
        return c.ys.map((a) =>
          n.ys.map((b) => <line key={`${i}-${a}-${b}`} x1={c.x + 26} y1={a} x2={n.x - 26} y2={b} stroke="#4a5368" strokeWidth={1.1} />),
        );
      })}
      {LAYERS.map((c) => (
        <g key={c.name}>
          <text x={c.x} y={24} textAnchor="middle" fill={C.text} fontSize={20}>
            {c.title}
          </text>
          <text x={c.x} y={50} textAnchor="middle" fill={C.muted} fontSize={15}>
            {c.sub}
          </text>
          {c.ys.map((y, i) => (
            <Node key={y} x={c.x} y={y} r={26} name={c.name} sub={c.labels[i]} color={c.color} fill={c.fill} />
          ))}
          <Dots x={c.x} y={c.dots} gap={12} />
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Zoom into one neuron: "The neuron: a weighted vote"
// ─────────────────────────────────────────────────────────────────────────

export function NeuronZoom() {
  // mini network (left)
  const MX = 55;
  const MY = 185;
  const mxs = [120, 160, 200, 280, 320];
  const mys = [140, 185, 230, 300];
  // big neuron (right)
  const IX = 420;
  const ins = [
    { y: 125, sub: "1", w: "w₁" },
    { y: 185, sub: "2", w: "w₂" },
    { y: 260, sub: "3", w: "w₃" },
    { y: 400, sub: "784", w: "w₇₈₄" },
  ];
  const box = { x: 600, y: 170, w: 290, h: 180 };
  const sumX = box.x + 70;
  const reluX = box.x + 205;
  const cy = box.y + box.h / 2;
  const OUTX = 968;

  return (
    <svg viewBox="0 0 1040 470" width="100%" role="img" aria-label="Zooming into neuron y1: weighted inputs, sum, ReLU, output" className="block">
      <defs>
        <marker id="nzArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={C.text} />
        </marker>
        <marker id="nzArrowL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={C.lilac} />
        </marker>
      </defs>

      {/* ── mini network ── */}
      <text x={(MX + MY) / 2} y={70} textAnchor="middle" fill={C.muted} fontSize={14}>
        in the network
      </text>
      <text x={MX} y={98} textAnchor="middle" fill={C.blue} fontSize={13} fontWeight={700}>
        x
      </text>
      <text x={MY} y={98} textAnchor="middle" fill={C.lilac} fontSize={13} fontWeight={700}>
        y
      </text>
      {mxs.map((a) => mys.map((b, j) => (j === 0 ? null : <line key={`m${a}-${b}`} x1={MX} y1={a} x2={MY} y2={b} stroke={C.line} />)))}
      {mxs.map((a) => (
        <line key={`h${a}`} x1={MX} y1={a} x2={MY} y2={mys[0]} stroke={C.blue} strokeOpacity={0.8} strokeWidth={1.6} />
      ))}
      {mxs.map((a) => (
        <circle key={a} cx={MX} cy={a} r={10} fill={C.node} stroke={C.blue} strokeWidth={2} />
      ))}
      <Dots x={MX} y={240} gap={9} />
      {mys.map((b, j) => (
        <circle key={b} cx={MY} cy={b} r={j === 0 ? 14 : 11} fill={j === 0 ? "rgba(164,92,255,.35)" : C.node} stroke={C.purple} strokeWidth={j === 0 ? 3 : 2} />
      ))}
      <Dots x={MY} y={265} gap={9} />
      <text x={MY + 22} y={mys[0] + 5} fill={C.text} fontSize={14} fontStyle="italic">
        y<tspan fontSize={10} dy={3} fontStyle="normal">1</tspan>
      </text>

      {/* zoom lines from the small y₁ to the big neuron */}
      <rect x={340} y={30} width={690} height={430} rx={18} fill="rgba(164,92,255,.03)" stroke={C.lilac} strokeOpacity={0.45} strokeDasharray="6 6" />
      <text x={1016} y={52} textAnchor="end" fill={C.lilac} fontSize={13} fontWeight={700}>
        zoomed in: neuron y₁
      </text>
      <line x1={MY + 12} y1={mys[0] - 8} x2={340} y2={30} stroke={C.lilac} strokeOpacity={0.45} strokeDasharray="5 5" />
      <line x1={MY + 12} y1={mys[0] + 8} x2={340} y2={460} stroke={C.lilac} strokeOpacity={0.45} strokeDasharray="5 5" />

      {/* ── big neuron ── */}
      {ins.map((n) => (
        <g key={n.sub}>
          <line x1={IX + 22} y1={n.y} x2={sumX - 34} y2={cy} stroke={C.blue} strokeOpacity={0.7} strokeWidth={2} />
          <text x={IX + 95} y={n.y + (cy - n.y) * 0.32 - 8} textAnchor="middle" fill={C.amber} fontSize={15} fontStyle="italic">
            × {n.w}
          </text>
        </g>
      ))}
      {ins.map((n) => (
        <Node key={`n${n.sub}`} x={IX} y={n.y} r={22} name="x" sub={n.sub} color={C.blue} />
      ))}
      <Dots x={IX} y={330} />
      <text x={IX} y={72} textAnchor="middle" fill={C.blue} fontSize={13} fontWeight={700} letterSpacing="0.1em">
        INPUTS
      </text>
      <text x={IX} y={89} textAnchor="middle" fill={C.muted} fontSize={12}>
        all 784 pixels
      </text>

      {/* bias */}
      <text x={reluX} y={box.y - 38} textAnchor="middle" fill={C.lilac} fontSize={15} fontStyle="italic">
        bias b₁
      </text>
      <line x1={reluX} y1={box.y - 30} x2={reluX} y2={cy - 46} stroke={C.lilac} strokeWidth={2} markerEnd="url(#nzArrowL)" />

      {/* the neuron body: ONE shape, two steps inside */}
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={34} fill="rgba(164,92,255,.08)" stroke={C.purple} strokeWidth={3} />
      <text x={box.x + box.w - 18} y={box.y + box.h + 24} textAnchor="end" fill={C.lilac} fontSize={15} fontWeight={700}>
        one neuron: y₁
      </text>

      {/* Σ: the weighted sum */}
      <circle cx={sumX} cy={cy} r={32} fill={C.node} stroke={C.blue} strokeWidth={2} />
      <text x={sumX} y={cy + 10} textAnchor="middle" fill={C.text} fontSize={28}>
        Σ
      </text>
      <line x1={sumX} y1={cy + 34} x2={sumX} y2={box.y + box.h + 22} stroke={C.blue} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={sumX} cy={cy + 34} r={3} fill={C.blue} />
      <text x={sumX - 70} y={box.y + box.h + 42} fill={C.blue} fontSize={14} fontWeight={700}>
        weighted sum
      </text>
      <text x={sumX - 70} y={box.y + box.h + 64} fill={C.text} fontSize={15} fontStyle="italic">
        Σ = x₁·w₁ + x₂·w₂ + x₃·w₃ + … + x₇₈₄·w₇₈₄
      </text>

      <line x1={sumX + 34} y1={cy} x2={reluX - 46} y2={cy} stroke={C.text} strokeWidth={2} markerEnd="url(#nzArrow)" />

      {/* σ: the activation function */}
      <circle cx={reluX} cy={cy} r={44} fill={C.node} stroke={C.purple} strokeWidth={2} />
      <text x={reluX} y={cy + 6} textAnchor="middle" fill={C.text} fontSize={17} fontStyle="italic">
        σ(Σ + b₁)
      </text>
      <text x={reluX} y={cy + 62} textAnchor="middle" fill={C.lilac} fontSize={12.5} fontWeight={700}>
        activation function: ReLU
      </text>

      {/* output */}
      <line x1={box.x + box.w} y1={cy} x2={OUTX - 30} y2={cy} stroke={C.text} strokeWidth={2} markerEnd="url(#nzArrow)" />
      <circle cx={OUTX} cy={cy} r={26} fill="rgba(164,92,255,.3)" stroke={C.lilac} strokeWidth={3} />
      <text x={OUTX - 1} y={cy + 6} textAnchor="middle" fill={C.text} fontSize={18} fontStyle="italic" fontWeight={700}>
        y<tspan fontSize={12} dy={4} fontStyle="normal">1</tspan>
      </text>
      <text x={OUTX} y={cy + 50} textAnchor="middle" fill={C.muted} fontSize={12}>
        one number
      </text>
      <text x={OUTX} y={cy + 66} textAnchor="middle" fill={C.muted} fontSize={12}>
        sent on to layer z
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Weight / bias / activation demo: one "top-bar detector" neuron on a 7 and a 1
// ─────────────────────────────────────────────────────────────────────────

/** An 8×8 "1": a single vertical stroke. */
function oneSmall(): number[] {
  const g = new Array(64).fill(0);
  for (let r = 0; r < 8; r++) g[r * 8 + 3] = 1;
  return g;
}

/** Weights that look for a bar across the top: +1 along the top row, −0.5 two rows down. */
const TOP_BAR_WEIGHTS = (() => {
  const w = new Array(64).fill(0);
  for (let c = 1; c <= 6; c++) w[c] = 1;
  for (let c = 0; c < 8; c++) w[16 + c] = -0.5;
  return w;
})();
const TOP_BAR_BIAS = -3;

function MiniGrid({ values, kind, size = 96 }: { values: number[]; kind: "pixels" | "weights"; size?: number }) {
  const cell = size / 8;
  const color = (v: number) => {
    if (kind === "pixels") return v > 0.5 ? "#e9edf5" : "#141a26";
    if (v > 0) return `rgba(61,139,255,${0.35 + v * 0.6})`;
    if (v < 0) return `rgba(255,92,122,${0.35 - v * 0.9})`;
    return "#1b2232";
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shrink-0 rounded-md border border-border-strong">
      {values.map((v, i) => (
        <rect key={i} x={(i % 8) * cell} y={Math.floor(i / 8) * cell} width={cell - 1} height={cell - 1} fill={color(v)} />
      ))}
    </svg>
  );
}

const fmt = (v: number) => (v === 0 ? "0" : v.toFixed(1).replace(/\.0$/, ""));

function DemoRow({ label, pixels }: { label: string; pixels: number[] }) {
  const sum = pixels.reduce((s, p, i) => s + p * TOP_BAR_WEIGHTS[i], 0);
  const pre = sum + TOP_BAR_BIAS;
  const out = Math.max(0, pre);
  const fires = out > 0;
  const op = "text-faint text-lg";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex flex-col items-center gap-1">
        <MiniGrid values={pixels} kind="pixels" size={72} />
        <span className="text-xs text-faint">{label}</span>
      </div>
      <span className={op}>×</span>
      <div className="flex flex-col items-center gap-1">
        <MiniGrid values={TOP_BAR_WEIGHTS} kind="weights" size={72} />
        <span className="text-xs text-faint">weights</span>
      </div>
      <span className={op}>→</span>
      <div className="font-mono text-[0.9em] leading-relaxed">
        <div>
          <span className="text-blue">Σ</span> = {fmt(sum)}
        </div>
        <div>
          <span className="text-[#c08bff]">+ b</span> = {fmt(sum)} + ({fmt(TOP_BAR_BIAS)}) = {fmt(pre)}
        </div>
        <div>
          <span className="text-[#c08bff]">ReLU</span>({fmt(pre)}) ={" "}
          <b className={fires ? "text-green" : "text-faint"}>{fmt(out)}</b>{" "}
          <span className={fires ? "text-green" : "text-faint"}>{fires ? "fires" : "silent"}</span>
        </div>
      </div>
    </div>
  );
}

export function WeightBiasDemo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "rgba(61,139,255,.95)" }} /> positive weight: ink here
          pushes the neuron up
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "rgba(255,92,122,.8)" }} /> negative weight: ink here
          pushes it down
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#1b2232]" /> zero: ignored
        </span>
      </div>
      <DemoRow label="a 7" pixels={sevenSmall()} />
      <DemoRow label="a 1" pixels={oneSmall()} />
    </div>
  );
}
