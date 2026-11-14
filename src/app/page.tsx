import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { LogoMark } from "@/components/Logo";
import { EpisodeCard } from "@/components/episode/EpisodeCard";
import { EpisodeCover } from "@/components/episode/EpisodeSlides";
import { episodeCode, episodes, latestEpisode, series } from "@/content/episodes";
import { site } from "@/site.config";

export default function Home() {
  const latest = latestEpisode();
  const season = series[0];
  const seasonEps = episodes.filter((e) => e.series === season.slug);

  return (
    <PageShell>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="studio-grid absolute inset-0 opacity-70" />
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-blue/20 blur-3xl" />
        <div className="absolute -right-40 -bottom-60 h-[520px] w-[520px] rounded-full bg-purple/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <LogoMark size={64} />
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-red" /> A podcast about building AI from scratch
          </div>
          <h1 className="font-display mt-6 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl">
            From one neuron <br className="hidden sm:block" />
            to <span className="text-gradient">GPT</span>, out loud.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted sm:text-lg">{site.description}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {latest && (
              <Link
                href={`/episodes/${latest.slug}/`}
                className="bg-gradient-brand rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-purple/20 transition hover:opacity-90"
              >
                Start with Episode {latest.number} →
              </Link>
            )}
            <Link href="/episodes/" className="rounded-full border border-border-strong px-6 py-3 text-text transition hover:bg-surface">
              All episodes
            </Link>
          </div>
        </div>
      </section>

      {/* latest episode */}
      {latest && (
        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <h2 className="font-display text-xs tracking-[0.3em] text-faint uppercase">Latest episode</h2>
          <Link
            href={`/episodes/${latest.slug}/`}
            className="group mt-6 grid overflow-hidden rounded-3xl border border-border bg-surface transition hover:border-purple/50 md:grid-cols-[1.25fr_1fr]"
          >
            <div className="border-b border-border md:border-r md:border-b-0">
              <EpisodeCover slug={latest.slug} />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <span className="font-mono text-sm text-purple">{episodeCode(latest)}</span>
              <h3 className="font-display mt-2 text-2xl font-bold sm:text-3xl">{latest.title}</h3>
              <p className="mt-1 text-muted">{latest.subtitle}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted">{latest.description}</p>
              <span className="mt-auto pt-6 text-sm font-semibold text-blue group-hover:underline">Open the episode →</span>
            </div>
          </Link>
        </section>
      )}

      {/* season roadmap */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-xs tracking-[0.3em] text-faint uppercase">Season 1</h2>
            <p className="font-display mt-3 text-3xl font-bold">
              {season.title}: <span className="text-muted">{season.subtitle}</span>
            </p>
            <p className="mt-3 max-w-2xl text-muted">{season.description}</p>
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seasonEps.map((ep) => (
            <EpisodeCard key={ep.slug} ep={ep} />
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Two voices", "One explains, one asks the questions you’re thinking. Nobody nods along to math they don’t get."],
            ["02", "From scratch", "NumPy before frameworks. If we use an idea, we derive it, compute it by hand, then code it."],
            ["03", "Notes you can play with", "Every episode is a page of notes here, with live widgets you can poke while you listen."],
          ].map(([n, h, d]) => (
            <div key={n} className="rounded-2xl border border-border bg-surface p-6">
              <span className="font-mono text-sm text-purple">{n}</span>
              <h3 className="font-display mt-3 text-lg font-bold">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
