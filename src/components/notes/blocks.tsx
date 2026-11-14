"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Code } from "@/components/Code";
import { StepContext } from "@/components/deck/context";
import { HostAvatar } from "@/components/HostAvatar";
import type { Host } from "@/site.config";

/* Notion / Obsidian-style building blocks for episode notes.
   Plain <p>, <ul>, <ol>, <table>, <blockquote>, <code>, <hr> inside <NotesDoc>
   are styled by the `.notes` rules in globals.css. */

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function Heading({ level, id, children }: { level: 2 | 3; id?: string; children: React.ReactNode }) {
  const text = typeof children === "string" ? children : "";
  const hid = id ?? slug(text);
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={hid} data-toc={level} className="group">
      {children}
      <a href={`#${hid}`} aria-label="Link to this section" className="anchor">
        #
      </a>
    </Tag>
  );
}

export const H2 = (p: { id?: string; children: React.ReactNode }) => <Heading level={2} {...p} />;
export const H3 = (p: { id?: string; children: React.ReactNode }) => <Heading level={3} {...p} />;

const tones = {
  blue: { border: "rgba(61,139,255,.35)", bg: "rgba(61,139,255,.07)", title: "var(--blue)" },
  purple: { border: "rgba(164,92,255,.4)", bg: "rgba(164,92,255,.07)", title: "#c08bff" },
  green: { border: "rgba(61,220,151,.35)", bg: "rgba(61,220,151,.06)", title: "var(--green)" },
  amber: { border: "rgba(255,181,71,.35)", bg: "rgba(255,181,71,.06)", title: "var(--amber)" },
  neutral: { border: "var(--border-strong)", bg: "rgba(255,255,255,.025)", title: "var(--text)" },
};
type Tone = keyof typeof tones;

/** Callout block: icon + optional title + body. */
export function Callout({
  icon = "💡",
  tone = "neutral",
  title,
  children,
  plain = false,
}: {
  icon?: string;
  tone?: Tone;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** no box or background: just icon, coloured title and text */
  plain?: boolean;
}) {
  const t = tones[tone];
  return (
    <div className={`callout ${plain ? "callout-plain" : ""}`} style={plain ? undefined : { borderColor: t.border, background: t.bg }}>
      <span className="callout-icon" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {title && (
          <div className="callout-title" style={{ color: t.title }}>
            {title}
          </div>
        )}
        <div className="callout-body">{children}</div>
      </div>
    </div>
  );
}

/** Collapsible toggle block. Closed by default, so answers stay hidden until you click. */
export function Toggle({ summary, children, open = false }: { summary: React.ReactNode; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="toggle" open={open}>
      <summary>
        <span className="toggle-caret" aria-hidden>
          ▸
        </span>
        <span>{summary}</span>
      </summary>
      <div className="toggle-body">{children}</div>
    </details>
  );
}

/** A line for one host to say: a cue in the host's colour. */
export function Say({ host, children }: { host: Host; children: React.ReactNode }) {
  return (
    <div className="say" style={{ borderColor: `var(--${host.color})` }}>
      <HostAvatar host={host} size={26} />
      <div className="min-w-0">
        <span className="say-name" style={{ color: `var(--${host.color})` }}>
          {host.shortName}
        </span>
        <span className="say-text">{children}</span>
      </div>
    </div>
  );
}

/** Margin note for whoever is presenting: what to do on screen right now. */
export function Cue({ children }: { children: React.ReactNode }) {
  return (
    <div className="cue">
      <span className="cue-tag">cue</span>
      <span>{children}</span>
    </div>
  );
}

/**
 * Embeds a component that was drawn for a fixed-size canvas (the slide widgets
 * and diagrams) and scales it to the column width. Everything renders fully
 * built (every reveal step shown) and stays interactive.
 */
export function Embed({
  width = 1408,
  height,
  caption,
  children,
  maxScale = 1,
}: {
  /** design width of the content, in px */
  width?: number;
  /** fixed design height; leave out to use the content's natural height */
  height?: number;
  caption?: React.ReactNode;
  children: React.ReactNode;
  maxScale?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [natH, setNatH] = useState(height ?? 0);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      setScale(Math.min(maxScale, o.getBoundingClientRect().width / width));
      if (!height) setNatH(i.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width, height, maxScale]);

  return (
    <figure className="embed wide">
      <div className="embed-frame">
        <div ref={outer} className="relative w-full overflow-hidden" style={{ height: natH * scale }}>
          <div
            ref={inner}
            className="absolute top-0 left-1/2 text-[30px] leading-[1.45]"
            style={{
              width,
              height,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
              visibility: scale ? "visible" : "hidden",
            }}
          >
            <StepContext.Provider value={99}>{children}</StepContext.Provider>
          </div>
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Wide figure for native (already responsive) content. */
export function Figure({ caption, children, wide = true }: { caption?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <figure className={`embed ${wide ? "wide" : ""}`}>
      <div className="embed-frame p-5 sm:p-6">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Horizontal chain of steps: a → b → c. Wraps on narrow screens. */
export function Flow({ steps, accent = [] }: { steps: React.ReactNode[]; accent?: number[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className={`rounded-lg border px-3 py-1.5 text-center text-[0.92em] leading-tight ${
              accent.includes(i) ? "border-purple/60 bg-purple/10" : "border-blue/50 bg-blue/10"
            }`}
          >
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-faint">→</span>}
        </div>
      ))}
    </div>
  );
}

/** Two cards side by side (stacked on mobile). */
export function Columns({ children }: { children: React.ReactNode }) {
  return <div className="columns wide">{children}</div>;
}

export function Card({ title, tone = "neutral", children }: { title: React.ReactNode; tone?: Tone; children: React.ReactNode }) {
  const t = tones[tone];
  return (
    <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: t.border, background: t.bg }}>
      <div className="font-display mb-2 font-bold" style={{ color: t.title }}>
        {title}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/** Obsidian-style internal link to a heading on this page: [[Loss]] */
export function Wiki({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a href={`#${to}`} className="wikilink">
      {children}
    </a>
  );
}

/** A Jupyter-style notebook cell: "In [n]:" gutter, code, and optional output. */
export function Cell({ n, code, output }: { n: number; code: string; output?: string }) {
  return (
    <div className="nb-cell wide">
      <div className="nb-row">
        <span className="nb-prompt nb-in">In [{n}]:</span>
        <Code code={code} className="nb-code min-w-0 flex-1 text-[0.8em]" />
      </div>
      {output && (
        <div className="nb-row">
          <span className="nb-prompt nb-out">Out [{n}]:</span>
          <pre className="nb-output">{output.trim()}</pre>
        </div>
      )}
    </div>
  );
}
