#!/bin/bash
# Update match data from FPL API wrapper script
# Faster and more reliable than web scraping
#
# Usage:
#   ./update_matches_from_fpl_api.sh [--days DAYS] [--season SEASON] [--gameweek GW]

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Run the Python script with all arguments
echo "🚀 Updating matches from FPL API..."
echo "📁 Project root: $PROJECT_ROOT"
echo ""

python3 "$SCRIPT_DIR/update_matches_from_fpl_api.py" "$@"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Match update completed successfully!"
else
    echo ""
    echo "❌ Match update failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE

