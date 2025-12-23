#!/usr/bin/env python3

import sys
import os
import importlib.util

# Resolve absolute path to backend directory and app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_MODULE_PATH = os.path.join(BASE_DIR, 'app.py')

# Load create_app from app.py explicitly to avoid conflict with app/ package
spec = importlib.util.spec_from_file_location('resumeit_backend_app', APP_MODULE_PATH)
if spec is None or spec.loader is None:
    raise RuntimeError('Unable to load app module from app.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)  # type: ignore
create_app = getattr(module, 'create_app')

# Create app instance for WSGI servers (like gunicorn)
app = create_app()

if __name__ == '__main__':
    """
    Backend server entry point.
    
    Port Configuration:
    - Local development: Defaults to port 8081 if PORT env var is not set
    - Render deployment: Automatically uses PORT environment variable provided by Render
    - No manual port configuration required in production
    
    This backend is deployed on Render (https://render.com).
    Render automatically injects the PORT environment variable at runtime.
    """
    # Read port from environment (Render provides this in production)
    # Defaults to 8081 for local development
    port = int(os.environ.get('PORT', 8081))
    
    # Determine if running in production (Render sets RENDER env var)
    is_production = os.environ.get('RENDER') == 'true' or os.environ.get('ENV') == 'production'
    
    print("=" * 60)
    print("Starting ResumeIT Backend Server...")
    print(f"Backend running on port {port}")
    if not is_production:
        print(f"Local URL: http://localhost:{port}")
    print(f"Health check available at /api/health")
    print("=" * 60)
    
    # Disable debug mode in production for security and performance
    app.run(host='0.0.0.0', port=port, debug=not is_production)
