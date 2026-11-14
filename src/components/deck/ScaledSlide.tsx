"use client";

import { useLayoutEffect, useRef, useState } from "react";

export const SLIDE_W = 1600;
export const SLIDE_H = 900;

/**
 * Renders a fixed 1600×900 slide canvas, scaled to fit its parent.
 * `fit="contain"` fills a box (present mode); `fit="width"` keeps 16:9
 * at the parent's width (read mode, thumbnails).
 */
export function ScaledSlide({
  children,
  fit = "width",
  className = "",
}: {
  children: React.ReactNode;
  fit?: "width" | "contain";
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(fit === "width" ? width / SLIDE_W : Math.min(width / SLIDE_W, height / SLIDE_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return (
    <div
      ref={outer}
      className={`relative ${fit === "width" ? "w-full" : "h-full w-full"} ${className}`}
      style={fit === "width" ? { aspectRatio: `${SLIDE_W} / ${SLIDE_H}` } : undefined}
    >
      <div
        className="absolute top-1/2 left-1/2 overflow-hidden"
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
