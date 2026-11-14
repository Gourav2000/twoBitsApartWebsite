import Image from "next/image";
import type { Host } from "@/site.config";

/** Round host photo with a ring in the host's brand colour. */
export function HostAvatar({ host, size = 56 }: { host: Host; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded-full bg-bg-2"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 2px var(--bg), 0 0 0 ${size > 40 ? 4 : 3}px var(--${host.color})`,
      }}
    >
      <Image
        src={host.photo}
        alt={host.name}
        width={size * 2}
        height={size * 2}
        className="h-full w-full object-cover"
        style={{
          objectPosition: host.photoFocus ?? "50% 50%",
          transform: host.photoZoom ? `scale(${host.photoZoom})` : undefined,
          transformOrigin: host.photoFocus ?? "50% 50%",
        }}
      />
    </span>
  );
}
