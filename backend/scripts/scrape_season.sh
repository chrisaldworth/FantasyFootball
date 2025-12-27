#!/bin/bash
# Simple wrapper script to scrape Premier League season data
# Usage: ./scrape_season.sh [season] [options]
# Example: ./scrape_season.sh 2025-2026 --no-headless

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

# Default season (2025-2026)
SEASON="${1:-2025-2026}"

# Shift to get remaining arguments
shift 1 || true

# Change to project root
cd "$PROJECT_ROOT"

# Run the comprehensive scraper
echo "🚀 Starting Premier League scraper for season: $SEASON"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

python3 "$SCRIPT_DIR/scrape_fbref_comprehensive.py" --season "$SEASON" "$@"

echo ""
echo "✅ Scraping complete!"

