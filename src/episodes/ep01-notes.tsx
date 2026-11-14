"use client";

import { useState } from "react";
import { Code } from "@/components/Code";
import { M, MB } from "@/components/Math";
import { Callout, Card, Columns, Cue, Embed, Figure, Flow, H2, H3, Say, Toggle, Wiki } from "@/components/notes/blocks";
import { GradientDescent } from "@/components/widgets/GradientDescent";
import { NeuronCalculator } from "@/components/widgets/NeuronCalculator";
import { FlatVector, PixelGrid, sevenLarge, sevenSmall } from "@/components/widgets/PixelGrid";
import { SoftmaxPlayground } from "@/components/widgets/SoftmaxPlayground";
import { site } from "@/site.config";
import { ActivationPlot, NetworkDiagram, NeuronDiagram, PictureOne, PictureTwo } from "./ep01-diagrams";

const [A, B] = site.hosts;

function PixelPlayground() {
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
  const btn = "rounded-full border px-3 py-0.5 text-xs transition";
  return (
    <Figure caption="Draw on the grid (shift-drag erases). Hover a pixel to find it in the flattened vector.">
      <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-center">
        <div className="flex flex-col gap-3">
          <PixelGrid n={n} values={vals} onChange={setVals} hover={hover} onHover={setHover} showNumbers={nums} size={300} />
          <div className="flex flex-wrap items-center gap-1.5">
            {[false, true].map((b) => (
              <button
                key={String(b)}
                onClick={() => toggle(b)}
                className={`${btn} ${big === b ? "border-purple bg-purple/20" : "border-border-strong text-muted hover:bg-surface-2"}`}
              >
                {b ? "28×28" : "8×8"}
              </button>
            ))}
            {!big && (
              <button onClick={() => setNums((v) => !v)} className={`${btn} border-border-strong text-muted hover:bg-surface-2`}>
                {nums ? "hide" : "show"} values
              </button>
            )}
            <button onClick={() => setVals(new Array(n * n).fill(0))} className={`${btn} border-border-strong text-muted hover:bg-surface-2`}>
              clear
            </button>
          </div>
        </div>
        <div className="min-w-0 max-w-full text-[0.92em]">
          <div className="text-xs tracking-widest text-faint uppercase">flattened: {n * n} numbers</div>
          <div className="mt-2 max-w-full overflow-x-auto">
            <FlatVector values={vals} hover={hover} onHover={setHover} perRow={big ? 56 : 16} cell={big ? 5 : 16} />
          </div>
          <div className="mt-3 h-6 font-mono text-sm text-[#c08bff]">
            {hover !== null ? `x[${hover}] = ${vals[hover].toFixed(2)}` : <span className="text-faint">hover a pixel</span>}
          </div>
        </div>
      </div>
    </Figure>
  );
}

