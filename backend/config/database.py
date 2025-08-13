import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    """Database configuration and connection management"""
    
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'resumeit_db')
        self.user = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', 'password')
        
    def get_connection(self):
        """Create and return a database connection"""
        try:
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                cursor_factory=RealDictCursor
            )
            return conn
        except psycopg2.Error as e:
            print(f"Database connection error: {e}")
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
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    first_name VARCHAR(50),
                    last_name VARCHAR(50),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Job descriptions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS job_descriptions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    company VARCHAR(100),
                    description TEXT NOT NULL,
                    requirements TEXT,
                    file_path VARCHAR(500),
                    embedding BYTEA,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Candidates table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS candidates (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    phone VARCHAR(20),
                    skills TEXT[],
                    experience_years INTEGER,
                    education TEXT,
                    location VARCHAR(100),
                    resume_text TEXT,
                    file_path VARCHAR(500) NOT NULL,
                    embedding BYTEA,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Candidate matches table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS candidate_matches (
                    id SERIAL PRIMARY KEY,
                    job_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
                    candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
                    similarity_score FLOAT NOT NULL,
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
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    job_title VARCHAR(200) NOT NULL,
                    company VARCHAR(100) NOT NULL,
                    application_date DATE NOT NULL,
                    status VARCHAR(50) DEFAULT 'Applied',
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
            print("Database tables initialized successfully!")
            return True
            
        except psycopg2.Error as e:
            print(f"Error initializing database tables: {e}")
            conn.rollback()
            return False
        finally:
            cursor.close()
            conn.close()

# Global database instance
db_config = DatabaseConfig()
