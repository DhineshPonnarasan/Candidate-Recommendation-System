#!/bin/bash

echo "🚀 Starting ResumeIT Backend Server..."

cd "$(dirname "$0")"

# Activate virtual environment
source /workspaces/Candidate-Recommendation-System/.venv/bin/activate

# Start the backend server
echo "📍 Starting server on port 3001..."
export FLASK_APP=run.py
export FLASK_ENV=development

# Try different approaches to start the server
echo "Attempting to start with gunicorn..."
exec gunicorn -w 1 -b 0.0.0.0:3001 run:app --timeout 300 --log-level info
