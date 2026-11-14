"use client";

/** Diagram building blocks used by the Episode 1 slides. */

import { RG, useShown } from "@/components/deck/context";

export function ArrowDefs() {
  return (
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#e9edf5" />
      </marker>
      <marker id="arrP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#a45cff" />
      </marker>
    </defs>
  );
}

/** Horizontal arrow for HTML flow diagrams. */
export function FlowArrow({ w = 80, label, back = false }: { w?: number; label?: string; back?: boolean }) {
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width: w }}>
      {label && <span className="mb-1 font-mono text-[18px] text-muted">{label}</span>}
      <svg width={w} height="20" viewBox={`0 0 ${w} 20`}>
        <ArrowDefs />
        <line
          x1={back ? w - 4 : 4}
          y1={10}
          x2={back ? 4 : w - 4}
          y2={10}
          stroke="#e9edf5"
          strokeWidth={2.5}
          markerEnd="url(#arr)"
        />
      </svg>
    </div>
  );
}

export function FlowBox({
  children,
  tone = "blue",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "blue" | "purple" | "neutral" | "dark";
  className?: string;
}) {
  const s =
    tone === "blue"
      ? "border-blue/70 bg-blue/10"
      : tone === "purple"
        ? "border-purple/70 bg-purple/12"
        : tone === "dark"
          ? "border-border-strong bg-black"
          : "border-border-strong bg-surface";
  return (
    <div className={`flex items-center justify-center rounded-2xl border-2 px-5 py-3 text-center leading-tight ${s} ${className}`}>
      {children}
    </div>
  );
}

// ── Picture it (1/2) ──────────────────────────────────────────────────
const BLUE_PTS = [
  [30, 135],
  [70, 120],
  [78, 165],
  [38, 190],
  [85, 205],
];
const PURP_PTS = [
  [148, 35],
  [195, 28],
  [170, 58],
  [162, 95],
  [200, 90],
];

function Scatter({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="-10 -10 260 260" width={300} height={300}>
      <rect x={-10} y={-10} width={260} height={260} fill="#080b12" stroke="#30384a" strokeWidth={2} rx={6} />
      {children}
      {BLUE_PTS.map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r={8} fill="var(--blue)" />
      ))}
      {PURP_PTS.map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r={8} fill="var(--purple)" />
      ))}
    </svg>
  );
}

export function PictureOne() {
  const line = useShown(1);
  const star = useShown(2);
  const circle = useShown(3);
  return (
    <div className="grid grid-cols-3 items-start gap-10 text-center">
      <div className="flex flex-col items-center">
        <Scatter>
          <line className="draw" data-hidden={!line} x1={5} y1={0} x2={235} y2={225} stroke="#e9edf5" strokeWidth={4} />
        </Scatter>
        <div className="font-display mt-6 text-[34px] font-bold">Linear model</div>
        <div className="text-[24px] text-muted">one straight boundary:</div>
        <div className="font-mono text-[24px]">wᵀx + b = 0</div>
      </div>
      <div className="flex flex-col items-center">
        <Scatter>
          <circle
            className="reveal-fade"
            data-hidden={!circle}
            cx={115}
            cy={118}
            r={70}
            fill="rgba(255,255,255,.04)"
            stroke="#e9edf5"
            strokeWidth={2.5}
            strokeDasharray="7 7"
          />
          <text className="reveal-fade" data-hidden={!star} x={115} y={128} textAnchor="middle" fontSize={34} fill="#ffb547">
            ★
          </text>
        </Scatter>
        <div className="font-display mt-6 text-[34px] font-bold">k-NN (k = 3)</div>
        <div className="text-[24px] text-muted">2 blue, 1 purple nearby,</div>
        <div className="text-[24px] text-muted">so the ★ is blue</div>
      </div>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 320 300" width={320} height={300}>
          <ArrowDefs />
          <RG at={4}>
            <line x1={140} y1={52} x2={68} y2={160} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
            <line x1={180} y1={52} x2={225} y2={112} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
            <text x={86} y={100} fill="#8d97ab" fontSize={17}>yes</text>
            <text x={214} y={74} fill="#8d97ab" fontSize={17}>no</text>
          </RG>
          <RG at={5}>
            <line x1={225} y1={152} x2={185} y2={232} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
            <line x1={255} y1={152} x2={282} y2={232} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
            <text x={176} y={190} fill="#8d97ab" fontSize={17}>yes</text>
            <text x={278} y={190} fill="#8d97ab" fontSize={17}>no</text>
          </RG>
          <rect x={110} y={12} width={110} height={40} rx={8} fill="#0f1420" stroke="#e9edf5" strokeWidth={2} />
          <text x={165} y={38} textAnchor="middle" fill="#e9edf5" fontSize={17}>top bar?</text>
          <rect x={180} y={114} width={130} height={40} rx={8} fill="#0f1420" stroke="#e9edf5" strokeWidth={2} />
          <text x={245} y={140} textAnchor="middle" fill="#e9edf5" fontSize={17}>closed loop?</text>
          {[
            [50, 162, "7", "var(--blue)"],
            [165, 236, "0", "var(--purple)"],
            [272, 236, "1", "var(--blue)"],
          ].map(([x, y, t, c]) => (
            <g key={t as string}>
              <rect x={x as number} y={y as number} width={34} height={46} rx={8} fill="rgba(61,139,255,.08)" stroke={c as string} strokeWidth={2} />
              <text x={(x as number) + 17} y={(y as number) + 30} textAnchor="middle" fill="#e9edf5" fontSize={20}>
                {t}
              </text>
            </g>
          ))}
        </svg>
        <div className="font-display mt-6 text-[34px] font-bold">Decision tree</div>
        <div className="text-[24px] text-muted">yes/no questions;</div>
        <div className="text-[24px] text-muted">a forest = many trees voting</div>
      </div>
    </div>
  );
}

