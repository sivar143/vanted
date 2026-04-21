#!/usr/bin/env bash
###############################################################################
#  Vanted — One-shot deploy script for Fedora / RHEL / CentOS Stream
#
#  Installs Node.js 22, pnpm, PostgreSQL 16, clones the repo, sets up the
#  database, builds, and starts the app.
#
#  Usage:
#    curl -fsSL https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/fedora.sh | bash
#  Or:
#    chmod +x fedora.sh && ./fedora.sh
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

[ "$(id -u)" = "0" ] && SUDO="" || SUDO="sudo"

log "==========================================================="
log "  Vanted Deploy — Fedora / RHEL"
log "==========================================================="

# 1. Base tools
log "[1/7] Installing base tools (curl, git, gcc, openssl)..."
$SUDO dnf install -y curl git ca-certificates openssl gcc-c++ make

# 2. Node.js 22
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  log "[2/7] Installing Node.js 22..."
  curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO bash -
  $SUDO dnf install -y nodejs
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
  log "[4/7] Installing PostgreSQL server..."
  $SUDO dnf install -y postgresql-server postgresql-contrib
  if [ ! -d /var/lib/pgsql/data/base ]; then
    $SUDO postgresql-setup --initdb
  fi
  $SUDO systemctl enable --now postgresql
else
  log "[4/7] PostgreSQL already installed."
  $SUDO systemctl start postgresql 2>/dev/null || true
fi

# 5. Database + role
log "[5/7] Creating database '$DB_NAME' and user '$DB_USER'..."
$SUDO -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 || \
  $SUDO -u postgres psql -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS' CREATEDB;"
$SUDO -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  $SUDO -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
$SUDO -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" >/dev/null

# Ensure pg_hba.conf accepts password auth on localhost (Fedora defaults to ident)
PG_HBA=$($SUDO -u postgres psql -tAc "SHOW hba_file;")
if ! $SUDO grep -qE "^host\s+all\s+$DB_USER\s+127\.0\.0\.1/32\s+md5" "$PG_HBA"; then
  warn "Adding md5 auth for $DB_USER to $PG_HBA..."
  echo "host    all    $DB_USER    127.0.0.1/32    md5" | $SUDO tee -a "$PG_HBA" >/dev/null
  echo "host    all    $DB_USER    ::1/128         md5" | $SUDO tee -a "$PG_HBA" >/dev/null
  $SUDO systemctl reload postgresql
fi

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
