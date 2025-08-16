
import sys
print("[DEBUG] Python executable:", sys.executable)
print("[DEBUG] sys.path:", sys.path)
print("[DEBUG] Python version:", sys.version)
try:
    from flask import Flask, jsonify
    from flask_cors import CORS
except ImportError as e:
    print("[ERROR] ImportError:", e)
    sys.exit(1)

app = Flask(__name__)
CORS(app)

@app.route('/')
def health_check():
    return jsonify({"status": "Backend is running!", "message": "ResumeIT Backend API"})

@app.route('/api/health')
def api_health():
    return jsonify({"status": "healthy", "service": "resumeit-backend"})

if __name__ == '__main__':
    print("🚀 Starting ResumeIT Minimal Backend Server...")
    app.run(host='0.0.0.0', port=5000)
