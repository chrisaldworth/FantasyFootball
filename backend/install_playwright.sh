#!/bin/bash
# Install Playwright and browsers for FPL authentication

echo "Installing Playwright..."
pip install playwright

echo "Installing Chromium browser..."
playwright install chromium

echo "Installing system dependencies (Linux)..."
playwright install-deps chromium || echo "Note: install-deps may not work on all systems"

echo "✅ Playwright setup complete!"

