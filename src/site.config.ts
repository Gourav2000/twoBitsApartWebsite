/**
 * Everything brand-specific lives here; every page reads from this file.
 */

import type { StaticImageData } from "next/image";
// Transparent cut-outs. Gourav's is the same photo as the hero on gouravsarkar.com.
import gouravPhoto from "@/assets/hosts/gourav.png";
import hindeshPhoto from "@/assets/hosts/hindesh.png";

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
  /** Optional placement inside the About-page oval, as % of the frame: image width, top offset, x = horizontal centre (default 50). Omit to fill the oval anchored to the top. */
  portrait?: { width: number; top: number; x?: number };
  email: string;
  links: { label: string; href: string }[];
};

export const site = {
  name: "Two Bits Apart",
  shortName: "twoBitsApart",
  tagline: "Two engineers. One idea at a time. AI built from scratch.",
  description:
    "Two Bits Apart is a podcast where two engineers rebuild modern AI from first principles, from a single neuron all the way to GPT, explained out loud and coded live.",
  url: "https://twobitsapart.com",

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
      photoFocus: "52% 5%",
      photoZoom: 2,
      portrait: { width: 100, top: 6 },
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
      photoFocus: "50% 20%",
      photoZoom: 1.25,
      portrait: { width: 118, top: 12 },
      email: "hindeshwork@gmail.com",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/hindesh-akash/" },
        { label: "Website", href: "https://www.aihindesh.com/" },
      ],
    },
  ] satisfies Host[],

  // Where people can listen / watch. Use "#" until a channel exists.
  // Header "Newsletter" button. TODO: link to the newsletter sign-up page.
  newsletterUrl: "#",

  channels: [
    // TODO: paste the Discord and Devpost links
    { label: "YouTube", href: "https://www.youtube.com/@twobitsapart", icon: "youtube" },
    { label: "Discord", href: "#", icon: "discord" },
    { label: "Devpost", href: "#", icon: "devpost" },
  ],
} as const;
