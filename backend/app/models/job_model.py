from datetime import datetime
import pickle
from config.database import db_config

class JobDescription:
    """Job description model for storing and managing job postings"""
    
    def __init__(self, user_id, title, company, description, requirements=None):
        self.user_id = user_id
        self.title = title
        self.company = company
        self.description = description
        self.requirements = requirements
        self.status = 'active'
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    @classmethod
    def create(cls, user_id, title, company, description, requirements=None, file_path=None, embedding=None):
        """Create a new job description"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            embedding_binary = pickle.dumps(embedding) if embedding is not None else None
            
            cursor.execute('''
                INSERT INTO job_descriptions (user_id, title, company, description, requirements, file_path, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, title, company, description, requirements, status, created_at
            ''', (user_id, title, company, description, requirements, file_path, embedding_binary))
            
            result = cursor.fetchone()
            conn.commit()
            return dict(result) if result else None
            
        except Exception as e:
            conn.rollback()
            print(f"Error creating job description: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, job_id):
        """Find job description by ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, user_id, title, company, description, requirements, 
                       file_path, embedding, status, created_at, updated_at
                FROM job_descriptions WHERE id = %s
            ''', (job_id,))
            
            result = cursor.fetchone()
            if result:
                job_data = dict(result)
                # Convert embedding from binary
                if job_data['embedding']:
                    job_data['embedding'] = pickle.loads(job_data['embedding'])
                return job_data
            return None
            
        except Exception as e:
            print(f"Error finding job description: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_user_id(cls, user_id, limit=20, offset=0):
        """Find job descriptions by user ID"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, title, company, description, requirements, 
                       file_path, status, created_at, updated_at
                FROM job_descriptions 
                WHERE user_id = %s 
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            ''', (user_id, limit, offset))
            
            results = cursor.fetchall()
            return [dict(row) for row in results]
            
        except Exception as e:
            print(f"Error finding user job descriptions: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def get_all_active(cls, limit=50, offset=0):
        """Get all active job descriptions"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, user_id, title, company, description, requirements,
                       file_path, embedding, created_at, updated_at
                FROM job_descriptions 
                WHERE status = 'active'
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            ''', (limit, offset))
            
            results = cursor.fetchall()
            jobs = []
            for row in results:
                job_data = dict(row)
                # Convert embedding from binary
                if job_data['embedding']:
                    job_data['embedding'] = pickle.loads(job_data['embedding'])
                jobs.append(job_data)
            return jobs
            
        except Exception as e:
            print(f"Error getting active job descriptions: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def update_embedding(cls, job_id, embedding):
        """Update job description embedding"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            embedding_binary = pickle.dumps(embedding) if embedding is not None else None
            
            cursor.execute('''
                UPDATE job_descriptions 
                SET embedding = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (embedding_binary, job_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating job embedding: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def delete(cls, job_id, user_id):
        """Delete job description (soft delete by changing status)"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE job_descriptions 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            ''', (job_id, user_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error deleting job description: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def search(cls, query, user_id=None, limit=20):
        """Search job descriptions by title or company"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            search_query = f"%{query.lower()}%"
            
            if user_id:
                cursor.execute('''
                    SELECT id, title, company, description, requirements,
                           status, created_at, updated_at
                    FROM job_descriptions 
                    WHERE user_id = %s AND status = 'active'
                    AND (LOWER(title) LIKE %s OR LOWER(company) LIKE %s)
                    ORDER BY created_at DESC
                    LIMIT %s
                ''', (user_id, search_query, search_query, limit))
            else:
                cursor.execute('''
                    SELECT id, user_id, title, company, description, requirements,
                           status, created_at, updated_at
                    FROM job_descriptions 
                    WHERE status = 'active'
                    AND (LOWER(title) LIKE %s OR LOWER(company) LIKE %s)
                    ORDER BY created_at DESC
                    LIMIT %s
                ''', (search_query, search_query, limit))
            
            results = cursor.fetchall()
            return [dict(row) for row in results]
            
        except Exception as e:
            print(f"Error searching job descriptions: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
