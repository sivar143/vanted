# Vanted Automation Scripts

This folder contains shell scripts that automate common development and deployment tasks for the Vanted project. All scripts are written in Bash and are executable.

## Quick Start

```bash
# Make all scripts executable (only needed once)
chmod +x bin/*.sh

# First-time setup
DATABASE_URL=postgresql://user:pass@localhost:5432/vanted ./bin/setup.sh

# Start all dev servers
DATABASE_URL=postgresql://user:pass@localhost:5432/vanted ./bin/dev.sh
```

---

## Scripts

### `setup.sh` — First-Time Project Setup

Runs the full onboarding sequence for a fresh environment:
1. Checks that Node.js and pnpm are installed
2. Runs `pnpm install` to install all workspace dependencies
3. Validates that `DATABASE_URL` is set
4. Pushes the Drizzle schema to your PostgreSQL database
5. Optionally runs the TypeScript seed script if present

**Usage:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/vanted ./bin/setup.sh
```

**When to use:** Once, when cloning the project for the first time on a new machine.

---

### `dev.sh` — Start Development Servers

Starts both the API server and the React frontend in parallel. Both processes run in the background and share the terminal. Pressing `Ctrl+C` stops both cleanly.

**Default ports:**
- API Server: `http://localhost:8080`
- Web App: `http://localhost:5173`

**Usage:**
```bash
# With defaults
DATABASE_URL=postgresql://... ./bin/dev.sh

# With custom ports
API_PORT=3001 WEB_PORT=3000 DATABASE_URL=postgresql://... ./bin/dev.sh
```

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `API_PORT` | `8080` | Port for the Express API server |
| `WEB_PORT` | `5173` | Port for the Vite frontend dev server |

**When to use:** Every time you want to run the project locally.

---

### `seed.sh` — Seed the Database with Services

Populates the database with the 7 Vanted services (Car, Bike, Plumber, Chef, Technician, Electrician, Packers & Movers) by calling the running API. It first removes all existing services, then creates the 7 services fresh.

**Requires:** The API server must be running before executing this script.

**Services seeded:**

| Service | Category | Price | ETA |
|---------|----------|-------|-----|
| Car | Driver | ₹249 | ~15 minutes |
| Bike | Driver | ₹99 | ~10 minutes |
| Plumber | Home Needs | ₹399 | ~30 minutes |
| Chef | Home Needs | ₹699 | ~45 minutes |
| Technician | Home Needs | ₹499 | ~35 minutes |
| Electrician | Home Needs | ₹349 | ~30 minutes |
| Packers & Movers | Courier | ₹1499 | ~60 minutes |

**Usage:**
```bash
# Against local API
./bin/seed.sh

# Against staging or production API
BASE_URL=https://api.my-vanted.com ./bin/seed.sh

# With custom admin credentials
ADMIN_USERNAME=myAdmin ADMIN_PASSWORD=mySecret ./bin/seed.sh
```

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8080` | Base URL of the running API server |
| `ADMIN_USERNAME` | `admin` | Admin username for authentication |
| `ADMIN_PASSWORD` | `vanted-admin-2024` | Admin password for authentication |

**When to use:**
- After a fresh database setup
- When you want to reset the service catalog to its default state
- When deploying to a new environment

---

### `build.sh` — Production Build

Builds both the API server and the frontend for production deployment:
1. Runs TypeScript type-checking across the entire workspace
2. Bundles the API server with esbuild → `artifacts/api-server/dist/index.mjs`
3. Bundles the frontend with Vite → `artifacts/vanted/dist/`

**Usage:**
```bash
./bin/build.sh
```

**Output:**

| Artifact | Location |
|----------|----------|
| API Server bundle | `artifacts/api-server/dist/index.mjs` |
| Frontend static files | `artifacts/vanted/dist/` |

**Running the production build:**
```bash
# Start the API
NODE_ENV=production PORT=8080 DATABASE_URL=postgresql://... \
  node artifacts/api-server/dist/index.mjs

# Serve the frontend (with any static server, e.g. serve)
npx serve artifacts/vanted/dist
```

**When to use:** Before deploying to a server or creating a release.

---

### `codegen.sh` — Regenerate API Client

Reads the OpenAPI specification at `lib/api-spec/openapi.yaml` and regenerates:
- `lib/api-client-react/src/generated/` — typed React Query hooks + Axios client
- `lib/api-zod/src/generated/` — Zod validation schemas

**Usage:**
```bash
./bin/codegen.sh
```

**When to use:**
- After adding, removing, or modifying any endpoint in `lib/api-spec/openapi.yaml`
- After changing a request/response schema in the OpenAPI spec
- Always run codegen before restarting the dev servers after spec changes

**Important:** The generated files should be committed to the repository. Do not edit them manually — they will be overwritten the next time codegen runs.

---

## Recommended Workflow

### Starting fresh on a new machine

```bash
git clone https://github.com/sivar143/vanted.git
cd vanted
export DATABASE_URL=postgresql://user:pass@localhost:5432/vanted
./bin/setup.sh
./bin/dev.sh
```

### Day-to-day development

```bash
export DATABASE_URL=postgresql://user:pass@localhost:5432/vanted
./bin/dev.sh
```

### After changing the API spec

```bash
# 1. Edit lib/api-spec/openapi.yaml
# 2. Regenerate the client
./bin/codegen.sh
# 3. Restart dev servers (Ctrl+C then re-run dev.sh)
./bin/dev.sh
```

### Preparing a production release

```bash
./bin/build.sh
# Deploy artifacts/api-server/dist/ and artifacts/vanted/dist/
```

### Resetting service data in any environment

```bash
# Ensure the API is running, then:
BASE_URL=https://your-api.example.com ./bin/seed.sh
```

---

## Troubleshooting

**`Permission denied` when running a script:**
```bash
chmod +x bin/*.sh
```

**`DATABASE_URL is not set` error:**
```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/vanted
```

**`Could not obtain admin token` in seed.sh:**
Make sure the API server is running before executing `seed.sh`. Start it with:
```bash
PORT=8080 DATABASE_URL=postgresql://... pnpm --filter @workspace/api-server run dev
```

**Port already in use:**
```bash
# Use different ports
API_PORT=3001 WEB_PORT=3000 ./bin/dev.sh
```
