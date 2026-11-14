import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <PageShell>
      <section className="mx-auto max-w-xl px-4 py-32 text-center">
        <p className="font-mono text-purple">404</p>
        <h1 className="font-display mt-3 text-4xl font-bold">This page is two bits too far.</h1>
        <Link href="/" className="mt-8 inline-block text-blue hover:underline">
          ← Back home
        </Link>
      </section>
    </PageShell>
  );
}