// ── Picture it (2/2) ──────────────────────────────────────────────────
export function PictureTwo() {
  const step1 = useShown(1);
  const step2 = useShown(2);
  const step3 = useShown(3);
  const blue = [
    [35, 110],
    [70, 150],
    [100, 140],
    [40, 175],
  ];
  const purple = [
    [115, 45],
    [170, 65],
    [185, 110],
    [155, 115],
  ];
  const inp = [80, 160, 240];
  const hid = [50, 120, 190, 260];
  const out = [125, 195];
  return (
    <div className="grid grid-cols-2 items-start gap-10 text-center">
      <div className="flex flex-col items-center">
        <svg viewBox="-10 -10 240 240" width={320} height={320}>
          <rect x={-10} y={-10} width={240} height={240} fill="#080b12" stroke="#30384a" strokeWidth={2} rx={6} />
          <line className="draw" data-hidden={!step1} x1={0} y1={0} x2={220} y2={220} stroke="#e9edf5" strokeWidth={4} />
          <g className="reveal-fade" data-hidden={!step2}>
            <line x1={-10} y1={30} x2={190} y2={230} stroke="#8d97ab" strokeWidth={2} strokeDasharray="6 6" />
            <line x1={30} y1={-10} x2={230} y2={190} stroke="#8d97ab" strokeWidth={2} strokeDasharray="6 6" />
            <text x={14} y={14} fill="#c08bff" fontSize={18}>margin</text>
          </g>
          {blue.map(([x, y], i) => <circle key={`b${i}`} cx={x} cy={y} r={8} fill="var(--blue)" />)}
          {purple.map(([x, y], i) => <circle key={`p${i}`} cx={x} cy={y} r={8} fill="var(--purple)" />)}
          <g className="reveal-fade" data-hidden={!step3}>
            <circle cx={100} cy={140} r={15} fill="none" stroke="#ffb547" strokeWidth={3} />
            <circle cx={155} cy={115} r={15} fill="none" stroke="#ffb547" strokeWidth={3} />
          </g>
        </svg>
        <div className="font-display mt-6 text-[34px] font-bold">SVM</div>
        <div className="text-[24px] text-muted">widest gap; only the circled</div>
        <div className="text-[24px]">
          <span className="text-[#c08bff]">support vectors</span> <span className="text-muted">matter</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 440 320" width={440} height={320}>
          <g className="reveal-fade" data-hidden={!step1}>
            {inp.map((a) => hid.map((b) => <line key={`${a}-${b}`} x1={70} y1={a} x2={220} y2={b} stroke="#5b657a" strokeWidth={1.4} />))}
          </g>
          <g className="reveal-fade" data-hidden={!step2}>
            {hid.map((a) => out.map((b) => <line key={`${a}-${b}`} x1={220} y1={a} x2={370} y2={b} stroke="#5b657a" strokeWidth={1.4} />))}
          </g>
          {inp.map((y) => <circle key={y} cx={70} cy={y} r={24} fill="#0f1420" stroke="#e9edf5" strokeWidth={2.5} />)}
          <g className="reveal-fade" data-hidden={!step1}>
            {hid.map((y) => <circle key={y} cx={220} cy={y} r={24} fill="rgba(61,139,255,.3)" stroke="var(--blue)" strokeWidth={2.5} />)}
          </g>
          <g className="reveal-fade" data-hidden={!step2}>
            {out.map((y) => <circle key={y} cx={370} cy={y} r={24} fill="rgba(164,92,255,.3)" stroke="var(--purple)" strokeWidth={2.5} />)}
          </g>
          <text x={70} y={308} textAnchor="middle" fill="#8d97ab" fontSize={20}>input</text>
          <text className="reveal-fade" data-hidden={!step1} x={220} y={308} textAnchor="middle" fill="#8d97ab" fontSize={20}>hidden</text>
          <text className="reveal-fade" data-hidden={!step2} x={370} y={308} textAnchor="middle" fill="#8d97ab" fontSize={20}>output</text>
        </svg>
        <div className="font-display mt-6 text-[34px] font-bold">Neural network</div>
        <div className="text-[24px] text-muted">layers of weighted sums</div>
        <div className="text-[24px] text-muted">that learn their own features</div>
      </div>
    </div>
  );
}

