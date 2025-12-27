#!/bin/bash
# Simple script to set up admin portal
# This calls the API endpoint to fix the schema

set -e

echo "=========================================="
echo "Admin Portal Setup"
echo "=========================================="
echo ""

# Default API URL
API_URL="${API_URL:-http://localhost:8080}"

echo "Step 1: Adding role column to database..."
echo "Calling: POST $API_URL/api/admin/fix-schema"
echo ""

response=$(curl -s -X POST "$API_URL/api/admin/fix-schema" || echo "ERROR")

if echo "$response" | grep -q "role" || echo "$response" | grep -q "ok"; then
    echo "✓ Schema updated successfully"
else
    echo "⚠ Response: $response"
    echo "⚠ If the server is not running, start it with: uvicorn app.main:app --reload"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update a user's role to 'admin' in your database:"
echo "   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
echo ""
echo "2. Or use the admin API (after logging in as admin):"
echo "   PUT /api/admin/users/{user_id}/role?role=admin"
echo ""
echo "3. Log in and navigate to /admin in your frontend"
echo ""

