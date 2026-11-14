"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type ExplorerItem = { slug: string; code: string; title: string; live: boolean };
type TocItem = { id: string; text: string; level: number };

const SIZES = [15, 16.5, 18, 20, 22.5];
const SIZE_KEY = "tba-notes-size";

/**
 * Notion / Obsidian-style reading layout:
 * file explorer (left) · document (centre) · outline with scroll-spy (right).
 * Focus mode (F) hides both sidebars and bumps the text size for presenting.
 */
export function NotesLayout({
  seriesTitle,
  items,
  current,
  children,
}: {
  seriesTitle: string;
  items: ExplorerItem[];
  current: string;
  children: React.ReactNode;
}) {
  const docRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");
  const [focus, setFocus] = useState(false);
  const [size, setSize] = useState(1);
  const [progress, setProgress] = useState(0);
  const [help, setHelp] = useState(false);

  // Keep the reader's place when the column width changes (focus mode, text size):
  // remember the block at the top of the viewport and put it back after re-layout.
  const anchor = useRef<{ el: Element; top: number } | null>(null);
  const keepPlace = useCallback(() => {
    const el = docRef.current;
    if (!el) return;
    const blocks = Array.from(el.querySelectorAll(":scope > *"));
    const b = blocks.find((x) => x.getBoundingClientRect().bottom > 120);
    if (b) anchor.current = { el: b, top: b.getBoundingClientRect().top };
  }, []);
  const toggleFocus = useCallback(() => {
    keepPlace();
    setFocus((v) => !v);
  }, [keepPlace]);
  const resize = useCallback(
    (d: 1 | -1) => {
      keepPlace();
      setSize((s) => Math.min(SIZES.length - 1, Math.max(0, s + d)));
    },
    [keepPlace],
  );
  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    // embedded widgets re-measure a frame or two later, so keep correcting briefly
    const until = performance.now() + 700;
    let raf = 0;
    const fix = () => {
      const d = a.el.getBoundingClientRect().top - a.top;
      if (Math.abs(d) > 1) window.scrollBy(0, d);
      if (performance.now() < until) raf = requestAnimationFrame(fix);
    };
    fix();
    return () => cancelAnimationFrame(raf);
  }, [focus, size]);

  // remembered text size (per viewer)
  useEffect(() => {
    try {
      const s = Number(localStorage.getItem(SIZE_KEY));
      if (s >= 0 && s < SIZES.length) setSize(s);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(SIZE_KEY, String(size));
    } catch {}
  }, [size]);

  // build the outline from the headings on the page
  useEffect(() => {
    const el = docRef.current;
    if (!el) return;
    const hs = Array.from(el.querySelectorAll<HTMLElement>("[data-toc]"));
    setToc(hs.map((h) => ({ id: h.id, text: h.firstChild?.textContent ?? "", level: Number(h.dataset.toc) })));
  }, []);

  // scroll-spy + reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = docRef.current;
      if (!el) return;
      const hs = Array.from(el.querySelectorAll<HTMLElement>("[data-toc]"));
      let cur = hs[0]?.id ?? "";
      for (const h of hs) {
        if (h.getBoundingClientRect().top < 180) cur = h.id;
        else break;
      }
      setActive(cur);
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

  const jump = useCallback(
    (dir: 1 | -1, level?: number) => {
      const list = level ? toc.filter((t) => t.level === level) : toc;
      if (!list.length) return;
      const els = list.map((t) => document.getElementById(t.id)!).filter(Boolean);
      const tops = els.map((e) => e.getBoundingClientRect().top);
      let idx: number;
      if (dir === 1) idx = tops.findIndex((t) => t > 100);
      else idx = tops.map((t, i) => [t, i] as const).filter(([t]) => t < 60).pop()?.[1] ?? 0;
      const target = els[idx === -1 ? els.length - 1 : idx];
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${target.id}`);
    },
    [toc],
  );

  // keyboard: F focus · j/k next/prev heading · J/K next/prev section · +/- size · ? help
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "f" || e.key === "F") toggleFocus();
      else if (e.key === "Escape") {
        if (focus) toggleFocus();
        setHelp(false);
      } else if (e.key === "j") jump(1);
      else if (e.key === "k") jump(-1);
      else if (e.key === "J") jump(1, 2);
      else if (e.key === "K") jump(-1, 2);
      else if (e.key === "+" || e.key === "=") resize(1);
      else if (e.key === "-" || e.key === "_") resize(-1);
      else if (e.key === "?") setHelp((v) => !v);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, toggleFocus, resize, focus]);

  const fontSize = SIZES[size] + (focus ? 2.5 : 0);
  // the level-2 section that contains the active heading
  const activeSection = (() => {
    let sec = "";
    for (const t of toc) {
      if (t.level === 2) sec = t.id;
      if (t.id === active) break;
    }
    return sec;
  })();

  return (
    <div className={focus ? "notes-focus" : ""}>
      {/* reading progress */}
      <div className="fixed top-0 left-0 z-50 h-[2px] bg-gradient-brand transition-[width]" style={{ width: `${progress * 100}%` }} />

      <div
        className={`mx-auto grid gap-8 px-4 sm:px-6 ${
          focus ? "max-w-[1180px] grid-cols-1" : "max-w-[1440px] lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_210px]"
        }`}
      >
        {/* explorer */}
        {!focus && (
          <aside className="hidden lg:block">
            <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 text-sm">
              <div className="px-2 text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">Explorer</div>
              <div className="mt-3 flex items-center gap-1.5 px-2 py-1 text-muted">
                <span className="text-[10px] text-faint">▾</span>
                <span aria-hidden>📁</span>
                <span className="truncate">{seriesTitle}</span>
              </div>
              <ul className="mt-0.5 ml-4 border-l border-border pl-1">
                {items.map((it) => {
                  const on = it.slug === current;
                  const row = (
                    <span
                      className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                        on ? "bg-surface-2 text-text" : it.live ? "text-muted hover:bg-surface hover:text-text" : "text-faint"
                      }`}
                    >
                      <span aria-hidden className="text-xs">📄</span>
                      <span className="font-mono text-[11px] text-faint">{it.code.replace("EP ", "")}</span>
                      <span className="truncate">{it.title}</span>
                      {!it.live && <span className="ml-auto text-[10px] text-faint">soon</span>}
                    </span>
                  );
                  return (
                    <li key={it.slug}>
                      <Link href={`/episodes/${it.slug}/`}>{row}</Link>
                      {on && toc.length > 0 && (
                        <ul className="mt-0.5 mb-1 ml-5 border-l border-border pl-1">
                          {toc
                            .filter((t) => t.level === 2)
                            .map((t) => (
                              <li key={t.id}>
                                <a
                                  href={`#${t.id}`}
                                  className={`block truncate rounded px-2 py-0.5 text-[12.5px] ${
                                    activeSection === t.id
                                      ? "text-text"
                                      : "text-faint hover:text-muted"
                                  }`}
                                >
                                  {t.text}
                                </a>
                              </li>
                            ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}

        {/* document */}
        <div className="min-w-0 py-8">
          <div className="sticky top-16 z-30 -mx-2 mb-2 flex items-center justify-end gap-1 bg-bg/85 px-2 py-2 backdrop-blur-sm">
            <button onClick={() => resize(-1)} className="tool" aria-label="Smaller text" title="Smaller text (−)">
              A−
            </button>
            <button onClick={() => resize(1)} className="tool" aria-label="Larger text" title="Larger text (+)">
              A+
            </button>
            <button onClick={toggleFocus} className={`tool ${focus ? "tool-on" : ""}`} title="Focus mode (F)">
              {focus ? "Exit focus" : "Focus"}
            </button>
            <button onClick={() => setHelp((v) => !v)} className="tool" aria-label="Keyboard shortcuts" title="Shortcuts (?)">
              ?
            </button>
          </div>
          <div ref={docRef} className="notes" style={{ fontSize }}>
            {children}
          </div>
        </div>

        {/* outline */}
        {!focus && (
          <aside className="hidden xl:block">
            <nav className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 text-[13px]">
              <div className="text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">On this page</div>
              <ul className="mt-3 space-y-0.5 border-l border-border">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={`-ml-px block border-l py-1 leading-snug transition ${t.level === 3 ? "pl-6" : "pl-3"} ${
                        active === t.id ? "border-purple text-text" : "border-transparent text-faint hover:text-muted"
                      }`}
                    >
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {help && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setHelp(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-surface p-6 text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg font-bold">Shortcuts</div>
            <dl className="mt-4 grid grid-cols-[90px_1fr] gap-y-2">
              {[
                ["F", "focus mode (presenting)"],
                ["j / k", "next / previous heading"],
                ["J / K", "next / previous section"],
                ["+ / −", "text size"],
                ["Esc", "leave focus mode"],
                ["?", "this help"],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt>
                    <kbd className="rounded border border-border-strong bg-bg-2 px-1.5 py-0.5 font-mono text-xs text-purple">{k}</kbd>
                  </dt>
                  <dd className="text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