// ── The neuron ────────────────────────────────────────────────────────
export function NeuronDiagram() {
  const ys = [70, 200, 330];
  return (
    <svg viewBox="0 0 1100 420" width={1100} height={420}>
      <ArrowDefs />
      <RG at={1}>
        {ys.map((y, i) => (
          <g key={y}>
            <line x1={146} y1={y} x2={480} y2={200 + (y - 200) * 0.18} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
            <text x={320} y={y + (200 - y) * 0.48 - 14} textAnchor="middle" fill="#c08bff" fontSize={28} fontStyle="italic">
              w{["₁", "₂", "₃"][i]}
            </text>
          </g>
        ))}
        <text x={550} y={60} textAnchor="middle" fill="#c08bff" fontSize={30} fontStyle="italic">+ b</text>
        <line x1={550} y1={76} x2={550} y2={128} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
      </RG>
      {ys.map((y, i) => (
        <g key={y}>
          <circle cx={110} cy={y} r={36} fill="#0f1420" stroke="#e9edf5" strokeWidth={2.5} />
          <text x={110} y={y + 10} textAnchor="middle" fill="#e9edf5" fontSize={28} fontStyle="italic">
            x{["₁", "₂", "₃"][i]}
          </text>
        </g>
      ))}
      <circle cx={550} cy={200} r={62} fill="rgba(61,139,255,.16)" stroke="var(--blue)" strokeWidth={3} />
      <text x={550} y={212} textAnchor="middle" fill="#e9edf5" fontSize={40}>Σ</text>
      <RG at={2}>
        <line x1={612} y1={200} x2={772} y2={200} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
        <text x={690} y={186} textAnchor="middle" fill="#e9edf5" fontSize={28} fontStyle="italic">z</text>
        <circle cx={832} cy={200} r={58} fill="rgba(164,92,255,.2)" stroke="var(--purple)" strokeWidth={3} />
        <text x={832} y={212} textAnchor="middle" fill="#e9edf5" fontSize={36} fontStyle="italic">σ</text>
        <line x1={890} y1={200} x2={1020} y2={200} stroke="#e9edf5" strokeWidth={2.5} markerEnd="url(#arr)" />
        <text x={1050} y={210} textAnchor="middle" fill="#e9edf5" fontSize={32} fontStyle="italic">a</text>
      </RG>
    </svg>
  );
}

