import { siDevpost, siDiscord, siYoutube } from "simple-icons";

export type ChannelIconName = "youtube" | "discord" | "devpost";

// Official brand marks from simple-icons. Devpost's brand colour (#003E54) is too
// dark for our background, so it gets the light text colour instead.
const icons: Record<ChannelIconName, { path: string; color: string }> = {
  youtube: { path: siYoutube.path, color: `#${siYoutube.hex}` },
  discord: { path: siDiscord.path, color: `#${siDiscord.hex}` },
  devpost: { path: siDevpost.path, color: "#e9edf5" },
};

/** Brand icon for a channel. `brand` paints it in the brand colour; otherwise it uses currentColor. */
export function ChannelIcon({ name, size = 18, brand = false }: { name: ChannelIconName; size?: number; brand?: boolean }) {
  const icon = icons[name];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0">
      <path d={icon.path} fill={brand ? icon.color : "currentColor"} />
    </svg>
  );
}
