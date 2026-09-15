# Bite Corner

A full-stack food-ordering platform for **Bite Corner** — a fictional Italian & Chinese fast-food restaurant. Customer web app, seller/admin dashboard, and delivery-agent portal, sharing one PostgreSQL database.

This is a **completely independent project** — separate codebase, database, authentication, and configuration from any other app on this machine. It reuses the same proven order/delivery workflow and architecture patterns, rebuilt from scratch under a new brand identity (vivid red + golden yellow, Fredoka/Poppins typography) rather than copied files.

## Pending: real branding

No logo or menu photo has been provided yet. Until then:

- **Logo**: a placeholder "BC" mark (`apps/web/src/components/logo-mark.tsx`) — swap this one file for the real logo.
- **Menu**: placeholder Italian + Chinese dishes in `apps/server/prisma/seed.ts`, no images (menu items render an icon fallback instead of a photo). Replace the `menuItemsData` array with the real menu once available, and drop real photos into `apps/web/public/seed-images/` the same way the item images work today (or just upload them via the admin panel's image upload once items exist — either works).

## Project structure

```
apps/
  web/      Next.js 15 (App Router) + TypeScript + Tailwind — customer app, admin dashboard, delivery portal
  server/   Express + TypeScript + Socket.io + Prisma — REST API + real-time order/delivery events
packages/
  shared/   Hand-mirrored TypeScript types (Role, OrderStatus, etc.) + the order-status-transition contract,
            imported by both apps/server and apps/web so client and server logic can't drift apart
```

## Local development

**Prerequisites**: Node.js, a local PostgreSQL server (the `bitecorner` database was created directly on the existing native Postgres server on this machine — see `apps/server/.env` for the connection string; `docker-compose.yml` is provided as a portable alternative for a fresh machine).

```bash
npm install                 # installs all workspaces; packages/shared builds itself via postinstall
npm run prisma:migrate      # apply migrations (already run once for local dev)
npm run prisma:seed         # seed shop config, placeholder menu, admin + agent accounts
npm run dev                 # runs apps/server (:4002) and apps/web (:3002) together
```

Web app: **http://localhost:3002**
API: **http://localhost:4002** (health check at `/health`)

### Seeded accounts

- **Admin**: `admin@bitecorner.local` / `admin123` — `/admin/login`
- **Delivery agent**: `agent1@bitecorner.local` / `agent123` — `/delivery/login`
- **Customer**: OTP login at `/login` — any phone number; the OTP is echoed back in dev mode (no real SMS provider wired up)

## Architecture notes carried over from the proven reference design

- **Auth**: JWT in an httpOnly, `sameSite: lax` cookie (`bc_token`). Customers log in via OTP (mock console-log provider in dev); admin/delivery agents use email+password. Role-based middleware (`requireAuth(...roles)`) gates every protected route.
- **Real-time**: Socket.io rooms — `order:<id>` (customer/admin/assigned agent), `admin` (dashboard sessions), `agent:<userId>` (a specific agent). Events: `order:new`, `order:status`, `order:payment-status`, `order:agent-assigned`.
- **Order workflow**: `PLACED → CONFIRMED → PREPARING → (READY_FOR_PICKUP | OUT_FOR_DELIVERY) → (COMPLETED | DELIVERED)`, with `CANCELLED`/`REJECTED` as early exits. Legal transitions are centralized in `packages/shared` (`ORDER_STATUS_TRANSITIONS` / `getNextOrderStatuses`) so the server enforces exactly what the admin UI offers.
- **No payment gateway** — Cash on Delivery or a manually-confirmed UPI QR code (a static shop VPA, not a per-transaction charge). Whoever collects payment (delivery agent, or admin/cashier for pickup orders) marks the order paid.
- **Flat delivery fee** — no address geocoding, no distance calculation. `ShopConfig.deliveryFee` applies to every delivery order regardless of which saved address is chosen.
- **Image uploads** live in `apps/server/uploads` (served via `express.static`), never in the web app's own `public/` folder — this is what lets the web app and API deploy to entirely separate hosts later with no shared filesystem. `resolveImageUrl()` on the frontend only prefixes `/uploads/*` paths with the API origin; everything else (bundled static assets) stays as-is.
- **`apps/server/tsconfig.json`** uses `module`/`moduleResolution: "nodenext"` (not the deprecated `"node"`) and `packages/shared` has a `postinstall` build step — both fixes for real build failures hit while getting the reference app running on a fresh host, baked in here from day one.

## Deploying to production

Not yet done — this has only been run and verified locally so far. When ready, the reference app's deployment split works the same way here: the API + Postgres need a host that supports a persistent Node process (Render, Railway, Fly.io, etc. — Vercel's serverless model can't run Socket.io or Postgres), while the Next.js web app can deploy to Vercel. Before going live: replace `JWT_SECRET` with a real random value, set `NODE_ENV=production`, point `WEB_ORIGIN`/`NEXT_PUBLIC_API_URL` at the real domains, and wire up a real OTP SMS provider (the current one just logs to the console).
