"""
FastAPI Dependencies
Dependency injection for authentication, database, and services.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth.jwt_handler import verify_access_token
from database.repositories.user_repository import UserRepository
from database.repositories.subscription_repository import SubscriptionRepository
from models.user import UserInDB

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        Current user model

    Raises:
        HTTPException: If token invalid or user not found (401)
    """
    try:
        # Extract token
        token = credentials.credentials

        # Verify JWT and extract claims
        payload = verify_access_token(token)
        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Fetch user from database
        user_repo = UserRepository()
        user = await user_repo.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """
    Get current user and verify account is active.

    Args:
        current_user: Current user from get_current_user

    Returns:
        Active user model

    Raises:
        HTTPException: If account canceled or inactive (403)
    """
    if current_user.subscription_status in ["canceled", "past_due"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account subscription is not active"
        )

    return current_user


def require_subscription_tier(required_tier: str):
    """
    Dependency factory to require specific subscription tier.

    Args:
        required_tier: Required tier ("paid")

    Returns:
        Dependency function

    Example:
        @router.get("/premium", dependencies=[Depends(require_subscription_tier("paid"))])
    """
    async def check_tier(user: UserInDB = Depends(get_current_user)):
        if required_tier == "paid" and user.subscription_tier != "paid":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This feature requires a paid subscription. Please upgrade your account."
            )
        return user

    return check_tier


async def get_user_subscription(
    user: UserInDB = Depends(get_current_user)
):
    """
    Get current user's subscription from database.

    Args:
        user: Current authenticated user

    Returns:
        Subscription model

    Raises:
        HTTPException: If subscription not found (404)
    """
    sub_repo = SubscriptionRepository()
    subscription = await sub_repo.get_by_company_id(user.company_id)

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    return subscription


# Optional: API key authentication for programmatic access
async def get_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Optional[str]:
    """
    Extract API key from X-API-Key header (for future API key auth).

    Args:
        x_api_key: API key from header

    Returns:
        API key or None
    """
    return x_api_key
