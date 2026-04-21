#!/usr/bin/env bash
###############################################################################
#  Vanted — One-shot deploy script for Ubuntu / Debian (22.04+)
#
#  Installs Node.js 22, pnpm, PostgreSQL 16, clones the repo, sets up the
#  database, builds, and starts the app.
#
#  Usage:
#    curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/ubuntu.sh | bash
#  Or:
#    chmod +x ubuntu.sh && ./ubuntu.sh
#
#  Optional env vars (any can be exported before running):
#    REPO_URL   — git repo URL (default: https://github.com/sivar143/vanted.git)
#    BRANCH     — git branch to clone (default: production)
#    INSTALL_DIR — where to clone (default: $HOME/vanted)
#    DB_NAME    — PostgreSQL database name (default: vanted)
#    DB_USER    — PostgreSQL user (default: vanted)
#    DB_PASS    — PostgreSQL password (default: random 16-char)
#    PORT       — port for the API server (default: 8080)
#    WEB_PORT   — port for the web frontend (default: 5173)
###############################################################################
set -e

REPO_URL="${REPO_URL:-https://github.com/sivar143/vanted.git}"
BRANCH="${BRANCH:-production}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/vanted}"
DB_NAME="${DB_NAME:-vanted}"
DB_USER="${DB_USER:-vanted}"
DB_PASS="${DB_PASS:-$(openssl rand -hex 8 2>/dev/null || echo "vanted$(date +%s)")}"
PORT="${PORT:-8080}"
WEB_PORT="${WEB_PORT:-5173}"

GREEN='\033[0;32m'; YEL='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[vanted]${NC} $*"; }
warn() { echo -e "${YEL}[vanted]${NC} $*"; }
err() { echo -e "${RED}[vanted]${NC} $*" >&2; }

[ "$(id -u)" = "0" ] && SUDO="" || SUDO="sudo"

log "==========================================================="
log "  Vanted Deploy — Ubuntu / Debian"
log "==========================================================="

# 1. System update + base packages
log "[1/7] Updating package index and installing base tools..."
$SUDO apt-get update -y
$SUDO apt-get install -y curl git ca-certificates gnupg openssl build-essential

# 2. Node.js 22
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  log "[2/7] Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
else
  log "[2/7] Node.js $(node -v) already installed."
fi

# 3. pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  log "[3/7] Installing pnpm..."
  $SUDO npm install -g pnpm
else
  log "[3/7] pnpm $(pnpm -v) already installed."
fi

# 4. PostgreSQL
if ! command -v psql >/dev/null 2>&1; then
  log "[4/7] Installing PostgreSQL..."
  $SUDO apt-get install -y postgresql postgresql-contrib
  $SUDO systemctl enable --now postgresql
else
  log "[4/7] PostgreSQL already installed."
fi

# 5. Database + role
log "[5/7] Creating database '$DB_NAME' and user '$DB_USER'..."
$SUDO -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || \
  $SUDO -u postgres psql -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS' CREATEDB;"
$SUDO -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  $SUDO -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
$SUDO -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >/dev/null

DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# 6. Clone & install
log "[6/7] Cloning $REPO_URL ($BRANCH) → $INSTALL_DIR..."
if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

cat > "$INSTALL_DIR/.env" <<ENVEOF
DATABASE_URL=${DB_URL}
PORT=${PORT}
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)
ENVEOF

log "Installing project dependencies (this may take a few minutes)..."
pnpm install --frozen-lockfile || pnpm install

# 7. DB migrate, build, seed
log "[7/7] Setting up database schema and seeding services..."
export DATABASE_URL="$DB_URL"
pnpm --filter @workspace/db run push-force
pnpm --filter @workspace/scripts run tsx src/seed-vanted.ts 2>/dev/null || \
  warn "Seed script unavailable — services can be added via the admin panel."

log ""
log "==========================================================="
log "  Vanted is installed at: $INSTALL_DIR"
log "==========================================================="
log "  Database URL: $DB_URL"
log "  API port:     $PORT"
log "  Web port:     $WEB_PORT"
log ""
log "  To start in DEV mode:"
log "    cd $INSTALL_DIR && pnpm run dev"
log ""
log "  To start in PROD mode (requires building first):"
log "    cd $INSTALL_DIR"
log "    pnpm --filter @workspace/api-server run build"
log "    pnpm --filter @workspace/api-server run start"
log ""
log "  Admin login: admin / vanted-admin-2024"
log "==========================================================="
