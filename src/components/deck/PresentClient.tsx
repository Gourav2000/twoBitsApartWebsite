"use client";

import { decks } from "@/episodes/registry";
import { DeckPlayer } from "./DeckPlayer";

export function PresentClient({ slug }: { slug: string }) {
  const deck = decks[slug];
  if (!deck) return <div className="p-10 text-muted">No slides for this episode yet.</div>;
  return <DeckPlayer deck={deck} backHref={`/episodes/${slug}/`} />;
}
