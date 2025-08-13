import sqlite3
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

class SQLiteConfig:
    """SQLite database configuration and connection management"""
    
    def __init__(self):
        self.db_path = os.getenv('SQLITE_DB_PATH', '/workspaces/Candidate-Recommendation-System/backend/resumeit.db')
        self.ensure_db_directory()
    
    def ensure_db_directory(self):
        """Ensure the database directory exists"""
        db_dir = os.path.dirname(self.db_path)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
    
    def get_connection(self):
        """Create and return a database connection"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable dict-like access
            return conn
        except sqlite3.Error as e:
            print(f"SQLite connection error: {e}")
            return None
    
    def initialize_tables(self):
        """Create all necessary tables if they don't exist"""
        conn = self.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Job descriptions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS job_descriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    company TEXT,
                    description TEXT NOT NULL,
                    requirements TEXT,
                    file_path TEXT,
                    embedding BLOB,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Candidates table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS candidates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT,
                    phone TEXT,
                    skills TEXT,  -- JSON string for SQLite
                    experience_years INTEGER,
                    education TEXT,
                    location TEXT,
                    resume_text TEXT,
                    file_path TEXT NOT NULL,
                    embedding BLOB,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Candidate matches table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS candidate_matches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
                    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
                    similarity_score REAL NOT NULL,
                    match_summary TEXT,
                    ranking INTEGER,
                    is_reviewed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(job_id, candidate_id)
                );
            ''')
            
            # Application tracking table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    job_title TEXT NOT NULL,
                    company TEXT NOT NULL,
                    application_date DATE NOT NULL,
                    status TEXT DEFAULT 'Applied',
                    notes TEXT,
                    follow_up_date DATE,
                    interview_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON job_descriptions(user_id);')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_candidate_matches_job_id ON candidate_matches(job_id);')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_candidate_matches_similarity ON candidate_matches(similarity_score DESC);')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);')
            
            conn.commit()
            print("SQLite database tables initialized successfully!")
            return True
            
        except sqlite3.Error as e:
            print(f"Error initializing database tables: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()

# Global database instance
db_config = SQLiteConfig()
