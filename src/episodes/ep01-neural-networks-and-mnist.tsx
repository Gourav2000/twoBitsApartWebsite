"use client";

import { useState } from "react";
import { Code } from "@/components/Code";
import { R, RG, useDeck, useShown, useStep } from "@/components/deck/context";
import { Box, Bullet, Divider, Hl, Slide, TitleCard } from "@/components/deck/primitives";
import type { Deck, SlideDef } from "@/components/deck/types";
import { LogoMark, Wordmark } from "@/components/Logo";
import { M, MB } from "@/components/Math";
import { GradientDescent } from "@/components/widgets/GradientDescent";
import { NeuronCalculator } from "@/components/widgets/NeuronCalculator";
import { FlatVector, PixelGrid, sevenLarge, sevenSmall } from "@/components/widgets/PixelGrid";
import { SoftmaxPlayground } from "@/components/widgets/SoftmaxPlayground";
import { site } from "@/site.config";
import {
  ActivationPlot,
  FlowArrow,
  FlowBox,
  NetworkDiagram,
  NeuronDiagram,
  PictureOne,
  PictureTwo,
} from "./ep01-diagrams";

const hosts = site.hosts.map((h) => ({ name: h.name, color: h.color }));
const A = site.hosts[0].name;
const B = site.hosts[1].name;

// ─────────────────────────────────────────────────────────────────────────
// Opening
// ─────────────────────────────────────────────────────────────────────────

const Title = () => (
  <TitleCard
    title="Neural Networks and MNIST"
    subtitle="How a computer learns to read a handwritten digit"
    series="Neural Networks to GPT: Building AI from Scratch"
    episode="Episode 1"
    hosts={hosts}
  />
);

function AgendaBtn({ id, children }: { id: string; children: React.ReactNode }) {
  const { go, interactive } = useDeck();
  return (
    <button
      onClick={() => go(id)}
      disabled={!interactive}
      className="bg-gradient-brand rounded-full px-6 py-1 text-[26px] font-semibold whitespace-nowrap text-white transition enabled:hover:brightness-125"
    >
      {children}
    </button>
  );
}

function TopicLink({ id, children }: { id: string; children: React.ReactNode }) {
  const { go, interactive } = useDeck();
  return (
    <button onClick={() => go(id)} disabled={!interactive} className="text-blue enabled:hover:underline">
      {children}
    </button>
  );
}

const Agenda = () => (
  <Slide title="Today’s map">
    <p className="mb-8 text-muted">Click any button to jump.</p>
    <div className="grid grid-cols-[300px_1fr] items-start gap-x-10 gap-y-7">
      <AgendaBtn id="demo">0 · Demo</AgendaBtn>
      <div>Upload a digit, press PREDICT, see what comes back</div>
      <AgendaBtn id="part1">1 · Theory</AgendaBtn>
      <div>
        From a single neuron to a trained network
        <div className="mt-2 text-[24px]">
          {[
            ["pixels", "pixels"],
            ["neuron", "neuron"],
            ["forward pass", "forward"],
            ["loss", "loss"],
            ["gradient descent", "gd"],
            ["backprop", "backprop"],
            ["training loop", "loop"],
          ].map(([l, id], i) => (
            <span key={id}>
              {i > 0 && <span className="text-faint"> · </span>}
              <TopicLink id={id}>{l}</TopicLink>
            </span>
          ))}
        </div>
      </div>
      <AgendaBtn id="part2">2 · System design</AgendaBtn>
      <div>Wrapping the trained model in a FastAPI service</div>
    </div>
    <Box tone="purple" title="The question we answer" className="mt-12">
      What exactly happens between “I clicked PREDICT” and “it’s a 7”?
    </Box>
  </Slide>
);

const Demo = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center bg-bg-2 text-center text-text">
    <div className="studio-grid absolute inset-0 opacity-60" />
    <div className="absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red/10 blur-3xl" />
    <div className="relative flex flex-col items-center">
      <div className="flex items-center gap-4 rounded-full border-2 border-red/70 px-8 py-3 text-[34px] font-bold tracking-[0.3em] text-red">
        <span className="h-5 w-5 animate-pulse rounded-full bg-red" /> LIVE DEMO
      </div>
      <h2 className="font-display mt-12 text-[96px] leading-none font-bold">Upload. Predict. Look.</h2>
      <p className="mt-8 max-w-[1100px] text-[36px] text-muted">
        Switching to the app: upload a handwritten digit, press <b className="text-text">PREDICT</b>, and see what comes back.
      </p>
      <div className="mt-14 rounded-2xl border border-border-strong bg-black/60 px-8 py-5 font-mono text-[28px]">
        <span className="text-green">$</span> uvicorn main:app --reload <span className="text-faint">→ http://127.0.0.1:8000</span>
      </div>
    </div>
  </div>
);

const BlackBox = () => (
  <Slide title="What you just saw: a black box">
    <div className="mt-4 flex items-center justify-between text-[32px]">
      <FlowBox tone="neutral" className="h-[200px] w-[280px]">
        handwritten
        <br />
        image
      </FlowBox>
      <FlowArrow w={170} />
      <div className="relative h-[220px] w-[420px]">
        <R at={0} fade className="absolute inset-0">
          <FlowBox tone="dark" className="h-full w-full text-[52px] text-muted">
            ???
          </FlowBox>
        </R>
        <R at={1} fade className="absolute inset-0">
          <FlowBox tone="purple" className="h-full w-full flex-col bg-bg-2 text-[30px]">
            <span className="text-muted">pixels → numbers</span>
            <span className="mt-2 text-[36px]">→ layers → probabilities</span>
          </FlowBox>
        </R>
      </div>
      <FlowArrow w={170} />
      <FlowBox tone="blue" className="h-[200px] w-[280px] flex-col">
        <span className="font-display text-[72px] leading-none font-bold">7</span>
        <span className="mt-2 text-[24px] text-muted">confidence 0.99</span>
      </FlowBox>
    </div>
    <R at={1} className="mt-16 space-y-4">
      <Bullet>
        <b>Part 1</b> opens the box: neurons, loss, gradients.
      </Bullet>
      <Bullet>
        <b>Part 2</b> builds the door: an API that anyone’s browser can knock on.
      </Bullet>
    </R>
  </Slide>
);

