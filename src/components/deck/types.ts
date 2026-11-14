import type { ComponentType } from "react";

export type SlideDef = {
  /** stable id, used for agenda jumps (`go("neuron")`) */
  id: string;
  /** shown in the overview grid, read mode and presenter view */
  title: string;
  /** number of build steps (like PDF overlays). Defaults to 1. */
  steps?: number;
  /** if set, this slide starts a chapter on the episode page */
  chapter?: string;
  /** speaker notes, shown in presenter view (P) and read mode */
  notes?: string;
  Component: ComponentType;
};

export type Deck = {
  slug: string;
  /** footer text on every slide */
  footer: string;
  slides: SlideDef[];
};