export function Ep01Notes() {
  return (
    <>
      <Say host={A}>Welcome to Two Bits Apart. This is episode one of “Neural Networks to GPT”.</Say>
      <Say host={B}>
        Today: how a computer reads a handwritten digit, and what happens between clicking PREDICT and seeing “7”.
      </Say>

      <H2 id="map">Today’s map</H2>
      <ol>
        <li>
          <Wiki to="demo">Demo</Wiki>: upload a digit, press PREDICT, see what comes back.
        </li>
        <li>
          <Wiki to="theory">Theory</Wiki>: from a single neuron to a trained network:{" "}
          <Wiki to="pixels">pixels</Wiki>, <Wiki to="neuron">neuron</Wiki>, <Wiki to="forward">forward pass</Wiki>,{" "}
          <Wiki to="loss">loss</Wiki>, <Wiki to="gd">gradient descent</Wiki>, <Wiki to="backprop">backprop</Wiki>,{" "}
          <Wiki to="loop">training loop</Wiki>.
        </li>
        <li>
          <Wiki to="system">System design</Wiki>: wrapping the trained model in a FastAPI service.
        </li>
      </ol>
      <Callout icon="❓" tone="purple" title="The question we answer">
        What exactly happens between “I clicked PREDICT” and “it’s a 7”?
      </Callout>

      {/* ───────────────────────────── Demo ───────────────────────────── */}
      <H2 id="demo">Demo: a black box</H2>
      <Cue>Switch to the running app. Upload two or three digits, including one that fails.</Cue>
      <Code className="mt-4 text-[0.82em]" code={`$ uvicorn main:app --reload   # → http://127.0.0.1:8000`} />
      <p>What you just saw: an image goes in, a digit comes out, and we have no idea why.</p>
      <Figure wide={false}>
        <Flow steps={["handwritten image", "???", <b key="7">7 · confidence 0.99</b>]} accent={[1]} />
      </Figure>
      <Toggle summary="What’s inside the box?">
        <p>
          Pixels become numbers, the numbers pass through layers, and the last layer turns into probabilities. That’s the
          whole episode:
        </p>
        <ul>
          <li>
            <b>Part 1</b> opens the box: neurons, loss, gradients.
          </li>
          <li>
            <b>Part 2</b> builds the door: an API that anyone’s browser can knock on.
          </li>
        </ul>
      </Toggle>

      {/* ──────────────────────────── Part 1 ──────────────────────────── */}
      <H2 id="theory">Part 1 · Theory: from pixels to prediction</H2>

      <H3 id="pixels">A computer does not see a 7. It sees numbers.</H3>
      <p>
        An MNIST image is <M>{String.raw`28 \times 28 =`}</M> <b>784</b> pixels. Each pixel is a number, from <M>0</M>{" "}
        (black) up to <M>1</M> (white). Flatten the grid row by row and you get one long vector:
      </p>
      <MB>{String.raw`x = [\,0,\,0,\,\dots,\,0.9,\,1.0,\,\dots,\,0\,]^\top \in \mathbb{R}^{784}`}</MB>
      <PixelPlayground />
      <p>
        Every image comes with a label <M>{String.raw`y \in \{0, 1, \dots, 9\}`}</M>. The goal is to learn a function{" "}
        <M>{String.raw`f(x) \approx y`}</M>.
      </p>

      <H3 id="toolbox">The ML toolbox: five ways to learn f</H3>
      <Say host={B}>Why neural networks at all?</Say>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>The idea</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Linear / logistic regression</td>
            <td>
              One weighted sum <M>{String.raw`w^\top x + b`}</M>, then a threshold. Draws a straight line between classes.
            </td>
          </tr>
          <tr>
            <td>k-Nearest Neighbours</td>
            <td>
              No training at all. Find the <M>k</M> most similar training images and let them vote.
            </td>
          </tr>
          <tr>
            <td>Decision tree / Random forest</td>
            <td>A flowchart of yes/no questions. A forest averages many trees.</td>
          </tr>
          <tr>
            <td>Support Vector Machine</td>
            <td>
              A linear model that picks the <span className="hl">widest-margin</span> boundary; kernels let it bend.
            </td>
          </tr>
          <tr>
            <td>Neural network</td>
            <td>Many weighted sums stacked in layers, with a nonlinearity between them.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Same job, same data. An SVM is one weighted sum with the widest margin; a neural network stacks many. We build those
        two.
      </p>
      <Embed width={1300} caption="Linear model, k-NN and a decision tree on the same toy data.">
        <PictureOne />
      </Embed>
      <Embed width={1300} caption="The two we will build: an SVM with its margin and support vectors, and a small network.">
        <PictureTwo />
      </Embed>
      <Columns>
        <Card title="SVM: one smart boundary" tone="blue">
          <ul>
            <li>Treats the 784 numbers as a point in space.</li>
            <li>
              Finds the boundary with the <span className="hl">largest gap</span> to each class.
            </li>
            <li>
              <b>Kernel trick:</b> bend the boundary without hand-made features.
            </li>
            <li>A strong baseline, and fast to train on small data.</li>
          </ul>
        </Card>
        <Card title="Neural network: learned features" tone="purple">
          <ul>
            <li>
              Starts from the same weighted sum <M>{String.raw`w^\top x + b`}</M>.
            </li>
            <li>Stacks layers, so early layers find strokes and later ones find shapes.</li>
            <li>Trained by nudging weights downhill.</li>
            <li>
              The same recipe scales <span className="hl">all the way to GPT</span>.
            </li>
          </ul>
        </Card>
      </Columns>

      <H3 id="neuron">The neuron: a weighted vote</H3>
      <Embed width={1100}>
        <NeuronDiagram />
      </Embed>
      <p>
        The inputs are the pixel values. Multiply each input by a <b>weight</b>, add a <b>bias</b>, and pass the result
        through an activation:
      </p>
      <MB>{String.raw`a = \sigma(w^\top x + b)`}</MB>
      <Callout icon="📌" tone="blue">
        The weights and bias are the <b>only</b> things the network learns.
      </Callout>

      <h4>One neuron, by hand</h4>
      <MB>{String.raw`x=\begin{pmatrix}1.0\\0.5\\-1.0\end{pmatrix},\quad w=\begin{pmatrix}0.8\\-0.4\\0.3\end{pmatrix},\quad b=0.1`}</MB>
      <MB>{String.raw`z = 0.8(1.0) + (-0.4)(0.5) + 0.3(-1.0) + 0.1 = 0.8 - 0.2 - 0.3 + 0.1 = \color{#c08bff}{0.4}`}</MB>
      <MB>{String.raw`a = \mathrm{ReLU}(0.4) = \color{#c08bff}{0.4}`}</MB>
      <Cue>Compute z together, out loud. Then {B.shortName}’s challenge. Pause before opening the answer.</Cue>
      <Callout icon="✏️" tone="amber" title="Try it">
        Flip the sign of <M>x_1</M>. What is <M>z</M>? What does ReLU output?
      </Callout>
      <Toggle summary="Answer">
        <p>
          <M>{String.raw`z = -0.8 - 0.2 - 0.3 + 0.1 = -1.2`}</M>, so ReLU gives <M>0</M>: the neuron stays silent.
        </p>
      </Toggle>

      <h4>Your turn: one neuron, live</h4>
      <Cue>
        Drag the sliders. A negative weight draws a red edge. Flip x₁: z = −1.2 and ReLU goes silent. Switch to sigmoid: it is
        never fully silent.
      </Cue>
      <Embed height={600}>
        <NeuronCalculator />
      </Embed>

      <h4>Activation functions: why not just stay linear?</h4>
      <Embed width={1100}>
        <div className="grid grid-cols-2 place-items-center gap-6 py-2">
          <div className="flex flex-col items-center">
            <ActivationPlot kind="relu" />
            <M>{String.raw`\mathrm{ReLU}(z) = \max(0, z)`}</M>
          </div>
          <div className="flex flex-col items-center">
            <ActivationPlot kind="sigmoid" />
            <M>{String.raw`\sigma(z) = \frac{1}{1+e^{-z}}`}</M>
          </div>
        </div>
      </Embed>
      <Callout icon="🧠" tone="purple" title="Why nonlinearity?">
        Stacked linear layers collapse into one linear map: <M>{String.raw`W_2(W_1x) = (W_2W_1)x`}</M>. The activation is
        what lets depth add power.
      </Callout>

      <H3 id="forward">Many neurons, layers: the forward pass</H3>
      <Embed width={1100}>
        <NetworkDiagram />
      </Embed>
      <p>
        784 inputs → 128 hidden neurons (ReLU) → 10 scores. Every neuron in one layer connects to every neuron in the next: a{" "}
        <b>fully connected</b> (MLP) layer, and every line is one weight. The whole prediction is four lines:
      </p>
      <MB>{String.raw`\begin{aligned} z^{(1)} &= W^{(1)}x + b^{(1)} & a^{(1)} &= \mathrm{ReLU}\big(z^{(1)}\big) \\ z^{(2)} &= W^{(2)}a^{(1)} + b^{(2)} & \hat y &= \mathrm{softmax}\big(z^{(2)}\big) \end{aligned}`}</MB>
      <table>
        <thead>
          <tr>
            <th>Tensor</th>
            <th>Shape</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><M>x</M></td><td><M>{String.raw`784 \times 1`}</M></td></tr>
          <tr><td><M>{String.raw`W^{(1)},\ b^{(1)}`}</M></td><td><M>{String.raw`128 \times 784,\ \ 128`}</M></td></tr>
          <tr><td><M>{String.raw`W^{(2)},\ b^{(2)}`}</M></td><td><M>{String.raw`10 \times 128,\ \ 10`}</M></td></tr>
          <tr><td><M>{String.raw`\hat y`}</M></td><td><M>{String.raw`10 \times 1`}</M></td></tr>
        </tbody>
      </table>
      <p>
        Count the parameters together: <M>{String.raw`784\cdot128 + 128 + 128\cdot10 + 10 =`}</M>{" "}
        <span className="text-gradient font-mono font-bold">101,770</span>.
      </p>

      <H3 id="softmax">Softmax: scores into probabilities</H3>
      <MB>{String.raw`\hat y_k = \frac{e^{z_k}}{\sum_j e^{z_j}}`}</MB>
      <p>A toy example with three classes:</p>
      <table className="font-mono">
        <thead>
          <tr>
            <th className="font-sans">class</th>
            <th>“7”</th>
            <th>“1”</th>
            <th>“9”</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="font-sans">score z</td><td>2.0</td><td>1.0</td><td>0.1</td></tr>
          <tr><td className="font-sans">eᶻ</td><td>7.39</td><td>2.72</td><td>1.11</td></tr>
          <tr className="hl"><td className="font-sans">probability</td><td>0.66</td><td>0.24</td><td>0.10</td></tr>
        </tbody>
      </table>
      <ul>
        <li>Probabilities are positive and sum to 1.</li>
        <li>
          Prediction = <M>{String.raw`\arg\max_k \hat y_k`}</M>; confidence = <M>{String.raw`\max_k \hat y_k`}</M>.
        </li>
      </ul>
      <Cue>
        Push the “7” score up: probability → 1, loss → 0. Mark “9” as the true class: the loss jumps. Make all scores equal:
        1/3 each.
      </Cue>
      <Embed height={600} caption="Softmax playground. Click a class to mark it as the true digit.">
        <SoftmaxPlayground />
      </Embed>

      <Callout icon="⏸️" tone="amber" title="Pause and predict">
        <Say host={B}>The weights are random. We feed in 10,000 test digits. What accuracy do you expect?</Say>
        <Toggle summary={`${A.shortName} guesses first, then open this`}>
          <ul>
            <li>
              About <span className="hl">10%</span>: no better than a coin with ten sides.
            </li>
            <li>Random weights give meaningless scores, so every digit is equally likely.</li>
            <li>
              <b>Training is the act of moving from 10% to about 97%.</b> How? Next.
            </li>
          </ul>
        </Toggle>
      </Callout>

      <H3 id="loss">Loss: how wrong are we?</H3>
      <MB>{String.raw`L = -\log \hat y_{y}`}</MB>
      <p>
        <b>Cross-entropy:</b> take the probability the network gave to the <i>true</i> class, and take minus its log.
      </p>
      <ul>
        <li>
          True digit “7”, network says <M>0.66</M>: <M>{String.raw`L = -\ln 0.66 \approx \color{#c08bff}{0.42}`}</M>
        </li>
        <li>
          Network says <M>0.10</M>: <M>{String.raw`L \approx \color{#c08bff}{2.3}`}</M>
        </li>
        <li>
          Network says <M>0.99</M>: <M>{String.raw`L \approx \color{#c08bff}{0.01}`}</M>
        </li>
      </ul>
      <Callout icon="🤔" tone="blue" title="Why not use accuracy?">
        Accuracy jumps in steps, so it gives no direction to move. Cross-entropy is smooth, so we can follow its slope.
      </Callout>

      <H3 id="gd">Gradient descent: walk downhill</H3>
      <MB>{String.raw`w \leftarrow w - \eta\, \frac{\partial L}{\partial w}`}</MB>
      <p>
        Toy loss <M>{String.raw`L = (w-3)^2`}</M>, learning rate <M>{String.raw`\eta = 0.1`}</M>, start at{" "}
        <M>{String.raw`w_0 = 0`}</M>:
      </p>
      <ul>
        <li>
          slope <M>{String.raw`= 2(0-3) = -6`}</M>, so <M>{String.raw`w_1 = 0 + 0.1\cdot 6 = \color{#c08bff}{0.6}`}</M>
        </li>
        <li>
          slope <M>{String.raw`= 2(0.6-3) = -4.8`}</M>, so <M>{String.raw`w_2 = \color{#c08bff}{1.08}`}</M>
        </li>
        <li>Steps shrink as the slope flattens near the minimum.</li>
      </ul>
      <p>
        The <b>learning rate</b> <M>\eta</M> matters: too big overshoots, too small crawls.
      </p>
      <Cue>η = 0.1 converges. 0.9 zig-zags. 1.0 bounces between 0 and 6 forever. Above 1 it diverges. 0.01 crawls.</Cue>
      <Embed height={600} caption="Walk downhill yourself.">
        <GradientDescent />
      </Embed>

      <H3 id="backprop">Backpropagation</H3>
      <p>
        A network has 101,770 weights, and we need the slope for <i>every</i> one. It starts with the chain rule:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a}\cdot\frac{\partial a}{\partial w}`}</MB>
      <Callout icon="🔗" tone="neutral" title="A tiny chain">
        <p>
          <M>{String.raw`a = wx,\quad L=(a-t)^2,\quad x=2,\ w=1,\ t=5`}</M>
        </p>
        <ul>
          <li>
            Forward: <M>{String.raw`a = 1\cdot 2 = 2,\quad L = (2-5)^2 = 9`}</M>
          </li>
          <li>
            <M>{String.raw`\partial L/\partial a = 2(a-t) = -6,\qquad \partial a/\partial w = x = 2`}</M>
          </li>
          <li>
            <M>{String.raw`\partial L/\partial w = -6\cdot 2 = \color{#c08bff}{-12}`}</M>, so{" "}
            <M>{String.raw`w \leftarrow 1 - 0.1(-12) = \color{#c08bff}{2.2}`}</M>, which moves <M>a</M> toward <M>t</M>.
          </li>
        </ul>
      </Callout>
      <p>
        <b>Backprop is the chain rule applied layer by layer, reusing what’s already computed.</b> Through our network, the
        gradients flow backward:
      </p>
      <Figure wide={false}>
        <Flow steps={[<M key="a">x</M>, <M key="b">{"z^{(1)}"}</M>, <M key="c">{"a^{(1)}"}</M>, <M key="d">{"z^{(2)}"}</M>, <M key="e">{String.raw`\hat y`}</M>, <M key="f">L</M>]} accent={[5]} />
        <div className="mt-3 text-center text-sm text-[#c08bff]">← gradients flow backward</div>
      </Figure>
      <MB>{String.raw`\begin{aligned} \delta^{(2)} &= \hat y - y & \delta^{(1)} &= \big(W^{(2)\top}\delta^{(2)}\big) \odot \mathbf{1}[z^{(1)}>0] \\ \tfrac{\partial L}{\partial W^{(2)}} &= \delta^{(2)}\, a^{(1)\top} & \tfrac{\partial L}{\partial W^{(1)}} &= \delta^{(1)}\, x^\top \\ \tfrac{\partial L}{\partial b^{(2)}} &= \delta^{(2)} & \tfrac{\partial L}{\partial b^{(1)}} &= \delta^{(1)} \end{aligned}`}</MB>
      <p>
        Output layer first, then the hidden layer reuses <M>{String.raw`\delta^{(2)}`}</M>. That reuse is why it’s efficient.
        Softmax plus cross-entropy gives the clean result <M>{String.raw`\hat y - y`}</M>; we verify it in NumPy later.
      </p>
      <Callout icon="🔜" tone="purple">
        Episode 2 (micrograd) automates exactly this.
      </Callout>

      <H3 id="loop">The training loop</H3>
      <Figure wide={false}>
        <Flow steps={["1. Forward", "2. Loss", "3. Backward", "4. Update"]} accent={[2, 3]} />
        <div className="mt-3 text-center text-sm text-muted">↻ repeat</div>
      </Figure>
      <ul>
        <li>Shuffle the 60,000 training images and slice them into mini-batches (e.g. 64).</li>
        <li>
          One <b>epoch</b> is one pass over all the data; train for several epochs.
        </li>
        <li>
          Watch the loss fall and the <i>test</i> accuracy rise.
        </li>
      </ul>

      <H3 id="learned">Did it actually learn?</H3>
      <Columns>
        <Card title="Honest evaluation" tone="blue">
          <ul>
            <li>60,000 images to train.</li>
            <li>
              10,000 <i>unseen</i> images to test.
            </li>
            <li>Report test accuracy, never training accuracy alone.</li>
          </ul>
        </Card>
        <Card title="SVM vs MLP" tone="purple">
          <p>Both land in the high 90s (≈ 97–98%) on MNIST.</p>
          <p className="text-muted">So why neural nets? Because the same recipe keeps scaling when SVMs stop.</p>
        </Card>
      </Columns>

      <Callout icon="⏸️" tone="amber" title="Pause and predict, again">
        <Say host={B}>
          You photograph a <b>7</b> written in black pen on white, lined paper, and upload it. Will our 97% model get it right?
        </Say>
        <Toggle summary="Open the answer">
          <ul>
            <li>
              <span className="hl">Maybe not!</span> MNIST digits are white on black, centred, 28×28.
            </li>
            <li>The model only knows the data distribution it was trained on.</li>
            <li>
              So serving a model is mostly about <b>matching the preprocessing</b>. That is Part 2.
            </li>
          </ul>
        </Toggle>
      </Callout>

      {/* ──────────────────────────── Part 2 ──────────────────────────── */}
      <H2 id="system">Part 2 · System design: the model behind an API</H2>

      <H3 id="architecture">The architecture</H3>
      <Figure>
        <div className="grid items-center gap-3 text-sm md:grid-cols-[1fr_auto_1.2fr_auto_1fr]">
          <div className="rounded-xl border border-blue/50 bg-blue/10 p-3 text-center">
            <div className="font-display font-bold">Browser UI</div>
            <div className="mt-1 text-muted">upload image · PREDICT · digit + bars</div>
          </div>
          <div className="text-center font-mono text-xs text-muted">
            POST /predict →<br />← JSON
          </div>
          <div className="rounded-xl border border-purple/60 bg-purple/10 p-3 text-center">
            <div className="font-display font-bold">FastAPI</div>
            <div className="mt-2 flex flex-col gap-1.5">
              {["validate file", "preprocess", "forward pass"].map((s) => (
                <span key={s} className="rounded-md border border-border-strong bg-bg-2 py-1">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center font-mono text-xs text-muted">← load once</div>
          <div className="rounded-xl border border-border-strong bg-surface p-3 text-center">
            <div className="font-display font-bold">model.npz</div>
            <div className="mt-1">
              <M>{String.raw`W^{(1)}, b^{(1)}, W^{(2)}, b^{(2)}`}</M>
            </div>
          </div>
        </div>
      </Figure>
      <p>
        The UI sends the image as multipart form data; the weights are loaded <i>once</i> at startup. The response holds the
        predicted digit, the confidence, and all 10 probabilities.
      </p>

      <H3 id="api">The API contract</H3>
      <ul>
        <li>
          <code>GET /health</code>: is the service up?
        </li>
        <li>
          <code>POST /predict</code>: image in, digit out. Request is <code>multipart/form-data</code>, field name{" "}
          <code>file</code>.
        </li>
        <li>
          <code>GET /docs</code>: free interactive docs from FastAPI.
        </li>
      </ul>
      <Code
        className="mt-4 text-[0.82em]"
        filename="response.json"
        code={`{
  "digit": 7,
  "confidence": 0.99,
  "probabilities": [0.00, 0.00, 0.01, 0.00, 0.00,
                    0.00, 0.00, 0.99, 0.00, 0.00]
}`}
      />

      <H3 id="preprocess">Preprocessing must match training</H3>
      <Figure>
        <Flow steps={["upload", "grayscale", "resize 28×28", "invert if dark-on-light", "÷255", "flatten 784"]} accent={[3]} />
      </Figure>
      <ul>
        <li>
          Same scaling as training: <M>{String.raw`[0, 1]`}</M>, float32.
        </li>
        <li>
          MNIST is <span className="hl">white digit on black</span>; most uploads are the opposite, so invert.
        </li>
        <li>Centre and crop to the digit; MNIST digits are centred.</li>
      </ul>

      <H3 id="code">The code</H3>
      <h4>model.py: the forward pass in NumPy</h4>
      <p>
        The same four equations from the <Wiki to="forward">forward pass</Wiki>. No framework: matrix multiply, max, exp,
        divide. <code>p</code> is the dict loaded from <code>model.npz</code>.
      </p>
      <Code
        filename="model.py"
        className="mt-4 text-[0.82em]"
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
      <h4>main.py: setup, preprocessing and the endpoint</h4>
      <p>The highlighted lines are the inversion step. Without them a dark-on-light photo is out of distribution.</p>
      <Code
        filename="main.py"
        className="mt-4 text-[0.82em]"
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
      <p>
        Run it with <code>uvicorn main:app --reload</code>, then open <code>/docs</code>.
      </p>

      <H3 id="design">Design decisions worth saying out loud</H3>
      <Columns>
        <Card title="Do" tone="green">
          <ul>
            <li>Load the model once, not per request.</li>
            <li>Validate the type and size of uploads.</li>
            <li>Return all probabilities, so the UI can show uncertainty.</li>
            <li>
              Keep preprocessing in <i>one</i> function shared with training.
            </li>
          </ul>
        </Card>
        <Card title="Watch out for" tone="amber">
          <ul>
            <li>Training/serving skew (inverted colours!).</li>
            <li>Overconfident wrong answers: softmax is not calibrated.</li>
            <li>CORS when the UI and API run on different ports.</li>
          </ul>
        </Card>
      </Columns>

      {/* ──────────────────────────── Recap ───────────────────────────── */}
      <H2 id="recap">Recap</H2>
      <ol>
        <li>
          An image is <M>784</M> numbers; the network maps them to <M>10</M> probabilities.
        </li>
        <li>
          <b>Forward:</b> <M>{String.raw`z = Wx + b`}</M>, activation, repeat, softmax.
        </li>
        <li>
          <b>Loss:</b> cross-entropy measures how wrong we are.
        </li>
        <li>
          <b>Backprop:</b> the chain rule gives every weight’s slope.
        </li>
        <li>
          <b>Gradient descent:</b> nudge the weights downhill, repeat.
        </li>
        <li>
          <b>Serving:</b> an API is only as good as its preprocessing.
        </li>
      </ol>
      <Callout icon="🔜" tone="purple" title="Next time: Episode 2">
        We open the hood on backprop and build <a href="../micrograd/">micrograd</a>, a tiny automatic differentiation engine,
        from scratch.
      </Callout>
      <Say host={A}>Thanks for listening.</Say>
    </>
  );
}
