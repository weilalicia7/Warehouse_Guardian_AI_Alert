"""
Firestore Client
Centralized Firestore database client with connection pooling.
"""

import os
from google.cloud import firestore
from google.oauth2 import service_account
from dotenv import load_dotenv

load_dotenv()

# Singleton Firestore client
_firestore_client = None


def get_firestore_client() -> firestore.Client:
    """
    Get or create Firestore client instance (singleton pattern).

    Returns:
        Firestore client instance
    """
    global _firestore_client

    if _firestore_client is not None:
        return _firestore_client

    try:
        # Get credentials path
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'business-guardian-ai')

        if cred_path and os.path.exists(cred_path):
            # Use service account credentials
            credentials = service_account.Credentials.from_service_account_file(cred_path)
            _firestore_client = firestore.Client(
                project=project_id,
                credentials=credentials
            )
        else:
            # Use default credentials (for Cloud Run)
            _firestore_client = firestore.Client(project=project_id)

        print(f"[OK] Firestore client initialized for project: {project_id}")
        return _firestore_client

    except Exception as e:
        print(f"[ERROR] Failed to initialize Firestore: {e}")
        raise


def close_firestore_client():
    """Close the Firestore client connection."""
    global _firestore_client
    if _firestore_client:
        _firestore_client.close()
        _firestore_client = None
        print("[OK] Firestore client closed")


# Collection names (constants for type safety)
class Collections:
    """Firestore collection names."""
    USERS = "users"
    COMPANIES = "companies"
    SUBSCRIPTIONS = "subscriptions"
    ALERT_HISTORY = "alert_history"
    SHARE_LINKS = "share_links"
    TEAM_INVITES = "team_invites"
    API_KEYS = "api_keys"
