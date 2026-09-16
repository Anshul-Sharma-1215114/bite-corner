// Local/LAN dev: the API runs on a fixed port on the same host the page
// was loaded through, so requests are resolved at runtime from the page's
// own origin — this works correctly from localhost, a LAN IP, whatever.
//
// Deployed (Vercel): the web app and API live on completely different
// domains, and browsers withhold cookies on cross-site requests — not
// just with SameSite=Lax, but increasingly even with SameSite=None, since
// third-party cookies are being phased out generally. So instead of
// pointing at the API's own domain, requests go through same-origin
// (empty base = relative path) and next.config.js rewrites proxy them to
// the real API server-side, where cross-site cookie rules don't apply.
const API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "4002";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function isLocalOrLanHost(hostname: string): boolean {
  return hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

export function getApiUrl(): string {
  if (API_URL) return API_URL;
  if (typeof window !== "undefined") {
    if (isLocalOrLanHost(window.location.hostname)) {
      return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
    }
    return ""; // same-origin, proxied via next.config.js rewrites
  }
  return `http://localhost:${API_PORT}`;
}

// Only /uploads/* paths are actual admin-uploaded images, served by the API
// itself. Everything else (bundled static assets shipped with the web
// app's own public/ folder) stays root-relative, resolved against the web
// app's own origin as-is.
export function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${getApiUrl()}${url}`;
  return url;
}
