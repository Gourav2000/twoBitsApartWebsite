"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RenderSlide, stepsOf } from "./RenderSlide";
import { ScaledSlide } from "./ScaledSlide";
import type { Deck } from "./types";

type Pos = { index: number; step: number };

/** Text fields own every key. */
const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return !["range", "checkbox", "radio", "button"].includes(type);
  }
  return tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
};

/** Sliders own the arrow keys; buttons own Space. Clicker keys (PgUp/PgDn) always navigate. */
const ownsKey = (t: EventTarget | null, key: string) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "INPUT" && (el as HTMLInputElement).type === "range")
    return key.startsWith("Arrow") || key === "Home" || key === "End";
  if (el.tagName === "BUTTON" || el.tagName === "A") return key === " " || key === "Enter";
  return false;
};

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * Full-screen presentation player.
 * Keys: → / Space / PgDn next · ← / PgUp prev · Home/End · F fullscreen ·
 * O overview · P presenter window · N notes · B blackout · ? help
 */
export function DeckPlayer({ deck, backHref }: { deck: Deck; backHref: string }) {
  const total = deck.slides.length;
  const [pos, setPos] = useState<Pos>({ index: 0, step: 0 });
  const [ready, setReady] = useState(false);
  const [presenter, setPresenter] = useState(false);
  const [overview, setOverview] = useState(false);
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const [black, setBlack] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const chan = useRef<BroadcastChannel | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef(pos);

  // ── initial position from URL hash (#12) and mode from ?presenter ────
  useEffect(() => {
    const n = parseInt(window.location.hash.replace("#", ""), 10);
    if (n >= 1 && n <= total) setPos({ index: n - 1, step: 0 });
    setPresenter(new URLSearchParams(window.location.search).has("presenter"));
    setReady(true);
  }, [total]);

  // ── sync between audience window and presenter window ────────────────
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const c = new BroadcastChannel(`tba-deck-${deck.slug}`);
    chan.current = c;
    c.onmessage = (e) => {
      const d = e.data as { type: string; pos?: Pos; black?: boolean };
      if (d.type === "pos" && d.pos) setPos((p) => (p.index === d.pos!.index && p.step === d.pos!.step ? p : d.pos!));
      if (d.type === "black") setBlack(!!d.black);
      if (d.type === "hello") c.postMessage({ type: "pos", pos: posRef.current });
    };
    c.postMessage({ type: "hello" });
    return () => c.close();
  }, [deck.slug]);

  useEffect(() => {
    posRef.current = pos;
    if (!ready) return;
    chan.current?.postMessage({ type: "pos", pos });
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${pos.index + 1}`);
  }, [pos, ready]);

  useEffect(() => {
    chan.current?.postMessage({ type: "black", black });
  }, [black]);

  // presenter timer
  useEffect(() => {
    if (!presenter) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [presenter]);

  // ── navigation ───────────────────────────────────────────────────────
  const next = useCallback(() => {
    setPos((p) => {
      if (p.step < stepsOf(deck, p.index) - 1) return { ...p, step: p.step + 1 };
      if (p.index < total - 1) return { index: p.index + 1, step: 0 };
      return p;
    });
  }, [deck, total]);

  const prev = useCallback(() => {
    setPos((p) => {
      if (p.step > 0) return { ...p, step: p.step - 1 };
      if (p.index > 0) return { index: p.index - 1, step: stepsOf(deck, p.index - 1) - 1 };
      return p;
    });
  }, [deck]);

  const goIndex = useCallback((i: number, full = false) => {
    const idx = Math.max(0, Math.min(total - 1, i));
    setPos({ index: idx, step: full ? stepsOf(deck, idx) - 1 : 0 });
  }, [deck, total]);

  const go = useCallback(
    (id: string) => {
      const i = deck.slides.findIndex((s) => s.id === id);
      if (i >= 0) goIndex(i);
    },
    [deck, goIndex],
  );

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  const openPresenter = () => {
    const url = `${window.location.pathname}?presenter#${pos.index + 1}`;
    window.open(url, `tba-presenter-${deck.slug}`, "width=1280,height=800");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (ownsKey(e.target, k)) return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(k)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) {
        e.preventDefault();
        prev();
      } else if (k === "Home") goIndex(0);
      else if (k === "End") goIndex(total - 1, true);
      else if (k === "f" || k === "F") toggleFullscreen();
      else if (k === "o" || k === "O") setOverview((v) => !v);
      else if (k === "n" || k === "N") setNotes((v) => !v);
      else if (k === "p" || k === "P") openPresenter();
      else if (k === "b" || k === "B" || k === ".") setBlack((v) => !v);
      else if (k === "?") setHelp((v) => !v);
      else if (k === "Escape") {
        setOverview(false);
        setHelp(false);
        setNotes(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // auto-hide the control bar
  const poke = () => {
    setChrome(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), 2200);
  };
  useEffect(() => {
    poke();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const slide = deck.slides[pos.index];
  const steps = stepsOf(deck, pos.index);
  // overall progress counts build steps too
  const progress = (pos.index + (steps > 1 ? pos.step / (steps - 1) : 1)) / total;

  if (!ready) return <div className="h-dvh w-full bg-bg" />;

  // ── presenter window ─────────────────────────────────────────────────
  if (presenter) {
    const nextPos: Pos | null =
      pos.step < steps - 1
        ? { index: pos.index, step: pos.step + 1 }
        : pos.index < total - 1
          ? { index: pos.index + 1, step: 0 }
          : null;
    return (
      <div className="flex h-dvh flex-col gap-4 bg-bg p-4 text-text">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="font-display tracking-widest uppercase">Presenter view</span>
          <span className="font-mono text-2xl text-text">{fmtTime(elapsed)}</span>
          <span>
            slide <b className="text-text">{pos.index + 1}</b> / {total} · step {pos.step + 1}/{steps}
            {black && <span className="ml-3 rounded bg-red/20 px-2 py-0.5 text-red">BLACKOUT</span>}
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-4">
          <div className="flex min-h-0 flex-col gap-2">
            <div className="text-xs tracking-widest text-faint uppercase">Now</div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border-strong">
              <ScaledSlide fit="contain">
                <RenderSlide deck={deck} index={pos.index} step={pos.step} interactive go={go} />
              </ScaledSlide>
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <div className="text-xs tracking-widest text-faint uppercase">Next</div>
            <div className="overflow-hidden rounded-xl border border-border opacity-80">
              {nextPos ? (
                <ScaledSlide>
                  <RenderSlide deck={deck} index={nextPos.index} step={nextPos.step} />
                </ScaledSlide>
              ) : (
                <div className="flex aspect-video items-center justify-center text-muted">End of episode</div>
              )}
            </div>
            <div className="text-xs tracking-widest text-faint uppercase">Notes · {slide.title}</div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-4 text-[17px] leading-relaxed whitespace-pre-line">
              {slide.notes || <span className="text-faint">No notes for this slide.</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={prev} className="flex-1 rounded-lg bg-surface-2 py-3 hover:bg-surface">← Prev</button>
              <button onClick={() => setBlack((v) => !v)} className="rounded-lg bg-surface-2 px-4 py-3 hover:bg-surface">B</button>
              <button onClick={() => setElapsed(0)} className="rounded-lg bg-surface-2 px-4 py-3 hover:bg-surface">⟲</button>
              <button onClick={next} className="bg-gradient-brand flex-1 rounded-lg py-3 font-semibold">Next →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── audience / main window ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black" onMouseMove={poke}>
      <ScaledSlide fit="contain">
        <div key={pos.index} className="slide-enter h-full w-full">
          <RenderSlide deck={deck} index={pos.index} step={pos.step} interactive go={go} />
        </div>
      </ScaledSlide>

      {/* progress */}
      <div className="absolute right-0 bottom-0 left-0 h-[3px] bg-white/5">
        <div className="bg-gradient-brand h-full transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* controls */}
      <div
        className={`absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/90 px-2 py-1.5 text-sm text-muted shadow-2xl backdrop-blur transition-opacity duration-300 ${
          chrome && !overview ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Link href={backHref} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Exit">✕</Link>
        <button onClick={prev} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Previous (←)">←</button>
        <span className="min-w-20 text-center font-mono text-text">
          {pos.index + 1} / {total}
        </span>
        <button onClick={next} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Next (→)">→</button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button onClick={() => setOverview(true)} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Overview (O)">▦</button>
        <button onClick={() => setNotes((v) => !v)} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Notes (N)">✎</button>
        <button onClick={openPresenter} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Presenter window (P)">⧉</button>
        <button onClick={toggleFullscreen} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Fullscreen (F)">⛶</button>
        <button onClick={() => setHelp(true)} className="rounded-full px-3 py-1.5 hover:bg-surface-2 hover:text-text" title="Shortcuts (?)">?</button>
      </div>

      {/* notes overlay */}
      {notes && (
        <div className="absolute right-6 bottom-20 max-h-[40vh] w-[min(560px,90vw)] overflow-y-auto rounded-xl border border-border-strong bg-surface/95 p-5 text-[15px] leading-relaxed whitespace-pre-line text-text shadow-2xl backdrop-blur">
          <div className="mb-2 text-xs tracking-widest text-faint uppercase">Notes · {slide.title}</div>
          {slide.notes || <span className="text-faint">No notes for this slide.</span>}
        </div>
      )}

      {/* blackout */}
      {black && <div className="absolute inset-0 bg-black" onClick={() => setBlack(false)} />}

      {/* overview grid */}
      {overview && (
        <div className="absolute inset-0 overflow-y-auto bg-bg/95 p-6 backdrop-blur">
          <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between text-muted">
            <span className="font-display tracking-widest uppercase">All slides</span>
            <button onClick={() => setOverview(false)} className="rounded-full px-3 py-1 hover:bg-surface">Close (Esc)</button>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {deck.slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  goIndex(i);
                  setOverview(false);
                }}
                className={`group text-left ${i === pos.index ? "ring-2 ring-purple" : ""} overflow-hidden rounded-lg border border-border`}
              >
                <div className="pointer-events-none">
                  <ScaledSlide>
                    <RenderSlide deck={deck} index={i} />
                  </ScaledSlide>
                </div>
                <div className="flex gap-2 bg-surface px-3 py-2 text-xs text-muted group-hover:text-text">
                  <span className="font-mono text-faint">{i + 1}</span>
                  <span className="truncate">{s.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* help */}
      {help && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70" onClick={() => setHelp(false)}>
          <div className="w-[min(480px,92vw)] rounded-2xl border border-border-strong bg-surface p-6 text-sm text-text">
            <h3 className="font-display mb-4 text-lg font-bold">Keyboard shortcuts</h3>
            {[
              ["→  Space  PgDn", "next step / slide"],
              ["←  PgUp", "previous"],
              ["Home / End", "first / last slide"],
              ["F", "fullscreen"],
              ["O", "overview of all slides"],
              ["P", "open presenter window (notes, next slide, timer)"],
              ["N", "notes overlay"],
              ["B  or  .", "blackout screen"],
              ["Esc", "close overlays"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-2 last:border-0">
                <kbd className="font-mono text-purple">{k}</kbd>
                <span className="text-muted">{v}</span>
              </div>
            ))}
            <p className="mt-4 text-xs text-faint">Presentation clickers send PgUp/PgDn and work out of the box.</p>
          </div>
        </div>
      )}
    </div>
  );
}
