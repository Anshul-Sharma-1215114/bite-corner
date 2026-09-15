// In production the web app and API live on completely different domains,
// so NEXT_PUBLIC_API_URL — baked in at build time — is the source of truth
// whenever it's set.
//
// Without it (local/LAN dev), the API is resolved at runtime from the
// page's own origin on a fixed port instead, so the app works correctly
// from any host the page is loaded through.
//
// This matters beyond convenience: the auth cookie is `sameSite: "lax"`,
// which browsers withhold on cross-site fetch/XHR requests. Deriving the
// dev-mode API host from `window.location.hostname` guarantees the page
// host and API host always match.
const API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "4002";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getApiUrl(): string {
  if (API_URL) return API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
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
