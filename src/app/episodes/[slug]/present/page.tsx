import type { Metadata } from "next";
import { PresentClient } from "@/components/deck/PresentClient";
import { episodeCode, getEpisode, publishedEpisodes } from "@/content/episodes";

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedEpisodes().map((e) => ({ slug: e.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ep = getEpisode(slug);
  return ep ? { title: `Present · ${episodeCode(ep)} ${ep.title}`, robots: { index: false } } : {};
}

export default async function PresentPage({ params }: Props) {
  const { slug } = await params;
  return <PresentClient slug={slug} />;
}
