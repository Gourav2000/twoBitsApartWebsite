"use client";

import katex from "katex";
import { useMemo } from "react";

/** Inline math: <M>{String.raw`w^\top x + b`}</M> */
export function M({ children, className = "" }: { children: string; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: false }),
    [children],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Display math, centred block. */
export function MB({ children, className = "" }: { children: string; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: true }),
    [children],
  );
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
