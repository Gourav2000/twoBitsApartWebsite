import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/SiteChrome";
import { HostAvatar } from "@/components/HostAvatar";
import { LogoMark } from "@/components/Logo";
import { NotesLayout } from "@/components/notes/NotesLayout";
import { EpisodeNotes } from "@/episodes/notes";
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
  const siblings = episodes.filter((e) => e.series === ep.series);

  return (
    <PageShell>
      <NotesLayout
        seriesTitle={s?.title ?? "Episodes"}
        current={ep.slug}
        items={siblings.map((e) => ({ slug: e.slug, code: episodeCode(e), title: e.title, live: e.status === "published" }))}
      >
        {/* breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-[0.8em] text-faint">
          <Link href="/episodes/" className="plain hover:text-muted">
            Episodes
          </Link>
          <span>/</span>
          <span>{s?.title}</span>
          <span>/</span>
          <span className="text-muted">{episodeCode(ep)}</span>
        </div>

        {/* page icon + title */}
        <div className="mt-8">
          <LogoMark size={56} />
        </div>
        <h1 className="font-display mt-5 text-[2.4em] leading-[1.1] font-bold tracking-tight text-text">{ep.title}</h1>
        <p className="mt-2 text-[1.15em] text-muted">{ep.subtitle}</p>

        {/* properties */}
        <dl className="props">
          <dt>
            <span aria-hidden>📺</span> Series
          </dt>
          <dd>
            {s?.title}: {s?.subtitle}
          </dd>
          <dt>
            <span aria-hidden>#</span> Episode
          </dt>
          <dd className="font-mono text-purple">{episodeCode(ep)}</dd>
          <dt>
            <span aria-hidden>🎙</span> Hosts
          </dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1.5">
            {site.hosts.map((h) => (
              <Link key={h.id} href="/about/" className="plain flex items-center gap-2 hover:underline" style={{ color: `var(--${h.color})` }}>
                <HostAvatar host={h} size={22} />
                {h.name}
              </Link>
            ))}
          </dd>
          <dt>
            <span aria-hidden>◉</span> Status
          </dt>
          <dd>
            {live ? (
              <span className="rounded bg-green/10 px-1.5 py-0.5 text-green">Out now</span>
            ) : (
              <span className="rounded bg-amber/10 px-1.5 py-0.5 text-amber">Coming soon</span>
            )}
          </dd>
          <dt>
            <span aria-hidden>🏷</span> Topics
          </dt>
          <dd className="flex flex-wrap gap-1.5">
            {ep.topics.map((t) => (
              <span key={t} className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em] text-muted">
                {t}
              </span>
            ))}
          </dd>
          {ep.watchUrl && (
            <>
              <dt>
                <span aria-hidden>▶</span> Watch
              </dt>
              <dd>
                <a href={ep.watchUrl} target="_blank" rel="noopener noreferrer">
                  Recorded episode ↗
                </a>
              </dd>
            </>
          )}
        </dl>

        <blockquote className="mt-6">{ep.description}</blockquote>

        <hr />

        {live ? (
          <EpisodeNotes slug={ep.slug} />
        ) : (
          <p className="text-muted">We’re recording this one. The notes will appear here when the episode is out.</p>
        )}

        {/* prev / next */}
        <nav className="wide mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/episodes/${prev.slug}/`} className="plain rounded-xl border border-border p-4 hover:border-purple/50">
              <span className="text-xs text-faint">← Previous · {episodeCode(prev)}</span>
              <div className="font-display mt-1 font-bold text-text">{prev.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/episodes/${next.slug}/`} className="plain rounded-xl border border-border p-4 text-right hover:border-purple/50">
              <span className="text-xs text-faint">
                Next · {episodeCode(next)} {next.status === "upcoming" && "(coming soon)"} →
              </span>
              <div className="font-display mt-1 font-bold text-text">{next.title}</div>
            </Link>
          )}
        </nav>
      </NotesLayout>
    </PageShell>
  );
}