// ─────────────────────────────────────────────────────────────────────────
// Part 1: theory
// ─────────────────────────────────────────────────────────────────────────

const Part1 = () => <Divider kicker="Part 1" title="Theory: from pixels to prediction" tint="blue" />;

function Pixels() {
  const [big, setBig] = useState(false);
  const [vals, setVals] = useState(sevenSmall);
  const [hover, setHover] = useState<number | null>(null);
  const [nums, setNums] = useState(false);
  const n = big ? 28 : 8;
  const toggle = (b: boolean) => {
    setBig(b);
    setVals(b ? sevenLarge() : sevenSmall());
    setHover(null);
  };
  return (
    <Slide title="A computer does not see a 7. It sees numbers.">
      <div className="grid grid-cols-[440px_1fr] gap-16">
        <div className="flex flex-col items-start gap-3">
          <PixelGrid n={n} values={vals} onChange={setVals} hover={hover} onHover={setHover} showNumbers={nums} size={420} />
          <div className="flex w-[420px] items-center gap-2 text-[18px]">
            {[false, true].map((b) => (
              <button
                key={String(b)}
                onClick={() => toggle(b)}
                className={`rounded-full border px-3 py-1 ${big === b ? "border-purple bg-purple/20" : "border-border-strong text-muted hover:bg-surface-2"}`}
              >
                {b ? "28×28" : "8×8"}
              </button>
            ))}
            {!big && (
              <button onClick={() => setNums((v) => !v)} className="rounded-full border border-border-strong px-3 py-1 text-muted hover:bg-surface-2">
                {nums ? "hide" : "show"} values
              </button>
            )}
            <button onClick={() => setVals(new Array(n * n).fill(0))} className="rounded-full border border-border-strong px-3 py-1 text-muted hover:bg-surface-2">
              clear
            </button>
            <span className="ml-auto text-faint">draw ✎</span>
          </div>
        </div>
        <div className="space-y-5">
          <Bullet>
            MNIST image: <M>{String.raw`28 \times 28 =`}</M> <Hl>784</Hl> pixels.
            <span className="ml-3 text-[22px] text-faint">(shown as {n}×{n})</span>
          </Bullet>
          <R at={1} className="space-y-5">
            <Bullet>
              Each pixel is a number: <M>0</M> (black) up to <M>1</M> (white).
              {hover !== null && (
                <span className="ml-3 font-mono text-[22px] text-[#c08bff]">
                  x[{hover}] = {vals[hover].toFixed(2)}
                </span>
              )}
            </Bullet>
            <Bullet>
              Flatten the grid into one long vector:
              <div className="mt-3">
                <FlatVector values={vals} hover={hover} onHover={setHover} perRow={big ? 98 : 32} cell={big ? 7 : 22} />
              </div>
              <div className="mt-2 text-[26px]">
                <M>{String.raw`x = [\,0,\,0,\,\dots,\,0.9,\,1.0,\,\dots,\,0\,]^\top \in \mathbb{R}^{784}`}</M>
              </div>
            </Bullet>
          </R>
          <R at={2} className="space-y-5">
            <Bullet>
              Label <M>{String.raw`y \in \{0, 1, \dots, 9\}`}</M>.
            </Bullet>
            <Bullet>
              <Hl>Goal:</Hl> learn a function <M>{String.raw`f(x) \approx y`}</M>.
            </Bullet>
          </R>
        </div>
      </div>
    </Slide>
  );
}

const TOOLBOX: [string, React.ReactNode][] = [
  ["Linear / logistic regression", <>One weighted sum <M>{String.raw`w^\top x + b`}</M>, then a threshold. Draws a straight line between classes.</>],
  ["k-Nearest Neighbours", <>No training at all. Find the <M>k</M> most similar training images and let them vote.</>],
  ["Decision tree / Random forest", <>A flowchart of yes/no questions. A forest averages many trees.</>],
  ["Support Vector Machine (SVM)", <>A linear model that picks the <Hl>widest-margin</Hl> boundary; kernels let it bend.</>],
  ["Neural network", <>Many weighted sums stacked in layers, with a nonlinearity between them.</>],
];

const Toolbox = () => (
  <Slide title={<>The ML toolbox: five ways to learn <M>f</M></>}>
    <div className="space-y-5 text-[28px]">
      {TOOLBOX.map(([h, d], i) => (
        <R key={h} at={i}>
          <Bullet>
            <div className="font-display font-bold">{h}</div>
            <div className="text-[25px] text-muted">{d}</div>
          </Bullet>
        </R>
      ))}
    </div>
    <R at={5} className="mt-6 text-center text-[#c08bff]">
      Same job, same data. SVM is one weighted sum with the widest margin; a neural network stacks many.
    </R>
  </Slide>
);

const Picture1 = () => (
  <Slide title="Picture it (1/2): line, neighbours, questions">
    <PictureOne />
  </Slide>
);

const Picture2 = () => (
  <Slide title="Picture it (2/2): the two we will build">
    <PictureTwo />
  </Slide>
);

const SvmVsNn = () => (
  <Slide title={<>Two ways to build <M>f</M>: SVM vs neural network</>}>
    <div className="grid grid-cols-2 gap-10">
      <Box tone="blue" title="SVM: one smart boundary" className="h-full">
        <div className="space-y-4 py-2">
          <Bullet>Treats the 784 numbers as a point in space.</Bullet>
          <Bullet>
            Finds the boundary with the <Hl>largest gap</Hl> to each class.
          </Bullet>
          <R at={1} className="space-y-4">
            <Bullet>
              <b>Kernel trick:</b> bend the boundary without hand-made features.
            </Bullet>
            <Bullet>A strong baseline, and fast to train on small data.</Bullet>
          </R>
        </div>
      </Box>
      <Box tone="purple" title="Neural network: learned features" className="h-full">
        <div className="space-y-4 py-2">
          <Bullet>
            Starts from the same weighted sum <M>{String.raw`w^\top x + b`}</M>.
          </Bullet>
          <Bullet>Stacks layers, so early layers find strokes and later ones find shapes.</Bullet>
          <R at={1} className="space-y-4">
            <Bullet>Trained by nudging weights downhill.</Bullet>
            <Bullet>
              The same recipe scales <Hl>all the way to GPT</Hl>.
            </Bullet>
          </R>
        </div>
      </Box>
    </div>
  </Slide>
);

