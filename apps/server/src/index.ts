import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { env, webOrigins } from "./config/env";
import { initSockets } from "./sockets";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: webOrigins, credentials: true },
});

app.set("io", io);
initSockets(io);

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Bite Corner server listening on http://localhost:${env.PORT}`);
});
