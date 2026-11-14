import Image from "next/image";
import type { Host } from "@/site.config";

/**
 * Large host portrait: an even oval with a brand-gradient ring and glow,
 * framed like the hero photo on gouravsarkar.com (240×280, photo anchored to the top).
 * Photos are transparent cut-outs on the site's dark backdrop.
 */
export function HostPortrait({ host, width = 240, height = 280 }: { host: Host; width?: number; height?: number }) {
  const p = host.portrait;
  return (
    <div
      className="relative shrink-0 rounded-[50%]"
      style={{
        width,
        height,
        padding: 5,
        background: "linear-gradient(155deg, var(--blue) 0%, var(--purple) 55%, #ff6ec7 100%)",
        boxShadow: "0 0 44px rgba(77, 181, 255, 0.35), 0 0 90px rgba(180, 77, 255, 0.2)",
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-[50%]"
        style={{ background: "radial-gradient(ellipse at 50% 35%, #131a2c 0%, var(--bg-2) 75%)" }}
      >
        {p ? (
          // custom placement (width / top / horizontal centre, % of the frame)
          <Image
            src={host.photo}
            alt={host.name}
            sizes={`${Math.round((width * p.width) / 100)}px`}
            className="absolute h-auto max-w-none -translate-x-1/2"
            style={{ width: `${p.width}%`, top: `${p.top}%`, left: `${p.x ?? 50}%` }}
          />
        ) : (
          // default: fill the oval, anchored to the top
          <Image
            src={host.photo}
            alt={host.name}
            sizes={`${width}px`}
            className="h-full w-full object-cover object-top"
          />
        )}
      </div>
    </div>
  );
}