/** Shows exactly one caption: the one for the current build step. */
function StepSwitch({ items }: { items: React.ReactNode[] }) {
  const step = useStep();
  return (
    <div className="relative h-16 w-full">
      {items.map((it, i) => {
        const on = i === items.length - 1 ? step >= i : step === i;
        return (
          <div key={i} className="reveal-fade absolute inset-x-0 top-0 text-center" data-hidden={!on}>
            {it}
          </div>
        );
      })}
    </div>
  );
}

const NEURON_CAPTIONS = [
  <>Inputs: the pixel values.</>,
  <>
    Multiply each input by a <Hl>weight</Hl>, add a <Hl>bias</Hl>.
  </>,
  <>
    <M>{String.raw`a = \sigma(w^\top x + b)`}</M>
    <span className="ml-10">
      The weights and bias are what the network <i>learns</i>.
    </span>
  </>,
];

const Neuron = () => (
  <Slide title="The neuron: a weighted vote">
    <div className="flex flex-col items-center">
      <NeuronDiagram />
      <div className="mt-4 w-full">
        <StepSwitch items={NEURON_CAPTIONS} />
      </div>
    </div>
  </Slide>
);

const ByHand = () => (
  <Slide title="One neuron, by hand">
    <div className="grid grid-cols-2 gap-14">
      <div>
        <div>Take</div>
        <MB>{String.raw`x=\begin{pmatrix}1.0\\0.5\\-1.0\end{pmatrix},\; w=\begin{pmatrix}0.8\\-0.4\\0.3\end{pmatrix},\; b=0.1`}</MB>
        <R at={1}>
          <div className="mt-4">Then</div>
          <MB>{String.raw`z = 0.8(1.0) + (-0.4)(0.5) + 0.3(-1.0) + 0.1`}</MB>
        </R>
      </div>
      <div>
        <R at={1} className="mt-6 space-y-6 text-[34px]">
          <MB>{String.raw`z = 0.8 - 0.2 - 0.3 + 0.1 = \color{#c08bff}{0.4}`}</MB>
          <MB>{String.raw`a = \mathrm{ReLU}(0.4) = \color{#c08bff}{0.4}`}</MB>
        </R>
        <R at={2} className="mt-10">
          <Box tone="blue" title="Try it">
            Flip the sign of <M>x_1</M>. What is <M>z</M>? What does ReLU output?
          </Box>
        </R>
        <R at={3} className="mt-4 text-[28px]">
          <M>{String.raw`z = -0.8 - 0.2 - 0.3 + 0.1 = -1.2`}</M>, so ReLU gives <M>0</M>: the neuron stays silent.
        </R>
      </div>
    </div>
  </Slide>
);

const NeuronLive = () => (
  <Slide title="Your turn: one neuron, live">
    <NeuronCalculator />
  </Slide>
);

const Activations = () => (
  <Slide title="Activation functions: why not just stay linear?">
    <div className="grid grid-cols-2 place-items-center">
      <div className="flex flex-col items-center">
        <ActivationPlot kind="relu" />
        <M>{String.raw`\mathrm{ReLU}(z) = \max(0, z)`}</M>
      </div>
      <div className="flex flex-col items-center">
        <ActivationPlot kind="sigmoid" />
        <M>{String.raw`\sigma(z) = \frac{1}{1+e^{-z}}`}</M>
      </div>
    </div>
    <R at={1} className="mt-6">
      <Box tone="purple" title="Why nonlinearity?">
        Stacked linear layers collapse into one linear map: <M>{String.raw`W_2(W_1x) = (W_2W_1)x`}</M>. The activation is
        what lets depth add power.
      </Box>
    </R>
  </Slide>
);

const Network = () => (
  <Slide title="Many neurons, layers: the network">
    <div className="flex flex-col items-center">
      <NetworkDiagram />
      <div className="mt-2 text-center">
        Every neuron in one layer connects to every neuron in the next: a <Hl>fully connected</Hl> (MLP) layer.
      </div>
    </div>
  </Slide>
);

const Forward = () => (
  <Slide title="Forward propagation: the whole prediction in four lines">
    <div className="grid grid-cols-[1fr_560px] items-center gap-10">
      <div className="text-[38px]">
        <MB>{String.raw`\begin{aligned} z^{(1)} &= W^{(1)}x + b^{(1)} \\ a^{(1)} &= \mathrm{ReLU}\big(z^{(1)}\big) \end{aligned}`}</MB>
        <R at={1}>
          <MB>{String.raw`\begin{aligned} z^{(2)} &= W^{(2)}a^{(1)} + b^{(2)} \\ \hat y &= \mathrm{softmax}\big(z^{(2)}\big) \end{aligned}`}</MB>
        </R>
      </div>
      <R at={2}>
        <Box tone="blue" title="Shapes">
          <div className="space-y-1 text-[26px]">
            <div><M>{String.raw`x:\ 784 \times 1`}</M></div>
            <div><M>{String.raw`W^{(1)}:\ 128 \times 784,\ \ b^{(1)}:\ 128`}</M></div>
            <div><M>{String.raw`W^{(2)}:\ 10 \times 128,\ \ b^{(2)}:\ 10`}</M></div>
            <div><M>{String.raw`\hat y:\ 10 \times 1`}</M></div>
          </div>
        </Box>
        <div className="mt-6 text-[26px]">
          Parameters:
          <div>
            <M>{String.raw`784\cdot128 + 128 + 128\cdot10 + 10 =`}</M>{" "}
            <span className="text-gradient font-mono text-[34px] font-bold">101,770</span>
          </div>
        </div>
      </R>
    </div>
  </Slide>
);

