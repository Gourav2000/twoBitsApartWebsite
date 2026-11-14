"use client";

/**
 * Backprop as "passing the blame backwards": the loss L at the right, then the
 * error signal δ flowing o → z → y. Same layer names as the rest of episode 1.
 */

const C = {
  line: "rgba(148,163,196,.18)",
  faint: "#5b657a",
  muted: "#8d97ab",
  text: "#e9edf5",
  blue: "#3d8bff",
  purple: "#a45cff",
  lilac: "#c08bff",
  red: "#ff5c7a",
  amber: "#ffb547",
  node: "#0f1420",
};

const NODE_Y = [110, 165, 220];
const COLS = [
  { x: 95, name: "x", n: "784", color: C.blue, title: "pixels", sub: "", rest: "", lines: ["the data itself:", "nothing to blame"] },
  { x: 325, name: "y", n: "128", color: C.purple, title: "δ", sub: "y", rest: "", lines: ["blame passed back", "from all 64 z’s"] },
  { x: 555, name: "z", n: "64", color: C.purple, title: "δ", sub: "z", rest: "", lines: ["blame passed back", "from all 10 outputs"] },
  { x: 785, name: "o", n: "10", color: C.lilac, title: "δ", sub: "o", rest: " = p − t", lines: ["how wrong each", "score was"] },
];
const LX = 945;

function Arrow({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 + 10} y2={y} stroke={C.red} strokeWidth={3} />
      <path d={`M${x2},${y} l14,-8 l0,16 z`} fill={C.red} />
      <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle" fill={C.red} fontSize={13}>
        {label}
      </text>
    </g>
  );
}

export function BlameDiagram() {
  return (
    <svg viewBox="0 0 1000 360" width="100%" role="img" aria-label="Blame flows backwards from the loss through o, z and y" className="block">
      {/* forward connections, faint */}
      {COLS.slice(0, -1).map((c, i) =>
        NODE_Y.map((a) =>
          NODE_Y.map((b) => <line key={`${i}-${a}-${b}`} x1={c.x + 20} y1={a} x2={COLS[i + 1].x - 20} y2={b} stroke={C.line} />),
        ),
      )}
      {NODE_Y.map((a) => (
        <line key={`L${a}`} x1={COLS[3].x + 20} y1={a} x2={LX - 32} y2={165} stroke={C.line} />
      ))}

      {/* backward arrows */}
      <Arrow x1={LX - 34} x2={COLS[3].x + 30} y={50} label="1. start here" />
      <Arrow x1={COLS[3].x - 30} x2={COLS[2].x + 30} y={50} label="2. through W₃" />
      <Arrow x1={COLS[2].x - 30} x2={COLS[1].x + 30} y={50} label="3. through W₂" />
      <Arrow x1={COLS[1].x - 30} x2={COLS[0].x + 30} y={50} label="4. through W₁" />

      {/* layers */}
      {COLS.map((c) => (
        <g key={c.name}>
          {NODE_Y.map((y) => (
            <circle key={y} cx={c.x} cy={y} r={18} fill={C.node} stroke={c.color} strokeWidth={2.5} />
          ))}
          <text x={c.x} y={258} textAnchor="middle" fill={C.faint} fontSize={14}>
            ⋮
          </text>
          <text x={c.x} y={283} textAnchor="middle" fill={C.text} fontSize={15} fontStyle="italic">
            {c.name} ({c.n})
          </text>
          <text x={c.x} y={308} textAnchor="middle" fill={c.name === "x" ? C.muted : C.red} fontSize={15} fontWeight={700}>
            {c.title}
            {c.sub && (
              <tspan fontSize={11} dy={4}>
                {c.sub}
              </tspan>
            )}
            {c.rest && <tspan dy={c.sub ? -4 : 0}>{c.rest}</tspan>}
          </text>
          {c.lines.map((l, i) => (
            <text key={i} x={c.x} y={327 + i * 16} textAnchor="middle" fill={C.muted} fontSize={12.5}>
              {l}
            </text>
          ))}
        </g>
      ))}

      {/* the loss */}
      <rect x={LX - 32} y={140} width={64} height={50} rx={12} fill="rgba(255,92,122,.15)" stroke={C.red} strokeWidth={2.5} />
      <text x={LX} y={172} textAnchor="middle" fill={C.text} fontSize={20} fontStyle="italic" fontWeight={700}>
        L
      </text>
      <text x={LX} y={283} textAnchor="middle" fill={C.text} fontSize={15}>
        loss
      </text>
      <text x={LX} y={308} textAnchor="middle" fill={C.red} fontSize={15} fontWeight={700}>
        one number
      </text>
    </svg>
  );
}
