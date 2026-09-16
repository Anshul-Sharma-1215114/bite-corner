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
  // Proxy API calls through the web app's own origin in deployed
  // environments (Vercel + Render live on different domains). Browsers
  // increasingly refuse to send auth cookies on cross-site requests at
  // all, even with SameSite=None — so the fix isn't a cookie flag, it's
  // making the request same-origin. Only active when API_PROXY_TARGET is
  // set (production); local/LAN dev talks to the API directly instead
  // (see src/lib/api-url.ts).
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [
      { source: "/api/:path*", destination: `${target}/api/:path*` },
      { source: "/uploads/:path*", destination: `${target}/uploads/:path*` },
      // Live order/menu updates (socket.io-client connects to getApiUrl(),
      // which resolves to the page's own origin in production — see
      // src/lib/socket.ts). Vercel's rewrite layer can't proxy a real
      // WebSocket upgrade to an external origin, so this only carries the
      // long-polling transport; socket.io-client falls back to it
      // automatically when the websocket upgrade fails, so it still works,
      // just without true full-duplex WebSocket.
      { source: "/socket.io/:path*", destination: `${target}/socket.io/:path*` },
    ];
  },
};

module.exports = nextConfig;
