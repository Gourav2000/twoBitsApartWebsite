/**
 * Episode registry (plain data, safe for server components).
 * To add an episode: add an entry here, then (once it has slides) register
 * its slide deck in src/episodes/registry.ts.
 */

export type Series = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};

export type Chapter = { label: string; slide: number };

export type Episode = {
  slug: string;
  series: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  status: "published" | "upcoming";
  topics: string[];
  /** ISO date, if released */
  date?: string;
  /** Link to the recorded episode once it is out */
  watchUrl?: string;
  /** Chapter markers; `slide` is 1-based and is filled in from the deck */
  chapters?: Chapter[];
  /** Episode code repo, if any */
  codeUrl?: string;
};

export const series: Series[] = [
  {
    slug: "neural-networks-to-gpt",
    title: "Neural Networks to GPT",
    subtitle: "Building AI from Scratch",
    description:
      "A season-long build. We start with one neuron reading a handwritten digit and keep going, adding one idea per episode, until we have a working GPT.",
  },
];

export const episodes: Episode[] = [
  {
    slug: "neural-networks-and-mnist",
    series: "neural-networks-to-gpt",
    number: 1,
    title: "Neural Networks and MNIST",
    subtitle: "How a computer learns to read a handwritten digit",
    description:
      "What actually happens between clicking PREDICT and seeing “it’s a 7”? We open the black box: pixels become numbers, neurons take weighted votes, softmax turns scores into probabilities, and backprop plus gradient descent move a random network from 10% to 97%. Then we wrap the NumPy model in a FastAPI service.",
    status: "published",
    topics: [
      "pixels",
      "neurons",
      "activations",
      "forward pass",
      "softmax",
      "cross-entropy",
      "gradient descent",
      "backprop",
      "FastAPI",
    ],
  },
  {
    slug: "micrograd",
    series: "neural-networks-to-gpt",
    number: 2,
    title: "micrograd",
    subtitle: "A tiny autograd engine, from scratch",
    description:
      "We open the hood on backprop and build micrograd, a small automatic differentiation engine. It shows how a computation graph computes every gradient for you.",
    status: "upcoming",
    topics: ["computation graphs", "autograd", "chain rule", "Value class"],
  },
  {
    slug: "microgpt",
    series: "neural-networks-to-gpt",
    number: 3,
    title: "microGPT",
    subtitle: "Tokens, attention and a tiny transformer",
    description:
      "From predicting digits to predicting the next token. We build a minimal GPT: embeddings, self-attention, and a training loop that learns to write.",
    status: "upcoming",
    topics: ["tokenization", "embeddings", "self-attention", "transformer"],
  },
];

export const getEpisode = (slug: string) => episodes.find((e) => e.slug === slug);
export const getSeries = (slug: string) => series.find((s) => s.slug === slug);
export const publishedEpisodes = () => episodes.filter((e) => e.status === "published");
export const latestEpisode = () => {
  const pub = publishedEpisodes();
  return pub[pub.length - 1];
};
export const episodeCode = (e: Episode) => `EP ${String(e.number).padStart(2, "0")}`;
