import type { Metadata } from "next";
import { PageShell } from "@/components/SiteChrome";
import { LogoMark } from "@/components/Logo";
import { HostPortrait } from "@/components/HostPortrait";
import { CopyEmail } from "@/components/CopyEmail";
import { ChannelIcon } from "@/components/ChannelIcon";
import { site } from "@/site.config";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
        <LogoMark size={48} />
        <h1 className="font-display mt-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Why “Two Bits Apart”?
        </h1>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
          <p>
            Two people, a couple of bits apart in what they know, closing the gap one episode at a time. One of us explains;
            the other keeps asking “wait, but <i>why</i>?” until the answer is actually clear.
          </p>
          <p>
            The plan for season one is simple: start from a single neuron reading a handwritten digit, and keep adding one idea
            per episode (autograd, embeddings, attention) until we’ve built a working GPT from scratch. We use no magic
            imports, and we work through the math by hand before we write the code.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
        <h2 className="font-display text-xs tracking-[0.3em] text-faint uppercase">The hosts</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {site.hosts.map((h) => (
            <div
              key={h.id}
              className={`flex flex-col items-center rounded-2xl border bg-surface px-6 pt-12 pb-7 text-center ${h.color === "blue" ? "border-blue/40" : "border-purple/40"}`}
            >
              <HostPortrait host={h} />
              <div className="font-display mt-9 text-2xl font-bold" style={{ color: `var(--${h.color})` }}>
                {h.name}
              </div>
              <div className="mt-1 text-sm text-faint">{h.role}</div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{h.bio}</p>
              <div className="mt-auto flex flex-col items-center gap-3 pt-6">
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {h.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border-strong px-4 py-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
                <CopyEmail email={h.email} color={h.color} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
        <h2 className="font-display text-xs tracking-[0.3em] text-faint uppercase">Listen & watch</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {site.channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-border-strong px-5 py-2.5 text-sm transition hover:bg-surface"
            >
              <ChannelIcon name={c.icon} brand />
              {c.label}
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">Questions, corrections, episode ideas? Write to either of us:</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {site.hosts.map((h) => (
            <CopyEmail key={h.id} email={h.email} color={h.color} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
