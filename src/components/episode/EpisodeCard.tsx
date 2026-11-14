import Link from "next/link";
import { episodeCode, type Episode } from "@/content/episodes";
import { EpisodeCover } from "./EpisodeSlides";

export function EpisodeCard({ ep }: { ep: Episode }) {
  const live = ep.status === "published";
  const inner = (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition ${
        live ? "border-border hover:-translate-y-1 hover:border-purple/60 hover:shadow-2xl hover:shadow-purple/10" : "border-dashed border-border"
      }`}
    >
      <div className="relative aspect-video overflow-hidden border-b border-border bg-bg-2">
        {live ? (
          <EpisodeCover slug={ep.slug} />
        ) : (
          <div className="studio-grid flex h-full flex-col items-center justify-center gap-2">
            <span className="font-display text-6xl font-bold text-border-strong">{String(ep.number).padStart(2, "0")}</span>
            <span className="text-xs tracking-[0.3em] text-faint uppercase">In the works</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-purple">{episodeCode(ep)}</span>
          {live ? (
            <span className="rounded-full bg-green/10 px-2 py-0.5 text-green">Out now</span>
          ) : (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-amber">Coming soon</span>
          )}
        </div>
        <h3 className="font-display mt-3 text-xl font-bold">{ep.title}</h3>
        <p className="mt-1 text-sm text-muted">{ep.subtitle}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {ep.topics.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-faint">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
  return live ? (
    <Link href={`/episodes/${ep.slug}/`} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
