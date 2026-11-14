"use client";

import { useRef, useState } from "react";

/**
 * Shows an email address as plain, selectable text with a copy button.
 * (mailto: links do nothing for people without a desktop mail app set up.)
 */
export function CopyEmail({
  email,
  color,
  size = "md",
  className = "",
}: {
  email: string;
  color?: "blue" | "purple";
  size?: "sm" | "md";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // clipboard blocked: select the text so Ctrl+C works
      const sel = window.getSelection();
      const range = document.createRange();
      if (textRef.current && sel) {
        range.selectNodeContents(textRef.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const sm = size === "sm";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-strong bg-bg-2/60 ${
        sm ? "py-0.5 pr-0.5 pl-2.5 text-xs" : "py-1 pr-1 pl-3.5 text-sm"
      } ${className}`}
    >
      <span
        ref={textRef}
        className="truncate font-mono select-all"
        style={color ? { color: `var(--${color})` } : undefined}
      >
        {email}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${email}`}
        title="Copy email"
        className={`inline-flex shrink-0 items-center gap-1 rounded-full text-muted transition hover:bg-surface-2 hover:text-text ${
          sm ? "px-1.5 py-0.5" : "px-2.5 py-1"
        }`}
      >
        {copied ? (
          <>
            <svg viewBox="0 0 16 16" width={sm ? 12 : 14} height={sm ? 12 : 14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 8.5l3.2 3L13 4.5" />
            </svg>
            <span className="text-[0.8em]">Copied</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" width={sm ? 12 : 14} height={sm ? 12 : 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
              <path d="M10.5 5.5V3.6c0-.9-.7-1.6-1.6-1.6H3.6C2.7 2 2 2.7 2 3.6v5.3c0 .9.7 1.6 1.6 1.6h1.9" />
            </svg>
            {!sm && <span className="text-[0.8em]">Copy</span>}
          </>
        )}
      </button>
    </span>
  );
}
