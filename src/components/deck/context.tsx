"use client";

import { createContext, useContext } from "react";

type DeckCtx = {
  footer: string;
  index: number;
  total: number;
  /** jump to a slide by id (agenda buttons). No-op in read mode. */
  go: (id: string) => void;
  interactive: boolean;
};

export const DeckContext = createContext<DeckCtx>({
  footer: "",
  index: 0,
  total: 0,
  go: () => {},
  interactive: false,
});

/** current build step of the slide being rendered */
export const StepContext = createContext<number>(0);

export const useDeck = () => useContext(DeckContext);
export const useStep = () => useContext(StepContext);

/** Reveal children once the slide reaches build step `at`. */
export function R({
  at,
  children,
  className = "",
  fade = false,
  as: Tag = "div",
}: {
  at: number;
  children: React.ReactNode;
  className?: string;
  fade?: boolean;
  as?: "div" | "span" | "li";
}) {
  const step = useStep();
  return (
    <Tag className={`${fade ? "reveal-fade" : "reveal"} ${className}`} data-hidden={step < at}>
      {children}
    </Tag>
  );
}

/** Same as R but for SVG groups. */
export function RG({ at, children, className = "" }: { at: number; children: React.ReactNode; className?: string }) {
  const step = useStep();
  return (
    <g className={`reveal-fade ${className}`} data-hidden={step < at}>
      {children}
    </g>
  );
}

export function useShown(at: number) {
  return useStep() >= at;
}
