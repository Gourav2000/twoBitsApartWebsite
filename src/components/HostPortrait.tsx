import Image from "next/image";
import type { Host } from "@/site.config";

// Organic, slightly egg-shaped outline (wider at the bottom), shared by ring and photo.
const BLOB = "50% 50% 47% 53% / 56% 56% 44% 44%";

/** Large host portrait: soft blob frame, brand-gradient ring and glow. */
export function HostPortrait({ host, width = 220, height = 264 }: { host: Host; width?: number; height?: number }) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width,
        height,
        padding: 4,
        borderRadius: BLOB,
        background: "linear-gradient(160deg, var(--blue) 0%, var(--purple) 55%, #e05cd6 100%)",
        boxShadow: "0 0 32px 4px rgba(110, 100, 255, 0.35), 0 0 80px 10px rgba(164, 92, 255, 0.18)",
      }}
    >
      <div className="h-full w-full overflow-hidden bg-bg-2" style={{ borderRadius: BLOB }}>
        <Image
          src={host.photo}
          alt={host.name}
          width={width * 2}
          height={height * 2}
          className="h-full w-full object-cover"
          style={{ objectPosition: host.portraitFocus ?? "50% 20%" }}
        />
      </div>
    </div>
  );
}
