"use client";

import Link from "next/link";
import { RenderSlide } from "@/components/deck/RenderSlide";
import { ScaledSlide } from "@/components/deck/ScaledSlide";
import { decks } from "@/episodes/registry";

/** Chapter list that deep-links into the presentation. */
export function EpisodeChapters({ slug }: { slug: string }) {
  const deck = decks[slug];
  if (!deck) return null;
  const chapters = deck.slides.map((s, i) => ({ s, i })).filter(({ s }) => s.chapter);
  return (
    <ol className="space-y-1">
      {chapters.map(({ s, i }) => (
        <li key={s.id}>
          <Link
            href={`/episodes/${slug}/present/#${i + 1}`}
            className="group flex items-baseline gap-3 rounded-lg px-3 py-2 transition hover:bg-surface"
          >
            <span className="w-7 shrink-0 font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm text-muted group-hover:text-text">{s.chapter}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Read mode: every slide, fully built, stacked, with notes. Widgets stay interactive. */
export function EpisodeSlides({ slug }: { slug: string }) {
  const deck = decks[slug];
  if (!deck) return null;
  return (
    <div className="space-y-12">
      {deck.slides.map((s, i) => (
        <section key={s.id} id={`slide-${i + 1}`} className="scroll-mt-24">
          {s.chapter && (
            <h3 className="font-display mb-4 text-xs tracking-[0.25em] text-purple uppercase">{s.chapter}</h3>
          )}
          <div className="overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/40">
            <ScaledSlide>
              <RenderSlide deck={deck} index={i} />
            </ScaledSlide>
          </div>
          <div className="mt-3 flex items-start justify-between gap-6 text-sm">
            <p className="whitespace-pre-line text-muted">
              <span className="mr-2 font-mono text-faint">{i + 1}.</span>
              <span className="text-text">{s.title}</span>
              {s.notes && <span className="mt-1 block text-muted">{s.notes}</span>}
            </p>
            <Link
              href={`/episodes/${slug}/present/#${i + 1}`}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-purple hover:text-text"
            >
              Present from here →
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}

export function slideCount(slug: string) {
  return decks[slug]?.slides.length ?? 0;
}

export function SlideCount({ slug }: { slug: string }) {
  return <>{slideCount(slug)}</>;
}

/** Cover thumbnail: the episode's first slide. */
export function EpisodeCover({ slug }: { slug: string }) {
  const deck = decks[slug];
  if (!deck) return null;
  return (
    <div className="pointer-events-none">
      <ScaledSlide>
        <RenderSlide deck={deck} index={0} />
      </ScaledSlide>
    </div>
  );
}
