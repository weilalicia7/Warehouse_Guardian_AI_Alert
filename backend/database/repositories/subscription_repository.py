"""
Subscription Repository
Data access layer for subscription operations in Firestore.
"""

from datetime import datetime, timedelta
from typing import Optional
import uuid

from database.firestore_client import get_firestore_client, Collections
from models.subscription import (
    SubscriptionInDB,
    SubscriptionFeatures,
    FREE_TIER_FEATURES,
    PAID_TIER_FEATURES
)


class SubscriptionRepository:
    """Repository for subscription database operations."""

    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection(Collections.SUBSCRIPTIONS)

    async def create_subscription(
        self,
        company_id: str,
        tier: str = "free",
        trial_days: int = 0
    ) -> SubscriptionInDB:
        """
        Create a new subscription for a company.

        Args:
            company_id: Company ID
            tier: Subscription tier (free/paid)
            trial_days: Number of trial days (0 for no trial)

        Returns:
            Created subscription model
        """
        subscription_id = str(uuid.uuid4())
        now = datetime.utcnow()

        # Set features based on tier
        features = FREE_TIER_FEATURES if tier == "free" else PAID_TIER_FEATURES

        # Calculate period dates
        current_period_start = now
        current_period_end = now + timedelta(days=30)  # 30-day billing cycle
        trial_end = now + timedelta(days=trial_days) if trial_days > 0 else None

        subscription = SubscriptionInDB(
            subscription_id=subscription_id,
            company_id=company_id,
            tier=tier,
            status="trial" if trial_days > 0 else "active",
            current_period_start=current_period_start,
            current_period_end=current_period_end,
            trial_end=trial_end,
            stripe_subscription_id=None,
            stripe_customer_id=None,
            features=features,
            created_at=now,
            updated_at=now,
            canceled_at=None,
            cancel_at_period_end=False
        )

        # Store in Firestore
        self.collection.document(subscription_id).set(subscription.to_dict())

        return subscription

    async def get_by_id(self, subscription_id: str) -> Optional[SubscriptionInDB]:
        """
        Get subscription by ID.

        Args:
            subscription_id: Subscription ID

        Returns:
            Subscription model or None if not found
        """
        doc = self.collection.document(subscription_id).get()

        if not doc.exists:
            return None

        data = doc.to_dict()
        # Convert features dict to model
        if "features" in data:
            data["features"] = SubscriptionFeatures(**data["features"])

        return SubscriptionInDB(**data)

    async def get_by_company_id(self, company_id: str) -> Optional[SubscriptionInDB]:
        """
        Get subscription by company ID.

        Args:
            company_id: Company ID

        Returns:
            Subscription model or None if not found
        """
        query = self.collection.where("company_id", "==", company_id).limit(1).stream()

        for doc in query:
            data = doc.to_dict()
            if "features" in data:
                data["features"] = SubscriptionFeatures(**data["features"])
            return SubscriptionInDB(**data)

        return None

    async def update_tier(
        self,
        subscription_id: str,
        new_tier: str
    ) -> Optional[SubscriptionInDB]:
        """
        Update subscription tier and features.

        Args:
            subscription_id: Subscription ID
            new_tier: New tier (free/paid)

        Returns:
            Updated subscription or None if not found
        """
        doc_ref = self.collection.document(subscription_id)
        doc = doc_ref.get()

        if not doc.exists:
            return None

        # Get new features for tier
        features = FREE_TIER_FEATURES if new_tier == "free" else PAID_TIER_FEATURES

        update_data = {
            "tier": new_tier,
            "features": features.model_dump(),
            "updated_at": datetime.utcnow()
        }

        doc_ref.update(update_data)

        # Return updated subscription
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data["features"] = SubscriptionFeatures(**data["features"])
        return SubscriptionInDB(**data)

    async def update_status(
        self,
        subscription_id: str,
        status: str
    ) -> bool:
        """
        Update subscription status.

        Args:
            subscription_id: Subscription ID
            status: New status (active/canceled/trial/past_due)

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(subscription_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }

        if status == "canceled":
            update_data["canceled_at"] = datetime.utcnow()

        doc_ref.update(update_data)
        return True

    async def cancel_subscription(
        self,
        subscription_id: str,
        cancel_at_period_end: bool = True
    ) -> bool:
        """
        Cancel a subscription.

        Args:
            subscription_id: Subscription ID
            cancel_at_period_end: If True, cancel at end of billing period

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(subscription_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        update_data = {
            "cancel_at_period_end": cancel_at_period_end,
            "updated_at": datetime.utcnow()
        }

        if not cancel_at_period_end:
            # Cancel immediately
            update_data["status"] = "canceled"
            update_data["canceled_at"] = datetime.utcnow()

        doc_ref.update(update_data)
        return True

    async def update_stripe_info(
        self,
        subscription_id: str,
        stripe_subscription_id: str,
        stripe_customer_id: str
    ) -> bool:
        """
        Update Stripe subscription IDs.

        Args:
            subscription_id: Our subscription ID
            stripe_subscription_id: Stripe subscription ID
            stripe_customer_id: Stripe customer ID

        Returns:
            True if successful
        """
        doc_ref = self.collection.document(subscription_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        doc_ref.update({
            "stripe_subscription_id": stripe_subscription_id,
            "stripe_customer_id": stripe_customer_id,
            "updated_at": datetime.utcnow()
        })
        return True
