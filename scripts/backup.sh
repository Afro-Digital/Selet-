#!/usr/bin/env bash
# ==============================================================================
# Selet (ስሌት) - PostgreSQL Database Backup Script
# Creates a compressed, timestamped database dump with SHA-256 checksum.
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/selet_backup_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

# Database Connection Variables
DB_USER="${POSTGRES_USER:-selet}"
DB_PASSWORD="${POSTGRES_PASSWORD:-selet_dev}"
DB_NAME="${POSTGRES_DB:-selet}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-selet-postgres}"

mkdir -p "${BACKUP_DIR}"

echo "=================================================="
echo " Selet (ስሌት) - Database Backup / የዳታቤዝ ምትኬ"
echo " Timestamp: ${TIMESTAMP}"
echo "=================================================="

# Check if running against Docker or Direct Postgres
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
  echo "📦 Detected running Docker container: ${DOCKER_CONTAINER}"
  echo "Dumping database '${DB_NAME}' from container..."
  docker exec -t "${DOCKER_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"
elif command -v pg_dump >/dev/null 2>&1; then
  echo "🐘 Using local pg_dump client to connect to ${DB_HOST}:${DB_PORT}..."
  PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"
else
  echo "❌ Error: Neither docker container '${DOCKER_CONTAINER}' nor local 'pg_dump' utility found."
  exit 1
fi

# Verify the backup file was created and is non-empty
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "❌ Backup failed: output file is missing or empty."
  rm -f "${BACKUP_FILE}"
  exit 1
fi

# Generate SHA-256 Checksum
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo "✅ Backup successfully created!"
echo "   File:     ${BACKUP_FILE} (${FILE_SIZE})"
echo "   Checksum: ${CHECKSUM_FILE}"
echo "=================================================="
