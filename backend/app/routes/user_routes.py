import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
import re
from app.models.user_model import User

user_bp = Blueprint('users', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, ""

@user_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        # Validate input
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, password_error = validate_password(password)
        if not is_valid:
            return jsonify({'error': password_error}), 400
        
        # Check if user already exists
        existing_user = User.find_by_username(username)
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 409
        
        existing_email = User.find_by_email(email)
        if existing_email:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        new_user = User.create(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        if not new_user:
            return jsonify({'error': 'Failed to create user'}), 500
        
        # Create access token
        access_token = create_access_token(identity=new_user['id'])
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': new_user['id'],
                'username': new_user['username'],
                'email': new_user['email'],
                'first_name': new_user['first_name'],
                'last_name': new_user['last_name']
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return access token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        # Find user
        user = User.find_by_username(username)
        if not user:
            # Try finding by email
            user = User.find_by_email(username)
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not User.verify_password(user, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user['id'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'created_at': user['created_at'].isoformat() if user['created_at'] else None
            }
        }), 200
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate fields
        update_data = {}
        
        if 'first_name' in data:
            update_data['first_name'] = data['first_name'].strip()
        
        if 'last_name' in data:
            update_data['last_name'] = data['last_name'].strip()
        
        if 'email' in data:
            email = data['email'].strip().lower()
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already taken by another user
            existing_user = User.find_by_email(email)
            if existing_user and existing_user['id'] != user_id:
                return jsonify({'error': 'Email already taken'}), 409
            
            update_data['email'] = email
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update user
        success = User.update_profile(user_id, **update_data)
        
        if not success:
            return jsonify({'error': 'Failed to update profile'}), 500
        
        # Get updated user data
        updated_user = User.find_by_id(user_id)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': updated_user['id'],
                'username': updated_user['username'],
                'email': updated_user['email'],
                'first_name': updated_user['first_name'],
                'last_name': updated_user['last_name']
            }
        }), 200
        
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@user_bp.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    """Validate JWT token and return user info"""
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }), 200
        
    except Exception as e:
        print(f"Token validation error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