function ProbRow() {
  const shown = useShown(2);
  return (
    <tr className="reveal-fade text-[#c08bff]" data-hidden={!shown}>
      <td className="pr-10 font-sans">probability</td>
      {["0.66", "0.24", "0.10"].map((c) => (
        <td key={c} className="border-l border-border-strong px-8 text-center">
          {c}
        </td>
      ))}
    </tr>
  );
}

const Softmax = () => (
  <Slide title="Softmax: scores into probabilities">
    <div className="flex flex-col items-center">
      <div className="text-[40px]">
        <MB>{String.raw`\hat y_k = \frac{e^{z_k}}{\sum_j e^{z_j}}`}</MB>
      </div>
      <R at={1} className="flex flex-col items-center">
        <div className="mb-2">Toy example with three classes:</div>
        <table className="font-mono text-[30px]">
          <tbody>
            <tr className="border-b border-border-strong">
              <td className="pr-10 font-sans">class</td>
              {["“7”", "“1”", "“9”"].map((c) => <td key={c} className="border-l border-border-strong px-8 text-center font-sans">{c}</td>)}
            </tr>
            <tr>
              <td className="pr-10 font-sans">score <M>z</M></td>
              {["2.0", "1.0", "0.1"].map((c) => <td key={c} className="border-l border-border-strong px-8 text-center">{c}</td>)}
            </tr>
            <tr>
              <td className="pr-10 font-sans"><M>{"e^z"}</M></td>
              {["7.39", "2.72", "1.11"].map((c) => <td key={c} className="border-l border-border-strong px-8 text-center">{c}</td>)}
            </tr>
            <ProbRow />
          </tbody>
        </table>
      </R>
      <R at={2} className="mt-8 w-full space-y-3">
        <Bullet>Probabilities are positive and sum to 1.</Bullet>
        <Bullet>
          Prediction = <M>{String.raw`\arg\max_k \hat y_k`}</M>; confidence = <M>{String.raw`\max_k \hat y_k`}</M>.
        </Bullet>
      </R>
    </div>
  </Slide>
);

const SoftmaxLive = () => (
  <Slide title="Play with softmax (and the loss)">
    <SoftmaxPlayground />
  </Slide>
);

const PauseOne = () => (
  <Slide title="Pause and predict">
    <Box tone="purple" title={`${B}: before we train anything…`} className="mt-10">
      The weights are random. We feed in 10,000 test digits.
      <br />
      What accuracy do you expect?
    </Box>
    <R at={1} className="mt-12 space-y-5">
      <Bullet>
        About <Hl>10 %</Hl>: no better than a coin with ten sides.
      </Bullet>
      <Bullet>Random weights give meaningless scores, so every digit is equally likely.</Bullet>
      <Bullet>
        <b>Training is the act of moving from 10 % to about 97 %.</b> How? Next.
      </Bullet>
    </R>
  </Slide>
);

const Loss = () => (
  <Slide title="Loss: how wrong are we?">
    <div className="grid grid-cols-2 gap-14">
      <div>
        <div className="text-[40px]">
          <MB>{String.raw`L = -\log \hat y_{y}`}</MB>
        </div>
        <div>
          <b>Cross-entropy:</b> take the probability the network gave to the <i>true</i> class.
        </div>
        <R at={1} className="mt-8 space-y-4">
          <Bullet>
            True digit “7”, network says <M>0.66</M>: <M>{String.raw`L = -\ln 0.66 \approx \color{#c08bff}{0.42}`}</M>
          </Bullet>
          <Bullet>
            Network says <M>0.10</M>: <M>{String.raw`L \approx \color{#c08bff}{2.3}`}</M>
          </Bullet>
          <Bullet>
            Network says <M>0.99</M>: <M>{String.raw`L \approx \color{#c08bff}{0.01}`}</M>
          </Bullet>
        </R>
      </div>
      <R at={2} className="pt-6">
        <Box tone="blue" title="Why not use accuracy?">
          Accuracy jumps in steps, so it gives no direction to move. Cross-entropy is smooth, so we can follow its slope.
        </Box>
      </R>
    </div>
  </Slide>
);

function GdCurve() {
  const pts: string[] = [];
  const X = (w: number) => 40 + w * 75;
  const Y = (w: number) => 440 - ((w - 3) ** 2 / 9) * 360;
  for (let i = 0; i <= 120; i++) {
    const w = (6 * i) / 120;
    pts.push(`${X(w)},${Y(w)}`);
  }
  const steps = [0, 0.6, 1.08];
  return (
    <svg viewBox="0 0 560 480" width={560} height={480}>
      <defs>
        <marker id="arrP2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#a45cff" />
        </marker>
      </defs>
      <line x1={20} y1={440} x2={540} y2={440} stroke="#8d97ab" strokeWidth={2} />
      <line x1={40} y1={460} x2={40} y2={30} stroke="#8d97ab" strokeWidth={2} />
      <text x={546} y={446} fill="#8d97ab" fontSize={22} fontStyle="italic">w</text>
      <text x={30} y={22} fill="#8d97ab" fontSize={22} fontStyle="italic">L</text>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--blue)" strokeWidth={5} />
      {steps.map((w, i) => (
        <RG key={w} at={i === 0 ? 0 : 1}>
          <g>
            {i > 0 && (
              <line
                x1={X(steps[i - 1])}
                y1={Y(steps[i - 1])}
                x2={X(w) - 4}
                y2={Y(w) - 8}
                stroke="#a45cff"
                strokeWidth={3}
                markerEnd="url(#arrP2)"
              />
            )}
            <circle cx={X(w)} cy={Y(w)} r={11} fill="var(--purple)" />
            <text x={X(w) + 18} y={Y(w) - 6} fill="#c08bff" fontSize={22}>
              w{["₀", "₁", "₂"][i]}
            </text>
          </g>
        </RG>
      ))}
    </svg>
  );
}

