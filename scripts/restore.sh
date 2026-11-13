#!/usr/bin/env bash
# ==============================================================================
# Selet (ስሌት) - PostgreSQL Database Restore Script
# Safely verifies and restores a compressed SQL backup file.
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz> [--force]"
  echo "Example: $0 ./backups/selet_backup_20261113_160000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
FORCE_FLAG="${2:-}"

# Database Connection Variables
DB_USER="${POSTGRES_USER:-selet}"
DB_PASSWORD="${POSTGRES_PASSWORD:-selet_dev}"
DB_NAME="${POSTGRES_DB:-selet}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-selet-postgres}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

echo "=================================================="
echo " Selet (ስሌት) - Database Restore / የዳታቤዝ መልሶ ማግኛ"
echo " Target File: ${BACKUP_FILE}"
echo " Database:    ${DB_NAME}"
echo "=================================================="

# Verify checksum if present
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "🔍 Verifying SHA-256 checksum..."
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILE}"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILE}"
  fi
  echo "✅ Checksum verified."
fi

# Confirm action unless --force is specified
if [ "${FORCE_FLAG}" != "--force" ] && [ "${FORCE_FLAG}" != "-f" ]; then
  read -p "⚠️ WARNING: This will overwrite existing data in '${DB_NAME}'. Continue? (y/N): " -r CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Restore aborted by user."
    exit 0
  fi
fi

# Execute restore
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
  echo "📦 Restoring into running Docker container: ${DOCKER_CONTAINER}..."
  if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${DOCKER_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
  else
    cat "${BACKUP_FILE}" | docker exec -i "${DOCKER_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
  fi
elif command -v psql >/dev/null 2>&1; then
  echo "🐘 Restoring via local psql client to ${DB_HOST}:${DB_PORT}..."
  if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
  else
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
  fi
else
  echo "❌ Error: Neither docker container '${DOCKER_CONTAINER}' nor local 'psql' utility found."
  exit 1
fi

echo "=================================================="
echo "✅ Database restore completed successfully!"
echo "=================================================="
