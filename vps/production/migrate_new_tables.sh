#!/bin/bash
# Migration script: add new tables to production Directus
# Tables: budget_pro, organisme_pro, prevision_pro, compta_parameters
# + Directus metadata (collections, fields, relations)
#
# Usage: ./migrate_new_tables.sh
# Run from /srv/projets/production/compta-new/

set -e

CONTAINER=$(docker compose ps -q db)
DB_USER="${POSTGRES_USER:-compta}"
DB_NAME="${POSTGRES_DB:-directusdb}"

echo "=== Migration: new tables ==="
echo "Container: $CONTAINER"
echo "DB: $DB_NAME"
echo ""

# 1. Create tables + import data
echo "[1/3] Creating tables and importing data..."
docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < migration_new_tables.sql
echo "  OK"

# 2. Import Directus metadata (collections, fields, relations)
echo "[2/3] Importing Directus metadata..."

# Copy CSVs into container
docker cp meta_collections.csv "$CONTAINER":/tmp/
docker cp meta_fields.csv "$CONTAINER":/tmp/
docker cp meta_relations.csv "$CONTAINER":/tmp/

docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" << 'PSQL'
-- Import collections metadata
\copy directus_collections FROM '/tmp/meta_collections.csv' WITH CSV HEADER;

-- Import fields metadata
\copy directus_fields FROM '/tmp/meta_fields.csv' WITH CSV HEADER;

-- Import relations metadata
\copy directus_relations FROM '/tmp/meta_relations.csv' WITH CSV HEADER;
PSQL
echo "  OK"

# 3. Restart Directus to pick up new schema
echo "[3/3] Restarting Directus..."
docker compose restart directus
echo "  OK"

echo ""
echo "=== Migration complete ==="
echo "New tables: budget_pro, organisme_pro, prevision_pro, compta_parameters"
echo "Verify at: https://api.compta.artpotentiel.fr/admin"
