#!/bin/bash
# Quick status check for the previous seasons scraper

LOG_FILE="../scrape_previous_seasons.log"
PID_FILE="../scrape_previous_seasons.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✓ Scraper is running (PID: $PID)"
    else
        echo "✗ Scraper process not found (PID: $PID)"
    fi
else
    echo "⚠️  PID file not found"
fi

if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "Last 10 lines of log:"
    echo "---"
    tail -10 "$LOG_FILE"
    echo ""
    echo "Progress:"
    echo "---"
    grep -E "(Starting scrape|Successfully completed|Error|matches scraped|Total matches)" "$LOG_FILE" | tail -5
else
    echo "Log file not found"
fi



