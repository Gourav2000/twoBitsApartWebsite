"use client";

import { useState } from "react";
import { M } from "@/components/Math";

const DEFAULT = [
  { label: "7", z: 2.0 },
  { label: "1", z: 1.0 },
  { label: "9", z: 0.1 },
];

/** Drag the raw scores, watch softmax probabilities and cross-entropy move. */
export function SoftmaxPlayground() {
  const [classes, setClasses] = useState(DEFAULT);
  const [truth, setTruth] = useState(0);

  const exps = classes.map((c) => Math.exp(c.z));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sum);
  const argmax = probs.indexOf(Math.max(...probs));
  const loss = -Math.log(probs[truth]);

  const setZ = (i: number, z: number) => setClasses((cs) => cs.map((c, j) => (j === i ? { ...c, z } : c)));

  return (
    <div className="grid h-full grid-cols-[1fr_520px] gap-14 text-[24px]">
      <div className="flex flex-col gap-6">
        {classes.map((c, i) => (
          <div key={c.label} className="grid grid-cols-[150px_1fr] items-center gap-6">
            <button
              onClick={() => setTruth(i)}
              className={`flex items-center justify-between rounded-xl border px-4 py-2 text-[34px] font-bold ${
                truth === i ? "border-green bg-green/10 text-green" : "border-border-strong text-text hover:bg-surface-2"
              }`}
              title="Mark as the true digit"
            >
              “{c.label}”
              {truth === i && <span className="text-[14px] font-normal tracking-widest uppercase">true</span>}
            </button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="w-24 text-[20px] text-muted">score z</span>
                <input
                  type="range"
                  min={-4}
                  max={6}
                  step={0.1}
                  value={c.z}
                  onChange={(e) => setZ(i, parseFloat(e.target.value))}
                  className="tba-range"
                />
                <span className="w-20 text-right font-mono">{c.z.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-[20px] text-muted">probability</span>
                <div className="h-8 flex-1 overflow-hidden rounded-lg bg-surface-2">
                  <div
                    className={`h-full rounded-lg transition-[width] duration-200 ${i === argmax ? "bg-gradient-brand" : "bg-[#4a5368]"}`}
                    style={{ width: `${probs[i] * 100}%` }}
                  />
                </div>
                <span className="w-20 text-right font-mono">{probs[i].toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            setClasses(DEFAULT);
            setTruth(0);
          }}
          className="w-fit rounded-full border border-border-strong px-5 py-1.5 text-[20px] hover:bg-surface-2"
        >
          reset to the slide’s numbers
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-border-strong bg-surface/70 p-5">
          <table className="w-full font-mono text-[22px]">
            <thead>
              <tr className="text-faint">
                <td className="pb-2 font-sans">class</td>
                {classes.map((c) => (
                  <td key={c.label} className="pb-2 text-right">“{c.label}”</td>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-sans text-muted">z</td>
                {classes.map((c) => <td key={c.label} className="text-right">{c.z.toFixed(1)}</td>)}
              </tr>
              <tr>
                <td className="font-sans text-muted"><M>{"e^{z}"}</M></td>
                {exps.map((e, i) => <td key={i} className="text-right">{e.toFixed(2)}</td>)}
              </tr>
              <tr className="text-[#c08bff]">
                <td className="font-sans">prob</td>
                {probs.map((p, i) => <td key={i} className="text-right">{p.toFixed(2)}</td>)}
              </tr>
            </tbody>
          </table>
          <div className="mt-3 border-t border-border pt-3 text-[20px] text-muted">
            sum of <M>{"e^{z}"}</M> = <span className="font-mono text-text">{sum.toFixed(2)}</span> · probabilities sum to{" "}
            <span className="font-mono text-text">{probs.reduce((a, b) => a + b, 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple/50 bg-purple/10 p-5">
          <div className="text-[18px] tracking-widest text-faint uppercase">prediction</div>
          <div className="mt-1 text-[30px]">
            “{classes[argmax].label}” with confidence <span className="font-mono">{probs[argmax].toFixed(2)}</span>
          </div>
          <div className="mt-4 text-[18px] tracking-widest text-faint uppercase">cross-entropy loss</div>
          <div className="mt-1 flex items-baseline gap-3 text-[30px]">
            <M>{String.raw`L = -\ln ${probs[truth].toFixed(2)} =`}</M>
            <span className={`font-mono font-bold ${loss < 0.2 ? "text-green" : loss > 1.5 ? "text-red" : "text-amber"}`}>
              {loss.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[19px] text-muted">Click a class on the left to mark it as the true digit.</div>
        </div>
      </div>
    </div>
  );
}
