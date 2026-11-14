"use client";

import { DeckContext, StepContext } from "./context";
import type { Deck } from "./types";

export const stepsOf = (deck: Deck, i: number) => Math.max(1, deck.slides[i]?.steps ?? 1);

/** Renders slide `i` of a deck at a given build step. */
export function RenderSlide({
  deck,
  index,
  step,
  interactive = false,
  go = () => {},
}: {
  deck: Deck;
  index: number;
  step?: number;
  interactive?: boolean;
  go?: (id: string) => void;
}) {
  const s = deck.slides[index];
  if (!s) return null;
  const S = s.Component;
  const st = step ?? stepsOf(deck, index) - 1;
  return (
    <DeckContext.Provider value={{ footer: deck.footer, index, total: deck.slides.length, go, interactive }}>
      <StepContext.Provider value={st}>
        <S />
      </StepContext.Provider>
    </DeckContext.Provider>
  );
}
