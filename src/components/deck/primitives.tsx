"use client";

import { LogoMark, Wordmark } from "@/components/Logo";
import { useDeck } from "./context";

/** Background used by every slide: dark studio with soft host-colour glows. */
function Backdrop({ tint = "neutral" }: { tint?: "neutral" | "blue" | "purple" }) {
  return (
    <>
      <div className="studio-grid absolute inset-0 opacity-60" />
      <div
        className="absolute -top-64 -left-64 h-[720px] w-[720px] rounded-full blur-3xl"
        style={{ background: `rgba(61,139,255,${tint === "blue" ? 0.2 : 0.09})` }}
      />
      <div
        className="absolute -right-64 -bottom-64 h-[720px] w-[720px] rounded-full blur-3xl"
        style={{ background: `rgba(164,92,255,${tint === "purple" ? 0.2 : 0.09})` }}
      />
    </>
  );
}

function Footer() {
  const { footer, index, go, interactive } = useDeck();
  return (
    <div className="absolute right-24 bottom-8 left-24 flex items-center justify-between text-[20px] text-faint">
      <span>{footer}</span>
      <span className="flex items-center gap-5">
        {interactive && (
          <button onClick={() => go("agenda")} className="text-blue/80 transition hover:text-blue">
            agenda
          </button>
        )}
        <span className="font-mono">{index + 1}</span>
      </span>
    </div>
  );
}

/** Standard content slide: title + gradient bar + body + footer. */
export function Slide({
  title,
  children,
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative h-full w-full bg-bg-2 text-text">
      <Backdrop />
      <div className="relative flex h-full flex-col px-24 pt-16 pb-24">
        <h2 className="font-display text-[60px] leading-[1.08] font-bold tracking-tight">{title}</h2>
        <div className="bg-gradient-brand mt-6 mb-10 h-[7px] w-[290px] shrink-0 rounded-full" />
        <div className={`relative min-h-0 flex-1 text-[30px] leading-[1.45] ${className}`}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

/** Section divider (Part 1 / Part 2 …). */
export function Divider({
  kicker,
  title,
  tint = "blue",
}: {
  kicker: string;
  title: string;
  tint?: "blue" | "purple";
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-bg-2 text-center text-text">
      <Backdrop tint={tint} />
      <div className="relative flex flex-col items-center">
        <LogoMark size={110} />
        <div className="font-display mt-8 text-[132px] leading-none font-bold tracking-tight">{kicker}</div>
        <div className="mt-6 text-[44px] text-muted">{title}</div>
      </div>
    </div>
  );
}

/** Title card for an episode. */
export function TitleCard({
  title,
  subtitle,
  series,
  episode,
  hosts,
}: {
  title: string;
  subtitle: string;
  series: string;
  episode: string;
  hosts: { name: string; color: "blue" | "purple" }[];
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-bg-2 text-center text-text">
      <Backdrop tint="blue" />
      <div className="relative flex flex-col items-center">
        <LogoMark size={170} />
        <h1 className="font-display mt-12 text-[104px] leading-none font-bold tracking-tight">{title}</h1>
        <p className="mt-6 text-[40px] text-muted">{subtitle}</p>
        <Wordmark className="mt-16 text-[36px]" />
        <p className="mt-4 text-[28px] text-muted">
          Series: <i className="text-text">{series}</i> · {episode}
        </p>
        <div className="mt-6 flex items-center gap-6 text-[32px] font-semibold">
          {hosts.map((h, i) => (
            <span key={h.name} className="flex items-center gap-6">
              {i > 0 && <span className="text-faint">·</span>}
              <span style={{ color: `var(--${h.color})` }}>{h.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Beamer-style block with a coloured header. */
export function Box({
  title,
  children,
  tone = "blue",
  className = "",
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  tone?: "blue" | "purple" | "neutral";
  className?: string;
}) {
  const c =
    tone === "blue"
      ? { border: "rgba(61,139,255,.45)", bg: "rgba(61,139,255,.07)", head: "rgba(61,139,255,.16)", text: "var(--blue)" }
      : tone === "purple"
        ? { border: "rgba(164,92,255,.5)", bg: "rgba(164,92,255,.07)", head: "rgba(164,92,255,.2)", text: "#c79bff" }
        : { border: "var(--border-strong)", bg: "rgba(255,255,255,.03)", head: "rgba(255,255,255,.06)", text: "var(--text)" };
  return (
    <div className={`overflow-hidden rounded-2xl border ${className}`} style={{ borderColor: c.border, background: c.bg }}>
      {title && (
        <div className="px-6 py-3 font-semibold" style={{ background: c.head, color: c.text }}>
          {title}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

/** Square-bullet list item, like the deck. */
export function Bullet({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex gap-5 ${className}`}>
      <span className="mt-[0.5em] h-[0.42em] w-[0.42em] shrink-0 rounded-[3px] bg-blue" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export const Hl = ({ children, tone = "purple" }: { children: React.ReactNode; tone?: "purple" | "blue" }) => (
  <span style={{ color: tone === "purple" ? "#c08bff" : "var(--blue)" }}>{children}</span>
);
