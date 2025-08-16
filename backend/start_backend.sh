#!/bin/bash

echo "🚀 Starting ResumeIT Backend Server..."

cd "$(dirname "$0")"

# Activate virtual environment
source $(dirname "$0")/.venv/bin/activate

# Start the backend server
echo "📍 Starting server on port 3001..."
export FLASK_APP=run.py
export FLASK_ENV=development

# Try different approaches to start the server
echo "Starting minimal backend (minimal_backend.py) with Flask..."
PYTHON_BIN="$(dirname "$0")/.venv/bin/python"
echo "Using Python binary at: $PYTHON_BIN"
"$PYTHON_BIN" minimal_backend.py
