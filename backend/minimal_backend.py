
import os
import sys
print("[DEBUG] Python executable:", sys.executable)
print("[DEBUG] sys.path:", sys.path)
print("[DEBUG] Python version:", sys.version)
try:
    from flask import Flask, jsonify, request
    from flask_cors import CORS
except ImportError as e:
    print("[ERROR] ImportError:", e)
    sys.exit(1)

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow all origins for demo; restrict in prod

@app.route('/')
def health_check():
    return jsonify({"status": "Backend is running!", "message": "ResumeIT Backend API"})

@app.route('/api/health')
def api_health():
    return jsonify({"status": "healthy", "service": "resumeit-backend"})

# Upload endpoint (main)
@app.route('/api/upload', methods=['POST'])
@app.route('/api/candidates/upload', methods=['POST'])  # Alias for frontend compatibility
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    # Save file to /tmp for demo
    save_path = os.path.join('/tmp', file.filename)
    file.save(save_path)
    return jsonify({"message": "File uploaded successfully", "filename": file.filename, "path": save_path}), 200

if __name__ == '__main__':
    print("🚀 Starting ResumeIT Minimal Backend Server...")
    port = int(os.environ.get("PORT", 5000)) 
    app.run(host='0.0.0.0', port=port)
