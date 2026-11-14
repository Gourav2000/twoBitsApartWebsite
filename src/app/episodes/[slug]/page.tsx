import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/SiteChrome";
import { HostAvatar } from "@/components/HostAvatar";
import { EpisodeChapters, EpisodeSlides, SlideCount } from "@/components/episode/EpisodeSlides";
import { episodeCode, episodes, getEpisode, getSeries } from "@/content/episodes";
import { site } from "@/site.config";

export const dynamicParams = false;
export function generateStaticParams() {
  return episodes.map((e) => ({ slug: e.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ep = getEpisode(slug);
  if (!ep) return {};
  return { title: `${episodeCode(ep)}: ${ep.title}`, description: ep.description };
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params;
  const ep = getEpisode(slug);
  if (!ep) notFound();
  const s = getSeries(ep.series);
  const idx = episodes.findIndex((e) => e.slug === ep.slug);
  const prev = episodes[idx - 1];
  const next = episodes[idx + 1];
  const live = ep.status === "published";

  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="studio-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-purple/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <Link href="/episodes/" className="text-sm text-muted hover:text-text">
            ← All episodes
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-mono text-purple">{episodeCode(ep)}</span>
            {s && <span className="text-muted">{s.title}: {s.subtitle}</span>}
          </div>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{ep.title}</h1>
          <p className="mt-3 text-lg text-muted sm:text-xl">{ep.subtitle}</p>
          <p className="mt-6 max-w-3xl leading-relaxed text-muted">{ep.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <span className="text-faint">with</span>
            {site.hosts.map((h) => (
              <Link key={h.id} href="/about/" className="flex items-center gap-2.5 font-semibold hover:underline" style={{ color: `var(--${h.color})` }}>
                <HostAvatar host={h} size={32} />
                {h.name}
              </Link>
            ))}
          </div>
          {live ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/episodes/${ep.slug}/present/`}
                className="bg-gradient-brand rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-purple/20 hover:opacity-90"
              >
                ▶ Present
              </Link>
              <a href="#slides" className="rounded-full border border-border-strong px-6 py-3 hover:bg-surface">
                Read the slides (<SlideCount slug={ep.slug} />)
              </a>
              {ep.watchUrl && (
                <a href={ep.watchUrl} className="rounded-full border border-border-strong px-6 py-3 hover:bg-surface">
                  Watch the episode ↗
                </a>
              )}
            </div>
          ) : (
            <div className="mt-8 inline-flex rounded-full bg-amber/10 px-4 py-2 text-sm text-amber">
              Coming soon. We’re recording it.
            </div>
          )}
        </div>
      </section>

      {live ? (
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display px-3 text-xs tracking-[0.25em] text-faint uppercase">Chapters</h2>
            <div className="mt-3">
              <EpisodeChapters slug={ep.slug} />
            </div>
            <h2 className="font-display mt-8 px-3 text-xs tracking-[0.25em] text-faint uppercase">Topics</h2>
            <div className="mt-3 flex flex-wrap gap-1.5 px-3">
              {ep.topics.map((t) => (
                <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
              <b className="text-text">Presenting?</b> Press <kbd className="text-purple">F</kbd> for fullscreen,{" "}
              <kbd className="text-purple">P</kbd> for a presenter window with notes, <kbd className="text-purple">?</kbd>{" "}
              for all shortcuts.
            </div>
          </aside>
          <div id="slides" className="min-w-0 scroll-mt-24">
            <EpisodeSlides slug={ep.slug} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <h2 className="font-display text-xs tracking-[0.25em] text-faint uppercase">What we’ll cover</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ep.topics.map((t) => (
              <span key={t} className="rounded-full border border-border px-3 py-1 text-sm text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <nav className="mx-auto mt-20 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
        {prev ? (
          <Link href={`/episodes/${prev.slug}/`} className="rounded-2xl border border-border p-5 hover:border-purple/50">
            <span className="text-xs text-faint">← Previous · {episodeCode(prev)}</span>
            <div className="font-display mt-1 font-bold">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/episodes/${next.slug}/`} className="rounded-2xl border border-border p-5 text-right hover:border-purple/50">
            <span className="text-xs text-faint">
              Next · {episodeCode(next)} {next.status === "upcoming" && "(coming soon)"} →
            </span>
            <div className="font-display mt-1 font-bold">{next.title}</div>
          </Link>
        )}
      </nav>
    </PageShell>
  );
}
