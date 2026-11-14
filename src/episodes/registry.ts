"use client";

import type { Deck } from "@/components/deck/types";
import { ep01Deck } from "./ep01-neural-networks-and-mnist";

/**
 * Slide decks by episode slug. To add Episode 2: create
 * src/episodes/ep02-micrograd.tsx exporting a Deck, import it here,
 * and set the episode's status to "published" in src/content/episodes.ts.
 */
export const decks: Record<string, Deck> = {
  [ep01Deck.slug]: ep01Deck,
};
