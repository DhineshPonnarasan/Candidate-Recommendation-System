from datetime import datetime
import json
from typing import Any, Dict, Optional

import numpy as np

from config.sqlite_database import db_config

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

    @staticmethod
    def _serialize_embedding(embedding: Optional[Any]) -> Optional[bytes]:
        if embedding is None:
            return None
        if hasattr(embedding, 'tolist'):
            payload = embedding.tolist()
        else:
            payload = embedding
        return json.dumps(payload).encode('utf-8')

    @staticmethod
    def _deserialize_embedding(embedding_blob: Optional[Any]) -> Optional[np.ndarray]:
        if embedding_blob is None:
            return None

        if isinstance(embedding_blob, memoryview):
            embedding_blob = embedding_blob.tobytes()

        if isinstance(embedding_blob, bytes):
            try:
                data = json.loads(embedding_blob.decode('utf-8'))
                if isinstance(data, list):
                    return np.array(data, dtype=np.float32)
            except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError):
                return None

        if isinstance(embedding_blob, str):
            try:
                data = json.loads(embedding_blob)
                if isinstance(data, list):
                    return np.array(data, dtype=np.float32)
            except (json.JSONDecodeError, TypeError, ValueError):
                return None

        return None

    @classmethod
    def _row_to_job(cls, row: Any, include_embedding: bool = False) -> Dict[str, Any]:
        job = dict(row)
        if include_embedding:
            job['embedding'] = cls._deserialize_embedding(job.get('embedding'))
        else:
            job.pop('embedding', None)
        return job
    
    @classmethod
    def create(cls, user_id, title, company, description, requirements=None, file_path=None, embedding=None):
        """Create a new job description"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        cursor = None
        try:
            cursor = conn.cursor()
            embedding_binary = cls._serialize_embedding(embedding)
            
            cursor.execute('''
                INSERT INTO job_descriptions (user_id, title, company, description, requirements, file_path, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, title, company, description, requirements, file_path, embedding_binary))

            cursor.execute('''
                SELECT id, title, company, description, requirements, status, created_at
                FROM job_descriptions
                WHERE id = ?
            ''', (cursor.lastrowid,))
            
            result = cursor.fetchone()
            conn.commit()
            return cls._row_to_job(result) if result else None
            
        except Exception as e:
            conn.rollback()
            print(f"Error creating job description: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, job_id):
        """Find job description by ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, user_id, title, company, description, requirements, 
                       file_path, embedding, status, created_at, updated_at
                FROM job_descriptions WHERE id = ?
            ''', (job_id,))
            
            result = cursor.fetchone()
            if result:
                return cls._row_to_job(result, include_embedding=True)
            return None
            
        except Exception as e:
            print(f"Error finding job description: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def find_by_user_id(cls, user_id, limit=20, offset=0):
        """Find job descriptions by user ID"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, title, company, description, requirements, 
                       file_path, status, created_at, updated_at
                FROM job_descriptions 
                WHERE user_id = ? 
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (user_id, limit, offset))
            
            results = cursor.fetchall()
            return [cls._row_to_job(row) for row in results]
            
        except Exception as e:
            print(f"Error finding user job descriptions: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def get_all_active(cls, limit=50, offset=0):
        """Get all active job descriptions"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, user_id, title, company, description, requirements,
                       file_path, embedding, created_at, updated_at
                FROM job_descriptions 
                WHERE status = 'active'
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            results = cursor.fetchall()
            jobs = []
            for row in results:
                jobs.append(cls._row_to_job(row, include_embedding=True))
            return jobs
            
        except Exception as e:
            print(f"Error getting active job descriptions: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def update_embedding(cls, job_id, embedding):
        """Update job description embedding"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        cursor = None
        try:
            cursor = conn.cursor()
            embedding_binary = cls._serialize_embedding(embedding)
            
            cursor.execute('''
                UPDATE job_descriptions 
                SET embedding = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (embedding_binary, job_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating job embedding: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def delete(cls, job_id, user_id):
        """Delete job description (soft delete by changing status)"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE job_descriptions 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            ''', (job_id, user_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error deleting job description: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def search(cls, query, user_id=None, limit=20):
        """Search job descriptions by title or company"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            search_query = f"%{query.lower()}%"
            
            if user_id:
                cursor.execute('''
                    SELECT id, title, company, description, requirements,
                           status, created_at, updated_at
                    FROM job_descriptions 
                    WHERE user_id = ? AND status = 'active'
                    AND (LOWER(COALESCE(title, '')) LIKE ? OR LOWER(COALESCE(company, '')) LIKE ?)
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (user_id, search_query, search_query, limit))
            else:
                cursor.execute('''
                    SELECT id, user_id, title, company, description, requirements,
                           status, created_at, updated_at
                    FROM job_descriptions 
                    WHERE status = 'active'
                    AND (LOWER(COALESCE(title, '')) LIKE ? OR LOWER(COALESCE(company, '')) LIKE ?)
                    ORDER BY created_at DESC
                    LIMIT ?
                ''', (search_query, search_query, limit))
            
            results = cursor.fetchall()
            return [cls._row_to_job(row) for row in results]
            
        except Exception as e:
            print(f"Error searching job descriptions: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
