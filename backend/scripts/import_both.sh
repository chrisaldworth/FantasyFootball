#!/bin/bash
# Script to import match data to both local and cloud databases

set -e

SEASON="2025-2026"
DATA_DIR="data"

echo "============================================================"
echo "Match Data Import - Local and Cloud"
echo "============================================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found. Please create one first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Import to LOCAL database
echo ""
echo "============================================================"
echo "STEP 1: Importing to LOCAL database"
echo "============================================================"
echo ""

python scripts/import_match_data.py --season "$SEASON" --data-dir "$DATA_DIR"

LOCAL_EXIT_CODE=$?

if [ $LOCAL_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Local import completed successfully!"
else
    echo ""
    echo "❌ Local import failed with exit code $LOCAL_EXIT_CODE"
    exit $LOCAL_EXIT_CODE
fi

echo ""
echo "============================================================"
echo "STEP 2: Cloud import instructions"
echo "============================================================"
echo ""
echo "To import to cloud database, you have two options:"
echo ""
echo "Option 1: Via API Endpoint (Recommended)"
echo "----------------------------------------"
echo "1. Get your admin JWT token by logging in:"
echo "   curl -X POST 'https://fpl-companion-api.onrender.com/api/auth/login' \\"
echo "     -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "     -d 'username=YOUR_ADMIN_EMAIL&password=YOUR_PASSWORD'"
echo ""
echo "2. Trigger import with the token:"
echo "   curl -X POST 'https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=$SEASON' \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "Option 2: Via Render Shell"
echo "-------------------------"
echo "1. Go to Render Dashboard → Your Service → Shell"
echo "2. Run:"
echo "   cd backend"
echo "   python scripts/import_match_data.py --season $SEASON --data-dir data"
echo ""
echo "============================================================"
echo ""


