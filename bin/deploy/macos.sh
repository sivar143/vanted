#!/usr/bin/env bash
###############################################################################
#  Vanted — One-shot deploy script for macOS (Intel + Apple Silicon)
#
#  Installs Homebrew (if missing), Node.js 22, pnpm, PostgreSQL 16, clones
#  the repo, sets up the database, builds, and starts the app.
#
#  Usage:
#    curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/macos.sh | bash
#  Or:
#    chmod +x macos.sh && ./macos.sh
#
#  Optional env vars: REPO_URL, BRANCH, INSTALL_DIR, DB_NAME, DB_USER, DB_PASS,
#                     PORT, WEB_PORT  (see ubuntu.sh for details)
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

log "==========================================================="
log "  Vanted Deploy — macOS"
log "==========================================================="

# 1. Homebrew
if ! command -v brew >/dev/null 2>&1; then
  log "[1/7] Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for current session (Apple Silicon vs Intel)
  if [ -d /opt/homebrew/bin ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -d /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  log "[1/7] Homebrew already installed."
fi

# 2. Node.js
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  log "[2/7] Installing Node.js 22..."
  brew install node@22
  brew link --overwrite --force node@22 2>/dev/null || true
else
  log "[2/7] Node.js $(node -v) already installed."
fi

# 3. pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  log "[3/7] Installing pnpm..."
  brew install pnpm
else
  log "[3/7] pnpm $(pnpm -v) already installed."
fi

# 4. PostgreSQL
if ! command -v psql >/dev/null 2>&1; then
  log "[4/7] Installing PostgreSQL 16..."
  brew install postgresql@16
  brew services start postgresql@16
  # Add postgres binaries to PATH for this session
  PG_BIN="$(brew --prefix postgresql@16)/bin"
  export PATH="$PG_BIN:$PATH"
else
  log "[4/7] PostgreSQL already installed."
  brew services start postgresql@16 2>/dev/null || \
    brew services start postgresql 2>/dev/null || true
fi

# Wait for postgres to accept connections
log "Waiting for PostgreSQL to be ready..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if psql postgres -c "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 1
done

# 5. Database + role (macOS Homebrew Postgres uses current user as superuser)
log "[5/7] Creating database '$DB_NAME' and user '$DB_USER'..."
psql postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || \
  psql postgres -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS' CREATEDB;"
psql postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  psql postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >/dev/null

DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# 6. Clone & install
log "[6/7] Cloning $REPO_URL ($BRANCH) → $INSTALL_DIR..."
if [ -d "$INSTALL_DIR/.git" ]; then
  cd "$INSTALL_DIR"
  git fetch origin && git checkout "$BRANCH" && git pull origin "$BRANCH"
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

log "Installing project dependencies..."
pnpm install --frozen-lockfile || pnpm install

# 7. DB migrate + seed
log "[7/7] Pushing schema and seeding services..."
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
log "  Start in DEV mode:    cd $INSTALL_DIR && pnpm run dev"
log "  Admin login:          admin / vanted-admin-2024"
log "==========================================================="
