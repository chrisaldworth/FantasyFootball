#!/bin/bash
# Import all scraped match data from JSON files into database
# Imports all seasons found in the data directory
#
# Usage:
#   ./import_all_seasons.sh [--data-dir DATA_DIR]
#
# Example:
#   ./import_all_seasons.sh

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

# Default data directory
DATA_DIR="${1:-data}"

# Change to backend directory
cd "$BACKEND_DIR"

echo "🚀 Importing All Seasons Match Data"
echo "📁 Data directory: $DATA_DIR"
echo ""

# Find all season directories
SEASONS=$(find "$DATA_DIR" -type d -name "matches" -exec dirname {} \; | xargs -n1 basename | sort -u)

if [ -z "$SEASONS" ]; then
    echo "❌ No season directories found in $DATA_DIR"
    exit 1
fi

echo "Found seasons:"
for season in $SEASONS; do
    echo "  - $season"
done
echo ""

# Import each season
TOTAL_IMPORTED=0
TOTAL_ERRORS=0

for season in $SEASONS; do
    echo "============================================================"
    echo "Importing Season: $season"
    echo "============================================================"
    echo ""
    
    python3 scripts/import_match_data.py --season "$season" --data-dir "$DATA_DIR"
    
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Season $season imported successfully"
    else
        echo "⚠️  Season $season had errors (exit code: $EXIT_CODE)"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
    
    echo ""
done

echo "============================================================"
echo "Import Summary"
echo "============================================================"
echo "Total seasons processed: $(echo $SEASONS | wc -w | tr -d ' ')"
echo "Seasons with errors: $TOTAL_ERRORS"
echo "============================================================"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo "✅ All seasons imported successfully!"
    exit 0
else
    echo "⚠️  Some seasons had errors. Check the output above."
    exit 1
fi

