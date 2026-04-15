from datetime import datetime
import json
from typing import Any, Dict, List, Optional

import numpy as np

from config.sqlite_database import db_config

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

    @staticmethod
    def _serialize_skills(skills: Optional[List[str]]) -> str:
        return json.dumps(skills or [])

    @staticmethod
    def _deserialize_skills(skills_raw: Any) -> List[str]:
        if not skills_raw:
            return []
        if isinstance(skills_raw, list):
            return [str(skill) for skill in skills_raw]
        if isinstance(skills_raw, str):
            try:
                parsed = json.loads(skills_raw)
                if isinstance(parsed, list):
                    return [str(skill) for skill in parsed]
            except (TypeError, json.JSONDecodeError):
                return [s.strip() for s in skills_raw.split(',') if s.strip()]
        return []

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
    def _row_to_candidate(cls, row: Any, include_embedding: bool = False) -> Dict[str, Any]:
        candidate = dict(row)
        candidate['skills'] = cls._deserialize_skills(candidate.get('skills'))
        if include_embedding:
            candidate['embedding'] = cls._deserialize_embedding(candidate.get('embedding'))
        else:
            candidate.pop('embedding', None)
        return candidate
    
    @classmethod
    def create(cls, name, email=None, phone=None, skills=None, experience_years=None,
               education=None, location=None, resume_text=None, file_path=None, embedding=None):
        """Create a new candidate"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        cursor = None
        try:
            cursor = conn.cursor()
            embedding_binary = cls._serialize_embedding(embedding)
            skills_json = cls._serialize_skills(skills)

            cursor.execute('''
                INSERT INTO candidates (name, email, phone, skills, experience_years,
                                      education, location, resume_text, file_path, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name, email, phone, skills_json, experience_years, education,
                  location, resume_text, file_path, embedding_binary))

            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years,
                       education, location, is_active, created_at
                FROM candidates
                WHERE id = ?
            ''', (cursor.lastrowid,))

            result = cursor.fetchone()
            conn.commit()
            return cls._row_to_candidate(result) if result else None
            
        except Exception as e:
            conn.rollback()
            print(f"Error creating candidate: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, candidate_id):
        """Find candidate by ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path, embedding,
                       is_active, created_at, updated_at
                FROM candidates WHERE id = ?
            ''', (candidate_id,))
            
            result = cursor.fetchone()
            if result:
                return cls._row_to_candidate(result, include_embedding=True)
            return None
            
        except Exception as e:
            print(f"Error finding candidate: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def find_by_email(cls, email):
        """Find candidate by email"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path,
                       is_active, created_at, updated_at
                FROM candidates WHERE email = ? AND is_active = 1
            ''', (email,))
            
            result = cursor.fetchone()
            return cls._row_to_candidate(result) if result else None
            
        except Exception as e:
            print(f"Error finding candidate by email: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def get_all_active(cls, limit=100, offset=0):
        """Get all active candidates"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, file_path, embedding,
                       created_at, updated_at
                FROM candidates 
                WHERE is_active = 1
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            results = cursor.fetchall()
            candidates = []
            for row in results:
                candidates.append(cls._row_to_candidate(row, include_embedding=True))
            return candidates
            
        except Exception as e:
            print(f"Error getting active candidates: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def get_candidates_with_embeddings(cls, limit=1000):
        """Get candidates that have embeddings for matching"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, resume_text, embedding
                FROM candidates 
                WHERE is_active = 1 AND embedding IS NOT NULL
                ORDER BY created_at DESC
                LIMIT ?
            ''', (limit,))
            
            results = cursor.fetchall()
            candidates = []
            for row in results:
                candidates.append(cls._row_to_candidate(row, include_embedding=True))
            return candidates
            
        except Exception as e:
            print(f"Error getting candidates with embeddings: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def update_embedding(cls, candidate_id, embedding):
        """Update candidate embedding"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        cursor = None
        try:
            cursor = conn.cursor()
            embedding_binary = cls._serialize_embedding(embedding)
            
            cursor.execute('''
                UPDATE candidates 
                SET embedding = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (embedding_binary, candidate_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating candidate embedding: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def search(cls, query, limit=20):
        """Search candidates by name, email, skills, or location"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        cursor = None
        try:
            cursor = conn.cursor()
            search_query = f"%{query.lower()}%"
            
            # SQLite: skills is stored as JSON string, use JSON_EXTRACT or LIKE on JSON
            cursor.execute('''
                SELECT id, name, email, phone, skills, experience_years, 
                       education, location, created_at, updated_at
                FROM candidates 
                WHERE is_active = 1
                AND (LOWER(COALESCE(name, '')) LIKE ?
                     OR LOWER(COALESCE(email, '')) LIKE ?
                     OR LOWER(COALESCE(location, '')) LIKE ?
                     OR LOWER(COALESCE(skills, '')) LIKE ?)
                ORDER BY created_at DESC
                LIMIT ?
            ''', (search_query, search_query, search_query, search_query, limit))
            
            results = cursor.fetchall()
            return [cls._row_to_candidate(row) for row in results]
            
        except Exception as e:
            print(f"Error searching candidates: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def delete(cls, candidate_id):
        """Delete candidate (soft delete by setting is_active to False)"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE candidates 
                SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (candidate_id,))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error deleting candidate: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            conn.close()
    
    @classmethod
    def get_statistics(cls):
        """Get candidate statistics"""
        conn = db_config.get_connection()
        if not conn:
            return {}
            
        cursor = None
        try:
            cursor = conn.cursor()
            
            # Total active candidates
            cursor.execute('SELECT COUNT(*) FROM candidates WHERE is_active = 1')
            total_candidates = cursor.fetchone()[0]
            
            # Candidates with embeddings
            cursor.execute('SELECT COUNT(*) FROM candidates WHERE is_active = 1 AND embedding IS NOT NULL')
            candidates_with_embeddings = cursor.fetchone()[0]
            
            # Average experience years
            cursor.execute('SELECT AVG(experience_years) FROM candidates WHERE is_active = 1 AND experience_years IS NOT NULL')
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
            if cursor:
                cursor.close()
            conn.close()
