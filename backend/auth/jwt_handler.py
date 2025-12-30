"""
JWT Token Handler
Handles creation and verification of JWT access tokens for API authentication.
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Optional

import jwt
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-change-in-production')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))


def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with user claims.

    Args:
        data: Dictionary containing user claims (user_id, company_id, tier)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string

    Example:
        token = create_access_token({
            "user_id": "user123",
            "company_id": "comp456",
            "tier": "free"
        })
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Dict[str, str]:
    """
    Verify and decode a JWT access token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload with user claims

    Raises:
        InvalidTokenError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Verify token type
        if payload.get("type") != "access":
            raise InvalidTokenError("Invalid token type")

        return payload

    except jwt.ExpiredSignatureError:
        raise InvalidTokenError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise InvalidTokenError(f"Invalid token: {str(e)}")


def decode_token_without_verification(token: str) -> Optional[Dict[str, str]]:
    """
    Decode a JWT token without verifying signature (for inspection only).
    WARNING: Do not use for authentication - only for debugging/logging.

    Args:
        token: JWT token string

    Returns:
        Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception:
        return None


def is_token_expired(token: str) -> bool:
    """
    Check if a token is expired without full verification.

    Args:
        token: JWT token string

    Returns:
        True if expired, False otherwise
    """
    payload = decode_token_without_verification(token)
    if not payload:
        return True

    exp = payload.get('exp')
    if not exp:
        return True

    return datetime.utcnow() > datetime.fromtimestamp(exp)
