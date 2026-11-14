/**
 * Diagrams for the "Basics of ML" page. Each one is a small, self-contained,
 * responsive SVG (no reveal steps), drawn on the same 2-D toy data:
 * blue and purple dots standing in for two classes.
 */

const INK = "#e9edf5";
const MUTED = "#8d97ab";
const AMBER = "#ffb547";

// Linearly separable toy data (x right, y down). Every blue point has y - x >= 40
// and every purple point has y - x <= -40, so y = x is the widest-margin boundary.
const BLUE: [number, number][] = [
  [35, 110],
  [70, 150],
  [100, 140],
  [40, 175],
];
const PURPLE: [number, number][] = [
  [115, 45],
  [170, 65],
  [185, 110],
  [155, 115],
];

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="-10 -10 240 240" role="img" aria-label={label} className="h-auto w-full max-w-[280px]">
      <rect x={-10} y={-10} width={240} height={240} fill="#080b12" stroke="#30384a" strokeWidth={2} rx={6} />
      {children}
    </svg>
  );
}

function Dots({ ring = [] as [number, number][] }) {
  return (
    <>
      {BLUE.map(([x, y]) => (
        <circle key={`b${x}-${y}`} cx={x} cy={y} r={8} fill="var(--blue)" />
      ))}
      {PURPLE.map(([x, y]) => (
        <circle key={`p${x}-${y}`} cx={x} cy={y} r={8} fill="var(--purple)" />
      ))}
      {ring.map(([x, y]) => (
        <circle key={`r${x}-${y}`} cx={x} cy={y} r={15} fill="none" stroke={AMBER} strokeWidth={3} />
      ))}
    </>
  );
}

/** A straight line through (px, py) with slope m (screen coordinates), clipped to the frame. */
function through(px: number, py: number, m: number) {
  if (!Number.isFinite(m)) return { x1: px, y1: -10, x2: px, y2: 230 };
  return { x1: -10, y1: py + m * (-10 - px), x2: 230, y2: py + m * (230 - px) };
}

/** One straight boundary; the two sides are the two predictions. */
export function LinearDiagram() {
  return (
    <Frame label="A straight line separating blue points from purple points">
      <line x1={-10} y1={-10} x2={230} y2={230} stroke={INK} strokeWidth={4} />
      <text x={22} y={30} fill={MUTED} fontSize={15}>
        wᵀx + b &gt; 0
      </text>
      <text x={112} y={216} fill={MUTED} fontSize={15}>
        wᵀx + b &lt; 0
      </text>
      <Dots />
    </Frame>
  );
}

/** Several lines that all separate the data equally well: which one should we trust? */
export function ManyLinesDiagram() {
  const lines = [0.25, 0.6, 1, 2.2, Infinity].map((m) => through(110, 110, m));
  return (
    <Frame label="Several different straight lines that all separate the two classes">
      {lines.map((l, i) => (
        <line key={i} {...l} stroke={INK} strokeWidth={2.5} opacity={0.55} />
      ))}
      <Dots />
    </Frame>
  );
}

/** k-NN: the star is classified by a vote among its k nearest neighbours. */
export function KnnDiagram() {
  return (
    <Frame label="A new point classified by its three nearest neighbours">
      <circle cx={115} cy={125} r={62} fill="rgba(255,255,255,.04)" stroke={INK} strokeWidth={2.5} strokeDasharray="7 7" />
      <Dots />
      <text x={115} y={136} textAnchor="middle" fontSize={34} fill={AMBER}>
        ★
      </text>
    </Frame>
  );
}

