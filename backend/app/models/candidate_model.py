from datetime import datetime
import pickle
from config.database import db_config

class Candidate:
    """Candidate model for storing and managing candidate resumes"""
    
    def __init__(self, name, email=None, phone=None, skills=None, experience_years=None, 
                 education=None, location=None, resume_text=None, file_path=None):
        self.name = name
        self.email = email
        self.phone = phone
        self.skills = skills or []
        self.experience_years = experience_years
        self.education = education
        self.location = location
        self.resume_text = resume_text
        self.file_path = file_path
        self.is_active = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    @classmethod
    def create(cls, name, email=None, phone=None, skills=None, experience_years=None,
               education=None, location=None, resume_text=None, file_path=None, embedding=None):
        """Create a new candidate"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            embedding_binary = pickle.dumps(embedding) if embedding is not None else None
            
            cursor.execute('''
                INSERT INTO candidates (name, email, phone, skills, experience_years, 
                                      education, location, resume_text, file_path, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, email, phone, skills, experience_years, 
                          education, location, is_active, created_at
            ''', (name, email, phone, skills, experience_years, education, 
                  location, resume_text, file_path, embedding_binary))
            
            result = cursor.fetchone()
            conn.commit()
            return dict(result) if result else None
            
        except Exception as e:
            conn.rollback()
            print(f"Error creating candidate: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, candidate_id):
        """Find candidate by ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path, embedding,
                       is_active, created_at, updated_at
                FROM candidates WHERE id = %s
            ''', (candidate_id,))
            
            result = cursor.fetchone()
            if result:
                candidate_data = dict(result)
                # Convert embedding from binary
                if candidate_data['embedding']:
                    candidate_data['embedding'] = pickle.loads(candidate_data['embedding'])
                return candidate_data
            return None
            
        except Exception as e:
            print(f"Error finding candidate: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_email(cls, email):
        """Find candidate by email"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path,
                       is_active, created_at, updated_at
                FROM candidates WHERE email = %s AND is_active = TRUE
            ''', (email,))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            print(f"Error finding candidate by email: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def get_all_active(cls, limit=100, offset=0):
        """Get all active candidates"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path, embedding,
                       created_at, updated_at
                FROM candidates 
                WHERE is_active = TRUE
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            ''', (limit, offset))
            
            results = cursor.fetchall()
            candidates = []
            for row in results:
                candidate_data = dict(row)
                # Convert embedding from binary
                if candidate_data['embedding']:
                    candidate_data['embedding'] = pickle.loads(candidate_data['embedding'])
                candidates.append(candidate_data)
            return candidates
            
        except Exception as e:
            print(f"Error getting active candidates: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def get_candidates_with_embeddings(cls, limit=1000):
        """Get candidates that have embeddings for matching"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, embedding
                FROM candidates 
                WHERE is_active = TRUE AND embedding IS NOT NULL
                ORDER BY created_at DESC
                LIMIT %s
            ''', (limit,))
            
            results = cursor.fetchall()
            candidates = []
            for row in results:
                candidate_data = dict(row)
                # Convert embedding from binary
                if candidate_data['embedding']:
                    candidate_data['embedding'] = pickle.loads(candidate_data['embedding'])
                candidates.append(candidate_data)
            return candidates
            
        except Exception as e:
            print(f"Error getting candidates with embeddings: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def update_embedding(cls, candidate_id, embedding):
        """Update candidate embedding"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            embedding_binary = pickle.dumps(embedding) if embedding is not None else None
            
            cursor.execute('''
                UPDATE candidates 
                SET embedding = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (embedding_binary, candidate_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating candidate embedding: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def search(cls, query, limit=20):
        """Search candidates by name, email, skills, or location"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            search_query = f"%{query.lower()}%"
            
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, created_at, updated_at
                FROM candidates 
                WHERE is_active = TRUE
                AND (LOWER(name) LIKE %s 
                     OR LOWER(email) LIKE %s 
                     OR LOWER(location) LIKE %s
                     OR EXISTS (SELECT 1 FROM unnest(skills) AS skill WHERE LOWER(skill) LIKE %s))
                ORDER BY created_at DESC
                LIMIT %s
            ''', (search_query, search_query, search_query, search_query, limit))
            
            results = cursor.fetchall()
            return [dict(row) for row in results]
            
        except Exception as e:
            print(f"Error searching candidates: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def delete(cls, candidate_id):
        """Delete candidate (soft delete by setting is_active to False)"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE candidates 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (candidate_id,))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error deleting candidate: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def get_statistics(cls):
        """Get candidate statistics"""
        conn = db_config.get_connection()
        if not conn:
            return {}
            
        try:
            cursor = conn.cursor()
            
            # Total active candidates
            cursor.execute('SELECT COUNT(*) FROM candidates WHERE is_active = TRUE')
            total_candidates = cursor.fetchone()[0]
            
            # Candidates with embeddings
            cursor.execute('SELECT COUNT(*) FROM candidates WHERE is_active = TRUE AND embedding IS NOT NULL')
            candidates_with_embeddings = cursor.fetchone()[0]
            
            # Average experience years
            cursor.execute('SELECT AVG(experience_years) FROM candidates WHERE is_active = TRUE AND experience_years IS NOT NULL')
            avg_experience = cursor.fetchone()[0]
            
            return {
                'total_candidates': total_candidates,
                'candidates_with_embeddings': candidates_with_embeddings,
                'average_experience_years': round(float(avg_experience), 1) if avg_experience else 0
            }
            
        except Exception as e:
            print(f"Error getting candidate statistics: {e}")
            return {}
        finally:
            cursor.close()
            conn.close()