// ── Activation plots ──────────────────────────────────────────────────
export function ActivationPlot({ kind }: { kind: "relu" | "sigmoid" }) {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const z = -4 + (8 * i) / 120;
    const a = kind === "relu" ? Math.max(0, z) / 4 : 1 / (1 + Math.exp(-z));
    // rounded so server- and client-rendered markup match exactly (no hydration mismatch)
    pts.push(`${(200 + z * 45).toFixed(2)},${(230 - a * 170).toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 420 270" width={460} height={290}>
      <ArrowDefs />
      <line x1={10} y1={230} x2={400} y2={230} stroke="#8d97ab" strokeWidth={2} markerEnd="url(#arr)" />
      <line x1={200} y1={260} x2={200} y2={20} stroke="#8d97ab" strokeWidth={2} markerEnd="url(#arr)" />
      <text x={408} y={238} fill="#8d97ab" fontSize={20} fontStyle="italic">z</text>
      <text x={192} y={14} fill="#8d97ab" fontSize={20} fontStyle="italic">a</text>
      <polyline points={pts.join(" ")} fill="none" stroke={kind === "relu" ? "var(--blue)" : "var(--purple)"} strokeWidth={6} strokeLinecap="round" />
      <text x={kind === "relu" ? 60 : 50} y={kind === "relu" ? 150 : 140} fill={kind === "relu" ? "var(--blue)" : "#c08bff"} fontSize={24}>
        {kind === "relu" ? "ReLU" : "sigmoid"}
      </text>
    </svg>
  );
}

// ── Fully connected network ───────────────────────────────────────────
export function NetworkDiagram() {
  const inY = [90, 160, 230, 360];
  const hidY = [120, 190, 260, 330];
  const outY = [95, 165, 300, 370];
  const showH = useShown(1);
  const showO = useShown(2);
  return (
    <svg viewBox="0 0 1100 470" width={1100} height={470}>
      <g className="reveal-fade" data-hidden={!showH}>
        {inY.map((a) => hidY.map((b) => <line key={`${a}${b}`} x1={235} y1={a} x2={515} y2={b} stroke="#4a5368" strokeWidth={1.3} />))}
      </g>
      <g className="reveal-fade" data-hidden={!showO}>
        {hidY.map((a) => outY.map((b) => <line key={`${a}${b}`} x1={575} y1={a} x2={835} y2={b} stroke="#4a5368" strokeWidth={1.3} />))}
      </g>
      <text x={205} y={24} textAnchor="middle" fill="#e9edf5" fontSize={28}>Input</text>
      <text x={205} y={56} textAnchor="middle" fill="#8d97ab" fontSize={22}>784 pixels</text>
      {inY.map((y, i) => (
        <g key={y}>
          <circle cx={205} cy={y} r={32} fill="#0f1420" stroke="#e9edf5" strokeWidth={2.5} />
          <text x={205} y={y + 8} textAnchor="middle" fill="#e9edf5" fontSize={20} fontStyle="italic">
            {["x₁", "x₂", "x₃", "x₇₈₄"][i]}
          </text>
        </g>
      ))}
      <text x={205} y={300} textAnchor="middle" fill="#e9edf5" fontSize={30}>⋮</text>
      <g className="reveal-fade" data-hidden={!showH}>
        <text x={545} y={24} textAnchor="middle" fill="#e9edf5" fontSize={28}>Hidden layer</text>
        <text x={545} y={56} textAnchor="middle" fill="#8d97ab" fontSize={22}>128 neurons (ReLU)</text>
        {hidY.map((y) => <circle key={y} cx={545} cy={y} r={32} fill="rgba(61,139,255,.28)" stroke="var(--blue)" strokeWidth={2.5} />)}
        <text x={545} y={410} textAnchor="middle" fill="#e9edf5" fontSize={30}>⋮</text>
      </g>
      <g className="reveal-fade" data-hidden={!showO}>
        <text x={865} y={24} textAnchor="middle" fill="#e9edf5" fontSize={28}>Output layer</text>
        <text x={865} y={56} textAnchor="middle" fill="#8d97ab" fontSize={22}>10 scores, one per digit</text>
        {outY.map((y, i) => (
          <g key={y}>
            <circle cx={865} cy={y} r={32} fill="rgba(164,92,255,.28)" stroke="var(--purple)" strokeWidth={2.5} />
            <text x={865} y={y + 9} textAnchor="middle" fill="#e9edf5" fontSize={26}>{["0", "1", "8", "9"][i]}</text>
          </g>
        ))}
        <text x={865} y={240} textAnchor="middle" fill="#e9edf5" fontSize={30}>⋮</text>
      </g>
    </svg>
  );
}
