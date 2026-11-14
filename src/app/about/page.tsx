import type { Metadata } from "next";
import { PageShell } from "@/components/SiteChrome";
import { LogoMark } from "@/components/Logo";
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
            <div key={h.id} className={`rounded-2xl border bg-surface p-6 ${h.color === "blue" ? "border-blue/40" : "border-purple/40"}`}>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: `var(--${h.color})` }}
                >
                  <span className="flex gap-1.5">
                    <span className={`h-2 w-2 ${h.color === "blue" ? "bg-white" : "bg-bg"}`} />
                    <span className={`h-2 w-2 ${h.color === "blue" ? "bg-white" : "bg-bg"}`} />
                  </span>
                </div>
                <div>
                  <div className="font-display text-xl font-bold" style={{ color: `var(--${h.color})` }}>
                    {h.name}
                  </div>
                  <div className="text-sm text-faint">{h.role}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{h.bio}</p>
              <div className="mt-4 flex gap-3 text-sm">
                {h.links.map((l) => (
                  <a key={l.label} href={l.href} className="text-muted underline-offset-4 hover:text-text hover:underline">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6">
        <h2 className="font-display text-xs tracking-[0.3em] text-faint uppercase">Listen & watch</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {site.channels.map((c) => (
            <a key={c.label} href={c.href} className="rounded-full border border-border-strong px-5 py-2.5 text-sm hover:bg-surface">
              {c.label}
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          Questions, corrections, episode ideas:{" "}
          <a href={`mailto:${site.contactEmail}`} className="text-blue hover:underline">
            {site.contactEmail}
          </a>
        </p>
      </section>
    </PageShell>
  );
}
