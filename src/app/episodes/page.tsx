import type { Metadata } from "next";
import { PageShell } from "@/components/SiteChrome";
import { EpisodeCard } from "@/components/episode/EpisodeCard";
import { episodes, series } from "@/content/episodes";

export const metadata: Metadata = { title: "Episodes" };

export default function EpisodesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Episodes</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every episode, written up as notes. Open one to read along; the widgets in it are live, so you can poke at them while
          you listen.
        </p>
      </section>
      {series.map((s, i) => (
        <section key={s.slug} className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          <div className="border-b border-border pb-4">
            <span className="font-mono text-xs text-purple">SEASON {i + 1}</span>
            <h2 className="font-display mt-1 text-2xl font-bold">
              {s.title} <span className="text-muted">· {s.subtitle}</span>
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">{s.description}</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {episodes
              .filter((e) => e.series === s.slug)
              .map((ep) => (
                <EpisodeCard key={ep.slug} ep={ep} />
              ))}
          </div>
        </section>
      ))}
    </PageShell>
  );
}
