import os
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    print("Warning: redis not installed. Caching will be disabled.")
    redis = None
    REDIS_AVAILABLE = False
import json
import pickle
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class RedisConfig:
    """Redis cache configuration and operations"""
    
    def __init__(self):
        self.host = os.getenv('REDIS_HOST', 'localhost')
        self.port = int(os.getenv('REDIS_PORT', 6379))
        self.password = os.getenv('REDIS_PASSWORD', None)
        self.db = int(os.getenv('REDIS_DB', 0))
        self.decode_responses = True
        
    def get_client(self, decode_responses=True):
        """Create and return a Redis client"""
        if not REDIS_AVAILABLE or redis is None:
            return None
        try:
            client = redis.Redis(
                host=self.host,
                port=self.port,
                password=self.password if self.password else None,
                db=self.db,
                decode_responses=decode_responses,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            client.ping()
            return client
        except (redis.ConnectionError, Exception):
            print("Warning: Redis connection failed. Cache functionality will be disabled.")
            return None
    
    def cache_embedding(self, key, embedding, expiry=86400):
        """Cache embedding vector"""
        client = self.get_client(decode_responses=False)
        if client:
            try:
                client.setex(key, expiry, pickle.dumps(embedding))
                return True
            except Exception as e:
                print(f"Error caching embedding: {e}")
        return False
    
    def get_cached_embedding(self, key):
        """Get cached embedding vector"""
        client = self.get_client(decode_responses=False)
        if client:
            try:
                data = client.get(key)
                if data:
                    return pickle.loads(data)
            except Exception as e:
                print(f"Error retrieving cached embedding: {e}")
        return None
    
    def cache_job_analysis(self, job_id, analysis_data, expiry=3600):
        """Cache job analysis results"""
        client = self.get_client()
        if client:
            try:
                key = f"job_analysis:{job_id}"
                client.setex(key, expiry, json.dumps(analysis_data))
                return True
            except Exception as e:
                print(f"Error caching job analysis: {e}")
        return False
    
    def get_cached_job_analysis(self, job_id):
        """Get cached job analysis results"""
        client = self.get_client()
        if client:
            try:
                key = f"job_analysis:{job_id}"
                data = client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                print(f"Error retrieving cached job analysis: {e}")
        return None
    
    def cache_candidate_matches(self, job_id, matches, expiry=1800):
        """Cache candidate matching results"""
        client = self.get_client()
        if client:
            try:
                key = f"matches:{job_id}"
                client.setex(key, expiry, json.dumps(matches))
                return True
            except Exception as e:
                print(f"Error caching matches: {e}")
        return False
    
    def get_cached_candidate_matches(self, job_id):
        """Get cached candidate matching results"""
        client = self.get_client()
        if client:
            try:
                key = f"matches:{job_id}"
                data = client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                print(f"Error retrieving cached matches: {e}")
        return None
    
    def clear_cache(self, pattern=None):
        """Clear cache by pattern or all cache"""
        client = self.get_client()
        if client:
            try:
                if pattern:
                    keys = client.keys(pattern)
                    if keys:
                        client.delete(*keys)
                else:
                    client.flushdb()
                return True
            except Exception as e:
                print(f"Error clearing cache: {e}")
        return False

# Global Redis instance
redis_config = RedisConfig()
