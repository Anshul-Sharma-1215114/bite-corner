/** @type {import('next').NextConfig} */
const nextConfig = {
  // packages/shared ships raw TypeScript; have Next transpile it instead of
  // requiring a separate build step for the workspace package.
  transpilePackages: ["@bite-corner/shared"],
  images: {
    // Uploaded menu/combo photos are served from the API host, which
    // differs by environment and isn't known at build time — no fixed
    // hostname to whitelist via remotePatterns.
    unoptimized: true,
  },
};

module.exports = nextConfig;
