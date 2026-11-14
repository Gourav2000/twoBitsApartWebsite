import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { BasicsContent } from "@/components/basics/BasicsContent";

export const metadata: Metadata = {
  title: "Basics of ML",
  description:
    "A quick refresher on the classical algorithms (linear and logistic regression, k-NN, trees, SVM) so the episodes can skip them.",
};

export default function BasicsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1180px] px-4 pt-16 sm:px-6">
        <div className="max-w-[54rem] mx-auto">
          <div className="flex items-center gap-1.5 text-sm text-faint">
            <Link href="/episodes/" className="hover:text-muted">
              Episodes
            </Link>
            <span>/</span>
            <span className="text-muted">Basics of ML</span>
          </div>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Basics of ML</h1>
          <p className="mt-3 text-lg text-muted">
            A refresher on the classical algorithms, so the series can skip straight to building neural networks.
          </p>
        </div>
        <div className="notes pb-8" style={{ fontSize: 18 }}>
          <hr />
          <BasicsContent />
        </div>
      </div>
    </PageShell>
  );
}
