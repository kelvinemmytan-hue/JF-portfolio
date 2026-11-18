// Static export: every page is written out as plain HTML into out/ (best for SEO, no server needed).
// NEXT_PUBLIC_BASE_PATH is only needed when the site lives in a sub-folder (e.g. username.github.io/repo).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  ...(basePath && { basePath }),
};

export default nextConfig;
