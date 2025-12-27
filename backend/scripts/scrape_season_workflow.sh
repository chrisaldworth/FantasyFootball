#!/bin/bash
# Workflow script to scrape Premier League season data step-by-step
# This uses the workflow script which shows fixtures for approval first
# Usage: ./scrape_season_workflow.sh [season] [options]
# Example: ./scrape_season_workflow.sh 25/26 --no-headless --skip-approval

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

# Default season (25/26 for 2025-2026)
SEASON="${1:-25/26}"

# Shift to get remaining arguments
shift 1 || true

# Change to project root
cd "$PROJECT_ROOT"

# Run the workflow scraper
echo "🚀 Starting Premier League scraper workflow for season: $SEASON"
echo "📁 Project root: $PROJECT_ROOT"
echo "📋 This will show fixtures for approval before scraping"
echo ""

python3 "$SCRIPT_DIR/scrape_fixtures_workflow.py" --season "$SEASON" "$@"

echo ""
echo "✅ Scraping complete!"

