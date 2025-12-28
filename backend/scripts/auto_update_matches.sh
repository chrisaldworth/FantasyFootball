#!/bin/bash
# Automated match data updater wrapper script
# Can be used with cron or systemd timer
#
# Usage:
#   ./auto_update_matches.sh [--days DAYS] [--season SEASON] [--import-only]
#
# Cron example (run daily at 2 AM):
#   0 2 * * * /path/to/backend/scripts/auto_update_matches.sh --days 3

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Run the Python script with all arguments
echo "🚀 Starting automated match update..."
echo "📁 Project root: $PROJECT_ROOT"
echo ""

python3 "$SCRIPT_DIR/auto_update_matches.py" "$@"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Match update completed successfully!"
else
    echo ""
    echo "❌ Match update failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE

