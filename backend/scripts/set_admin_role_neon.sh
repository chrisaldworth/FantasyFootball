#!/bin/bash
# Script to set admin role for a user on Neon database
# Usage: ./set_admin_role_neon.sh your-email@example.com

set -e

if [ -z "$1" ]; then
    echo "Usage: ./set_admin_role_neon.sh your-email@example.com"
    exit 1
fi

EMAIL="$1"
CONNECTION_STRING="postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "Connecting to Neon database..."
echo "Setting user '$EMAIL' to admin role..."
echo ""

psql "$CONNECTION_STRING" <<EOF
-- Add role column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';

-- Set user to admin
UPDATE users SET role = 'admin' WHERE email = '$EMAIL';

-- Verify the update
SELECT id, email, username, role FROM users WHERE email = '$EMAIL';
EOF

echo ""
echo "✅ Done! User '$EMAIL' has been set to admin role."
echo ""
echo "Next steps:"
echo "1. Log out from the frontend"
echo "2. Log back in"
echo "3. Navigate to /admin"

