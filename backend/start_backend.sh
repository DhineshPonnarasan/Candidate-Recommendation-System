#!/bin/bash

echo "🚀 Starting ResumeIT Backend Server..."

cd "$(dirname "$0")"

# Activate virtual environment
source $(dirname "$0")/.venv/bin/activate

# Start the backend server
# Local development: Set PORT=8081 for local development
# Note: On Render, PORT is automatically provided by the platform
echo "📍 Starting server on port 8081 (local development)..."
export FLASK_APP=run.py
export FLASK_ENV=development
export PORT=8081

# Start the main backend server
PYTHON_BIN="$(dirname "$0")/.venv/bin/python"
echo "Using Python binary at: $PYTHON_BIN"
echo "Starting ResumeIT Backend on http://localhost:8081"
"$PYTHON_BIN" run.py
