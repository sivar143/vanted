# Vanted — One-Shot Deploy Scripts

Each script installs everything from scratch on a fresh machine: Node.js 22,
pnpm, PostgreSQL, clones the repo, sets up the database, seeds the 7 services,
and prepares the app to run.

| OS                      | Script                  | Run as |
|-------------------------|-------------------------|--------|
| Ubuntu / Debian (22+)   | `bin/deploy/ubuntu.sh`  | regular user (uses `sudo`) |
| Fedora / RHEL / CentOS  | `bin/deploy/fedora.sh`  | regular user (uses `sudo`) |
| macOS (Intel + Apple Si)| `bin/deploy/macos.sh`   | regular user |
| Windows 10 / 11         | `bin/deploy/windows.ps1`| **Administrator PowerShell** |

## Quick Install (one-liners)

### Ubuntu / Debian

```bash
curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/ubuntu.sh | bash
```

### Fedora / RHEL

```bash
curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/fedora.sh | bash
```

### macOS

```bash
curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/macos.sh | bash
```

### Windows (PowerShell as Administrator)

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
iwr -useb https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/windows.ps1 | iex
```

## What the scripts do

1. Install package manager (Homebrew/Chocolatey) if missing
2. Install **Node.js 22**
3. Install **pnpm**
4. Install **PostgreSQL 16** and start the service
5. Create the database `vanted` and a dedicated user with a random password
6. Clone the `production` branch of the repo into `~/vanted` (or `C:\vanted` on Windows)
7. Generate a `.env` file with `DATABASE_URL`, `PORT`, `SESSION_SECRET`
8. Install project dependencies via `pnpm install`
9. Push the Drizzle schema (creates 7 tables)
10. Seed the 7 default services (Car, Bike, Plumber, Chef, Technician,
    Electrician, Packers & Movers)

## Customisation

All scripts accept the same environment variables (set them before running):

| Variable      | Default                           | Description |
|---------------|-----------------------------------|-------------|
| `REPO_URL`    | `https://github.com/sivar143/vanted.git` | Source repo |
| `BRANCH`      | `production`                      | Git branch |
| `INSTALL_DIR` | `~/vanted` (or `C:\vanted`)       | Install path |
| `DB_NAME`     | `vanted`                          | DB name |
| `DB_USER`     | `vanted` (Linux/macOS) / `postgres` (Win) | DB user |
| `DB_PASS`     | random (Linux/macOS) / `vanted-postgres-2024` (Win) | DB password |
| `PORT`        | `8080`                            | API server port |
| `WEB_PORT`    | `5173`                            | Vite dev port |

Example with custom values:

```bash
DB_NAME=mydb PORT=9000 INSTALL_DIR=/opt/vanted ./ubuntu.sh
```

## After Install

The scripts finish with the install location and DB URL printed. To start the
application in development mode:

```bash
cd ~/vanted        # or wherever INSTALL_DIR points to
pnpm run dev
```

Then visit:

- **Web app:**    `http://localhost:5173`
- **API:**        `http://localhost:8080/api/healthz`
- **Admin panel:** `http://localhost:5173/admin` — login as `admin` / `vanted-admin-2024`

## Production Mode

```bash
cd ~/vanted
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/vanted    run build
pnpm --filter @workspace/api-server run start    # starts the API
pnpm --filter @workspace/vanted    run preview   # serves the static frontend
```

For a real production deployment, put the API server behind a reverse proxy
(nginx / Caddy) and serve the frontend's `dist/` folder as static files.

## Troubleshooting

- **PostgreSQL "peer authentication" failed (Linux):** The Fedora script edits
  `pg_hba.conf` automatically. On Ubuntu you may need to add an `md5` line for
  your user manually if the default `peer` auth blocks the connection.
- **`pnpm` not found after install:** Open a new shell so `PATH` is reloaded.
- **PowerShell "running scripts is disabled":** Run the `Set-ExecutionPolicy
  Bypass -Scope Process -Force` line first.
- **Port 8080 already in use:** Run with `PORT=9000` (Linux/macOS) or
  `$env:PORT=9000` (Windows) before the script.
