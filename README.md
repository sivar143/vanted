# Vanted — On-Demand Service Marketplace

Vanted is a full-stack local service booking platform that lets users browse, book, and pay for home services — including drivers, plumbers, chefs, electricians, technicians, and movers — with INR pricing and real-time ETAs.

> Implements the same features as the Android production app at [github.com/sivar143/vanted](https://github.com/sivar143/vanted) (production branch), rebuilt as a web app.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Service Catalog](#service-catalog)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Automation Scripts](#automation-scripts)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Code Generation](#code-generation)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│   React + Vite (artifacts/vanted)                        │
│   • React Query hooks (auto-generated from OpenAPI)      │
│   • TailwindCSS + shadcn/ui                              │
│   • Session-based cart (UUID in localStorage)            │
│   • JWT-style tokens for admin and user auth             │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP (REST JSON)
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Express API Server (artifacts/api-server)   │
│                                                          │
│   Routes: /api/services  /api/cart  /api/orders          │
│           /api/auth      /api/admin                      │
│   Middleware: CORS, Zod validation, HMAC auth            │
│   Logger: pino                                           │
└───────────────────────┬──────────────────────────────────┘
                        │ Drizzle ORM
                        ▼
┌──────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                    │
│                                                          │
│   Tables: services, cart_items, orders, order_items,     │
│            users, login_logs                             │
└──────────────────────────────────────────────────────────┘
```

**Data flow:**
1. Browser sends requests to the Express API over REST JSON.
2. The API validates input with Zod, queries PostgreSQL via Drizzle ORM, and responds.
3. The React frontend uses auto-generated React Query hooks (from the OpenAPI spec) to fetch and mutate data.
4. Cart state is tied to a UUID session ID stored in localStorage.
5. Admin and user authentication use HMAC-SHA256 tokens sent in custom headers.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Package manager | pnpm workspaces (monorepo) |
| Language | TypeScript 5.9 |
| Node.js | v24 |
| Frontend framework | React 19 + Vite 7 |
| Styling | TailwindCSS 4 + shadcn/ui |
| API framework | Express 5 |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| API spec | OpenAPI 3.0 (YAML) |
| API codegen | Orval (generates React Query hooks) |
| HTTP client | Axios (via Orval-generated client) |
| Data fetching | TanStack React Query v5 |
| Build tool | esbuild (API), Vite (frontend) |
| Logging | pino + pino-http |

---

## Project Structure

```
vanted/
├── artifacts/
│   ├── api-server/              # Express REST API
│   │   ├── src/
│   │   │   ├── app.ts           # Express app setup (CORS, middleware)
│   │   │   ├── index.ts         # Server entry point (reads PORT env var)
│   │   │   ├── middlewares/
│   │   │   │   └── auth.ts      # HMAC token verification middleware
│   │   │   └── routes/
│   │   │       ├── admin.ts     # Admin login, stats, login-logs
│   │   │       ├── auth.ts      # User signup, login, logout, me
│   │   │       ├── cart.ts      # Cart CRUD (session-based)
│   │   │       ├── health.ts    # Health check endpoint
│   │   │       ├── orders.ts    # Order creation and retrieval
│   │   │       └── services.ts  # Service CRUD (admin-protected writes)
│   │   └── build.mjs            # esbuild bundle config
│   │
│   └── vanted/                  # React + Vite web app
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.tsx
│       │   │   ├── ServiceCard.tsx    # Shows price (₹), ETA, category
│       │   │   └── ui/               # shadcn/ui component library
│       │   ├── lib/
│       │   │   ├── session.ts        # Session ID helpers (localStorage)
│       │   │   ├── utils.ts          # formatCurrency (INR ₹)
│       │   │   └── userSession.ts    # User auth token helpers
│       │   └── pages/
│       │       ├── home.tsx
│       │       ├── services.tsx      # Browse + search + category filter
│       │       ├── service-detail.tsx
│       │       ├── cart.tsx
│       │       ├── checkout.tsx      # Name, email, address, notes, payment
│       │       ├── order-success.tsx
│       │       ├── login.tsx
│       │       ├── signup.tsx
│       │       └── admin/
│       │           ├── login.tsx
│       │           ├── dashboard.tsx
│       │           ├── services.tsx
│       │           ├── orders.tsx
│       │           └── login-logs.tsx
│
├── lib/
│   ├── api-spec/
│   │   ├── openapi.yaml         # Single source of truth for the API contract
│   │   └── orval.config.ts      # Orval codegen configuration
│   ├── api-client-react/        # AUTO-GENERATED — do not edit manually
│   │   └── src/generated/       # React Query hooks + Axios client
│   ├── api-zod/                 # AUTO-GENERATED — Zod schemas from OpenAPI
│   │   └── src/generated/
│   └── db/
│       ├── src/schema/          # Drizzle table definitions
│       │   ├── services.ts
│       │   ├── cart.ts
│       │   ├── orders.ts
│       │   └── users.ts
│       └── drizzle.config.ts
│
├── bin/                         # Automation shell scripts (see below)
│   ├── setup.sh
│   ├── dev.sh
│   ├── build.sh
│   ├── seed.sh
│   └── codegen.sh
│
├── scripts/                     # pnpm workspace package for TS scripts
│   └── src/
│       └── seed-vanted.ts
│
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

---

## Service Catalog

The 7 services match the Android production app exactly:

| Service | Category | Price | ETA |
|---------|----------|-------|-----|
| Car | Driver | ₹249 | ~15 minutes |
| Bike | Driver | ₹99 | ~10 minutes |
| Plumber | Home Needs | ₹399 | ~30 minutes |
| Chef | Home Needs | ₹699 | ~45 minutes |
| Technician | Home Needs | ₹499 | ~35 minutes |
| Electrician | Home Needs | ₹349 | ~30 minutes |
| Packers & Movers | Courier | ₹1499 | ~60 minutes |

---

## Prerequisites

- **Node.js** v18 or higher ([nodejs.org](https://nodejs.org))
- **pnpm** v9+ — `npm install -g pnpm`
- **PostgreSQL** v14+ running locally (or a hosted instance)

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/sivar143/vanted.git
cd vanted
pnpm install
```

### 2. Set environment variables

Create a `.env` file in the project root or export these in your shell:

```bash
# Required
export DATABASE_URL=postgresql://postgres:password@localhost:5432/vanted

# Optional — override admin credentials
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=vanted-admin-2024

# Optional — token signing secret (random string)
export SESSION_SECRET=your-random-secret-here

# Optional — log level (trace | debug | info | warn | error)
export LOG_LEVEL=info
```

### 3. Set up the database

Push the Drizzle schema to your PostgreSQL instance:

```bash
pnpm --filter @workspace/db run push-force
```

### 4. Seed the services

Use the seed script to populate the 7 Vanted services (requires the API server to be running):

```bash
# Start the API server first
PORT=8080 pnpm --filter @workspace/api-server run dev &

# Then run the seed script
./bin/seed.sh
```

### 5. Start the development servers

In two separate terminal windows:

**Terminal 1 — API Server:**
```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Web Frontend:**
```bash
PORT=5173 pnpm --filter @workspace/vanted run dev
```

Or use the automation script to start both at once (see below).

The API will be at `http://localhost:8080` and the web app at `http://localhost:5173`.

---

## Automation Scripts

All scripts live in the `bin/` directory. Make them executable if needed:

```bash
chmod +x bin/*.sh
```

### `bin/setup.sh` — Full first-time setup

Installs dependencies, pushes the database schema, and seeds initial data.

```bash
./bin/setup.sh
```

### `bin/dev.sh` — Start all services

Starts both the API server and the web frontend in parallel. Press `Ctrl+C` to stop everything.

```bash
DATABASE_URL=postgresql://... ./bin/dev.sh
```

You can override the default ports:

```bash
API_PORT=3001 WEB_PORT=3000 DATABASE_URL=postgresql://... ./bin/dev.sh
```

### `bin/seed.sh` — Seed services database

Re-seeds the database with the 7 Vanted services. Deletes any existing services first. Requires the API server to be running.

```bash
./bin/seed.sh

# With a custom API base URL (e.g., staging):
BASE_URL=https://api.my-vanted.com ./bin/seed.sh
```

### `bin/build.sh` — Production build

Runs type-checking, then builds the API server bundle and the frontend static files.

```bash
./bin/build.sh
```

Output:
- API bundle: `artifacts/api-server/dist/index.mjs`
- Frontend: `artifacts/vanted/dist/`

### `bin/codegen.sh` — Regenerate API client

Run this whenever you change `lib/api-spec/openapi.yaml`. Regenerates the React Query hooks and Zod schemas.

```bash
./bin/codegen.sh
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | Yes | — | Port for the API server (set per-process) |
| `ADMIN_USERNAME` | No | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | No | `vanted-admin-2024` | Admin panel password |
| `SESSION_SECRET` | No | auto-generated | HMAC secret for auth tokens |
| `LOG_LEVEL` | No | `info` | pino log level |
| `NODE_ENV` | No | `development` | Set to `production` for prod builds |

---

## API Reference

All endpoints are prefixed with `/api`.

### Services

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services` | Public | List services. Query: `search`, `category`, `page`, `limit` |
| GET | `/services/categories` | Public | List distinct category names |
| GET | `/services/:id` | Public | Get a single service |
| POST | `/services` | Admin | Create a service |
| PUT | `/services/:id` | Admin | Update a service |
| DELETE | `/services/:id` | Admin | Delete a service |

### Cart

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | Public | Get cart. Query: `sessionId` |
| POST | `/cart` | Public | Add item. Body: `{ sessionId, serviceId, quantity }` |
| PUT | `/cart/:itemId` | Public | Update quantity |
| DELETE | `/cart/:itemId` | Public | Remove item |
| DELETE | `/cart` | Public | Clear cart. Query: `sessionId` |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | Public | Create order (checkout). Body: `{ sessionId, customerName, customerEmail, address, notes, paymentMethod }` |
| GET | `/orders/:id` | Public | Get order by ID |
| GET | `/orders` | Admin | List all orders |

### Auth (User)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | Public | Register. Body: `{ name, email, username, password }` |
| POST | `/auth/login` | Public | Login. Body: `{ identifier, password }` |
| POST | `/auth/logout` | User | Logout |
| GET | `/auth/me` | User | Get current user info |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/login` | Public | Admin login. Body: `{ username, password }` |
| GET | `/admin/stats` | Admin | Dashboard stats |
| GET | `/admin/login-logs` | Admin | All login attempt records |

**Authentication headers:**
- Admin endpoints: `x-admin-token: <token>`
- User endpoints: `x-user-token: <token>`

---

## Database Schema

### `services`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | |
| short_description | text | |
| description | text | |
| price | real | In INR (₹) |
| category | text | Driver, Home Needs, Courier |
| delivery_time | text | ETA string, e.g. "~15 minutes" |
| image_url | text | Nullable |
| featured | boolean | Default false |
| available | boolean | Default true |
| rating | real | Default 4.5 |
| review_count | integer | Default 0 |
| created_at | timestamp | |
| updated_at | timestamp | |

### `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| session_id | text | UUID from localStorage |
| service_id | integer | FK → services |
| quantity | integer | |
| created_at | timestamp | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| session_id | text | |
| customer_name | text | |
| customer_email | text | |
| address | text | Service delivery address |
| notes | text | Optional booking notes |
| total | real | Sum in INR |
| status | text | pending / processing / completed / cancelled |
| payment_status | text | unpaid / paid / refunded |
| payment_method | text | credit_card / debit_card / paypal / bank_transfer |
| created_at | timestamp | |
| updated_at | timestamp | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| order_id | integer | FK → orders (cascade delete) |
| service_id | integer | |
| service_name | text | Snapshot of name at time of order |
| price | real | Snapshot of price at time of order |
| quantity | integer | |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | text | |
| email | text | Unique |
| username | text | Unique |
| password_hash | text | SHA-256 hashed |
| created_at | timestamp | |

### `login_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_type | text | admin or user |
| identifier | text | Username or email used |
| ip | text | Client IP |
| success | boolean | |
| created_at | timestamp | |

---

## Code Generation

The API contract lives in a single file: `lib/api-spec/openapi.yaml`.

Any time you add or change an endpoint, run codegen to keep the frontend client in sync:

```bash
./bin/codegen.sh
# or directly:
pnpm --filter @workspace/api-spec run codegen
```

This regenerates:
- `lib/api-client-react/src/generated/` — typed React Query hooks + Axios client
- `lib/api-zod/src/generated/` — Zod schemas matching the OpenAPI spec

The generated files are committed to the repository and should **not** be edited manually.

---

## Admin Panel

Access the admin panel at `/admin` (or `/admin/login`).

**Default credentials:**
- Username: `admin`
- Password: `vanted-admin-2024`

Override with env vars `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

**Admin pages:**
| Path | Description |
|------|-------------|
| `/admin/dashboard` | Stats: total orders, revenue, services |
| `/admin/services` | Add, edit, delete services |
| `/admin/orders` | View all customer bookings |
| `/admin/login-logs` | View all login attempts |

---

## Deployment

### Using Replit (Recommended)

The project is configured for Replit deployment out of the box. Click **Publish** from the Replit workspace.

- API server and web frontend run as separate workflows
- PostgreSQL is provisioned by Replit's built-in database
- Environment variables are managed in Replit Secrets

### Manual / Self-hosted

**1. Build the project:**

```bash
./bin/build.sh
```

**2. Start the API server:**

```bash
NODE_ENV=production PORT=8080 DATABASE_URL=postgresql://... node artifacts/api-server/dist/index.mjs
```

**3. Serve the frontend:**

The frontend builds to static files in `artifacts/vanted/dist/`. Serve them with any static file server (nginx, Caddy, Vercel, etc.).

With nginx, add a proxy rule so `/api` requests go to the API server:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/artifacts/vanted/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**4. Environment:**

Set all required environment variables (see [Environment Variables](#environment-variables)) in your server environment or a process manager like PM2.

```bash
# Example with PM2
pm2 start artifacts/api-server/dist/index.mjs \
  --name vanted-api \
  --env production \
  -- --port 8080
```

**5. Database migration:**

Run schema push on first deploy (or whenever the schema changes):

```bash
DATABASE_URL=postgresql://... pnpm --filter @workspace/db run push-force
```

**6. Seed services:**

```bash
BASE_URL=https://your-api-domain.com ./bin/seed.sh
```
