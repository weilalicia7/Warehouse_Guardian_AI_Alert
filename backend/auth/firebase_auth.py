"""
Firebase Authentication Handler
Integrates with Firebase Admin SDK for user authentication and management.
"""

import os
import firebase_admin
from firebase_admin import credentials, auth
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
_firebase_initialized = False


def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    global _firebase_initialized

    if _firebase_initialized:
        return

    try:
        # Get credentials path from environment
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # Use default credentials for Cloud Run
            cred = credentials.ApplicationDefault()

        firebase_admin.initialize_app(cred, {
            'projectId': os.getenv('GOOGLE_CLOUD_PROJECT', 'business-guardian-ai')
        })

        _firebase_initialized = True
        print("[OK] Firebase Admin SDK initialized successfully")

    except Exception as e:
        print(f"[ERROR] Failed to initialize Firebase: {e}")
        raise


def create_firebase_user(email: str, password: str, display_name: Optional[str] = None) -> Dict:
    """
    Create a new user in Firebase Authentication.

    Args:
        email: User's email address
        password: User's password (min 6 characters)
        display_name: Optional display name

    Returns:
        Dictionary with user data including uid

    Raises:
        ValueError: If email already exists or password too weak
    """
    initialize_firebase()

    try:
        user_record = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            email_verified=False
        )

        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'display_name': user_record.display_name,
            'email_verified': user_record.email_verified,
            'created_at': user_record.user_metadata.creation_timestamp
        }

    except auth.EmailAlreadyExistsError:
        raise ValueError(f"Email {email} already exists")
    except auth.InvalidPasswordError:
        raise ValueError("Password must be at least 6 characters")
    except Exception as e:
        raise ValueError(f"Failed to create user: {str(e)}")


def verify_firebase_password(email: str, password: str) -> Dict:
    """
    Verify user credentials with Firebase (using custom token flow).
    Note: Firebase Admin SDK doesn't support direct password verification.
    This is a placeholder - actual implementation should use Firebase REST API.

    Args:
        email: User's email
        password: User's password

    Returns:
        User data if credentials valid

    Raises:
        ValueError: If credentials invalid
    """
    # NOTE: Firebase Admin SDK doesn't have a verify_password method
    # In production, use Firebase Authentication REST API:
    # POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword

    initialize_firebase()

    try:
        # Get user by email
        user_record = auth.get_user_by_email(email)

        # TODO: Implement actual password verification via Firebase REST API
        # For now, we'll return user data (assuming frontend verified password)

        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'display_name': user_record.display_name,
            'email_verified': user_record.email_verified
        }

    except auth.UserNotFoundError:
        raise ValueError("Invalid email or password")
    except Exception as e:
        raise ValueError(f"Authentication failed: {str(e)}")


def verify_firebase_token(id_token: str) -> Dict:
    """
    Verify a Firebase ID token (from Google OAuth or email/password sign-in).

    Args:
        id_token: Firebase ID token from client

    Returns:
        Decoded token with user claims

    Raises:
        ValueError: If token invalid or expired
    """
    initialize_firebase()

    try:
        decoded_token = auth.verify_id_token(id_token)

        return {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture'),
            'email_verified': decoded_token.get('email_verified', False)
        }

    except auth.InvalidIdTokenError:
        raise ValueError("Invalid ID token")
    except auth.ExpiredIdTokenError:
        raise ValueError("Token has expired")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")


def get_user_by_uid(uid: str) -> Dict:
    """
    Get user data from Firebase by UID.

    Args:
        uid: Firebase user ID

    Returns:
        User data dictionary

    Raises:
        ValueError: If user not found
    """
    initialize_firebase()

    try:
        user_record = auth.get_user(uid)

        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'display_name': user_record.display_name,
            'email_verified': user_record.email_verified,
            'created_at': user_record.user_metadata.creation_timestamp
        }

    except auth.UserNotFoundError:
        raise ValueError(f"User {uid} not found")


def delete_firebase_user(uid: str) -> bool:
    """
    Delete a user from Firebase Authentication.

    Args:
        uid: Firebase user ID

    Returns:
        True if successful

    Raises:
        ValueError: If user not found
    """
    initialize_firebase()

    try:
        auth.delete_user(uid)
        return True

    except auth.UserNotFoundError:
        raise ValueError(f"User {uid} not found")
    except Exception as e:
        raise ValueError(f"Failed to delete user: {str(e)}")


def update_user_email(uid: str, new_email: str) -> Dict:
    """
    Update user's email address in Firebase.

    Args:
        uid: Firebase user ID
        new_email: New email address

    Returns:
        Updated user data

    Raises:
        ValueError: If email already in use or user not found
    """
    initialize_firebase()

    try:
        user_record = auth.update_user(
            uid,
            email=new_email,
            email_verified=False  # Require re-verification
        )

        return {
            'uid': user_record.uid,
            'email': user_record.email,
            'email_verified': user_record.email_verified
        }

    except auth.EmailAlreadyExistsError:
        raise ValueError(f"Email {new_email} already in use")
    except auth.UserNotFoundError:
        raise ValueError(f"User {uid} not found")
