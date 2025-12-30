"""
User Pydantic Models
Data models for user management and authentication.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field
import uuid


class UserCreate(BaseModel):
    """Model for user registration request."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    display_name: str = Field(..., min_length=1, max_length=100)
    company_name: str = Field(..., min_length=1, max_length=200)


class UserLogin(BaseModel):
    """Model for user login request."""
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    """Model for Google OAuth request."""
    id_token: str = Field(..., description="Firebase ID token from Google sign-in")


class UserResponse(BaseModel):
    """Model for user response (excludes sensitive data)."""
    user_id: str
    email: str
    display_name: str
    company_name: str
    company_id: str
    subscription_tier: Literal["free", "paid"]
    subscription_status: Literal["active", "canceled", "trial", "past_due"]
    email_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    onboarding_completed: bool = False

    class Config:
        from_attributes = True


class UserInDB(BaseModel):
    """Model for user stored in Firestore."""
    user_id: str
    email: str
    display_name: str
    company_name: str
    company_id: str
    auth_provider: Literal["email", "google"]
    subscription_tier: Literal["free", "paid"]
    subscription_status: Literal["active", "canceled", "trial", "past_due"]
    email_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    onboarding_completed: bool = False
    metadata: Optional[dict] = {}

    class Config:
        from_attributes = True

    def to_dict(self) -> dict:
        """Convert model to dictionary for Firestore."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "display_name": self.display_name,
            "company_name": self.company_name,
            "company_id": self.company_id,
            "auth_provider": self.auth_provider,
            "subscription_tier": self.subscription_tier,
            "subscription_status": self.subscription_status,
            "email_verified": self.email_verified,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "onboarding_completed": self.onboarding_completed,
            "metadata": self.metadata or {}
        }

    def to_response(self) -> UserResponse:
        """Convert to UserResponse model."""
        return UserResponse(
            user_id=self.user_id,
            email=self.email,
            display_name=self.display_name,
            company_name=self.company_name,
            company_id=self.company_id,
            subscription_tier=self.subscription_tier,
            subscription_status=self.subscription_status,
            email_verified=self.email_verified,
            avatar_url=self.avatar_url,
            created_at=self.created_at,
            last_login=self.last_login,
            onboarding_completed=self.onboarding_completed
        )


class TokenResponse(BaseModel):
    """Model for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    """Model for updating user profile."""
    display_name: Optional[str] = None
    company_name: Optional[str] = None
    avatar_url: Optional[str] = None
    onboarding_completed: Optional[bool] = None
