import Image from "next/image";
import type { Host } from "@/site.config";

/**
 * Large host portrait: an even oval with a brand-gradient ring and glow.
 * The photo is a transparent cut-out placed on the site's dark backdrop.
 */
export function HostPortrait({ host, width = 220, height = 264 }: { host: Host; width?: number; height?: number }) {
  const { width: w, top } = host.portrait ?? { width: 110, top: 10 };
  return (
    <div
      className="relative shrink-0 rounded-[50%]"
      style={{
        width,
        height,
        padding: 4,
        background: "linear-gradient(160deg, var(--blue) 0%, var(--purple) 55%, #e05cd6 100%)",
        boxShadow: "0 0 32px 4px rgba(110, 100, 255, 0.35), 0 0 80px 10px rgba(164, 92, 255, 0.18)",
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[50%]"
        style={{ background: "radial-gradient(ellipse at 50% 35%, #131a2c 0%, var(--bg-2) 75%)" }}
      >
        <Image
          src={host.photo}
          alt={host.name}
          sizes={`${Math.round((width * w) / 100)}px`}
          className="absolute left-1/2 h-auto max-w-none -translate-x-1/2"
          style={{ width: `${w}%`, top: `${top}%` }}
        />
      </div>
    </div>
  );
}
