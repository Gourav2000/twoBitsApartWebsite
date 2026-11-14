import type { NextConfig } from "next";

// On GitHub Pages the site lives at https://<user>.github.io/twoBitsApartWebsite/,
// so the deploy workflow sets NEXT_PUBLIC_BASE_PATH=/twoBitsApartWebsite.
// Locally (and on a custom domain) leave it unset.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Fully static site: `npm run build` writes plain HTML/JS/CSS to ./out.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
