"""
User Repository
Data access layer for user operations in Firestore.
"""

from datetime import datetime
from typing import Optional
import uuid

from google.cloud import firestore
from database.firestore_client import get_firestore_client, Collections
from models.user import UserInDB, UserCreate


class UserRepository:
    """Repository for user database operations."""

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection(Collections.USERS)

    async def create_user(
        self,
        user_id: str,
        email: str,
        display_name: str,
        company_name: str,
        company_id: str,
        auth_provider: str = "email",
        subscription_tier: str = "free"
    ) -> UserInDB:
        """
        Create a new user in Firestore.

        Args:
            user_id: Firebase UID
            email: User's email
            display_name: User's display name
            company_name: Company name
            company_id: Company ID (UUID)
            auth_provider: Authentication method (email/google)
            subscription_tier: Initial subscription tier (default: free)

        Returns:
            Created user model
        """
        user = UserInDB(
            user_id=user_id,
            email=email,
            display_name=display_name,
            company_name=company_name,
            company_id=company_id,
            auth_provider=auth_provider,
            subscription_tier=subscription_tier,
            subscription_status="active",
            email_verified=False,
            avatar_url=None,
            created_at=datetime.utcnow(),
            last_login=None,
            onboarding_completed=False,
            metadata={}
        )

        # Store in Firestore
        self.collection.document(user_id).set(user.to_dict())

        return user

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """
        Get user by Firebase UID.

        Args:
            user_id: Firebase UID

        Returns:
            User model or None if not found
        """
        doc = self.collection.document(user_id).get()

        if not doc.exists:
            return None

        data = doc.to_dict()
        return UserInDB(**data)

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """
        Get user by email address.

        Args:
            email: User's email

        Returns:
            User model or None if not found
        """
        query = self.collection.where("email", "==", email).limit(1).stream()

        for doc in query:
            data = doc.to_dict()
            return UserInDB(**data)

        return None

    async def update_user(self, user_id: str, update_data: dict) -> Optional[UserInDB]:
        """
        Update user fields.

        Args:
            user_id: Firebase UID
            update_data: Dictionary of fields to update

        Returns:
            Updated user model or None if not found
        """
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return None

        # Add updated_at timestamp
        update_data["updated_at"] = datetime.utcnow()

        # Update document
        doc_ref.update(update_data)

        # Return updated user
        updated_doc = doc_ref.get()
        return UserInDB(**updated_doc.to_dict())

    async def update_last_login(self, user_id: str) -> bool:
        """
        Update user's last login timestamp.

        Args:
            user_id: Firebase UID

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.update({"last_login": datetime.utcnow()})
        return True

    async def update_subscription_tier(
        self,
        user_id: str,
        tier: str,
        status: str = "active"
    ) -> bool:
        """
        Update user's subscription tier.

        Args:
            user_id: Firebase UID
            tier: New tier (free/paid)
            status: Subscription status

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.update({
            "subscription_tier": tier,
            "subscription_status": status,
            "updated_at": datetime.utcnow()
        })
        return True

    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user from Firestore.

        Args:
            user_id: Firebase UID

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.delete()
        return True

    async def get_users_by_company(self, company_id: str) -> list[UserInDB]:
        """
        Get all users belonging to a company.

        Args:
            company_id: Company ID

        Returns:
            List of user models
        """
        query = self.collection.where("company_id", "==", company_id).stream()

        users = []
        for doc in query:
            data = doc.to_dict()
            users.append(UserInDB(**data))

        return users

    async def count_team_members(self, company_id: str) -> int:
        """
        Count number of users in a company.

        Args:
            company_id: Company ID

        Returns:
            Number of users
        """
        query = self.collection.where("company_id", "==", company_id).stream()
        return len(list(query))
