"""
Password Handler
Handles password hashing and verification using bcrypt.
"""

from passlib.context import CryptContext

# Bcrypt context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password string

    Example:
        hashed = hash_password("user_password123")
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Previously hashed password from database

    Returns:
        True if password matches, False otherwise

    Example:
        is_valid = verify_password("user_input", stored_hash)
    """
    return pwd_context.verify(plain_password, hashed_password)


def needs_rehash(hashed_password: str) -> bool:
    """
    Check if a hashed password needs to be rehashed (e.g., due to updated security params).

    Args:
        hashed_password: Hashed password from database

    Returns:
        True if password should be rehashed
    """
    return pwd_context.needs_update(hashed_password)
