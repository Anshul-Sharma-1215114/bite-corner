import { io, type Socket } from "socket.io-client";
import { getApiUrl } from "./api-url";

let socket: Socket | null = null;

// Reused across the app so we don't open a new connection per component.
// Auth rides along as the httpOnly cookie (withCredentials), same as REST.
//
// transports/upgrade: deployed traffic is proxied through the web app's
// own origin (see next.config.js rewrites), which can carry the polling
// transport's plain HTTP requests but can't proxy a real WebSocket
// upgrade to an external host. Left at defaults, the client repeatedly
// tries to upgrade anyway, and each failed attempt was tearing down and
// re-establishing the connection — which is what made live status
// updates look "stuck until you refresh": the socket was frequently
// mid-reconnect exactly when an update arrived. Pinning to polling only
// skips that entirely, trading a real WebSocket's latency for a stable
// connection that actually delivers events promptly.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(getApiUrl(), {
      withCredentials: true,
      autoConnect: true,
      transports: ["polling"],
      upgrade: false,
    });
  }
  return socket;
}
