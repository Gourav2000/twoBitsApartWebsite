"use client";

import { useState } from "react";

/** Small "Copy" button for a code block. Copies `text` exactly as given. */
export function CopyCodeButton({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  // older copy method: put the text in a hidden textarea, select it, copy
  const fallbackCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  };

  const copy = async () => {
    let ok = false;
    try {
      // the clipboard API can hang (e.g. behind a permission prompt), so don't wait forever
      ok = await Promise.race([
        navigator.clipboard.writeText(text).then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)),
      ]);
    } catch {}
    if (!ok) ok = fallbackCopy();
    setState(ok ? "copied" : "failed"); // failed: the code is still selectable by hand
    setTimeout(() => setState("idle"), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={state === "copied" ? "Copied" : "Copy code"}
      title={state === "copied" ? "Copied" : state === "failed" ? "Couldn’t copy: select the code instead" : "Copy code"}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-strong bg-[#0d121d]/90 transition hover:bg-surface-2 hover:text-text ${
        state === "copied" ? "text-green" : state === "failed" ? "text-red" : "text-muted"
      } ${className}`}
    >
      {state === "copied" ? (
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
          <path d="M10.5 5.5V3.6c0-.9-.7-1.6-1.6-1.6H3.6C2.7 2 2 2.7 2 3.6v5.3c0 .9.7 1.6 1.6 1.6h1.9" />
        </svg>
      )}
    </button>
  );
}
