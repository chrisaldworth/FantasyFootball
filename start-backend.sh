#!/bin/bash
cd "$(dirname "$0")/backend"
source venv/bin/activate
echo "Starting backend on http://localhost:8080..."
uvicorn app.main:app --reload --port 8080
