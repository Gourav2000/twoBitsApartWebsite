/**
 * Everything brand-specific lives here. Swap the placeholders for real
 * names, bios and links; every page reads from this file.
 */

export type Host = {
  id: "a" | "b";
  name: string;
  role: string;
  bio: string;
  color: "blue" | "purple";
  links: { label: string; href: string }[];
};

export const site = {
  name: "Two Bits Apart",
  shortName: "twoBitsApart",
  tagline: "Two engineers. One idea at a time. AI built from scratch.",
  description:
    "Two Bits Apart is a podcast where two engineers rebuild modern AI from first principles, from a single neuron all the way to GPT, explained out loud and coded live.",
  url: "https://gourav2000.github.io/twoBitsApartWebsite", // TODO: swap for a custom domain later

  hosts: [
    {
      id: "a",
      name: "Host A",
      role: "Co-host",
      bio: "Placeholder bio. A sentence or two about who you are, what you build, and why you care about understanding AI from the ground up.",
      color: "blue",
      links: [
        { label: "LinkedIn", href: "#" },
        { label: "GitHub", href: "#" },
      ],
    },
    {
      id: "b",
      name: "Host B",
      role: "Co-host",
      bio: "Placeholder bio. The one who asks the 'wait, but why?' questions so the audience doesn't have to.",
      color: "purple",
      links: [
        { label: "LinkedIn", href: "#" },
        { label: "GitHub", href: "#" },
      ],
    },
  ] satisfies Host[],

  // Where people can listen / watch. Use "#" until a channel exists.
  channels: [
    { label: "YouTube", href: "#" },
    { label: "Spotify", href: "#" },
    { label: "Apple Podcasts", href: "#" },
    { label: "Instagram", href: "#" },
  ],

  contactEmail: "hello@example.com", // TODO
} as const;
