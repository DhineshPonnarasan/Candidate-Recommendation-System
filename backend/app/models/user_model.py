from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from config.sqlite_database import db_config
import sqlite3

class User:
    """User model for authentication and user management"""
    
    def __init__(self, username=None, email=None, password=None, first_name=None, last_name=None):
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.first_name = first_name
        self.last_name = last_name
        self.is_active = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    @classmethod
    def create(cls, username, email, password, first_name=None, last_name=None):
        """Create a new user"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            password_hash = generate_password_hash(password)
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, first_name, last_name)
                VALUES (?, ?, ?, ?, ?)
            ''', (username, email, password_hash, first_name, last_name))
            
            # Get the inserted row
            cursor.execute('''
                SELECT id, username, email, first_name, last_name, is_active, created_at
                FROM users WHERE id = ?
            ''', (cursor.lastrowid,))
            
            result = cursor.fetchone()
            conn.commit()
            return dict(result) if result else None
            
        except sqlite3.Error as e:
            conn.rollback()
            print(f"Error creating user: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_username(cls, username):
        """Find user by username"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, email, password_hash, first_name, last_name, 
                       is_active, created_at, updated_at
                FROM users WHERE username = ? AND is_active = 1
            ''', (username,))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            print(f"Error finding user: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, email, password_hash, first_name, last_name, 
                       is_active, created_at, updated_at
                FROM users WHERE email = ? AND is_active = 1
            ''', (email,))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, user_id):
        """Find user by ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, email, first_name, last_name, 
                       is_active, created_at, updated_at
                FROM users WHERE id = ? AND is_active = 1
            ''', (user_id,))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @staticmethod
    def verify_password(user_data, password):
        """Verify user password"""
        if user_data and 'password_hash' in user_data:
            return check_password_hash(user_data['password_hash'], password)
        return False
    
    @classmethod
    def update_profile(cls, user_id, **kwargs):
        """Update user profile"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            for field in ['first_name', 'last_name', 'email']:
                if field in kwargs:
                    update_fields.append(f"{field} = ?")
                    values.append(kwargs[field])
            
            if not update_fields:
                return True
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(user_id)
            
            query = f'''
                UPDATE users 
                SET {', '.join(update_fields)}
                WHERE id = ? AND is_active = 1
            '''
            
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating user profile: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
