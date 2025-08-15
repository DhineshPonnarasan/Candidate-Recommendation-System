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
    # Run the application
    print("Starting ResumeIT Backend Server...")
    port = int(os.environ.get('PORT', 8081))
    print(f"API will be available at: http://localhost:{port}")
    print(f"Health check: http://localhost:{port}/api/health")
    
    app.run(host='0.0.0.0', port=port, debug=True)
