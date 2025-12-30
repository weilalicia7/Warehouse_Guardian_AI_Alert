"""
Subscription Pydantic Models
Data models for subscription and feature management.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class SubscriptionFeatures(BaseModel):
    """Model for subscription feature flags."""
    push_alerts: bool = False
    advanced_analytics: bool = False
    api_access: bool = False
    export_reports: bool = False
    team_members_limit: int = 1
    alerts_per_month: int = 100
    qr_scans_per_month: int = 100
    custom_alert_rules: bool = False
    priority_support: bool = False


class SubscriptionInDB(BaseModel):
    """Model for subscription stored in Firestore."""
    subscription_id: str
    company_id: str
    tier: Literal["free", "paid"]
    status: Literal["active", "canceled", "trial", "past_due"]
    current_period_start: datetime
    current_period_end: datetime
    trial_end: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    features: SubscriptionFeatures
    created_at: datetime
    updated_at: datetime
    canceled_at: Optional[datetime] = None
    cancel_at_period_end: bool = False

    class Config:
        from_attributes = True

    def to_dict(self) -> dict:
        """Convert model to dictionary for Firestore."""
        return {
            "subscription_id": self.subscription_id,
            "company_id": self.company_id,
            "tier": self.tier,
            "status": self.status,
            "current_period_start": self.current_period_start,
            "current_period_end": self.current_period_end,
            "trial_end": self.trial_end,
            "stripe_subscription_id": self.stripe_subscription_id,
            "stripe_customer_id": self.stripe_customer_id,
            "features": self.features.model_dump(),
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "canceled_at": self.canceled_at,
            "cancel_at_period_end": self.cancel_at_period_end
        }


class SubscriptionResponse(BaseModel):
    """Model for subscription API response."""
    subscription_id: str
    tier: Literal["free", "paid"]
    status: Literal["active", "canceled", "trial", "past_due"]
    current_period_end: datetime
    trial_end: Optional[datetime] = None
    features: SubscriptionFeatures
    cancel_at_period_end: bool = False

    class Config:
        from_attributes = True


class CompanyInDB(BaseModel):
    """Model for company/organization stored in Firestore."""
    company_id: str
    name: str
    owner_user_id: str
    member_user_ids: list[str] = []
    subscription_id: str
    warehouse_locations: list[str] = []
    notification_preferences: dict = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    def to_dict(self) -> dict:
        """Convert model to dictionary for Firestore."""
        return {
            "company_id": self.company_id,
            "name": self.name,
            "owner_user_id": self.owner_user_id,
            "member_user_ids": self.member_user_ids,
            "subscription_id": self.subscription_id,
            "warehouse_locations": self.warehouse_locations,
            "notification_preferences": self.notification_preferences,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


# Feature tier definitions (used by feature gate service)
FREE_TIER_FEATURES = SubscriptionFeatures(
    push_alerts=False,
    advanced_analytics=False,
    api_access=False,
    export_reports=False,
    team_members_limit=1,
    alerts_per_month=100,
    qr_scans_per_month=100,
    custom_alert_rules=False,
    priority_support=False
)

PAID_TIER_FEATURES = SubscriptionFeatures(
    push_alerts=True,
    advanced_analytics=True,
    api_access=True,
    export_reports=True,
    team_members_limit=999999,  # Unlimited
    alerts_per_month=999999,  # Unlimited
    qr_scans_per_month=999999,  # Unlimited
    custom_alert_rules=True,
    priority_support=True
)
