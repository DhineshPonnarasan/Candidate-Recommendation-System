import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class JWTConfig:
    """JWT Authentication Configuration"""
    
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-resumeit-2025')
    ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    ALGORITHM = 'HS256'
    
    @staticmethod
    def get_jwt_config():
        """Return JWT configuration dictionary"""
        return {
            'JWT_SECRET_KEY': JWTConfig.SECRET_KEY,
            'JWT_ACCESS_TOKEN_EXPIRES': JWTConfig.ACCESS_TOKEN_EXPIRES,
            'JWT_ALGORITHM': JWTConfig.ALGORITHM
        }
