import express from "express";
import path from "path";
import "express-async-errors";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { isProd, webOrigins } from "./config/env";
import authRoutes from "./routes/auth.routes";
import menuRoutes from "./routes/menu.routes";
import shopConfigRoutes from "./routes/shop-config.routes";
import addressRoutes from "./routes/address.routes";
import couponRoutes from "./routes/coupon.routes";
import orderRoutes from "./routes/order.routes";
import favoriteRoutes from "./routes/favorite.routes";
import adminRoutes from "./routes/admin.routes";
import deliveryRoutes from "./routes/delivery.routes";
import reviewRoutes from "./routes/review.routes";

export const app = express();

// contentSecurityPolicy/crossOriginResourcePolicy are meant for servers
// that render HTML — this is a pure JSON + Socket.io API called
// cross-origin from the web app, so those two would only add friction.
// hsts stays off in dev — see RR Kitchen's app.ts for the full incident
// writeup; flip this on only once HTTPS is confirmed working end-to-end.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false, hsts: isProd }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || webOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Matches the upload destination in middleware/upload.ts — served from
// here (not the web app's public/) so uploads work even when the web app
// and this API are deployed to separate hosts.
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", menuRoutes);
app.use("/api/shop-config", shopConfigRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: isProd ? "Something went wrong" : String(err) });
});
