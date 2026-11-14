"use client";

import Link from "next/link";
import { useState } from "react";
import { Code } from "@/components/Code";
import { M, MB } from "@/components/Math";
import { Callout, Card, Cell, Columns, Cue, Embed, Figure, Flow, H2, H3, Say, Toggle, Wiki } from "@/components/notes/blocks";
import { GradientDescent } from "@/components/widgets/GradientDescent";
import { NeuronCalculator } from "@/components/widgets/NeuronCalculator";
import { FlatVector, PixelGrid, sevenLarge, sevenSmall } from "@/components/widgets/PixelGrid";
import { SoftmaxPlayground } from "@/components/widgets/SoftmaxPlayground";
import { site } from "@/site.config";
import { BlameDiagram } from "./ep01-backprop";
import { MinimaPlot } from "./ep01-minima";
import { AnnotatedNetwork, LayersDiagram, NeuronZoom, WeightBiasDemo } from "./ep01-annotated-network";
import { ActivationPlot } from "./ep01-diagrams";

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
      <Say host={A}>Welcome to Two Bits Apart. This is episode one of “Neural Networks to GPT”. Hindesh, here’s today’s question: you show a computer a photo of a handwritten digit. How does it work out which digit it is?</Say>
      <Say host={B}>Short answer: a neural network. So today we’ll cover what a neural network actually is, why it beats writing the rules by hand, how it differs from classical machine learning, and then we build one and watch it learn.</Say>

      <H2 id="map">Today’s map</H2>
      <ol>
        <li>
          <Wiki to="demo">Demo</Wiki>: upload a digit, press PREDICT, see what comes back.
        </li>
        <li>
          <Wiki to="theory">Theory</Wiki>: <Wiki to="pixels">pixels</Wiki>,{" "}
          <Wiki to="approach">rules vs classical ML vs neural nets</Wiki>,{" "}
          <Wiki to="what-is-nn">what a neural network is</Wiki>, and then the parts that make one work: <Wiki to="neuron">neuron</Wiki>, <Wiki to="forward">forward pass</Wiki>,{" "}
          <Wiki to="loss">loss</Wiki>, <Wiki to="gd">gradient descent</Wiki>, <Wiki to="backprop">backprop</Wiki>,{" "}
          <Wiki to="loop">training loop</Wiki>.
        </li>
        <li>
          <Wiki to="build">Build it</Wiki>: code the whole network in a Jupyter notebook, first using only NumPy, then
          again in PyTorch.
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
      <Say host={A}>Before any theory, show me it working.</Say>
      <Say host={B}>Here’s the app: upload a digit, hit PREDICT, and see what comes back.</Say>
      <Cue>Switch to the running app. Upload two or three digits, including one that fails.</Cue>
      <Code className="mt-4 text-[0.82em]" code={`$ uvicorn main:app --reload   # → http://127.0.0.1:8000`} />
      <p>What you just saw: an image goes in, a digit comes out, and we have no idea why.</p>
      <Figure wide={false}>
        <Flow steps={["handwritten image", "???", <b key="7">7 · confidence 0.99</b>]} accent={[1]} />
      </Figure>
      <Say host={A}>So what’s actually inside that box?</Say>
      <Say host={B}>Pixels become numbers, the numbers go through layers, and the last layer turns into probabilities.</Say>
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
            <b>Part 2</b> builds the box ourselves, in NumPy, then again in PyTorch.
          </li>
          <li>
            <b>Part 3</b> builds the door: an API that anyone’s browser can knock on.
          </li>
        </ul>
      </Toggle>

      {/* ──────────────────────────── Part 1 ──────────────────────────── */}
      <H2 id="theory">Part 1 · Theory: from pixels to prediction</H2>

      <H3 id="pixels">A computer does not see a 7. It sees numbers.</H3>
      <Say host={A}>When the computer looks at this 7, what does it actually see?</Say>
      <Say host={B}>Not a 7. It sees 784 numbers, one per pixel, from 0 for black to 1 for white.</Say>
      <p>
        An MNIST image is <M>{String.raw`28 \times 28 =`}</M> <b>784</b> pixels. Each pixel is a number, from <M>0</M>{" "}
        (black) up to <M>1</M> (white). Flatten the grid row by row and you get one long vector:
      </p>
      <MB>{String.raw`x = [\,0,\,0,\,\dots,\,0.9,\,1.0,\,\dots,\,0\,]^\top \in \mathbb{R}^{784}`}</MB>
      <PixelPlayground />
      <p>
        Every image comes with a label <M>{String.raw`t \in \{0, 1, \dots, 9\}`}</M> (t for “target”, the true digit). The
        goal is to learn a function <M>{String.raw`f(x) \approx t`}</M>.
      </p>

      <H3 id="approach">Three ways to teach a computer to read a 7</H3>
      <Say host={A}>So we have 784 numbers. How do we get from those to “7”?</Say>
      <Say host={B}>There are three ways: write the rules by hand, classical machine learning, or a neural network. Only the last one learns what to look for by itself.</Say>

      <h4>1. Write the rules yourself</h4>
      <p>
        The obvious idea is ordinary programming: “if there’s a horizontal bar at the top and a diagonal stroke going down
        to the left, it’s a 7”. Then you meet real handwriting. Some people cross their 7s, some slant them, some leave a
        gap. Every rule needs exceptions, and every exception needs more rules. Nobody has managed to write down, by hand,
        what makes a 7 a 7.
      </p>

      <h4>2. Classical machine learning</h4>
      <p>
        Machine learning flips the problem. Instead of writing the rules, we give the computer many examples with the answers
        (60,000 labelled digits) and let it find the rule itself.
      </p>
      <Figure>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-center">
            <div className="mb-2 text-xs tracking-widest text-faint uppercase">Traditional programming</div>
            <Flow steps={["rules + data", "program", "answers"]} />
          </div>
          <div className="text-center">
            <div className="mb-2 text-xs tracking-widest text-faint uppercase">Machine learning</div>
            <Flow steps={["data + answers", "learning", "rules"]} accent={[1, 2]} />
          </div>
        </div>
      </Figure>
      <p>
        Classical methods (logistic regression, k-NN, decision trees, SVMs) work this way, and they do well on MNIST. They
        have one big limit: <b>a person still decides what the model looks at</b>. Either it works on the raw pixels with
        one fixed kind of boundary, or someone hand-designs <i>features</i> first: “how many loops?”, “how much ink in the
        top third?”. The algorithm learns how to <i>weigh</i> those features. It never invents new ones. Want a refresher
        on the methods themselves? <Link href="/basics/">Basics of ML</Link> covers them on one page.
      </p>

      <h4>3. A neural network</h4>
      <p>
        A neural network takes the last step: it gets the raw pixels and learns the features <i>as well as</i> the
        decision. Nobody tells it to look for loops or bars. If those help, it finds them.
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Rules by hand</th>
            <th>Classical ML</th>
            <th>Neural network</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Who decides what to look for?</td>
            <td>You</td>
            <td>You (features)</td>
            <td className="hl">The network</td>
          </tr>
          <tr>
            <td>Who decides how to combine it?</td>
            <td>You</td>
            <td>The algorithm</td>
            <td className="hl">The network</td>
          </tr>
          <tr>
            <td>What it learns from</td>
            <td>Nothing</td>
            <td>Labelled examples</td>
            <td>Labelled examples</td>
          </tr>
          <tr>
            <td>Gets better with more data?</td>
            <td>No</td>
            <td>Up to a point</td>
            <td>Keeps scaling, all the way to GPT</td>
          </tr>
        </tbody>
      </table>
      <Cue>Keep the classical methods to this one comparison. The details are on the Basics page, not on air.</Cue>

      <H3 id="what-is-nn">So what exactly is a neural network?</H3>
      <Say host={A}>So what exactly is a neural network?</Say>
      <Say host={B}>Forget the brain metaphor: it’s one big function with about a hundred thousand adjustable knobs. Pixels go in, ten scores come out.</Say>
      <p>
        Strip away the brain metaphor and a neural network is <b>one big function with adjustable knobs</b>. It takes 784
        numbers in and puts 10 numbers out, one score per digit. The knobs are the <b>weights</b> and <b>biases</b>,
        together called <b>parameters</b>, and our network has 109,386 of them. Learning means turning those knobs until
        the outputs are right.
      </p>
      <Figure caption="The network we build in this episode: 784 inputs, two hidden layers of 128 and 64 neurons, 10 outputs. Only a few nodes per layer are drawn.">
        <AnnotatedNetwork />
      </Figure>

      <h4 id="layers">What exactly is a layer?</h4>
      <Say host={A}>You keep saying layers. What is a layer?</Say>
      <Say host={B}>A row of neurons working side by side on the same inputs, handing their results on to the next row.</Say>
      <p>
        A <b>layer</b> is a row of neurons that all do their work at the same time, on the same inputs. Neurons inside a
        layer never talk to each other; each one only reads from the layer before it and sends its number to the layer
        after it. So a layer takes in a list of numbers and hands on a new list of numbers:
      </p>
      <ul>
        <li>
          <b>Input layer (x):</b> not really neurons that compute anything. It just holds the 784 pixel values.
        </li>
        <li>
          <b>Hidden layers (y, z):</b> everything in between. “Hidden” only means you never see their numbers directly: you
          put in a picture and read out an answer, and these are the steps in the middle. This is where the features get
          built, each layer on top of the one before.
        </li>
        <li>
          <b>Output layer (o):</b> the answer, one neuron per possible digit.
        </li>
      </ul>
      <p>
        When people say <b>deep</b> learning, “deep” just means many hidden layers stacked up.
      </p>

      <h4 id="how-many-layers">How many layers do we need?</h4>
      <Say host={A}>How do you decide how many layers to use?</Say>
      <Say host={B}>There’s no formula. Input and output are fixed by the problem; the hidden layers are our choice. Start small, and only add more if accuracy improves.</Say>
      <p>
        The input and output layers are fixed by the problem. The number of <i>hidden</i> layers is up to us, and there’s
        no formula for it. It’s a design choice, settled by trying a few and measuring:
      </p>
      <ul>
        <li>
          <b>In theory one hidden layer is enough.</b> A network with a single, wide enough hidden layer can approximate
          any reasonable function. In practice it might need to be enormously wide.
        </li>
        <li>
          <b>More layers build features out of features.</b> Strokes, then parts, then digits. Doing it in steps usually
          needs far fewer neurons than doing it all in one giant layer.
        </li>
        <li>
          <b>Too many has a cost.</b> Every extra layer is more weights, slower training, and on a small, simple dataset
          more chance to memorise instead of learn.
        </li>
        <li>
          <b>Start small, then grow.</b> Begin with one or two hidden layers, check accuracy on images the network hasn’t
          trained on, and only add layers if that number improves.
        </li>
      </ul>
      <Callout plain icon="🔢" tone="blue" title="For MNIST">
        Handwritten digits are a fairly easy problem: one or two hidden layers already reach the high 90s. We use two, so
        you can see one layer feeding another. Harder problems need far deeper networks. GPT-3, for example, stacks 96
        layers.
      </Callout>

      <h4>Why do the layers get smaller: 784 → 128 → 64 → 10?</h4>
      <Say host={A}>Why do the layers get smaller? Why throw neurons away? Wouldn’t more be better?</Say>
      <Say host={B}>Most pixels are empty background. Squeezing forces the network to keep only what helps tell digits apart.</Say>
      <p>
        Only two of those numbers are forced on us. <b>784</b> is fixed by the image (28 × 28 pixels), and <b>10</b> is
        fixed by the question (digits 0 to 9). The hidden sizes, 128 and 64, are <i>our</i> choice. They’re design
        decisions, not laws, and we picked a funnel on purpose:
      </p>
      <ul>
        <li>
          <b>Most of the 784 numbers are wasted space.</b> In a typical MNIST digit only about a fifth of the pixels carry any
          ink; the rest is black background. Some pixels near the corners are black in every single training image, so
          they carry no information at all. And neighbouring pixels mostly say the same thing.
        </li>
        <li>
          <b>Squeezing forces a summary.</b> 128 numbers can’t copy 784 pixels one for one, so the first layer has to keep
          what helps tell digits apart (where the strokes are) and drop the rest. The next layer summarises again, into
          64 numbers, before the last one turns that into 10 digit scores. Each step is a smaller, more useful description
          of the same image.
        </li>
        <li>
          <b>Width costs weights.</b> Every neuron has one weight per input. A first hidden layer as wide as the image
          would need <M>{String.raw`784 \times 784 = 614{,}656`}</M> weights on its own, more than five times our whole network. That
          is slower to train, and more room to simply memorise the training images instead of learning digits.
        </li>
        <li>
          <b>Too narrow loses information.</b> Squeeze everything through, say, 2 neurons and the network has to describe
          every digit with just two numbers. That isn’t enough to keep ten digits apart, and accuracy drops hard.
        </li>
      </ul>
      <Callout icon="🎛️" tone="neutral" title="So why exactly 128 and 64?">
        No deep reason: they’re a common, comfortable size for MNIST, and powers of two are just a habit. Try 256 → 128 or
        64 → 32 and you’ll get roughly similar accuracy. Picking these sizes is part of designing a network, and we’ll play with
        them when we train it.
      </Callout>
      <p>It is built from three ideas, and the rest of Part 1 takes them one at a time:</p>
      <ol>
        <li>
          <b>The neuron:</b> a tiny unit that takes a weighted sum of its inputs and decides how strongly to fire.{" "}
          <Wiki to="neuron">The neuron</Wiki>
        </li>
        <li>
          <b>Layers:</b> many neurons side by side, with layers stacked so each one builds on the one before.{" "}
          <Wiki to="forward">Forward pass</Wiki>
        </li>
        <li>
          <b>Learning:</b> measure how wrong the output is, work out which way to turn every knob, nudge them all, repeat.{" "}
          <Wiki to="loss">Loss</Wiki> → <Wiki to="gd">gradient descent</Wiki> → <Wiki to="backprop">backprop</Wiki>
        </li>
      </ol>
      <Figure>
        <Flow steps={["784 pixels", "small strokes", "parts: bar, curve, diagonal", "10 digit scores"]} accent={[1, 2]} />
      </Figure>
      <p>
        One way to picture how it reads a 7: early neurons react to small strokes and edges, later ones combine those into
        parts like a top bar or a diagonal, and the last layer adds up the evidence for each digit.
      </p>
      <Callout icon="⚠️" tone="amber" title="Honest caveat">
        That picture is an intuition, not a guarantee. What a trained network’s hidden neurons respond to is usually messier
        than “bar” or “loop”, and we never tell it which features to learn.
      </Callout>
      <Callout icon="🧠" tone="neutral" title="Why “neural”?">
        The name comes from a loose analogy with brain cells, which receive signals, weigh them up and fire. The analogy
        stops there. Everything inside is multiplication, addition and a simple nonlinearity, as we’re about to see.
      </Callout>

      <H3 id="neuron">The neuron: a weighted vote</H3>
      <Say host={A}>Show me one of these neurons. What happens inside one of those circles?</Say>
      <Say host={B}>Two things: it adds up its inputs, each multiplied by a weight, and then an activation function decides whether it fires.</Say>
      <p>
        Take the very first neuron of hidden layer 1, <M>y_1</M>. In the network picture it’s one circle. Zoom in, and that
        one circle does two things, in order:
      </p>
      <Figure caption="One circle in the network, zoomed in. Σ (the weighted sum) and σ (the activation function, here ReLU) are two steps inside the same neuron, not two neurons.">
        <NeuronZoom />
      </Figure>
      <ol>
        <li>
          <b>Σ, add up.</b> Multiply every input pixel by its own <b>weight</b> and add them all. Σ is just the maths sign
          for “sum”.
        </li>
        <li>
          <b>σ(Σ + b), the activation function.</b> Add the neuron’s own <b>bias</b> <M>b_1</M>, then apply σ. Ours is ReLU: if
          the result is positive, pass it on; if it’s negative, output 0 (the neuron stays silent).
        </li>
      </ol>
      <p>
        Whatever comes out <i>is</i> <M>y_1</M>: one number, which goes on to every neuron in layer <M>z</M>.
      </p>
      <MB>{String.raw`y_1 = \sigma\big(\underbrace{w_1x_1 + w_2x_2 + \dots + w_{784}x_{784}}_{\Sigma} + b_1\big), \qquad \sigma = \mathrm{ReLU}`}</MB>
      <p>
        <M>y_2</M> does exactly the same with its <i>own</i> 784 weights and its own bias, and so on up to{" "}
        <M>{String.raw`y_{128}`}</M>. Stack all 128 of them and you get the first line of the{" "}
        <Wiki to="forward">forward pass</Wiki>: <M>{String.raw`y = \mathrm{ReLU}(W_1x + b_1)`}</M>, where row 1 of{" "}
        <M>W_1</M> holds <M>y_1</M>’s weights.
      </p>
      <h4>Weight, bias, activation function: what each one does</h4>
      <Say host={A}>What exactly are a weight, a bias and an activation function?</Say>
      <Say host={B}>Weight: how much each input matters. Bias: how easily the neuron fires. Activation: what it passes on.</Say>
      <Callout plain icon="⚖️" tone="amber" title="Weight: how much one input matters, and which way">
        <p>
          Every connection into a neuron has its own weight, so <M>y_1</M> has 784 of them, one per pixel.{" "}
          <b>Positive</b> means “ink here is evidence <i>for</i> me”, <b>negative</b> means “ink here is evidence{" "}
          <i>against</i> me”, and <b>near zero</b> means “I don’t care about this pixel”. Because there is one weight per
          pixel, you can draw a neuron’s weights as a picture of what it’s looking for.
        </p>
      </Callout>
      <Callout plain icon="🎚️" tone="purple" title="Bias: how easily the neuron fires">
        <p>
          One extra number per neuron, added after the weighted sum, that doesn’t depend on the image at all. It sets the
          neuron’s threshold. A large <b>negative</b> bias means “I need a lot of evidence before I fire”; a{" "}
          <b>positive</b> bias means “I fire easily”. Without it, a blank image (all zeros) would always give exactly 0.
        </p>
      </Callout>
      <Callout plain icon="⚡" tone="blue" title="Activation function: what the neuron passes on">
        <p>
          The rule applied to <M>{String.raw`\Sigma + b`}</M> to get the neuron’s output. Ours is ReLU: a negative result
          becomes 0 (the neuron stays silent), a positive result passes through unchanged (it fires, and the stronger the
          evidence, the bigger the number). It’s also what makes depth worth having; more on that in{" "}
          <Wiki to="activations">activation functions</Wiki>.
        </p>
        <p>
          The rule is the <b>same for every neuron in a layer</b>, but it doesn’t have to be the same across layers: each
          layer can have its own. For MNIST we use ReLU in both hidden layers simply because it works well here, and the
          output layer uses a different one, <Wiki to="softmax">softmax</Wiki>.
        </p>
      </Callout>
      <p>
        Here are all three working together. This made-up neuron looks for <b>a bar across the top</b>: positive weights
        along the top row, negative weights two rows down, and a bias of −3. Same weights, same bias, two different
        digits:
      </p>
      <Figure caption="A hand-made “top-bar detector”. Real trained weights are messier, but they work exactly like this.">
        <WeightBiasDemo />
      </Figure>
      <p>
        The 7’s top bar lands on six positive weights, so <M>\Sigma</M> is large, clears the bias, and the neuron fires.
        The 1 touches just one of them; the bias pulls it below zero, and ReLU silences it. That’s the job of each part:
        the weights decide <i>what</i> to look for, the bias decides <i>how much</i> is enough, and the activation decides{" "}
        <i>what to pass on</i>.
      </p>
      <Callout icon="📌" tone="blue">
        The weights and biases are the <b>only</b> things the network learns. Nobody hand-makes a top-bar detector;
        training finds whatever weights work.
      </Callout>

      <h4>One neuron, by hand</h4>
      <Say host={A}>Can we do one by hand?</Say>
      <Say host={B}>Sure: three inputs, three weights and a bias. Let’s work it out.</Say>
      <p>A tiny neuron <M>y_1</M> with just three inputs:</p>
      <MB>{String.raw`x=\begin{pmatrix}1.0\\0.5\\-1.0\end{pmatrix},\quad w=\begin{pmatrix}0.8\\-0.4\\0.3\end{pmatrix},\quad b_1=0.1`}</MB>
      <MB>{String.raw`\begin{aligned} \Sigma &= x_1w_1 + x_2w_2 + x_3w_3 = (1.0)(0.8) + (0.5)(-0.4) + (-1.0)(0.3) = 0.8 - 0.2 - 0.3 = 0.3 \\ \Sigma + b_1 &= 0.3 + 0.1 = 0.4 \\ y_1 &= \sigma(\Sigma + b_1) = \mathrm{ReLU}(0.4) = \color{#c08bff}{0.4} \end{aligned}`}</MB>
      <Cue>Compute Σ together, out loud. Then {A.shortName}’s challenge. Pause before opening the answer.</Cue>
      <Say host={A}>What if I flip the sign of x₁?</Say>
      <Callout icon="✏️" tone="amber" title="Try it">
        Flip the sign of <M>x_1</M>. What are <M>\Sigma</M> and <M>{String.raw`\Sigma + b_1`}</M>? What does ReLU output?
      </Callout>
      <Toggle summary={`${B.shortName}’s answer`}>
        <Say host={B}>The sum goes negative, ReLU outputs 0, and the neuron stays silent.</Say>
        <p>
          <M>{String.raw`\Sigma = -0.8 - 0.2 - 0.3 = -1.3`}</M>, so <M>{String.raw`\Sigma + b_1 = -1.2`}</M> and ReLU gives{" "}
          <M>0</M>: the neuron stays silent.
        </p>
      </Toggle>

      <h4>Your turn: one neuron, live</h4>
      <Cue>
        Drag the sliders. A negative weight draws a red edge. Flip x₁: Σ + b₁ = −1.2 and ReLU goes silent. Switch to sigmoid: it is
        never fully silent.
      </Cue>
      <Embed height={600}>
        <NeuronCalculator />
      </Embed>

      <h4 id="activations">Activation functions: why not just stay linear?</h4>
      <Say host={A}>Why do we need an activation function at all? Why not just keep adding things up?</Say>
      <Say host={B}>Without it, stacking layers is pointless: layers of plain sums collapse into one single sum.</Say>
      <Embed width={1100}>
        <div className="grid grid-cols-2 place-items-center gap-6 py-2">
          <div className="flex flex-col items-center">
            <ActivationPlot kind="relu" />
            <M>{String.raw`\mathrm{ReLU}(s) = \max(0, s)`}</M>
          </div>
          <div className="flex flex-col items-center">
            <ActivationPlot kind="sigmoid" />
            <M>{String.raw`\sigma(s) = \frac{1}{1+e^{-s}}`}</M>
          </div>
        </div>
      </Embed>
      <Callout icon="🧠" tone="purple" title="Why nonlinearity?">
        Stacked linear layers collapse into one linear map: <M>{String.raw`W_2(W_1x) = (W_2W_1)x`}</M>. The activation is
        what lets depth add power.
      </Callout>

      <H3 id="forward">Many neurons, layers: the forward pass</H3>
      <Say host={A}>How do all these neurons work together to make one prediction?</Say>
      <Say host={B}>Layer by layer, left to right. That trip is the forward pass, and it’s four lines of maths.</Say>
      <Figure>
        <LayersDiagram />
      </Figure>
      <p>
        784 inputs → 128 neurons → 64 neurons → 10 scores. Every neuron in one layer connects to every neuron in the next: a{" "}
        <b>fully connected</b> (MLP) layer, and every line is one weight. A layer computes a whole row of neurons at once, so
        its weights form a matrix <M>W</M> and its biases a vector <M>b</M>. The whole prediction is four lines:
      </p>
      <MB>{String.raw`\begin{aligned} y &= \mathrm{ReLU}(W_1 x + b_1) && \text{hidden layer 1} \\ z &= \mathrm{ReLU}(W_2 y + b_2) && \text{hidden layer 2} \\ o &= W_3 z + b_3 && \text{10 scores} \\ p &= \mathrm{softmax}(o) && \text{10 probabilities} \end{aligned}`}</MB>
      <Say host={A}>Is it the same activation function in every layer?</Say>
      <Say host={B}>Same within a layer. Usually the same across hidden layers, but it doesn’t have to be. And the output layer uses softmax.</Say>
      <Callout icon="⚡" tone="blue" title="Which activation function, where?">
        <table>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Activation</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hidden layer 1 (y)</td>
              <td>ReLU, for all 128 neurons</td>
              <td>cheap, trains well</td>
            </tr>
            <tr>
              <td>Hidden layer 2 (z)</td>
              <td>ReLU, for all 64 neurons</td>
              <td>same reason</td>
            </tr>
            <tr>
              <td>Output layer (o → p)</td>
              <td className="hl">softmax</td>
              <td>we need 10 probabilities</td>
            </tr>
          </tbody>
        </table>
        <ul>
          <li>
            <b>Within a layer, every neuron uses the same activation.</b> Each neuron still gives a different answer,
            because it has its own weights and bias.
          </li>
          <li>
            <b>Across hidden layers it’s usually the same, but it doesn’t have to be.</b> We use ReLU in both because it’s
            the common default. tanh in one and ReLU in the other would also learn to read digits. It’s a design choice,
            like the layer sizes.
          </li>
          <li>
            <b>The output layer is usually different, because its job is different.</b> ReLU would just give 10 positive
            numbers. We need 10 probabilities that add up to 1, so the output layer’s activation function is{" "}
            <Wiki to="softmax">softmax</Wiki>. (A yes/no network would use sigmoid there instead.)
          </li>
        </ul>
      </Callout>
      <table>
        <thead>
          <tr>
            <th>Tensor</th>
            <th>Shape</th>
            <th>Parameters</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><M>x</M></td><td><M>{String.raw`784 \times 1`}</M></td><td>–</td></tr>
          <tr><td><M>{String.raw`W_1,\ b_1`}</M></td><td><M>{String.raw`128 \times 784,\ \ 128`}</M></td><td>100,480</td></tr>
          <tr><td><M>{String.raw`W_2,\ b_2`}</M></td><td><M>{String.raw`64 \times 128,\ \ 64`}</M></td><td>8,256</td></tr>
          <tr><td><M>{String.raw`W_3,\ b_3`}</M></td><td><M>{String.raw`10 \times 64,\ \ 10`}</M></td><td>650</td></tr>
          <tr><td><M>{String.raw`o,\ p`}</M></td><td><M>{String.raw`10 \times 1`}</M></td><td>–</td></tr>
        </tbody>
      </table>
      <p>
        Count the parameters together: <M>{String.raw`100{,}480 + 8{,}256 + 650 =`}</M>{" "}
        <span className="text-gradient font-mono font-bold">109,386</span>.
      </p>
      <Say host={A}>Who sets all 109,386 numbers in the first place?</Say>
      <Say host={B}>Nobody. They start random, and training fixes them.</Say>
      <Callout plain icon="🎲" tone="amber" title="So who sets the first 109,386 values? Nobody: they start random">
        <p>
          Nobody could type in 109,386 numbers by hand, and even if we could, we wouldn’t know the right ones. That’s the
          whole point: finding them is the network’s job. So every weight starts as a <b>small random number</b> (biases
          usually start at 0), and training improves them from there.
        </p>
        <p>
          Why random, and not simply all zeros? If every weight started the same, every neuron in a layer would compute the
          same thing, get the same correction, and stay identical forever: 128 copies of one neuron. Random starting values
          make each neuron different, so each can learn something different.
        </p>
        <p>
          It also means a brand-new network is useless. With random weights, its guesses are no better than chance; we’ll
          see that in <Wiki to="pause-1">Pause and predict</Wiki>.
        </p>
      </Callout>

      <H3 id="softmax">Softmax: scores into probabilities</H3>
      <Say host={A}>The network gives us ten scores. How do they become probabilities?</Say>
      <Say host={B}>Softmax: raise e to the power of each score, then divide by the total. Everything comes out positive and adds up to 1.</Say>
      <p>
        Softmax is the <b>activation function of the output layer</b>. It plays the same role ReLU plays in the hidden
        layers, with one difference: ReLU looks at each neuron on its own, while softmax looks at all 10 output neurons
        together. Each probability depends on every score, because each one is divided by the same total:
      </p>
      <MB>{String.raw`p_k = \frac{e^{o_k}}{\sum_j e^{o_j}}`}</MB>
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
          <tr><td className="font-sans">score o</td><td>2.0</td><td>1.0</td><td>0.1</td></tr>
          <tr><td className="font-sans">eᵒ</td><td>7.39</td><td>2.72</td><td>1.11</td></tr>
          <tr className="hl"><td className="font-sans">probability</td><td>0.66</td><td>0.24</td><td>0.10</td></tr>
        </tbody>
      </table>
      <ul>
        <li>Probabilities are positive and sum to 1.</li>
        <li>
          Prediction = <M>{String.raw`\arg\max_k p_k`}</M>; confidence = <M>{String.raw`\max_k p_k`}</M>.
        </li>
      </ul>
      <Cue>
        Push the “7” score up: probability → 1, loss → 0. Mark “9” as the true class: the loss jumps. Make all scores equal:
        1/3 each.
      </Cue>
      <Embed height={600} caption="Softmax playground. Click a class to mark it as the true digit.">
        <SoftmaxPlayground />
      </Embed>

      <div id="pause-1" className="scroll-mt-32" />
      <Callout icon="⏸️" tone="amber" title="Pause and predict">
        <Say host={A}>Hindesh, the weights are random and we feed in 10,000 test digits. What accuracy do you expect?</Say>
        <Cue>Pause: let the audience guess first.</Cue>
        <Toggle summary={`${B.shortName}’s answer`}>
          <Say host={B}>About 10%: no better than guessing.</Say>
          <ul>
            <li>Random weights give meaningless scores, so every digit is equally likely.</li>
            <li>
              <b>Training is the act of moving from 10% to about 97%.</b> How? Next.
            </li>
          </ul>
        </Toggle>
      </Callout>

      <H3 id="loss">Loss: how wrong are we?</H3>
      <Say host={A}>How does the network know it got something wrong?</Say>
      <Say host={B}>The loss function: one number for how wrong it was. For MNIST, that’s cross-entropy.</Say>
      <p>
        To get better, the network first needs a way to measure how bad it is right now. That measurement is the{" "}
        <b>loss function</b>: it compares what the network said with the right answer and turns the gap into{" "}
        <b>one number</b>. Big means very wrong; 0 means perfect.
      </p>
      <p>We need it for two reasons:</p>
      <ul>
        <li>
          <b>It defines “better”.</b> Without a single score there’s nothing to improve. Training literally means “change
          the weights so the loss goes down”.
        </li>
        <li>
          <b>It gives a direction.</b> Because the loss is a smooth function of every weight, we can ask “if I nudge this
          weight, does the loss go up or down?”. That question is what <Wiki to="gd">gradient descent</Wiki> answers.
        </li>
      </ul>

      <h4 id="choosing-loss">How do we choose the loss function?</h4>
      <Say host={A}>Is it always cross-entropy?</Say>
      <Say host={B}>No, it depends on the job: cross-entropy for picking a class, mean squared error for predicting a number.</Say>
      <p>
        There isn’t one loss for every network. You pick the one that matches what the network is supposed to output,
        and it usually goes hand in hand with the output layer’s activation:
      </p>
      <table>
        <thead>
          <tr>
            <th>The task</th>
            <th>Output layer</th>
            <th>Usual loss</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pick one of several classes (MNIST: which digit?)</td>
            <td>softmax</td>
            <td className="hl">cross-entropy</td>
          </tr>
          <tr>
            <td>Yes / no (spam or not?)</td>
            <td>sigmoid</td>
            <td>binary cross-entropy</td>
          </tr>
          <tr>
            <td>Predict a number (a house price, a temperature)</td>
            <td>none</td>
            <td>mean squared error</td>
          </tr>
        </tbody>
      </table>
      <p>
        Each kind of network gets the loss that suits its job. For MNIST the job is “choose one of 10 digits”, the output
        is 10 probabilities from softmax, so the loss is <b>cross-entropy</b>:
      </p>
      <MB>{String.raw`L = -\log p_{t}`}</MB>
      <p>
        <b>Cross-entropy:</b> take the probability the network gave to the <i>true</i> digit <M>t</M>, and take minus its log.
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
      <Say host={A}>Okay, we know how wrong we are. How do we get less wrong?</Say>
      <Say host={B}>Find the weights where the loss is lowest. We can’t try them all, but we can feel the slope and walk downhill.</Say>
      <p>
        The loss is a single number, but it depends on every one of our 109,386 weights. Change any weight and the
        network’s answers change, so the loss changes. <b>Training means finding the weights that make the loss as small
        as possible</b>: the bottom of the loss, its <b>minimum</b>. Minimum loss means the network’s probabilities are as
        close to the right answers as they can get.
      </p>
      <p>How do we find that bottom?</p>
      <ul>
        <li>
          <b>We can’t try every combination.</b> Even if each weight could only take 10 values, there would be{" "}
          <M>{String.raw`10^{109{,}386}`}</M> networks to test.
        </li>
        <li>
          <b>We can’t solve for it directly.</b> There’s no formula that spits out the best weights for a network like this.
        </li>
        <li>
          <b>But we can always measure the slope.</b> For each weight, the <b>gradient</b> tells us: “if this weight goes up
          a little, does the loss go up or down, and how steeply?”. Step every weight the opposite way, downhill, and the
          loss drops. Repeat until the slope is about zero: that’s the bottom.
        </li>
      </ul>
      <Callout plain icon="🌫️" tone="blue" title="Walking downhill in fog">
        Picture standing on a hillside in thick fog, trying to reach the valley. You can’t see the valley, but you can feel
        which way the ground slopes under your feet. Take a step downhill, feel again, repeat. The gradient is that feeling
        of the slope, and gradient descent is the walk.
      </Callout>
      <p>The rule for one step:</p>
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

      <h4 id="minima">“What if we get stuck in the wrong valley?”</h4>
      <Say host={A}>Downhill stops wherever the slope is zero. What if that’s just a small dip, and the real bottom is somewhere else?</Say>
      <Say host={B}>On a toy curve like this, that happens. In big networks the dips turn out to be nearly as deep as the bottom, so it barely matters.</Say>
      <Figure caption="A loss with two valleys. Walking downhill from the right, you stop in the local minimum and never see the global one.">
        <MinimaPlot />
      </Figure>
      <p>
        That’s a real concern. A <b>local minimum</b> is a dip where every direction goes uphill, so gradient descent stops,
        even though a lower point, the <b>global minimum</b>, exists elsewhere. On a toy curve like this one it happens
        easily.
      </p>
      <p>In big neural networks it turns out to matter much less than you’d expect:</p>
      <ul>
        <li>
          <b>The valleys are nearly as deep as each other.</b> Studies of large networks find that most local minima have a
          loss close to the global minimum. Ending up in “a” valley is about as good as ending up in “the” valley.
        </li>
        <li>
          <b>True traps are rare in many dimensions.</b> To trap you, a point has to curve upward in <i>every</i> one of
          those 109,386 directions at once. Much more often some direction still slopes down (a <i>saddle point</i>), and
          the walk carries on.
        </li>
        <li>
          <b>The noise helps.</b> We compute each step on a small random batch of images, not all 60,000, so the steps
          wobble a little. That wobble helps shake the walk out of small dips.
        </li>
        <li>
          <b>We don’t want the exact global minimum anyway.</b> The very lowest training loss can mean the network has
          memorised its 60,000 training images. What we care about is accuracy on digits it has never seen.
        </li>
      </ul>

      <H3 id="so-far">Where we are so far</H3>
      <p>Let’s line up everything we’ve built, for one image of a handwritten 7:</p>
      <Figure>
        <Flow
          steps={[
            "784 pixels (x)",
            "128 numbers (y)",
            "64 numbers (z)",
            "10 scores (o)",
            "10 probabilities (p)",
            "loss L: one number",
          ]}
          accent={[5]}
        />
      </Figure>
      <ol>
        <li>The 784 pixel values go into hidden layer 1, which turns them into 128 numbers (weighted sums, then ReLU).</li>
        <li>Hidden layer 2 turns those 128 into 64 numbers, the same way.</li>
        <li>The output layer turns those 64 into 10 scores, one per digit.</li>
        <li>Softmax turns the 10 scores into 10 probabilities.</li>
        <li>Cross-entropy compares them with the right answer and gives the loss: one number for how wrong we were.</li>
      </ol>
      <p>
        That whole left-to-right trip is the <b>forward pass</b>. And from <Wiki to="gd">gradient descent</Wiki> we know
        what to do next: nudge every parameter a little against its slope, <M>{String.raw`w \leftarrow w - \eta\,\partial L/\partial w`}</M>.
      </p>
      <Say host={A}>But that needs the slope for every single one of the 109,386 parameters. The loss only appears at the very end, and most of the weights are way back at the start. How do we get all those slopes?</Say>
      <Say host={B}>Backpropagation.</Say>
      <p>
        That’s the missing piece.
      </p>

      <H3 id="backprop">Backpropagation</H3>
      <Say host={A}>How does backprop work, intuitively?</Say>
      <Say host={B}>Pass the blame backwards: start at the loss, and work out how much each layer, and then each weight, caused the mistake.</Say>
      <h4>The idea: pass the blame backwards</h4>
      <p>
        Think of the network as a team that just got an answer wrong. The loss is the final score. Backprop goes back
        through the team, from the end to the start, working out how much each member contributed to the mistake:
      </p>
      <Figure caption="The forward pass goes left to right. Backprop starts at the loss and goes right to left, one layer at a time.">
        <BlameDiagram />
      </Figure>
      <ol>
        <li>
          <b>Start at the output.</b> Compare each probability with the truth. Said 0.20 for “7” when the answer is 7? That
          score was too low: push it up. Said 0.70 for “1”? Too high: push it down.
        </li>
        <li>
          <b>Pass the blame to hidden layer 2.</b> Each <M>z</M> neuron fed all 10 outputs. Its share of the blame is the
          blame of each output it fed, scaled by how strong its connection to that output is. A neuron with a big weight
          into a badly wrong output gets a lot of blame; one with tiny weights gets very little.
        </li>
        <li>
          <b>Pass it on to hidden layer 1</b> the same way, through the <M>W_2</M> weights.
        </li>
        <li>
          <b>Every weight gets its share.</b> A weight’s blame is the blame of the neuron it feeds into, times how big the
          input on its other end was. That share <i>is</i> its gradient, <M>{String.raw`\partial L/\partial w`}</M>.
        </li>
      </ol>
      <p>
        Now every parameter has a slope, so we take one <Wiki to="gd">gradient descent</Wiki> step: nudge all 109,386 of
        them a little downhill.
      </p>
      <p>
        And then we’re right back where we started, with a slightly better network. Take the next images, do a forward
        pass, get a loss (a bit smaller this time), pass the blame back, nudge the weights. Each round is one{" "}
        <b>iteration</b>, and iteration by iteration the loss walks down towards a minimum:
      </p>
      <Figure wide={false}>
        <Flow steps={["forward pass", "loss", "backprop: gradients", "update weights"]} accent={[2, 3]} />
        <div className="mt-3 text-center text-sm text-muted">↻ repeat, thousands of times</div>
      </Figure>

      <h4 id="chain-rule">How it actually works: the chain rule</h4>
      <Say host={A}>And what’s the actual maths behind that?</Say>
      <Say host={B}>Just the chain rule from school calculus, applied layer by layer.</Say>
      <p>
        The blame-passing above is a single rule from calculus. If <M>L</M> depends on <M>a</M>, and <M>a</M> depends on{" "}
        <M>w</M>, then a small change in <M>w</M> ripples through <M>a</M> into <M>L</M>, and the slopes multiply:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a}\cdot\frac{\partial a}{\partial w}`}</MB>
      <p>
        In words: (how much <M>L</M> reacts to <M>a</M>) × (how much <M>a</M> reacts to <M>w</M>). A longer chain just
        means more factors multiplied together.
      </p>
      <Callout icon="🔗" tone="neutral" title="A tiny chain, by hand">
        <p>
          <M>{String.raw`a = wx,\quad L=(a-t)^2,\quad x=2,\ w=1,\ t=5`}</M>
        </p>
        <ul>
          <li>
            Forward: <M>{String.raw`a = 1\cdot 2 = 2,\quad L = (2-5)^2 = 9`}</M>
          </li>
          <li>
            Backward: <M>{String.raw`\partial L/\partial a = 2(a-t) = -6,\qquad \partial a/\partial w = x = 2`}</M>
          </li>
          <li>
            Multiply: <M>{String.raw`\partial L/\partial w = -6\cdot 2 = \color{#c08bff}{-12}`}</M>, so{" "}
            <M>{String.raw`w \leftarrow 1 - 0.1(-12) = \color{#c08bff}{2.2}`}</M>, which moves <M>a</M> toward <M>t</M>.
          </li>
        </ul>
      </Callout>

      <h4>Step 1: the output layer</h4>
      <p>
        Write the right answer <M>t</M> as 10 numbers: all 0, except a 1 for the true digit. Then softmax and
        cross-entropy together give the simplest possible slope for each output score:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial o_k} = p_k - t_k \qquad\text{(what we said, minus what was true)}`}</MB>
      <Toggle summary="Why is it just p − t? (four lines of calculus)">
        <p>
          With <M>{String.raw`p_t = e^{o_t} / \sum_j e^{o_j}`}</M>, the loss is
        </p>
        <MB>{String.raw`L = -\log p_t = -o_t + \log \sum_j e^{o_j}`}</MB>
        <p>Take the slope with respect to one score <M>o_k</M>:</p>
        <MB>{String.raw`\frac{\partial L}{\partial o_k} = -\,[k = t] + \frac{e^{o_k}}{\sum_j e^{o_j}} = -\,t_k + p_k`}</MB>
        <p>
          The first term is 1 only for the true digit, and the second is exactly softmax’s output, so the slope is{" "}
          <M>{String.raw`p_k - t_k`}</M>.
        </p>
      </Toggle>
      <p>
        For our 7: we said <M>{String.raw`p_7 = 0.20`}</M> and the truth is <M>{String.raw`t_7 = 1`}</M>, so the blame on{" "}
        <M>o_7</M> is <M>{String.raw`0.20 - 1 = -0.80`}</M> (negative: push it <i>up</i>). We said{" "}
        <M>{String.raw`p_1 = 0.70`}</M> for “1”, which is wrong, so its blame is <M>{String.raw`0.70 - 0 = +0.70`}</M>{" "}
        (positive: push it <i>down</i>). Call these blames <M>{String.raw`\delta_o`}</M>.
      </p>
      <p>
        Now one weight in <M>W_3</M>: the one from <M>z_5</M> into <M>o_7</M>. Since{" "}
        <M>{String.raw`o_7 = \dots + w\,z_5 + \dots`}</M>, nudging <M>w</M> changes <M>o_7</M> by <M>z_5</M> times as
        much. Chain rule, with <M>{String.raw`z_5 = 1.5`}</M>:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial w} = \underbrace{\frac{\partial L}{\partial o_7}}_{-0.80}\cdot\underbrace{\frac{\partial o_7}{\partial w}}_{z_5 \,=\, 1.5} = -1.2 \quad\Rightarrow\quad w \leftarrow w - 0.1(-1.2) = w + 0.12`}</MB>
      <p>
        The weight goes up, so next time <M>z_5</M> pushes <M>o_7</M> higher. The rule: <b>a weight’s gradient = the blame
        of the neuron it feeds × the value coming in on its other end.</b>
      </p>

      <h4>Step 2: one layer further back</h4>
      <p>
        Now a weight in <M>W_2</M>: the one from <M>y_3</M> into <M>z_5</M>. This is harder, because <M>z_5</M> feeds{" "}
        <i>all 10</i> outputs, so a change in it reaches the loss along 10 paths. The chain rule says: add up the paths.
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial z_5} = \sum_{k=0}^{9} \frac{\partial L}{\partial o_k}\cdot\frac{\partial o_k}{\partial z_5} = \sum_{k} \delta_{o_k} \cdot W_3[k,5]`}</MB>
      <p>
        That’s exactly “collect the blame from every output, scaled by the connection”. Say{" "}
        <M>{String.raw`W_3[7,5] = 0.5`}</M> and <M>{String.raw`W_3[1,5] = 0.3`}</M>. The other eight probabilities add up
        to only 0.10, so they contribute almost nothing here:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial z_5} \approx (-0.80)(0.5) + (0.70)(0.3) = -0.40 + 0.21 = -0.19`}</MB>
      <p>
        Next, <M>z_5</M> came out of a ReLU. ReLU has slope 1 where it was active and 0 where it was silent. Here{" "}
        <M>{String.raw`z_5 = 1.5 > 0`}</M>, so the blame passes straight through: <M>{String.raw`\delta_{z_5} = -0.19`}</M>.
        Then the same rule as before, with <M>{String.raw`y_3 = 2.0`}</M>:
      </p>
      <MB>{String.raw`\frac{\partial L}{\partial w} = \delta_{z_5} \cdot y_3 = -0.19 \times 2.0 = -0.38 \quad\Rightarrow\quad w \leftarrow w + 0.038`}</MB>
      <Callout plain icon="🚪" tone="amber" title="ReLU is a gate for blame, too">
        If <M>z_5</M> had been silent (output 0), the ReLU slope would be 0 and <i>no</i> blame would pass through. That
        makes sense: a neuron that did nothing for this image didn’t cause the mistake, so the weights feeding it are left
        alone this time.
      </Callout>

      <h4>Step 3: reuse, and why it’s fast</h4>
      <p>
        Notice that <M>{String.raw`\delta_{z_5}`}</M> was worked out <b>once</b>, then used for all 128 weights coming into{" "}
        <M>z_5</M>, and passed further back to every <M>y</M>. The same goes for each <M>{String.raw`\delta_o`}</M>. Each
        layer’s blame is built from the layer after it, so nothing is computed twice. One backward pass costs about as
        much as one forward pass, instead of 109,386 separate calculations. That reuse is the whole trick.
      </p>
      <p>Written for whole layers at once, the three steps above are all of backprop for our network:</p>
      <MB>{String.raw`\begin{aligned} \delta_o &= p - t & \tfrac{\partial L}{\partial W_3} &= \delta_o\, z^\top & \tfrac{\partial L}{\partial b_3} &= \delta_o \\ \delta_z &= \big(W_3^\top \delta_o\big) \odot \mathbf{1}[z>0] & \tfrac{\partial L}{\partial W_2} &= \delta_z\, y^\top & \tfrac{\partial L}{\partial b_2} &= \delta_z \\ \delta_y &= \big(W_2^\top \delta_z\big) \odot \mathbf{1}[y>0] & \tfrac{\partial L}{\partial W_1} &= \delta_y\, x^\top & \tfrac{\partial L}{\partial b_1} &= \delta_y \end{aligned}`}</MB>
      <ul>
        <li>
          <M>{String.raw`W_3^\top \delta_o`}</M> is “collect blame from every output, scaled by the weights”: the sum from
          step 2, done for all 64 neurons at once.
        </li>
        <li>
          <M>{String.raw`\odot\,\mathbf{1}[z>0]`}</M> is the ReLU gate: keep the blame where the neuron fired, zero it where
          it was silent.
        </li>
        <li>
          <M>{String.raw`\delta\,(\text{input})^\top`}</M> is “blame × incoming value” for every weight in the layer. A bias
          has no incoming value (think of it as 1), so its gradient is just the blame.
        </li>
      </ul>
      <Callout icon="🔜" tone="purple">
        We code exactly this in <Wiki to="nb-backprop">Part 2</Wiki>, and check it against the slow way. Episode 2
        (micrograd) builds a tiny engine that does this backward pass automatically, for any formula.
      </Callout>

      <H3 id="loop">The training loop</H3>
      <Say host={A}>So what does training look like, from start to finish?</Say>
      <Say host={B}>Take a batch of images, forward, loss, backward, update. Repeat thousands of times, over several epochs.</Say>
      <p>Now we can put the whole thing together. One <b>iteration</b> (also called a <b>step</b>) is:</p>
      <Figure wide={false}>
        <Flow steps={["1. Forward", "2. Loss", "3. Backward", "4. Update"]} accent={[2, 3]} />
        <div className="mt-3 text-center text-sm text-muted">↻ repeat</div>
      </Figure>
      <ol>
        <li>
          <b>Take a mini-batch</b> of 64 training images, not just one. One image gives a noisy idea of “downhill”;
          averaging the blame over 64 gives a steadier one, and is still fast.
        </li>
        <li>
          <b>Forward:</b> run all 64 through the network. <b>Loss:</b> average their 64 losses into one number.
        </li>
        <li>
          <b>Backward:</b> backprop gives a gradient for every parameter (averaged over the batch).
        </li>
        <li>
          <b>Update:</b> <M>{String.raw`w \leftarrow w - \eta\,\partial L/\partial w`}</M> for all 109,386 parameters.
        </li>
      </ol>

      <h4>Epochs</h4>
      <p>
        One <b>epoch</b> is one full pass through all the training images. With 55,000 training images in batches of 64,
        that’s about 860 iterations per epoch. We shuffle the images before every epoch so the batches are different each
        time, and train for several epochs (say 10, so roughly 8,600 updates in total).
      </p>

      <h4 id="data-splits">Training, validation and test data</h4>
      <Say host={A}>How do we know it’s actually learning, and not just memorising?</Say>
      <Say host={B}>Keep some images it never trains on, and test it on those.</Say>
      <p>MNIST comes as 60,000 training images and 10,000 test images. We use them in three groups:</p>
      <table>
        <thead>
          <tr>
            <th>Set</th>
            <th>Images</th>
            <th>What it’s for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Training</td>
            <td>55,000</td>
            <td>The only images the weights ever learn from.</td>
          </tr>
          <tr>
            <td>Validation</td>
            <td>5,000 (split off the 60,000)</td>
            <td>Checked after every epoch. Used to pick layer sizes and the learning rate, and to decide when to stop.</td>
          </tr>
          <tr>
            <td>Test</td>
            <td>10,000</td>
            <td>Used <b>once</b>, at the very end. This is the accuracy you report.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Why keep images back? A network can score brilliantly on images it has trained on just by memorising them. The
        only honest question is how it does on digits it has <i>never seen</i>. And if we kept tuning on the test set, it
        would quietly stop being “unseen”, which is why the validation set exists.
      </p>

      <h4>What you watch while it trains</h4>
      <ul>
        <li>
          <b>Training loss</b> should fall, quickly at first and then more slowly.
        </li>
        <li>
          <b>Validation accuracy</b> should climb. From a random start at about 10%, a network like ours is typically above
          90% after the first epoch and around 97% after a few more.
        </li>
        <li>
          <b>The warning sign:</b> training accuracy keeps going up while validation accuracy stalls or drops. That’s{" "}
          <b>overfitting</b>, the network memorising instead of learning. Time to stop.
        </li>
      </ul>


      <H3 id="learned">Did it actually learn?</H3>
      <Say host={A}>So, did it work?</Say>
      <Say host={B}>About 97% on digits it has never seen.</Say>
      <Columns>
        <Card title="Honest evaluation" tone="blue">
          <ul>
            <li>55,000 images to train, 5,000 to tune (validation).</li>
            <li>
              10,000 <i>unseen</i> images to test, once.
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
        <Say host={A}>
          Hindesh, I photograph a <b>7</b> written in black pen on white, lined paper, and upload it. Will our 97% model get it
          right?
        </Say>
        <Cue>Pause: let the audience guess first.</Cue>
        <Toggle summary={`${B.shortName}’s answer`}>
          <Say host={B}>Maybe not. MNIST digits are white on black, and a photo of black pen on white paper looks nothing like them.</Say>
          <ul>
            <li>
              <span className="hl">Maybe not!</span> MNIST digits are white on black, centred, 28×28.
            </li>
            <li>The model only knows the data distribution it was trained on.</li>
            <li>
              So serving a model is mostly about <b>matching the preprocessing</b>. That is Part 3.
            </li>
          </ul>
        </Toggle>
      </Callout>

      {/* ──────────────────────────── Part 2 ──────────────────────────── */}
      <H2 id="build">Part 2 · Build it: first in NumPy, then in PyTorch</H2>
      <Say host={B}>Gourav, that’s all the theory. Now what?</Say>
      <Say host={A}>
        Now I build it. I’ll open a Jupyter notebook and write the whole network, cell by cell, using only NumPy. Every
        line will be something we just explained. Once it works, we’ll redo it in PyTorch.
      </Say>
      <Say host={B}>Only NumPy? No PyTorch?</Say>
      <Say host={A}>
        Not yet. That was the promise: no magic imports. NumPy only gives us arrays and matrix maths. The neurons, the
        loss, the backprop and the training loop, we write ourselves first. PyTorch comes once there’s nothing left in it
        to be magic.
      </Say>
      <Cue>Switch to Jupyter. Run each cell live as you explain it.</Cue>

      <H3 id="nb-data">Get the data ready</H3>
      <Say host={B}>What’s the first cell?</Say>
      <Say host={A}>The import. NumPy, plus a random number generator with a fixed seed, so we get the same run every time.</Say>
      <Cell
        n={1}
        code={`
import numpy as np                  # the only library the model uses

rng = np.random.default_rng(0)      # fixed seed: same "random" numbers every run
`}
      />
      <Say host={B}>Where does the data come from?</Say>
      <Say host={A}>
        MNIST is published as one NumPy file, about 11 MB. I download it once with Python’s built-in <code>urllib</code>,
        and load it with <code>np.load</code>.
      </Say>
      <Cell
        n={2}
        code={`
import urllib.request               # part of Python itself, not an ML library

url = "https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz"
urllib.request.urlretrieve(url, "mnist.npz")

data = np.load("mnist.npz")
x_train, y_train = data["x_train"], data["y_train"]
x_test,  y_test  = data["x_test"],  data["y_test"]
print(x_train.shape, y_train.shape, x_test.shape)
`}
        output="(60000, 28, 28) (60000,) (10000, 28, 28)"
      />
      <Say host={B}>What does one image look like in there?</Say>
      <Say host={A}>A 28 × 28 grid of numbers from 0 to 255, and a label saying which digit it is.</Say>
      <Cell
        n={3}
        code={`
print("label:", y_train[0])
print("pixel range:", x_train[0].min(), "to", x_train[0].max())
`}
        output={`
label: 5
pixel range: 0 to 255`}
      />
      <Say host={B}>But the network wants 784 numbers between 0 and 1.</Say>
      <Say host={A}>
        So I flatten each grid into 784 numbers, divide by 255, and put one image per column, exactly like the <M>x</M> in our
        maths. Then I split off 5,000 training images for validation.
      </Say>
      <Cell
        n={4}
        code={`
def prep(x):
    # (n, 28, 28) of 0–255  →  (784, n) of 0–1, one image per column
    return (x.reshape(len(x), 784) / 255.0).T.astype(np.float32)

X_train, X_val = prep(x_train[:55000]), prep(x_train[55000:])
t_train, t_val = y_train[:55000], y_train[55000:]
X_test,  t_test = prep(x_test), y_test
print(X_train.shape, X_val.shape, X_test.shape)
`}
        output="(784, 55000) (784, 5000) (784, 10000)"
      />

      <H3 id="nb-network">The network</H3>
      <Say host={B}>What are you planning next?</Say>
      <Say host={A}>
        The random start: three weight matrices and three bias vectors. Small random weights, biases at zero. And it should
        come to exactly the number we counted earlier.
      </Say>
      <Cell
        n={5}
        code={`
def init_params():
    def layer(n_out, n_in):
        W = rng.standard_normal((n_out, n_in)) * np.sqrt(2 / n_in)   # small random numbers
        b = np.zeros((n_out, 1))                                       # biases start at 0
        return W, b
    p = {}
    p["W1"], p["b1"] = layer(128, 784)    # input    → hidden 1
    p["W2"], p["b2"] = layer(64, 128)     # hidden 1 → hidden 2
    p["W3"], p["b3"] = layer(10, 64)      # hidden 2 → output
    return p

params = init_params()
print(sum(v.size for v in params.values()))
`}
        output="109386"
      />
      <p>
        109,386: the same count as in the <Wiki to="forward">forward pass</Wiki> section. The <M>{String.raw`\sqrt{2/n_{in}}`}</M>{" "}
        just keeps the random numbers small enough for ReLU layers; it’s a standard choice.
      </p>
      <Say host={B}>Now the forward pass?</Say>
      <Say host={A}>The same four lines as the theory: ReLU twice, then the ten scores, then softmax.</Say>
      <Cell
        n={6}
        code={`
def relu(s):
    return np.maximum(0, s)

def softmax(o):
    o = o - o.max(axis=0, keepdims=True)     # subtract the max: same answer, no overflow
    e = np.exp(o)
    return e / e.sum(axis=0, keepdims=True)

def forward(X, p):
    y = relu(p["W1"] @ X + p["b1"])          # hidden layer 1: (128, n)
    z = relu(p["W2"] @ y + p["b2"])          # hidden layer 2: (64, n)
    o = p["W3"] @ z + p["b3"]                # 10 scores:      (10, n)
    return y, z, softmax(o)                  # keep y and z: backprop needs them
`}
      />
      <Say host={B}>How will you know if it’s working?</Say>
      <Say host={A}>
        Two functions: cross-entropy for the loss, and accuracy for us. And before any training, the random network should
        score about 10%. Remember the pause and predict?
      </Say>
      <Cell
        n={7}
        code={`
def cross_entropy(P, t):
    # P: (10, n) probabilities, t: the n true digits → average of −log p_t
    return -np.log(P[t, np.arange(len(t))] + 1e-12).mean()

def accuracy(X, t, p):
    _, _, P = forward(X, p)
    return (P.argmax(axis=0) == t).mean()

_, _, P = forward(X_val, params)
print("loss:", cross_entropy(P, t_val), " accuracy:", accuracy(X_val, t_val, params))
`}
      />
      <Cue>
        Expect an accuracy near 10% and a loss a bit above 2.3 (2.3 is <M>{String.raw`\ln 10`}</M>, the loss of ten equal
        guesses). The random network is guessing.
      </Cue>

      <H3 id="nb-backprop">Backprop, in code</H3>
      <Say host={B}>This is the backprop part. How long is it?</Say>
      <Say host={A}>
        About ten lines. It’s the three <M>\delta</M> equations from the <Wiki to="backprop">backprop</Wiki> section, one per
        layer, in the same order: output, then hidden 2, then hidden 1.
      </Say>
      <Cell
        n={8}
        code={`
def backward(X, t, p, y, z, P):
    n = X.shape[1]
    T = np.zeros_like(P)
    T[t, np.arange(n)] = 1                   # one-hot truth: a 1 for the true digit

    d_o = (P - T) / n                        # δo = p − t   (averaged over the batch)
    d_z = (p["W3"].T @ d_o) * (z > 0)        # blame back through W3, then the ReLU gate
    d_y = (p["W2"].T @ d_z) * (y > 0)        # blame back through W2, then the ReLU gate

    return {                                 # gradient = blame × incoming value
        "W3": d_o @ z.T, "b3": d_o.sum(axis=1, keepdims=True),
        "W2": d_z @ y.T, "b2": d_z.sum(axis=1, keepdims=True),
        "W1": d_y @ X.T, "b1": d_y.sum(axis=1, keepdims=True),
    }
`}
      />
      <Say host={B}>How do you know your backprop is right?</Say>
      <Say host={A}>
        I check it the slow way. Nudge one weight up a tiny bit, then down, measure the loss each time, and work out the
        slope. If that matches what backprop says, backprop is right.
      </Say>
      <Cell
        n={9}
        code={`
Xb, tb = X_train[:, :32], t_train[:32]
y, z, P = forward(Xb, params)
grads = backward(Xb, tb, params, y, z, P)

eps = 1e-5
for name, (i, j) in [("W1", (5, 400)), ("W2", (10, 20)), ("W3", (7, 3))]:
    old = params[name][i, j]
    params[name][i, j] = old + eps
    up = cross_entropy(forward(Xb, params)[2], tb)
    params[name][i, j] = old - eps
    down = cross_entropy(forward(Xb, params)[2], tb)
    params[name][i, j] = old                              # put it back
    print(name, " backprop:", grads[name][i, j], "  nudge:", (up - down) / (2 * eps))
`}
      />
      <Cue>
        The two numbers on each line should agree to many decimal places. That is the “we verify it in NumPy” promise from
        the backprop section.
      </Cue>

      <H3 id="nb-train">Train it, test it, save it</H3>
      <Say host={B}>And now we train?</Say>
      <Say host={A}>
        Ten epochs, batches of 64, learning rate 0.1. For every batch: forward, loss, backward, update. Exactly the{" "}
        <Wiki to="loop">training loop</Wiki>.
      </Say>
      <Cell
        n={10}
        code={`
params = init_params()                                # a fresh random start
lr, batch, epochs = 0.1, 64, 10

for epoch in range(epochs):
    order = rng.permutation(X_train.shape[1])         # shuffle every epoch
    for k in range(0, len(order), batch):
        idx = order[k:k + batch]
        Xb, tb = X_train[:, idx], t_train[idx]
        y, z, P = forward(Xb, params)                 # 1. forward
        loss = cross_entropy(P, tb)                   # 2. loss
        grads = backward(Xb, tb, params, y, z, P)     # 3. backward
        for name in params:                           # 4. update
            params[name] -= lr * grads[name]
    print(f"epoch {epoch + 1}: loss {loss:.3f}   val accuracy {accuracy(X_val, t_val, params):.2%}")
`}
      />
      <Cue>Let it run on screen. Point at the validation accuracy climbing from one epoch to the next.</Cue>
      <Say host={B}>Is it done?</Say>
      <Say host={A}>One last check, on the 10,000 test images it has never seen. We run this exactly once.</Say>
      <Cell
        n={11}
        code={`
print(f"test accuracy: {accuracy(X_test, t_test, params):.2%}")
`}
      />
      <Say host={B}>Do we keep these weights?</Say>
      <Say host={A}>I save all 109,386 numbers to one file, model_numpy.npz, so the NumPy model is never lost.</Say>
      <Cell
        n={12}
        code={`
np.savez("model_numpy.npz", **params)   # W1, b1, W2, b2, W3, b3
`}
      />

      <H3 id="nb-try">Try it: does it really read digits?</H3>
      <Say host={B}>A test accuracy is just a number. Can we actually see it read some digits before we move on?</Say>
      <Say host={A}>
        Yes, and we should. A small <code>predict</code> function for one image, then I’ll run it on a test image it has
        never seen.
      </Say>
      <Cell
        n={13}
        code={`
def predict(x, p):
    # one image (784 numbers) → the digit, and how sure the network is
    _, _, P = forward(x.reshape(784, 1), p)
    return int(P.argmax()), float(P.max())

i = 0
print("true:", t_test[i], "  predicted:", predict(X_test[:, i], params))
`}
      />
      <Say host={B}>One image could be luck. Show me a bunch.</Say>
      <Say host={A}>
        Twelve random test images, drawn on screen, each with what the network says and what the truth is. Green when it’s
        right, red when it’s wrong. Matplotlib only draws the pictures; the model is still pure NumPy.
      </Say>
      <Cell
        n={14}
        code={`
import matplotlib.pyplot as plt                         # only for drawing pictures

idx = rng.choice(X_test.shape[1], 12, replace=False)   # 12 random test images
fig, axes = plt.subplots(2, 6, figsize=(10, 4))
for ax, i in zip(axes.flat, idx):
    digit, conf = predict(X_test[:, i], params)
    ax.imshow(X_test[:, i].reshape(28, 28), cmap="gray")
    ax.set_title(f"pred {digit} ({conf:.0%})\\ntrue {t_test[i]}",
                 color="green" if digit == t_test[i] else "red")
    ax.axis("off")
plt.show()
`}
      />
      <Cue>Run this cell two or three times: a new random dozen each time. Read a few predictions out loud.</Cue>
      <Say host={B}>And when it gets one wrong?</Say>
      <Say host={A}>
        Let’s find out. Here’s every mistake on the test set, and a look at a few of them. Most are digits a person would
        squint at too.
      </Say>
      <Cell
        n={15}
        code={`
_, _, P = forward(X_test, params)
wrong = np.flatnonzero(P.argmax(axis=0) != t_test)     # indices it got wrong
print(len(wrong), "mistakes out of", len(t_test))

fig, axes = plt.subplots(1, 6, figsize=(10, 2.2))
for ax, i in zip(axes, wrong[:6]):
    ax.imshow(X_test[:, i].reshape(28, 28), cmap="gray")
    ax.set_title(f"pred {P[:, i].argmax()}   true {t_test[i]}", color="red")
    ax.axis("off")
plt.show()
`}
      />
      <p>
        Looking at the mistakes is worth the time: a squashed 4 read as a 9, or a 7 with a bar through it read as something
        else. They show what the network finds hard, and they’re a hint of what happens with real photos in{" "}
        <Wiki to="system">Part 3</Wiki>.
      </p>
      <Callout plain icon="✅" tone="green" title="That’s the whole network">
        Data, a random start, the forward pass, the loss, backprop, a gradient check, the training loop, and a model you
        can watch read digits: fifteen cells of NumPy, and every line is something from Part 1.
      </Callout>

      <H3 id="nb-torch">Now the same thing in PyTorch</H3>
      <Say host={B}>It works. So do we write everything in NumPy from now on?</Say>
      <Say host={A}>
        No. NumPy was to see every piece. Real projects use PyTorch, the standard library, and that’s what we’ll use from
        here on. It’s fine now: we know exactly what happens inside, so it isn’t magic any more. Each PyTorch line replaces
        something we just wrote by hand.
      </Say>
      <table>
        <thead>
          <tr>
            <th>What we wrote in NumPy</th>
            <th>What PyTorch gives us</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>init_params</code>: random W, zero b
            </td>
            <td>
              <code>nn.Linear</code> layers: each makes its own W and b, with a random start
            </td>
          </tr>
          <tr>
            <td>
              <code>forward</code>, <code>relu</code>
            </td>
            <td>
              <code>nn.Sequential(...)</code>, <code>nn.ReLU()</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>softmax</code> + <code>cross_entropy</code>
            </td>
            <td>
              <code>nn.CrossEntropyLoss()</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>backward</code>: our three δ equations
            </td>
            <td>
              <code>loss.backward()</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>params[name] -= lr * grads[name]</code>
            </td>
            <td>
              <code>torch.optim.SGD</code>, then <code>opt.step()</code>
            </td>
          </tr>
          <tr>
            <td>shuffling and slicing batches by hand</td>
            <td>
              <code>DataLoader</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>np.savez</code>
            </td>
            <td>
              <code>torch.save</code>
            </td>
          </tr>
        </tbody>
      </table>

      <Say host={B}>What changes first?</Say>
      <Say host={A}>Just the import: PyTorch, and its own fixed seed.</Say>
      <Cell
        n={16}
        code={`
import torch
from torch import nn

torch.manual_seed(0)                # PyTorch's own random numbers, repeatable too
`}
      />
      <Say host={B}>Do we load the data again?</Say>
      <Say host={A}>
        No, it’s the same arrays. PyTorch wants one image per <i>row</i>, so I flip them back. And a{" "}
        <code>DataLoader</code> does the shuffling and batching we wrote by hand.
      </Say>
      <Cell
        n={17}
        code={`
from torch.utils.data import TensorDataset, DataLoader

Xtr = torch.from_numpy(X_train.T.copy())          # (55000, 784): one image per row
Xva = torch.from_numpy(X_val.T.copy())
Xte = torch.from_numpy(X_test.T.copy())
ttr, tva, tte = (torch.from_numpy(t).long() for t in (t_train, t_val, t_test))

loader = DataLoader(TensorDataset(Xtr, ttr), batch_size=64, shuffle=True)
print(Xtr.shape, ttr.shape)
`}
        output="torch.Size([55000, 784]) torch.Size([55000])"
      />
      <Say host={B}>So where did init_params and forward go?</Say>
      <Say host={A}>
        Both become this: three <code>nn.Linear</code> layers with a ReLU between them. Same shape of network, same
        number of parameters.
      </Say>
      <Cell
        n={18}
        code={`
model = nn.Sequential(
    nn.Linear(784, 128), nn.ReLU(),     # y = ReLU(W1 x + b1)
    nn.Linear(128, 64),  nn.ReLU(),     # z = ReLU(W2 y + b2)
    nn.Linear(64, 10),                  # o = W3 z + b3   (no softmax here: the loss does it)
)
print(sum(p.numel() for p in model.parameters()))
print(model[0].weight.shape)
`}
        output={`
109386
torch.Size([128, 784])`}
      />
      <p>
        109,386 again, and the first layer’s weights are stored as 128 × 784: exactly our <M>W_1</M>. PyTorch picks a
        slightly different random start from ours, but the idea is the same: small random numbers.
      </p>
      <Say host={B}>And the loss? And all of backprop?</Say>
      <Say host={A}>
        <code>CrossEntropyLoss</code> does softmax and cross-entropy in one go, which is why the model stops at the raw
        scores. The optimiser is our update rule. And backprop is one line: <code>loss.backward()</code>.
      </Say>
      <Cell
        n={19}
        code={`
loss_fn = nn.CrossEntropyLoss()                      # softmax + cross-entropy, on the raw scores o
opt = torch.optim.SGD(model.parameters(), lr=0.1)    # w ← w − η · ∂L/∂w

def torch_accuracy(X, t):
    with torch.no_grad():                            # only predicting: no gradients needed
        return (model(X).argmax(dim=1) == t).float().mean().item()
`}
      />
      <Callout plain icon="🔍" tone="blue" title="Where did backward() go?">
        <p>
          PyTorch keeps a note of every operation in the forward pass. When you call <code>loss.backward()</code>, it walks
          those notes in reverse and applies the chain rule at each step: exactly the blame-passing we did by hand. The
          gradient it gets for the scores is the same <M>{String.raw`p - t`}</M> we derived. This is called{" "}
          <b>autograd</b>, and in Episode 2 we build a tiny one ourselves.
        </p>
      </Callout>
      <Say host={B}>Same training loop as before?</Say>
      <Say host={A}>Same four steps. Except step 3, backward, is now one line.</Say>
      <Cell
        n={20}
        code={`
for epoch in range(10):
    for xb, tb in loader:                    # shuffled batches of 64
        o = model(xb)                        # 1. forward
        loss = loss_fn(o, tb)                # 2. loss
        opt.zero_grad()                      #    clear the last step's gradients
        loss.backward()                      # 3. backward: autograd does all of our backprop
        opt.step()                           # 4. update every parameter
    print(f"epoch {epoch + 1}: loss {loss.item():.3f}   val accuracy {torch_accuracy(Xva, tva):.2%}")
`}
      />
      <Cue>Run it. The accuracy should climb just like the NumPy version did.</Cue>
      <Say host={B}>And the file for the website?</Say>
      <Say host={A}>
        Test once, then <code>torch.save</code> the weights to <code>model.pt</code>. That’s the file Part 3 serves.
      </Say>
      <Cell
        n={21}
        code={`
print(f"test accuracy: {torch_accuracy(Xte, tte):.2%}")
torch.save(model.state_dict(), "model.pt")           # Part 3 loads this file
`}
      />

      <h4 id="nb-compare">Same network, much less code</h4>
      <table>
        <thead>
          <tr>
            <th>Piece</th>
            <th>NumPy (lines)</th>
            <th>PyTorch (lines)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Random start + forward pass</td>
            <td>21</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Loss</td>
            <td>2</td>
            <td>1</td>
          </tr>
          <tr>
            <td>Backprop</td>
            <td>12</td>
            <td>1</td>
          </tr>
          <tr>
            <td>Update step</td>
            <td>2</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Shuffling and batching</td>
            <td>4</td>
            <td>1</td>
          </tr>
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td>
              <b>41</b>
            </td>
            <td>
              <b>11</b>
            </td>
          </tr>
        </tbody>
      </table>
      <Callout plain icon="✅" tone="green" title="Shorter, not smarter">
        The PyTorch version doesn’t do anything new. It’s the same 109,386 numbers, the same forward pass, the same{" "}
        <M>{String.raw`p - t`}</M>, the same walk downhill. It just writes it for us, and because we built it ourselves
        first, we know what every one of those short lines is doing.
      </Callout>


      {/* ──────────────────────────── Part 3 ──────────────────────────── */}
      <H2 id="system">Part 3 · System design: the model behind an API</H2>
      <Say host={B}>Gourav, we have a trained model. How does someone actually use it from a browser?</Say>
      <Say host={A}>We wrap it in an API: the browser sends the image, the server runs the forward pass and sends back the answer.</Say>

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
            <div className="font-display font-bold">model.pt</div>
            <div className="mt-1 text-muted">the trained PyTorch weights</div>
          </div>
        </div>
      </Figure>
      <p>
        The UI sends the image as multipart form data; the weights are loaded <i>once</i> at startup. The response holds the
        predicted digit, the confidence, and all 10 probabilities.
      </p>

      <H3 id="api">The API contract</H3>
      <Say host={B}>What exactly does the browser send, and what comes back?</Say>
      <Say host={A}>It POSTs the image to /predict and gets back JSON: the digit, the confidence and all ten probabilities.</Say>
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
      <Say host={B}>Why does preprocessing matter so much?</Say>
      <Say host={A}>The model only knows MNIST-style digits: white on black, centred, 28×28. Everything else has to be converted first.</Say>
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
      <Say host={B}>Show me the code.</Say>
      <Say host={A}>Two files: model.py loads the PyTorch model we trained in Part 2, and main.py is the API.</Say>
      <h4>model.py: load the trained PyTorch model</h4>
      <p>
        Rebuild the same <code>nn.Sequential</code> from <Wiki to="nb-torch">Part 2</Wiki>, load the trained weights from{" "}
        <code>model.pt</code> once, and switch to prediction mode. Training ended at the raw scores because the loss
        applied softmax; here there’s no loss, so we apply softmax ourselves to get probabilities.
      </p>
      <Code
        filename="model.py"
        className="mt-4 text-[0.82em]"
        highlightLines={[9, 16]}
        code={`
import torch
from torch import nn

model = nn.Sequential(                  # the same network we trained in Part 2
    nn.Linear(784, 128), nn.ReLU(),
    nn.Linear(128, 64),  nn.ReLU(),
    nn.Linear(64, 10),
)
model.load_state_dict(torch.load("model.pt"))   # the trained weights, loaded once
model.eval()                                     # predicting, not training

@torch.no_grad()                                 # no gradients needed to predict
def predict_probs(x):
    """x: 784 numbers between 0 and 1  →  10 probabilities"""
    o = model(torch.from_numpy(x).unsqueeze(0))  # (1, 10): one image's scores
    return torch.softmax(o, dim=1)[0].numpy()   # softmax here, since there's no loss now
`}
      />
      <h4>main.py: setup, preprocessing and the endpoint</h4>
      <p>The highlighted lines are the inversion step. Without them a dark-on-light photo is out of distribution.</p>
      <Code
        filename="main.py"
        className="mt-4 text-[0.82em]"
        highlightLines={[11, 12]}
        code={`
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import numpy as np, io
from model import predict_probs           # the PyTorch model, loaded once in model.py

app = FastAPI()

def preprocess(raw: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(raw)).convert("L").resize((28, 28))
    x = np.asarray(img, dtype=np.float32) / 255.0
    if x.mean() > 0.5:                    # dark ink on light paper?
        x = 1.0 - x                       # make it white-on-black, like MNIST
    return x.reshape(784)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image")
    x = preprocess(await file.read())
    probs = predict_probs(x)
    return {"digit": int(probs.argmax()),
            "confidence": float(probs.max()),
            "probabilities": probs.tolist()}
`}
      />
      <p>
        Run it with <code>uvicorn main:app --reload</code>, then open <code>/docs</code>.
      </p>

      <H3 id="design">Design decisions worth saying out loud</H3>
      <Say host={B}>What would you watch out for if this ran for real users?</Say>
      <Say host={A}>Load the model once, validate uploads, and keep preprocessing identical to training.</Say>
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
      <Say host={A}>Let’s recap. Hindesh, what should people take away from today?</Say>
      <Say host={B}>Seven things:</Say>
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
          <b>Build:</b> the whole network fits in a handful of notebook cells of NumPy, and a gradient check proves backprop
          right. In PyTorch the same network is a handful of lines, and now none of it is magic.
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
