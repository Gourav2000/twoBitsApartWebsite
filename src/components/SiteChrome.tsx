import { CopyEmail } from "@/components/CopyEmail";
import { ChannelIcon } from "@/components/ChannelIcon";
import Link from "next/link";
import { LogoMark, Wordmark } from "./Logo";
import { site } from "@/site.config";

const nav = [
  { href: "/episodes/", label: "Episodes" },
  { href: "/about/", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
          <LogoMark size={26} />
          <Wordmark className="hidden text-sm text-text sm:inline" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-muted transition hover:bg-surface hover:text-text"
            >
              {n.label}
            </Link>
          ))}
          <a
            href={site.newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-full bg-gradient-brand px-4 py-1.5 font-medium text-white transition hover:opacity-90"
          >
            Newsletter
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={22} />
            <Wordmark className="text-xs" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted">{site.tagline}</p>
        </div>
        <div>
          <h3 className="font-display text-xs tracking-widest text-faint uppercase">Listen & watch</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {site.channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted transition hover:text-text">
                  <ChannelIcon name={c.icon} size={15} />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-xs tracking-widest text-faint uppercase">Site</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/episodes/" className="text-muted hover:text-text">All episodes</Link></li>
            <li><Link href="/about/" className="text-muted hover:text-text">About the hosts</Link></li>
            {site.hosts.map((h) => (
              <li key={h.id}>
                <CopyEmail email={h.email} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-faint">
        © {new Date().getFullYear()} {site.name}. Built from scratch, like everything else here.
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