const Gd = () => (
  <Slide title="Gradient descent: walk downhill">
    <div className="grid grid-cols-[560px_1fr] gap-12">
      <GdCurve />
      <div>
        <div className="text-[36px]">
          <MB>{String.raw`w \leftarrow w - \eta\, \frac{\partial L}{\partial w}`}</MB>
        </div>
        <div>
          Toy loss <M>{String.raw`L = (w-3)^2`}</M> (the picture is scaled), <M>{String.raw`\eta = 0.1`}</M>, start <M>{String.raw`w_0 = 0`}</M>:
        </div>
        <R at={1} className="mt-4 space-y-3">
          <Bullet>
            slope <M>{String.raw`= 2(0-3) = -6`}</M>, so <M>{String.raw`w_1 = 0 + 0.1\cdot 6 = \color{#c08bff}{0.6}`}</M>
          </Bullet>
          <Bullet>
            slope <M>{String.raw`= 2(0.6-3) = -4.8`}</M>, so <M>{String.raw`w_2 = \color{#c08bff}{1.08}`}</M>
          </Bullet>
        </R>
        <R at={2} className="mt-3 space-y-3">
          <Bullet>Steps shrink as the slope flattens near the minimum.</Bullet>
          <div className="pt-2">
            <b>Learning rate</b> <M>\eta</M>: too big overshoots, too small crawls.
          </div>
        </R>
      </div>
    </div>
  </Slide>
);

const GdLive = () => (
  <Slide title="Walk downhill yourself">
    <GradientDescent />
  </Slide>
);

