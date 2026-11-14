"use client";

import Link from "next/link";
import { Callout, Card, Figure, H2 } from "@/components/notes/blocks";
import { M, MB } from "@/components/Math";
import {
  KernelLiftDiagram,
  KnnDiagram,
  LinearDiagram,
  ManyLinesDiagram,
  SvmDiagram,
  TreeDiagram,
} from "./diagrams";

/** A diagram with its caption, centred inside the notes column. */
function Pic({ caption, children }: { caption: React.ReactNode; children: React.ReactNode }) {
  return (
    <Figure wide={false} caption={caption}>
      <div className="flex justify-center">{children}</div>
    </Figure>
  );
}

function Facts({ good, bad, mnist }: { good: string; bad: string; mnist: string }) {
  return (
    <div className="mt-5 grid gap-3 text-[0.92em] sm:grid-cols-3">
      <Card title="Good at" tone="blue">
        {good}
      </Card>
      <Card title="Struggles with" tone="purple">
        {bad}
      </Card>
      <Card title="On MNIST (typical)" tone="neutral">
        {mnist}
      </Card>
    </div>
  );
}

export function BasicsContent() {
  return (
    <>
      <Callout icon="🧭" tone="blue" title="How to use this page">
        A refresher on the classical algorithms, so the episodes can skip them. Each section is one idea, one picture and
        a few lines. Nothing here is required to follow the neural-network episodes, but if a word like “margin” or “k-NN”
        comes up and you want the one-minute version, it’s here.
      </Callout>

      <H2 id="setup">The setup</H2>
      <p>
        Every method below solves the same problem. You have examples, each a list of numbers <M>x</M> with a label{" "}
        <M>y</M>, and you want a function <M>{String.raw`f(x) \approx y`}</M> that works on examples it hasn’t seen. In the
        pictures, the two colours are two classes and each dot is one example in a 2-D toy space.
      </p>
      <p>
        For MNIST, an example is a 28×28 image flattened into <M>784</M> numbers, so it’s a point in a 784-dimensional
        space. You can’t draw that, but the ideas carry over unchanged.
      </p>

      <H2 id="linear">Linear and logistic regression</H2>
      <p>
        Take a weighted sum of the inputs and add a bias, <M>{String.raw`z = w^\top x + b`}</M>. The sign of <M>z</M> picks
        the class, so the boundary <M>{String.raw`w^\top x + b = 0`}</M> is a straight line (a flat plane in higher
        dimensions). Logistic regression squashes <M>z</M> with a sigmoid so the output reads as a probability:
      </p>
      <MB>{String.raw`P(\text{class}=1) = \sigma(z) = \frac{1}{1 + e^{-z}}`}</MB>
      <Pic caption="One straight boundary. The two sides are the two predictions.">
        <LinearDiagram />
      </Pic>
      <p>
        You learn <M>w</M> and <M>b</M> by minimising a loss with gradient descent. That is the same loop the episode builds,
        just with one unit instead of many.
      </p>
      <Facts
        good="Fast, simple, easy to explain. A strong first baseline."
        bad="Anything that isn’t separated by a flat boundary."
        mnist="Around 92 % test accuracy."
      />

      <H2 id="knn">k-Nearest Neighbours</H2>
      <p>
        No training at all. To classify a new point, find the <M>k</M> closest training examples and let them vote. Here{" "}
        <M>k=3</M>: two blue and one purple are nearby, so the ★ is blue.
      </p>
      <Pic caption="The dashed circle holds the 3 nearest neighbours of the ★.">
        <KnnDiagram />
      </Pic>
      <Facts
        good="No training step. Handles odd, curvy boundaries naturally."
        bad="Slow at prediction time, since it compares against all the data. Needs a sensible notion of distance."
        mnist="Around 97 %, which is surprisingly strong."
      />

      <H2 id="trees">Decision trees and random forests</H2>
      <p>
        A tree is a flowchart of yes/no questions about the inputs, ending in a label. A random forest trains many trees on
        different random slices of the data and lets them vote, which cancels out their individual quirks.
      </p>
      <Pic caption="Questions a person might ask about a digit. Real trees ask about pixels instead.">
        <TreeDiagram />
      </Pic>
      <Facts
        good="Readable. Needs little preprocessing. Works well on tables of mixed features."
        bad="One tree overfits easily. On raw pixels the questions aren’t very meaningful."
        mnist="Around 97 % for a forest."
      />

      <H2 id="svm">Support Vector Machine (SVM)</H2>
      <p>
        Start from the same straight boundary as above. The catch is that many lines separate the data equally well, so
        which one should we trust?
      </p>
      <Pic caption="All five lines get every training point right. They disagree on new points near the gap.">
        <ManyLinesDiagram />
      </Pic>
      <p>
        An SVM picks the line with the <b>widest gap</b> to both classes, the margin. Only the points touching the margin,
        the <b>support vectors</b>, decide where the line goes. Delete any other point and nothing changes.
      </p>
      <Pic caption="The ringed points are the support vectors. The dashed lines mark the margin.">
        <SvmDiagram />
      </Pic>

      <KernelTrick />

      <Facts
        good="Strong with modest amounts of data. Clean maths."
        bad="Training cost grows quickly with the number of examples. You have to choose a kernel."
        mnist="Around 98 to 98.5 % with an RBF kernel."
      />

      <H2 id="compare">Side by side</H2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Core idea</th>
            <th>Training</th>
            <th>MNIST (typical)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Logistic regression</td>
            <td>One weighted sum, one flat boundary</td>
            <td>Gradient descent</td>
            <td>≈ 92 %</td>
          </tr>
          <tr>
            <td>k-NN</td>
            <td>Vote among the closest examples</td>
            <td>None (just store the data)</td>
            <td>≈ 97 %</td>
          </tr>
          <tr>
            <td>Random forest</td>
            <td>Many yes/no flowcharts voting</td>
            <td>Greedy splits</td>
            <td>≈ 97 %</td>
          </tr>
          <tr>
            <td>SVM (RBF)</td>
            <td>Widest-margin boundary, bent by a kernel</td>
            <td>Quadratic optimisation</td>
            <td>≈ 98 to 98.5 %</td>
          </tr>
          <tr>
            <td>Neural network</td>
            <td>Stacked weighted sums that learn their own features</td>
            <td>Gradient descent + backprop</td>
            <td>≈ 97 to 98 % (small MLP)</td>
          </tr>
        </tbody>
      </table>
      <p className="text-muted">
        These are rough, commonly reported figures with default-ish settings, not a benchmark. Tuning moves them by a point
        or so either way.
      </p>

      <H2 id="to-nn">From here to neural networks</H2>
      <p>
        Look back at the first section. Logistic regression is one weighted sum followed by a squashing function. That is
        exactly one <b>neuron</b>. A neural network wires many of them into layers, so the early layers compute features
        and the last layer decides, and it trains them all with the same gradient-descent recipe.
      </p>
      <Callout icon="➡️" tone="purple" title="Pick up the story">
        The series starts from this point. In{" "}
        <Link href="/episodes/neural-networks-and-mnist/" className="wikilink">
          Episode 1: Neural Networks and MNIST
        </Link>{" "}
        we build the network in NumPy and put it behind an API.
      </Callout>
    </>
  );
}

/** The kernel-trick sub-section of the SVM part. */
function KernelTrick() {
  return (
    <>
      <p>
        <b>The kernel trick.</b> What if no straight line works? Map each input into a richer space, where a straight line
        might. In the picture below, points on a line can’t be split by a single cut. Lift each to <M>{String.raw`(x, x^2)`}</M>{" "}
        and one straight line splits them. A kernel computes this kind of lifted comparison without ever building the new
        coordinates, which is how an SVM draws curved boundaries.
      </p>
      <Pic caption="Same points before and after the lift x → (x, x²).">
        <KernelLiftDiagram />
      </Pic>
    </>
  );
}
