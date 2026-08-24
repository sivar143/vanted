#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

NODE_VERSION="24.19.0"
JAVA_MAJOR="25"
MAVEN_VERSION="3.9.16"

log() { printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
fail() { echo "ERROR: $*" >&2; exit 1; }

[[ "${EUID}" -eq 0 ]] || SUDO=sudo
SUDO="${SUDO:-}"

if ! command -v apt-get >/dev/null 2>&1; then
  fail "This bootstrap currently supports Debian/Ubuntu Linux."
fi

log "Installing base OS packages"
$SUDO apt-get update
$SUDO apt-get install -y curl ca-certificates git unzip tar build-essential

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine and Compose plugin from Docker's official installer"
  curl -fsSL https://get.docker.com | $SUDO sh
fi

if ! id -nG "${USER}" | tr ' ' '\n' | grep -qx docker; then
  $SUDO usermod -aG docker "${USER}" || true
  log "Added ${USER} to the docker group. A new login may be required before docker works without sudo."
fi

if [[ ! -s "${HOME}/.nvm/nvm.sh" ]]; then
  log "Installing nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
fi
export NVM_DIR="${HOME}/.nvm"
# shellcheck disable=SC1090
source "${NVM_DIR}/nvm.sh"
nvm install "${NODE_VERSION}"
nvm alias default "${NODE_VERSION}"
nvm use "${NODE_VERSION}"

if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | grep -q '25'; then
  log "Installing Java ${JAVA_MAJOR} with SDKMAN"
  if [[ ! -s "${HOME}/.sdkman/bin/sdkman-init.sh" ]]; then
    curl -s "https://get.sdkman.io" | bash
  fi
  # shellcheck disable=SC1090
  source "${HOME}/.sdkman/bin/sdkman-init.sh"
  yes | sdk install java "25-tem" || true
  sdk default java "25-tem"
fi

if ! command -v mvn >/dev/null 2>&1 || ! mvn -version 2>&1 | grep -q "Apache Maven ${MAVEN_VERSION}"; then
  log "Installing Maven ${MAVEN_VERSION}"
  MAVEN_DIR="${HOME}/.local/apache-maven-${MAVEN_VERSION}"
  mkdir -p "${HOME}/.local"
  if [[ ! -x "${MAVEN_DIR}/bin/mvn" ]]; then
    tmp="$(mktemp -d)"
    curl -fsSL "https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o "${tmp}/maven.tgz"
    tar -xzf "${tmp}/maven.tgz" -C "${HOME}/.local"
    rm -rf "${tmp}"
  fi
  export PATH="${MAVEN_DIR}/bin:${PATH}"
  mkdir -p "${HOME}/.local/bin"
  ln -sf "${MAVEN_DIR}/bin/mvn" "${HOME}/.local/bin/mvn"
  export PATH="${HOME}/.local/bin:${PATH}"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  log "Created vanted-platform/.env from .env.example"
fi

log "Verifying toolchain"
printf 'Node: '; node --version
printf 'npm: '; npm --version
printf 'Java: '; java -version 2>&1 | head -n 1
printf 'Maven: '; mvn -version | head -n 1
printf 'Docker: '; docker --version
printf 'Compose: '; docker compose version

log "Installing frontend packages"
(cd frontend && npm install)

log "Building and starting the local stack"
docker compose pull
docker compose up -d --build

log "Vanted local environment is starting"
echo "Open: http://localhost"
echo "Useful command: docker compose -f vanted-platform/docker-compose.yml ps"