/** A tiny decision tree for digits. */
export function TreeDiagram() {
  const arrow = { stroke: INK, strokeWidth: 2.5, markerEnd: "url(#basics-arr)" };
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label="A decision tree asking top bar? then closed loop?" className="h-auto w-full max-w-[320px]">
      <defs>
        <marker id="basics-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={INK} />
        </marker>
      </defs>
      <line x1={140} y1={52} x2={68} y2={160} {...arrow} />
      <line x1={180} y1={52} x2={225} y2={112} {...arrow} />
      <line x1={225} y1={152} x2={185} y2={232} {...arrow} />
      <line x1={255} y1={152} x2={282} y2={232} {...arrow} />
      <text x={86} y={100} fill={MUTED} fontSize={17}>yes</text>
      <text x={214} y={74} fill={MUTED} fontSize={17}>no</text>
      <text x={176} y={190} fill={MUTED} fontSize={17}>yes</text>
      <text x={278} y={190} fill={MUTED} fontSize={17}>no</text>
      <rect x={110} y={12} width={110} height={40} rx={8} fill="#0f1420" stroke={INK} strokeWidth={2} />
      <text x={165} y={38} textAnchor="middle" fill={INK} fontSize={17}>top bar?</text>
      <rect x={180} y={114} width={130} height={40} rx={8} fill="#0f1420" stroke={INK} strokeWidth={2} />
      <text x={245} y={140} textAnchor="middle" fill={INK} fontSize={17}>closed loop?</text>
      {(
        [
          [50, 162, "7", "var(--blue)"],
          [165, 236, "0", "var(--purple)"],
          [272, 236, "1", "var(--blue)"],
        ] as const
      ).map(([x, y, t, c]) => (
        <g key={t}>
          <rect x={x} y={y} width={34} height={46} rx={8} fill="rgba(61,139,255,.08)" stroke={c} strokeWidth={2} />
          <text x={x + 17} y={y + 30} textAnchor="middle" fill={INK} fontSize={20}>{t}</text>
        </g>
      ))}
    </svg>
  );
}

/** SVM: the widest empty gap, held up by the support vectors. */
export function SvmDiagram() {
  // boundary y = x; margins y = x + 40 and y = x - 40, so each ringed point sits exactly on one.
  return (
    <Frame label="A support vector machine: boundary, margin and support vectors">
      <line x1={-10} y1={30} x2={190} y2={230} stroke={MUTED} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={30} y1={-10} x2={230} y2={190} stroke={MUTED} strokeWidth={2} strokeDasharray="6 6" />
      <line x1={-10} y1={-10} x2={230} y2={230} stroke={INK} strokeWidth={4} />
      <Dots ring={[[100, 140], [155, 115]]} />
    </Frame>
  );
}

/** The kernel trick in one dimension: not separable by a point, separable after lifting to (x, x²). */
export function KernelLiftDiagram() {
  const blue = [-0.5, 0, 0.6];
  const purple = [-2.1, -1.7, 1.6, 2.2];
  const X = (v: number) => 150 + v * 55;
  return (
    <svg viewBox="0 0 700 240" role="img" aria-label="Points on a line that cannot be split by one cut, then lifted onto a parabola where a straight line splits them" className="h-auto w-full max-w-[700px]">
      <defs>
        <marker id="basics-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={INK} />
        </marker>
      </defs>
      {/* left: 1-D */}
      <text x={150} y={28} textAnchor="middle" fill={MUTED} fontSize={16}>1-D: no single cut works</text>
      <line x1={20} y1={120} x2={280} y2={120} stroke={MUTED} strokeWidth={2} />
      {blue.map((v) => <circle key={`b${v}`} cx={X(v)} cy={120} r={9} fill="var(--blue)" />)}
      {purple.map((v) => <circle key={`p${v}`} cx={X(v)} cy={120} r={9} fill="var(--purple)" />)}
      <text x={150} y={170} textAnchor="middle" fill={MUTED} fontSize={15}>x</text>

      {/* arrow */}
      <line x1={300} y1={120} x2={380} y2={120} stroke={INK} strokeWidth={2.5} markerEnd="url(#basics-arr2)" />
      <text x={340} y={104} textAnchor="middle" fill="#c08bff" fontSize={15}>x → (x, x²)</text>

      {/* right: lifted */}
      <text x={540} y={28} textAnchor="middle" fill={MUTED} fontSize={16}>lifted: one straight line works</text>
      <line x1={400} y1={200} x2={680} y2={200} stroke={MUTED} strokeWidth={2} />
      <line x1={540} y1={210} x2={540} y2={40} stroke={MUTED} strokeWidth={2} />
      <text x={672} y={222} fill={MUTED} fontSize={15} fontStyle="italic">x</text>
      <text x={548} y={50} fill={MUTED} fontSize={15} fontStyle="italic">x²</text>
      <line x1={400} y1={132} x2={680} y2={132} stroke={INK} strokeWidth={3} strokeDasharray="8 6" />
      {blue.map((v) => <circle key={`lb${v}`} cx={540 + v * 55} cy={200 - v * v * 30} r={9} fill="var(--blue)" />)}
      {purple.map((v) => <circle key={`lp${v}`} cx={540 + v * 55} cy={200 - v * v * 30} r={9} fill="var(--purple)" />)}
    </svg>
  );
}
