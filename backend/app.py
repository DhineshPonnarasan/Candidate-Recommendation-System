import sys
import os

# Adding the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import sys
import os

# Adding the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.app_config import AppConfig
from config.jwt_config import JWTConfig
from config.sqlite_database import db_config

def create_app():
    """Application factory pattern for creating Flask app"""
    app = Flask(__name__)
    
    # Loading configuration
    app.config.from_object(AppConfig)
    app.config.update(JWTConfig.get_jwt_config())
    
    # Initializing extensions with comprehensive CORS configuration
    jwt = JWTManager(app)
    
    # Enhanced CORS configuration
    CORS(app, 
         origins=AppConfig.CORS_ORIGINS,
         methods=AppConfig.CORS_METHODS,
         allow_headers=AppConfig.CORS_ALLOW_HEADERS,
         supports_credentials=True,
         expose_headers=['Content-Type', 'Authorization'])
    
    # Global OPTIONS handler for preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', '*'))
            response.headers.add('Access-Control-Allow-Headers', ', '.join(AppConfig.CORS_ALLOW_HEADERS))
            response.headers.add('Access-Control-Allow-Methods', ', '.join(AppConfig.CORS_METHODS))
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.status_code = 200
            return response
    
    # Adding CORS headers to all responses
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in AppConfig.CORS_ORIGINS:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', ', '.join(AppConfig.CORS_ALLOW_HEADERS))
        response.headers.add('Access-Control-Allow-Methods', ', '.join(AppConfig.CORS_METHODS))
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Initializing database
    with app.app_context():
        db_config.initialize_tables()
    
    # Registering blueprints - using simple imports
    sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
    from routes.user_routes import user_bp
    from routes.job_routes import job_bp
    from routes.candidate_routes import candidate_bp
    from routes.matching_routes import matching_bp
    from routes.application_routes import application_bp
    
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(job_bp, url_prefix='/api/jobs')
    app.register_blueprint(candidate_bp, url_prefix='/api/candidates')
    app.register_blueprint(matching_bp, url_prefix='/api/matching')
    app.register_blueprint(application_bp, url_prefix='/api/applications')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET', 'OPTIONS'])
    def health_check():
        return jsonify({
            'status': 'healthy', 
            'message': 'ResumeIT API is running',
            'version': '1.0.0'
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8081))
    app.run(host='0.0.0.0', port=port, debug=True)
