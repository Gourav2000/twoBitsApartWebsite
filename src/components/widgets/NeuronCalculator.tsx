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

/** Live single neuron: z = w·x + b, then ReLU or sigmoid. */
export function NeuronCalculator() {
  const [x, setX] = useState([1.0, 0.5, -1.0]);
  const [w, setW] = useState([0.8, -0.4, 0.3]);
  const [b, setB] = useState(0.1);
  const [act, setAct] = useState<"relu" | "sigmoid">("relu");

  const terms = x.map((xi, i) => xi * w[i]);
  const z = terms.reduce((s, t) => s + t, 0) + b;
  const a = act === "relu" ? Math.max(0, z) : sigmoid(z);
  const silent = act === "relu" && z <= 0;

  const setAt = (arr: number[], set: (v: number[]) => void, i: number) => (v: number) => {
    const n = arr.slice();
    n[i] = v;
    set(n);
  };

  // diagram geometry
  const ys = [70, 190, 310];
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
        <Slider label="b" value={b} onChange={setB} tone="purple" />
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
        <svg viewBox="0 0 760 380" className="w-full">
          {ys.map((y, i) => {
            const wi = w[i];
            const col = wi >= 0 ? "var(--blue)" : "var(--red)";
            return (
              <g key={i}>
                <line x1={90} y1={y} x2={420} y2={190} stroke={col} strokeWidth={1.5 + Math.abs(wi) * 10} strokeOpacity={0.25 + Math.abs(wi) * 0.75} />
                <circle cx={60} cy={y} r={38} fill="#0b0f19" stroke="#e9edf5" strokeWidth={2} />
                <text x={60} y={y + 8} textAnchor="middle" fill="#e9edf5" fontSize={24} fontFamily="var(--font-jetbrains)">
                  {f(x[i], 1)}
                </text>
                <text x={250} y={y + (190 - y) * 0.5 - 14} textAnchor="middle" fill={col} fontSize={22} fontFamily="var(--font-jetbrains)">
                  ×{f(wi, 1)} = {f(terms[i])}
                </text>
              </g>
            );
          })}
          <line x1={470} y1={60} x2={470} y2={140} stroke="#c79bff" strokeWidth={2} />
          <text x={470} y={48} textAnchor="middle" fill="#c79bff" fontSize={22} fontFamily="var(--font-jetbrains)">
            + b ({f(b, 1)})
          </text>
          <circle cx={470} cy={190} r={52} fill="rgba(61,139,255,.15)" stroke="var(--blue)" strokeWidth={3} />
          <text x={470} y={200} textAnchor="middle" fill="#e9edf5" fontSize={34}>Σ</text>
          <line x1={522} y1={190} x2={598} y2={190} stroke="#e9edf5" strokeWidth={2} />
          <text x={560} y={176} textAnchor="middle" fill="#e9edf5" fontSize={20} fontFamily="var(--font-jetbrains)">
            {f(z)}
          </text>
          <circle cx={645} cy={190} r={46} fill={silent ? "#0b0f19" : "rgba(164,92,255,.25)"} stroke="var(--purple)" strokeWidth={3} />
          <text x={645} y={199} textAnchor="middle" fill="#e9edf5" fontSize={24}>
            {act === "relu" ? "ReLU" : "σ"}
          </text>
          <line x1={691} y1={190} x2={750} y2={190} stroke="#e9edf5" strokeWidth={2} />
        </svg>

        <div className="mt-2 rounded-2xl border border-border-strong bg-surface/70 px-6 py-4 text-[26px] leading-[1.7]">
          <div>
            <M>{String.raw`z = ${terms.map((t, i) => `(${f(w[i], 1)})(${f(x[i], 1)})`).join("+")} + ${f(b, 1)}`}</M>
          </div>
          <div>
            <M>{String.raw`z = ${f(z)}`}</M>
          </div>
          <div className="flex items-center gap-4">
            <M>{String.raw`a = ${act === "relu" ? "\\mathrm{ReLU}" : "\\sigma"}(${f(z)}) = `}</M>
            <span className={`font-mono text-[34px] font-bold ${silent ? "text-faint" : "text-gradient"}`}>{f(a, 3)}</span>
            {silent && <span className="text-[22px] text-muted">the neuron stays silent</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
