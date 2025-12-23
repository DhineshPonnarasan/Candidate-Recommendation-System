import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: sentence_transformers not installed. Embedding features will be disabled.")
    print("Install with: pip install sentence-transformers")
    SentenceTransformer = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    cosine_similarity = None
    
from typing import List, Dict, Tuple, Optional
import pickle
import os
from config.app_config import AppConfig
from config.redis_config import redis_config

class EmbeddingService:
    """Service for generating and managing text embeddings"""
    
    def __init__(self):
        self.model_name = AppConfig.SENTENCE_TRANSFORMER_MODEL
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the sentence transformer model"""
        if not SENTENCE_TRANSFORMERS_AVAILABLE or SentenceTransformer is None:
            print("Sentence transformers not available - embedding features disabled")
            self.model = None
            return
            
        try:
            print(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print("Embedding model loaded successfully!")
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            # Fallback to a smaller model if the default fails
            try:
                fallback_model = 'all-MiniLM-L6-v2'
                print(f"Trying fallback model: {fallback_model}")
                self.model = SentenceTransformer(fallback_model)
                self.model_name = fallback_model
                print("Fallback model loaded successfully!")
            except Exception as fallback_error:
                print(f"Error loading fallback model: {fallback_error}")
                self.model = None
    
    def generate_embedding(self, text: str, use_cache: bool = True) -> Optional[np.ndarray]:
        """Generate embedding for given text"""
        if not self.model:
            print("Embedding model not available")
            return None
        
        if not text or not text.strip():
            print("Empty text provided for embedding")
            return None
        
        try:
            # Create cache key
            cache_key = f"embedding:{hash(text.strip())}"
            
            # Check cache first
            if use_cache:
                cached_embedding = redis_config.get_cached_embedding(cache_key)
                if cached_embedding is not None:
                    return cached_embedding
            
            # Generate embedding
            text = text.strip()
            embedding = self.model.encode(text, convert_to_numpy=True)
            
            # Cache the embedding
            if use_cache:
                redis_config.cache_embedding(cache_key, embedding)
            
            return embedding
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def generate_batch_embeddings(self, texts: List[str], use_cache: bool = True) -> List[Optional[np.ndarray]]:
        """Generate embeddings for multiple texts"""
        if not self.model:
            print("Embedding model not available")
            return [None] * len(texts)
        
        if not texts:
            return []
        
        try:
            embeddings = []
            texts_to_process = []
            cache_keys = []
            indices_to_process = []
            
            # Check cache for each text
            for i, text in enumerate(texts):
                if not text or not text.strip():
                    embeddings.append(None)
                    continue
                
                cache_key = f"embedding:{hash(text.strip())}"
                cache_keys.append(cache_key)
                
                if use_cache:
                    cached_embedding = redis_config.get_cached_embedding(cache_key)
                    if cached_embedding is not None:
                        embeddings.append(cached_embedding)
                        continue
                
                # Text not in cache, add to batch processing
                texts_to_process.append(text.strip())
                indices_to_process.append(i)
                embeddings.append(None)  # Placeholder
            
            # Process uncached texts in batch
            if texts_to_process:
                batch_embeddings = self.model.encode(texts_to_process, convert_to_numpy=True)
                
                for j, embedding in enumerate(batch_embeddings):
                    original_index = indices_to_process[j]
                    embeddings[original_index] = embedding
                    
                    # Cache the embedding
                    if use_cache and j < len(cache_keys):
                        redis_config.cache_embedding(cache_keys[j], embedding)
            
            return embeddings
            
        except Exception as e:
            print(f"Error generating batch embeddings: {e}")
            return [None] * len(texts)
    
    def calculate_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            if embedding1 is None or embedding2 is None:
                return 0.0
            
            # Ensure embeddings are 2D arrays for cosine_similarity
            embedding1 = embedding1.reshape(1, -1)
            embedding2 = embedding2.reshape(1, -1)
            
            similarity = cosine_similarity(embedding1, embedding2)[0][0]
            return float(similarity)
            
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0
    
    def calculate_batch_similarities(self, job_embedding: np.ndarray, 
                                   candidate_embeddings: List[np.ndarray]) -> List[float]:
        """Calculate similarities between job and multiple candidates"""
        try:
            if job_embedding is None:
                return [0.0] * len(candidate_embeddings)
            
            similarities = []
            job_embedding = job_embedding.reshape(1, -1)
            
            for candidate_embedding in candidate_embeddings:
                if candidate_embedding is None:
                    similarities.append(0.0)
                else:
                    candidate_embedding = candidate_embedding.reshape(1, -1)
                    similarity = cosine_similarity(job_embedding, candidate_embedding)[0][0]
                    similarities.append(float(similarity))
            
            return similarities
            
        except Exception as e:
            print(f"Error calculating batch similarities: {e}")
            return [0.0] * len(candidate_embeddings)
    
    def find_similar_candidates(self, job_embedding: np.ndarray, 
                              candidates_data: List[Dict],
                              threshold: float = None,
                              top_k: int = None) -> List[Dict]:
        """Find most similar candidates to a job description"""
        try:
            if not candidates_data:
                return []
            
            threshold = threshold or AppConfig.SIMILARITY_THRESHOLD
            top_k = top_k or AppConfig.TOP_CANDIDATES_LIMIT
            
            # Extract candidate embeddings
            candidate_embeddings = []
            valid_candidates = []
            
            for candidate in candidates_data:
                if candidate.get('embedding') is not None:
                    candidate_embeddings.append(candidate['embedding'])
                    valid_candidates.append(candidate)
            
            if not candidate_embeddings:
                return []
            
            # Calculate similarities
            similarities = self.calculate_batch_similarities(job_embedding, candidate_embeddings)
            
            # Combine candidates with their similarities
            candidates_with_scores = []
            for i, candidate in enumerate(valid_candidates):
                similarity_score = similarities[i]
                if similarity_score >= threshold:
                    candidate_copy = candidate.copy()
                    candidate_copy['similarity_score'] = similarity_score
                    candidates_with_scores.append(candidate_copy)
            
            # Sort by similarity score (descending) and return top_k
            candidates_with_scores.sort(key=lambda x: x['similarity_score'], reverse=True)
            return candidates_with_scores[:top_k]
            
        except Exception as e:
            print(f"Error finding similar candidates: {e}")
            return []
    
    def get_model_info(self) -> Dict[str, str]:
        """Get information about the loaded model"""
        return {
            'model_name': self.model_name,
            'is_loaded': self.model is not None,
            'max_sequence_length': getattr(self.model, 'max_seq_length', 'Unknown') if self.model else 'Unknown'
        }

# Global embedding service instance
embedding_service = EmbeddingService()
