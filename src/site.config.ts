/**
 * Everything brand-specific lives here; every page reads from this file.
 */

import type { StaticImageData } from "next/image";
import gouravPhoto from "@/assets/hosts/gourav.jpg";
import hindeshPhoto from "@/assets/hosts/hindesh.jpeg";

export type Host = {
  id: "a" | "b";
  name: string;
  /** First name, used in slide captions and speaker notes. */
  shortName: string;
  role: string;
  bio: string;
  color: "blue" | "purple";
  photo: StaticImageData;
  /** CSS object-position for the photo crop (face centred in a circle). */
  photoFocus?: string;
  /** Zoom into photoFocus (1 = no zoom); for full-body shots. */
  photoZoom?: number;
  /** object-position for the large portrait on the About page. */
  portraitFocus?: string;
  email: string;
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
      name: "Gourav Sarkar",
      shortName: "Gourav",
      role: "Co-host",
      // TODO: Gourav, rewrite this in your own words
      bio: "Engineer who builds for the web. On Two Bits Apart: rebuilding AI from first principles, with no magic imports. The math is worked out by hand first, then the code.",
      color: "blue",
      photo: gouravPhoto,
      photoFocus: "44% 20%",
      photoZoom: 2,
      portraitFocus: "50% 12%",
      email: "gouravsarkar67@gmail.com",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/gouravsarkardev/" },
        { label: "Website", href: "https://www.gouravsarkar.com/" },
      ],
    },
    {
      id: "b",
      name: "Hindesh Akash",
      shortName: "Hindesh",
      role: "Co-host",
      // TODO: Hindesh, rewrite this in your own words
      bio: "Builds AI products, taking them from idea to production. On Two Bits Apart: taking those systems apart again, all the way down to the single neuron.",
      color: "purple",
      photo: hindeshPhoto,
      photoFocus: "50% 30%",
      email: "hindeshwork@gmail.com",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/hindesh-akash/" },
        { label: "Website", href: "https://www.aihindesh.com/" },
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
} as const;
