#!/bin/bash
# Cloud deployment setup script for Admin Portal
# This can be run as a one-time setup task in cloud environments

set -e

echo "=========================================="
echo "Admin Portal Cloud Setup"
echo "=========================================="
echo ""

# Get environment variables
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
ADMIN_ROLE="${ADMIN_ROLE:-admin}"

# Check if we should create admin user
SKIP_USER="${SKIP_USER:-false}"

cd "$(dirname "$0")/.."

# Run Python setup script
if [ "$SKIP_USER" = "true" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo "Running schema migration only..."
    python3 scripts/cloud_setup_admin.py --skip-user
else
    echo "Running full setup with admin user..."
    python3 scripts/cloud_setup_admin.py \
        --email "$ADMIN_EMAIL" \
        --password "$ADMIN_PASSWORD" \
        --role "$ADMIN_ROLE"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="

