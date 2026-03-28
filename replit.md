# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v3 compatible), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite (Vanted web app)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── vanted/             # Vanted service marketplace frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Vanted — Service Marketplace

**Vanted** is a full-featured service marketplace with:

### Features
- **Home page**: Hero banner, featured services, category highlights
- **Browse Services** (`/services`): Category filters, search, pagination
- **Service Detail** (`/services/:id`): Full details, add to cart
- **Shopping Cart** (`/cart`): View/update/remove items, total
- **Checkout** (`/checkout`): Customer info, payment method selection
- **Order Confirmation** (`/order-success/:id`): Post-checkout confirmation
- **User Login** (`/login`): Login with email or username
- **User Signup** (`/signup`): Register a new user account
- **Admin Login** (`/admin`): Secure admin access
- **Admin Dashboard** (`/admin/dashboard`): Stats overview
- **Admin Services** (`/admin/services`): Add, edit, delete services
- **Admin Orders** (`/admin/orders`): View all orders
- **Admin Login Records** (`/admin/login-logs`): View all admin and user login attempts

### Admin Credentials
- **Username**: `admin`
- **Password**: `vanted-admin-2024`
- (Can be overridden via env vars: `ADMIN_USERNAME`, `ADMIN_PASSWORD`)

### Database Schema
- `services` — Service catalog with name, description, price, category, featured, etc.
- `cart_items` — Session-based shopping cart
- `orders` — Customer orders with status tracking
- `order_items` — Line items per order
- `users` — Registered user accounts (email, username, hashed password)
- `login_logs` — Record of all login attempts (admin and user, with IP, success/fail, timestamp)

### API Endpoints
All under `/api`:
- `GET /services` — List services (with filtering/pagination)
- `GET /services/:id` — Get service
- `POST /services` — Create service (admin)
- `PUT /services/:id` — Update service (admin)
- `DELETE /services/:id` — Delete service (admin)
- `GET /categories` — List categories
- `GET /cart?sessionId=...` — Get cart
- `POST /cart` — Add to cart
- `PUT /cart/:itemId` — Update cart item
- `DELETE /cart/:itemId` — Remove cart item
- `DELETE /cart?sessionId=...` — Clear cart
- `POST /orders` — Create order (checkout)
- `GET /orders/:id` — Get order
- `GET /orders` — List all orders (admin)
- `POST /admin/login` — Admin login
- `GET /admin/stats` — Admin stats (admin)

### Security
- Admin token auth via `x-admin-token` header (HMAC-SHA256 tokens)
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- CORS configured with allowed headers
- Input validation via Zod on all endpoints
- Rate-limiting delay on failed login attempts

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/`.

- Entry: `src/index.ts`
- App setup: `src/app.ts`
- Auth middleware: `src/middlewares/auth.ts`
- Routes: services, cart, orders, admin
- Depends on: `@workspace/db`, `@workspace/api-zod`, `zod`

### `artifacts/vanted` (`@workspace/vanted`)

React + Vite frontend for the Vanted marketplace.

- Pages: Home, Services, ServiceDetail, Cart, Checkout, OrderSuccess, Admin (Login, Dashboard, Services, Orders)
- Uses React Query for API calls via `@workspace/api-client-react`
- Session-based cart (UUID in localStorage)
- Admin auth via token in localStorage

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- Schema: `services`, `cartItems`, `orders`, `orderItems`
- Push schema: `pnpm --filter @workspace/db run push`
