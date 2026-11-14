"use client";

import { useState } from "react";
import { M } from "@/components/Math";

const f = (v: number, d = 2) => (Math.abs(v) < 1e-9 ? 0 : v).toFixed(d);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function Slider({
  label,
  value,
  onChange,
  tone = "blue",
  min = -1,
  max = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tone?: "blue" | "purple";
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex items-center gap-4">
      <span className="w-14 shrink-0">
        <M>{label}</M>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`tba-range ${tone === "purple" ? "purple" : ""}`}
      />
      <span className="w-20 shrink-0 text-right font-mono text-[22px]">{f(value, 1)}</span>
    </label>
  );
}

/** Live single neuron y₁: Σ = x·w, then y₁ = σ(Σ + b₁) with σ = ReLU or sigmoid. */
export function NeuronCalculator() {
  const [x, setX] = useState([1.0, 0.5, -1.0]);
  const [w, setW] = useState([0.8, -0.4, 0.3]);
  const [b, setB] = useState(0.1);
  const [act, setAct] = useState<"relu" | "sigmoid">("relu");

  const terms = x.map((xi, i) => xi * w[i]);
  const sum = terms.reduce((s, t) => s + t, 0);
  const pre = sum + b;
  const out = act === "relu" ? Math.max(0, pre) : sigmoid(pre);
  const silent = act === "relu" && pre <= 0;
  const actName = act === "relu" ? "ReLU" : "sigmoid";

  const setAt = (arr: number[], set: (v: number[]) => void, i: number) => (v: number) => {
    const n = arr.slice();
    n[i] = v;
    set(n);
  };

  // diagram geometry: same layout and names as the zoomed-in neuron diagram
  const ys = [80, 200, 320];
  const SUM = { x: 430, y: 200 };
  const ACT = { x: 570, y: 200 };
  const OUT = { x: 718, y: 200 };
  const mono = "var(--font-jetbrains)";
  const subs = ["₁", "₂", "₃"];

  return (
    <div className="grid h-full grid-cols-[560px_1fr] gap-12 text-[24px]">
      <div className="flex flex-col gap-4">
        <div className="text-[18px] tracking-widest text-faint uppercase">inputs (pixels)</div>
        {x.map((v, i) => (
          <Slider key={`x${i}`} label={`x_${i + 1}`} value={v} onChange={setAt(x, setX, i)} />
        ))}
        <div className="mt-2 text-[18px] tracking-widest text-faint uppercase">weights &amp; bias (learned)</div>
        {w.map((v, i) => (
          <Slider key={`w${i}`} label={`w_${i + 1}`} value={v} onChange={setAt(w, setW, i)} tone="purple" />
        ))}
        <Slider label="b_1" value={b} onChange={setB} tone="purple" />
        <div className="mt-3 flex gap-3 text-[20px]">
          <button
            onClick={() => setX([-x[0], x[1], x[2]])}
            className="rounded-full border border-border-strong px-4 py-1.5 hover:bg-surface-2"
          >
            flip sign of <M>x_1</M>
          </button>
          <button
            onClick={() => {
              setX([1.0, 0.5, -1.0]);
              setW([0.8, -0.4, 0.3]);
              setB(0.1);
            }}
            className="rounded-full border border-border-strong px-4 py-1.5 hover:bg-surface-2"
          >
            reset
          </button>
          <div className="ml-auto flex overflow-hidden rounded-full border border-border-strong">
            {(["relu", "sigmoid"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setAct(k)}
                className={`px-4 py-1.5 ${act === k ? "bg-purple/30 text-text" : "text-muted hover:bg-surface-2"}`}
              >
                {k === "relu" ? "ReLU" : "sigmoid"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <svg viewBox="0 0 760 400" className="w-full">
          <defs>
            <marker id="ncArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#e9edf5" />
            </marker>
            <marker id="ncArrowL" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#c08bff" />
            </marker>
          </defs>

          {/* inputs and weighted connections into Σ */}
          {ys.map((y, i) => {
            const wi = w[i];
            const col = wi >= 0 ? "var(--blue)" : "var(--red)";
            return (
              <g key={i}>
                <line
                  x1={104}
                  y1={y}
                  x2={SUM.x - 40}
                  y2={SUM.y}
                  stroke={col}
                  strokeWidth={1.5 + Math.abs(wi) * 9}
                  strokeOpacity={0.25 + Math.abs(wi) * 0.75}
                />
                <circle cx={70} cy={y} r={34} fill="#0b0f19" stroke="var(--blue)" strokeWidth={2.5} />
                <text x={70} y={y + 7} textAnchor="middle" fill="#e9edf5" fontSize={20} fontFamily={mono}>
                  {f(x[i], 1)}
                </text>
                <text x={22} y={y - 30} fill="#3d8bff" fontSize={20} fontStyle="italic">
                  x
                  <tspan fontSize={14} dy={5} fontStyle="normal">
                    {i + 1}
                  </tspan>
                </text>
                <text x={238} y={y + (SUM.y - y) * 0.45 - 12} textAnchor="middle" fill="#ffb547" fontSize={18} fontFamily={mono}>
                  × w{subs[i]} ({f(wi, 1)})
                </text>
              </g>
            );
          })}

          {/* the bias goes into the activation */}
          <text x={ACT.x} y={58} textAnchor="middle" fill="#c08bff" fontSize={19} fontStyle="italic">
            bias b₁ = {f(b, 1)}
          </text>
          <line x1={ACT.x} y1={68} x2={ACT.x} y2={ACT.y - 54} stroke="#c08bff" strokeWidth={2} markerEnd="url(#ncArrowL)" />

          {/* ONE neuron: Σ, then σ(Σ + b₁) */}
          <rect x={372} y={128} width={268} height={160} rx={34} fill="rgba(164,92,255,.08)" stroke="var(--purple)" strokeWidth={3} />
          <text x={506} y={316} textAnchor="middle" fill="#c08bff" fontSize={19} fontWeight={700}>
            one neuron: y₁
          </text>

          <circle cx={SUM.x} cy={SUM.y} r={38} fill="#0b0f19" stroke="var(--blue)" strokeWidth={2.5} />
          <text x={SUM.x} y={SUM.y - 2} textAnchor="middle" fill="#e9edf5" fontSize={26}>
            Σ
          </text>
          <text x={SUM.x} y={SUM.y + 22} textAnchor="middle" fill="#e9edf5" fontSize={15} fontFamily={mono}>
            {f(sum)}
          </text>
          <text x={SUM.x} y={SUM.y + 60} textAnchor="middle" fill="#3d8bff" fontSize={14} fontWeight={700}>
            weighted sum
          </text>

          <line x1={SUM.x + 40} y1={SUM.y} x2={ACT.x - 54} y2={ACT.y} stroke="#e9edf5" strokeWidth={2} markerEnd="url(#ncArrow)" />

          <circle cx={ACT.x} cy={ACT.y} r={52} fill={silent ? "#0b0f19" : "rgba(164,92,255,.25)"} stroke="var(--purple)" strokeWidth={2.5} />
          <text x={ACT.x} y={ACT.y - 2} textAnchor="middle" fill="#e9edf5" fontSize={17} fontStyle="italic">
            σ(Σ + b₁)
          </text>
          <text x={ACT.x} y={ACT.y + 22} textAnchor="middle" fill="#e9edf5" fontSize={15} fontFamily={mono}>
            {f(pre)}
          </text>
          <text x={ACT.x} y={ACT.y + 72} textAnchor="middle" fill="#c08bff" fontSize={14} fontWeight={700}>
            activation: {actName}
          </text>

          {/* output */}
          <line x1={640} y1={OUT.y} x2={OUT.x - 32} y2={OUT.y} stroke="#e9edf5" strokeWidth={2} markerEnd="url(#ncArrow)" />
          <circle cx={OUT.x} cy={OUT.y} r={30} fill={silent ? "#0b0f19" : "rgba(164,92,255,.3)"} stroke="#c08bff" strokeWidth={3} />
          <text x={OUT.x - 1} y={OUT.y + 7} textAnchor="middle" fill="#e9edf5" fontSize={20} fontStyle="italic" fontWeight={700}>
            y
            <tspan fontSize={13} dy={5} fontStyle="normal">
              1
            </tspan>
          </text>
          <text x={OUT.x} y={OUT.y + 56} textAnchor="middle" fill={silent ? "#5b657a" : "#e9edf5"} fontSize={17} fontFamily={mono}>
            {f(out, 2)}
          </text>
        </svg>

        <div className="mt-2 rounded-2xl border border-border-strong bg-surface/70 px-6 py-4 text-[24px] leading-[1.75]">
          <div>
            <M>{String.raw`\Sigma = ${terms.map((_, i) => `(${f(x[i], 1)})(${f(w[i], 1)})`).join(" + ")} = ${f(sum)}`}</M>
          </div>
          <div>
            <M>{String.raw`\Sigma + b_1 = ${f(sum)} + (${f(b, 1)}) = ${f(pre)}`}</M>
          </div>
          <div className="flex items-center gap-4">
            <M>{String.raw`y_1 = \mathrm{${actName}}(${f(pre)}) = `}</M>
            <span className={`font-mono text-[32px] font-bold ${silent ? "text-faint" : "text-gradient"}`}>{f(out, 3)}</span>
            {silent && <span className="text-[20px] text-muted">the neuron stays silent</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
