"use client";

import type { ComponentType } from "react";
import { Ep01Notes } from "./ep01-notes";

/**
 * Episode notes by slug. To add Episode 2: write src/episodes/ep02-notes.tsx
 * (blocks live in src/components/notes/blocks.tsx), register it here, and set
 * the episode's status to "published" in src/content/episodes.ts.
 */
const notes: Record<string, ComponentType> = {
  "neural-networks-and-mnist": Ep01Notes,
};

export function EpisodeNotes({ slug }: { slug: string }) {
  const Notes = notes[slug];
  return Notes ? <Notes /> : null;
}