const ChainRule = () => (
  <Slide title="Backpropagation starts with the chain rule">
    <div>
      A network has 101,770 weights. We need the slope for <i>every</i> one.
    </div>
    <div className="text-[36px]">
      <MB>{String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a}\cdot\frac{\partial a}{\partial w}`}</MB>
    </div>
    <R at={1}>
      <Box tone="neutral" title="Example (Tiny chain)">
        <M>{String.raw`a = wx,\quad L=(a-t)^2,\quad x=2,\ w=1,\ t=5`}</M>
      </Box>
      <div className="mt-5 space-y-3">
        <Bullet>
          Forward: <M>{String.raw`a = 1\cdot 2 = 2,\quad L = (2-5)^2 = 9`}</M>
        </Bullet>
        <R at={2} className="space-y-3">
          <Bullet>
            <M>{String.raw`\frac{\partial L}{\partial a} = 2(a-t) = -6 \qquad \frac{\partial a}{\partial w} = x = 2`}</M>
          </Bullet>
          <Bullet>
            <M>{String.raw`\frac{\partial L}{\partial w} = -6\cdot 2 = \color{#c08bff}{-12}`}</M> so{" "}
            <M>{String.raw`w \leftarrow 1 - 0.1(-12) = \color{#c08bff}{2.2}`}</M>, which moves <M>a</M> toward <M>t</M>.
          </Bullet>
        </R>
      </div>
    </R>
    <R at={2} className="mt-4 text-center font-bold">
      Backprop = chain rule applied layer by layer, reusing what’s already computed.
    </R>
  </Slide>
);

const BackpropNet = () => (
  <Slide title="Backprop through our network">
    <div className="relative">
      <div className="flex items-center justify-between text-[30px]">
        {["x", "z^{(1)}", "a^{(1)}", "z^{(2)}", String.raw`\hat y`, "L"].map((t, i, arr) => (
          <div key={t} className="flex items-center">
            <FlowBox tone={i === arr.length - 1 ? "purple" : "blue"} className="min-w-[90px]">
              <M>{t}</M>
            </FlowBox>
            {i < arr.length - 1 && <FlowArrow w={130} />}
          </div>
        ))}
      </div>
      <R at={1} fade>
        <svg width="100%" height="34" viewBox="0 0 1408 34" preserveAspectRatio="none" className="mt-3">
          <line x1={1370} y1={14} x2={40} y2={14} stroke="#a45cff" strokeWidth={3} strokeDasharray="12 9" />
          <path d="M40,14 l18,-9 l0,18 z" fill="#a45cff" />
        </svg>
        <div className="text-center text-[24px] text-[#c08bff]">gradients flow backward</div>
      </R>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-6 text-[30px]">
      <R at={1}>
        <MB>{String.raw`\begin{aligned} \delta^{(2)} &= \hat y - y \\ \partial L/\partial W^{(2)} &= \delta^{(2)}\, a^{(1)\top} \\ \partial L/\partial b^{(2)} &= \delta^{(2)} \end{aligned}`}</MB>
      </R>
      <R at={2}>
        <MB>{String.raw`\begin{aligned} \delta^{(1)} &= \big(W^{(2)\top}\delta^{(2)}\big) \odot \mathbf{1}[z^{(1)}>0] \\ \partial L/\partial W^{(1)} &= \delta^{(1)}\, x^\top \\ \partial L/\partial b^{(1)} &= \delta^{(1)} \end{aligned}`}</MB>
      </R>
    </div>
    <R at={2} className="mt-4 text-center text-[26px]">
      <Hl>
        Softmax + cross-entropy gives the clean result <M>{String.raw`\hat y - y`}</M>.
      </Hl>{" "}
      We verify this in NumPy later.
    </R>
  </Slide>
);

const Loop = () => (
  <Slide title="The training loop">
    <div className="relative mx-auto w-fit">
      <div className="flex items-center text-[32px]">
        <FlowBox tone="blue">1. Forward</FlowBox>
        <FlowArrow w={110} />
        <FlowBox tone="blue">2. Loss</FlowBox>
        <FlowArrow w={110} />
        <FlowBox tone="purple">3. Backward</FlowBox>
        <FlowArrow w={110} />
        <FlowBox tone="purple">4. Update</FlowBox>
      </div>
      <R at={1} fade>
        <svg width="100%" height="110" viewBox="0 0 1000 110" preserveAspectRatio="none">
          <polyline points="925,0 925,80 85,80 85,10" fill="none" stroke="#e9edf5" strokeWidth={2.5} />
          <path d="M85,2 l-8,14 l16,0 z" fill="#e9edf5" />
        </svg>
        <div className="-mt-6 text-center text-[24px] text-muted">repeat</div>
      </R>
    </div>
    <R at={2} className="mt-10 space-y-4">
      <Bullet>Shuffle the 60,000 training images; slice into mini-batches (e.g. 64).</Bullet>
      <Bullet>
        One <Hl>epoch</Hl> = one pass over all the data; train for several epochs.
      </Bullet>
      <Bullet>
        Watch the loss fall and the <i>test</i> accuracy rise.
      </Bullet>
    </R>
  </Slide>
);

const Learned = () => (
  <Slide title="Did it actually learn?">
    <div className="mt-16 grid grid-cols-2 gap-12">
      <Box tone="blue" title="Honest evaluation">
        <div className="space-y-3 py-2">
          <Bullet>60,000 images to train.</Bullet>
          <Bullet>
            10,000 <i>unseen</i> images to test.
          </Bullet>
          <Bullet>Report test accuracy, never training accuracy alone.</Bullet>
        </div>
      </Box>
      <R at={1}>
        <Box tone="purple" title="SVM vs MLP">
          <div className="py-2">
            Both land in the high 90s (≈ 97–98 %) on MNIST.
            <div className="mt-3 text-[26px] text-muted">
              So why neural nets? Because the same recipe keeps scaling when SVMs stop.
            </div>
          </div>
        </Box>
      </R>
    </div>
  </Slide>
);

const PauseTwo = () => (
  <Slide title="Pause and predict, again">
    <Box tone="purple" title={`${B}: the real world`} className="mt-10">
      You photograph a <b>7</b> written in black pen on white, lined paper, and upload it.
      <br />
      Will our 97 % model get it right?
    </Box>
    <R at={1} className="mt-12 space-y-5">
      <Bullet>
        <Hl>Maybe not!</Hl> MNIST digits are white on black, centred, 28×28.
      </Bullet>
      <Bullet>The model only knows the data distribution it was trained on.</Bullet>
      <Bullet>
        So serving a model is mostly about <b>matching the preprocessing</b>. That is Part 2.
      </Bullet>
    </R>
  </Slide>
);

// ─────────────────────────────────────────────────────────────────────────
// Part 2: system design
// ─────────────────────────────────────────────────────────────────────────

const Part2 = () => <Divider kicker="Part 2" title="System design: the model behind an API" tint="purple" />;

const Architecture = () => (
  <Slide title="The architecture">
    <div className="mt-6 flex items-center justify-between text-[28px]">
      <FlowBox tone="blue" className="h-[300px] w-[330px] flex-col gap-2">
        <b className="font-display text-[34px]">Browser UI</b>
        <span>upload image</span>
        <span>PREDICT button</span>
        <span>shows digit + bars</span>
      </FlowBox>
      <div className="flex flex-col gap-6">
        <R at={1} fade>
          <FlowArrow w={200} label="POST /predict" />
        </R>
        <R at={2} fade>
          <FlowArrow w={200} label="JSON" back />
        </R>
      </div>
      <div className="flex h-[360px] w-[400px] flex-col items-center gap-3 rounded-2xl border-2 border-purple/70 bg-purple/10 p-5">
        <b className="font-display text-[34px]">FastAPI</b>
        {["validate file", "preprocess", "forward pass"].map((s) => (
          <div key={s} className="w-full rounded-xl border-2 border-border-strong bg-bg-2 py-3 text-center">
            {s}
          </div>
        ))}
      </div>
      <R at={1} fade>
        <FlowArrow w={160} label="load once" back />
      </R>
      <FlowBox tone="neutral" className="h-[300px] w-[280px] flex-col gap-2">
        <b className="font-display text-[34px]">model.npz</b>
        <M>{String.raw`W^{(1)}, b^{(1)}`}</M>
        <M>{String.raw`W^{(2)}, b^{(2)}`}</M>
      </FlowBox>
    </div>
    <R at={1} className="mt-10 text-center text-[28px]">
      The UI sends the image as multipart form data; weights are loaded <i>once</i> at startup. The response: predicted digit,
      confidence, all 10 probabilities.
    </R>
  </Slide>
);

const Api = () => (
  <Slide title="The API contract">
    <div className="grid grid-cols-2 gap-12">
      <div>
        <div className="font-display mb-4 font-bold">Endpoints</div>
        <div className="space-y-4">
          <Bullet>
            <code className="font-mono text-blue">GET /health</code>: is the service up?
          </Bullet>
          <Bullet>
            <code className="font-mono text-blue">POST /predict</code>: image in, digit out
          </Bullet>
          <Bullet>
            <code className="font-mono text-blue">GET /docs</code>: free interactive docs from FastAPI
          </Bullet>
        </div>
        <R at={1} className="mt-8 text-[28px]">
          Request: <code className="font-mono">multipart/form-data</code>, field name <code className="font-mono text-[#c08bff]">file</code>.
        </R>
      </div>
      <div>
        <div className="font-display mb-4 font-bold">Response</div>
        <Code
          className="text-[26px]"
          code={`{
  "digit": 7,
  "confidence": 0.99,
  "probabilities": [0.00, 0.00, 0.01,
    0.00, 0.00, 0.00, 0.00, 0.99,
    0.00, 0.00]
}`}
        />
      </div>
    </div>
  </Slide>
);

const Preprocess = () => (
  <Slide title="Preprocessing must match training">
    <div className="mt-6 flex items-center justify-between text-[26px]">
      <FlowBox tone="blue">upload</FlowBox>
      <FlowArrow w={60} />
      <FlowBox tone="blue">grayscale</FlowBox>
      <FlowArrow w={60} />
      <FlowBox tone="blue">
        resize
        <br />
        28×28
      </FlowBox>
      <FlowArrow w={60} />
      <FlowBox tone="purple">
        invert if
        <br />
        dark-on-light
      </FlowBox>
      <FlowArrow w={60} />
      <FlowBox tone="blue">÷255</FlowBox>
      <FlowArrow w={60} />
      <FlowBox tone="blue">
        flatten
        <br />
        784
      </FlowBox>
    </div>
    <R at={1} className="mt-16 space-y-5">
      <Bullet>
        Same scaling as training: <M>{String.raw`[0, 1]`}</M>, float32.
      </Bullet>
      <Bullet>
        MNIST is <Hl>white digit on black</Hl>; most uploads are the opposite, so invert.
      </Bullet>
      <Bullet>Centre and crop to the digit; MNIST digits are centred.</Bullet>
    </R>
  </Slide>
);

const ModelPy = () => (
  <Slide title="model.py: the forward pass in NumPy">
    <div className="grid grid-cols-[1fr_380px] gap-10">
      <Code
        filename="model.py"
        className="text-[25px]"
        highlightLines={[12, 13, 14, 15]}
        code={`
import numpy as np

def relu(z):
    return np.maximum(0, z)

def softmax(z):
    z = z - z.max(axis=0, keepdims=True)   # numerical stability
    e = np.exp(z)
    return e / e.sum(axis=0, keepdims=True)

def forward(x, p):
    z1 = p["W1"] @ x + p["b1"]      # (128, 1)
    a1 = relu(z1)
    z2 = p["W2"] @ a1 + p["b2"]     # (10, 1)
    return softmax(z2)              # 10 probabilities
`}
      />
      <div className="space-y-5 pt-4 text-[26px]">
        <Bullet>The same four lines from the forward-propagation slide.</Bullet>
        <Bullet>
          <code className="font-mono">p</code> is the dict loaded from <code className="font-mono">model.npz</code>.
        </Bullet>
        <Bullet>No framework: matrix multiply, max, exp, divide.</Bullet>
      </div>
    </div>
  </Slide>
);

const MainPy1 = () => (
  <Slide title="main.py (1/2): setup and preprocessing">
    <Code
      filename="main.py"
      className="text-[25px]"
      highlightLines={[13, 14]}
      code={`
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import numpy as np, io
from model import forward                 # our NumPy forward pass

app = FastAPI()
params = np.load("model.npz")             # loaded once at startup

def preprocess(raw: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(raw)).convert("L").resize((28, 28))
    x = np.asarray(img, dtype=np.float32) / 255.0
    if x.mean() > 0.5:                    # dark ink on light paper?
        x = 1.0 - x                       # make it white-on-black, like MNIST
    return x.reshape(784, 1)
`}
    />
  </Slide>
);

const MainPy2 = () => (
  <Slide title="main.py (2/2): the endpoint">
    <Code
      filename="main.py"
      className="text-[25px]"
      code={`
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image")
    x = preprocess(await file.read())
    probs = forward(x, params).ravel()
    return {"digit": int(probs.argmax()),
            "confidence": float(probs.max()),
            "probabilities": probs.tolist()}
`}
    />
    <div className="mt-6">
      Run it: <code className="font-mono text-green">uvicorn main:app --reload</code>, then open{" "}
      <code className="font-mono text-blue">/docs</code>.
    </div>
  </Slide>
);

const Design = () => (
  <Slide title="Design decisions worth saying out loud">
    <div className="mt-6 grid grid-cols-2 gap-12">
      <Box tone="blue" title="Do">
        <div className="space-y-4 py-2">
          <Bullet>Load the model once, not per request.</Bullet>
          <Bullet>Validate type and size of uploads.</Bullet>
          <Bullet>Return all probabilities, so the UI can show uncertainty.</Bullet>
          <Bullet>
            Keep preprocessing in <i>one</i> function shared with training.
          </Bullet>
        </div>
      </Box>
      <R at={1}>
        <Box tone="purple" title="Watch out for">
          <div className="space-y-4 py-2">
            <Bullet>Training/serving skew (inverted colours!).</Bullet>
            <Bullet>Overconfident wrong answers: softmax is not calibrated.</Bullet>
            <Bullet>CORS when the UI and API run on different ports.</Bullet>
          </div>
        </Box>
      </R>
    </div>
  </Slide>
);

const RECAP: React.ReactNode[] = [
  <>An image is <M>784</M> numbers; the network maps them to <M>10</M> probabilities.</>,
  <><b>Forward:</b> <M>{String.raw`z = Wx + b`}</M>, activation, repeat, softmax.</>,
  <><b>Loss:</b> cross-entropy measures how wrong we are.</>,
  <><b>Backprop:</b> the chain rule gives every weight’s slope.</>,
  <><b>Gradient descent:</b> nudge weights downhill, repeat.</>,
  <><b>Serving:</b> an API is only as good as its preprocessing.</>,
];

const Recap = () => (
  <Slide title="Recap">
    <ol className="space-y-3">
      {RECAP.map((r, i) => (
        <R key={i} as="li" at={i < 2 ? 0 : i < 5 ? 1 : 2} className="flex gap-5">
          <span className="w-8 text-right font-mono text-blue">{i + 1}.</span>
          <span>{r}</span>
        </R>
      ))}
    </ol>
    <R at={2} className="mt-8">
      <Box tone="purple" title="Next time: Episode 2">
        We open the hood on backprop and build <b>micrograd</b>, a tiny automatic differentiation engine, from scratch.
      </Box>
    </R>
  </Slide>
);

const Outro = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center bg-bg-2 text-center text-text">
    <div className="studio-grid absolute inset-0 opacity-60" />
    <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-blue/15 blur-3xl" />
    <div className="absolute right-1/4 -bottom-40 h-[600px] w-[600px] rounded-full bg-purple/15 blur-3xl" />
    <div className="relative flex flex-col items-center">
      <LogoMark size={150} />
      <h2 className="font-display mt-10 text-[96px] leading-none font-bold">Thanks for listening.</h2>
      <Wordmark className="mt-8 text-[38px]" />
      <p className="mt-10 text-[32px] text-muted">
        Subscribe so you don’t miss <b className="text-text">Episode 2: micrograd</b>.
      </p>
      <p className="mt-3 text-[26px] text-faint">
        {A} · {B} · slides and code at {site.url.replace(/^https?:\/\//, "")}
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
// Deck definition: order, build steps, speaker notes
// ─────────────────────────────────────────────────────────────────────────

const slides: SlideDef[] = [
  { id: "title", title: "Title", Component: Title, chapter: "Intro",
    notes: `${A}: Welcome to Two Bits Apart. Episode one of "Neural Networks to GPT".\n${B}: Today: how a computer reads a handwritten digit, and what happens between clicking PREDICT and seeing "7".` },
  { id: "agenda", title: "Today’s map", Component: Agenda,
    notes: "Three stops: a quick demo (the black box), theory (open the box), system design (put it behind an API).\nButtons on this slide jump straight to each section." },
  { id: "demo", title: "Live demo", Component: Demo, chapter: "Demo",
    notes: "Switch to the running app now (uvicorn main:app --reload).\nUpload 2–3 digits, including one that fails. Come back with the → key." },
  { id: "blackbox", title: "What you just saw: a black box", steps: 2, Component: BlackBox,
    notes: "Step 1: image in, '7' out, and we have no idea why.\nStep 2: inside the box: numbers, layers, probabilities. That's the episode." },
  { id: "part1", title: "Part 1: Theory", Component: Part1, chapter: "Part 1 · Theory" },
  { id: "pixels", title: "A computer sees numbers", steps: 3, Component: Pixels,
    notes: "The grid is live: draw on it. Hover a pixel to see its index in the flattened vector.\nToggle 28×28 to show real MNIST size: 784 inputs.\nGoal: learn f(x) ≈ y." },
  { id: "toolbox", title: "The ML toolbox", steps: 6, Component: Toolbox,
    notes: `${B} asks: why neural networks at all? Walk through the five options quickly; we'll build two of them.` },
  { id: "picture1", title: "Picture it (1/2)", steps: 6, Component: Picture1,
    notes: "Line → k-NN star → k-NN neighbourhood circle → tree branches." },
  { id: "picture2", title: "Picture it (2/2)", steps: 4, Component: Picture2,
    notes: "SVM: boundary → margin → support vectors. NN: input → hidden → output." },
  { id: "svm-vs-nn", title: "SVM vs neural network", steps: 2, Component: SvmVsNn },
  { id: "neuron", title: "The neuron: a weighted vote", steps: 3, Component: Neuron, chapter: "The neuron",
    notes: "Inputs → weights & bias → activation. Stress: weights and bias are the ONLY things that get learned." },
  { id: "byhand", title: "One neuron, by hand", steps: 4, Component: ByHand,
    notes: `Compute z together, out loud. Then ${B}'s challenge: flip x₁. Pause before revealing.` },
  { id: "neuron-live", title: "Neuron calculator (interactive)", Component: NeuronLive,
    notes: "Drag the sliders. Show: negative weight = red edge. Flip x₁ → z = −1.2 → ReLU silent. Switch to sigmoid: never fully silent." },
  { id: "activations", title: "Activation functions", steps: 2, Component: Activations },
  { id: "network", title: "Many neurons, layers", steps: 3, Component: Network,
    notes: "784 → 128 (ReLU) → 10 scores. Every line is one weight." },
  { id: "forward", title: "Forward propagation", steps: 3, Component: Forward, chapter: "Forward pass",
    notes: "Four lines = the entire prediction. Count parameters together: 101,770." },
  { id: "softmax", title: "Softmax", steps: 3, Component: Softmax },
  { id: "softmax-live", title: "Softmax playground (interactive)", Component: SoftmaxLive,
    notes: "Push the '7' score up: probability → 1, loss → 0. Mark '9' as the true class: loss jumps. Make all scores equal: 1/3 each." },
  { id: "pause1", title: "Pause and predict", steps: 2, Component: PauseOne,
    notes: `${B} asks the question; ${A} guesses before revealing. Answer: ~10%.` },
  { id: "loss", title: "Loss: how wrong are we?", steps: 3, Component: Loss, chapter: "Loss" },
  { id: "gd", title: "Gradient descent", steps: 3, Component: Gd, chapter: "Gradient descent" },
  { id: "gd-live", title: "Gradient descent playground (interactive)", Component: GdLive,
    notes: "η = 0.1 converges. η = 0.9 zig-zags. η = 1.0 oscillates forever between 0 and 6. η > 1 diverges. η = 0.01 crawls." },
  { id: "backprop", title: "The chain rule", steps: 3, Component: ChainRule, chapter: "Backprop" },
  { id: "backprop-net", title: "Backprop through our network", steps: 3, Component: BackpropNet,
    notes: "Output layer first, then hidden layer reusing δ⁽²⁾. That reuse is why it's efficient. Episode 2 (micrograd) automates exactly this." },
  { id: "loop", title: "The training loop", steps: 3, Component: Loop, chapter: "Training loop" },
  { id: "learned", title: "Did it actually learn?", steps: 2, Component: Learned },
  { id: "pause2", title: "Pause and predict, again", steps: 2, Component: PauseTwo,
    notes: "The bridge to Part 2: a real photo ≠ MNIST distribution." },
  { id: "part2", title: "Part 2: System design", Component: Part2, chapter: "Part 2 · System design" },
  { id: "architecture", title: "The architecture", steps: 3, Component: Architecture },
  { id: "api", title: "The API contract", steps: 2, Component: Api },
  { id: "preprocess", title: "Preprocessing must match training", steps: 2, Component: Preprocess },
  { id: "model-py", title: "model.py (NumPy)", Component: ModelPy,
    notes: "The forward pass in NumPy: exactly the four equations from earlier. No PyTorch." },
  { id: "main-py-1", title: "main.py (1/2)", Component: MainPy1,
    notes: "Highlighted lines: the inversion step. Without it a dark-on-light photo is out of distribution." },
  { id: "main-py-2", title: "main.py (2/2)", Component: MainPy2 },
  { id: "design", title: "Design decisions", steps: 2, Component: Design },
  { id: "recap", title: "Recap", steps: 3, Component: Recap, chapter: "Recap" },
  { id: "outro", title: "Thanks for listening", Component: Outro },
];

export const ep01Deck: Deck = {
  slug: "neural-networks-and-mnist",
  footer: "Two Bits Apart · Episode 1: Neural Networks and MNIST",
  slides,
};
