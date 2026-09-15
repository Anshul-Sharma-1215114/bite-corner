import type { Server, Socket } from "socket.io";
import { verifyAuthToken } from "../utils/jwt";
import { COOKIE_NAME } from "../middleware/auth";
import { prisma } from "../utils/prisma";

// Room conventions:
//   order:<orderId>  - customer/admin/assigned agent for that order
//   admin            - admin dashboard sessions
//   agent:<userId>   - a specific delivery agent's own room

function safeAsync<A extends unknown[]>(handler: (...args: A) => Promise<void>) {
  return (...args: A) => {
    handler(...args).catch((err) => console.error("Socket handler error:", err));
  };
}

function extractCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function initSockets(io: Server) {
  io.use((socket, next) => {
    const tokenFromAuth = socket.handshake.auth?.token as string | undefined;
    const tokenFromCookie = extractCookie(socket.handshake.headers.cookie, COOKIE_NAME);
    const token = tokenFromAuth ?? tokenFromCookie;

    if (token) {
      try {
        const payload = verifyAuthToken(token);
        socket.data.user = { id: payload.id, role: payload.role };
      } catch {
        // Anonymous connections are still allowed — menu-update broadcasts
        // go to guests too. Just no socket.data.user set.
      }
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    socket.on(
      "order:subscribe",
      safeAsync(async (orderId: unknown) => {
        if (typeof orderId !== "string") return;
        const user = socket.data.user;
        if (!user) return;

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return;

        const allowed = order.customerId === user.id || order.deliveryAgentId === user.id || user.role === "ADMIN";
        if (allowed) socket.join(`order:${orderId}`);
      })
    );

    socket.on(
      "admin:subscribe",
      safeAsync(async () => {
        if (socket.data.user?.role === "ADMIN") socket.join("admin");
      })
    );

    socket.on(
      "agent:subscribe-self",
      safeAsync(async () => {
        const user = socket.data.user;
        if (user?.role === "DELIVERY_AGENT") socket.join(`agent:${user.id}`);
      })
    );

    socket.on("disconnect", () => {
      // no-op, kept for future diagnostics
    });
  });
}
