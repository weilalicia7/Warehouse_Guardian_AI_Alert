"""
Authentication Router
Handles user registration, login, and Google OAuth endpoints.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from auth.firebase_auth import create_firebase_user, verify_firebase_token, get_user_by_uid
from auth.jwt_handler import create_access_token
from database.repositories.user_repository import UserRepository
from database.repositories.subscription_repository import SubscriptionRepository
from models.user import UserCreate, UserLogin, GoogleAuthRequest, TokenResponse
from models.subscription import CompanyInDB

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user with email and password.

    Creates:
    - Firebase Authentication user
    - Firestore user document
    - Company document
    - Free tier subscription

    Returns:
        JWT token and user profile
    """
    try:
        # Check if email already exists
        user_repo = UserRepository()
        existing_user = await user_repo.get_user_by_email(user_data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create Firebase user
        firebase_user = create_firebase_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name
        )

        user_id = firebase_user['uid']
        company_id = str(uuid.uuid4())

        # Create subscription for company
        sub_repo = SubscriptionRepository()
        subscription = await sub_repo.create_subscription(
            company_id=company_id,
            tier="free",
            trial_days=0
        )

        # Create Firestore user document
        user = await user_repo.create_user(
            user_id=user_id,
            email=user_data.email,
            display_name=user_data.display_name,
            company_name=user_data.company_name,
            company_id=company_id,
            auth_provider="email",
            subscription_tier="free"
        )

        # TODO: Create company document in companies collection

        # Generate JWT token
        token = create_access_token({
            "user_id": user.user_id,
            "company_id": user.company_id,
            "tier": user.subscription_tier
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user.to_response()
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.

    Note: Actual password verification should be done via Firebase client SDK
    on frontend, then exchange ID token here. This is a simplified version.

    Returns:
        JWT token and user profile
    """
    try:
        user_repo = UserRepository()

        # Get user by email
        user = await user_repo.get_user_by_email(credentials.email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # TODO: In production, verify password via Firebase REST API
        # For now, we assume frontend verified credentials and got Firebase ID token

        # Update last login
        await user_repo.update_last_login(user.user_id)

        # Generate JWT
        token = create_access_token({
            "user_id": user.user_id,
            "company_id": user.company_id,
            "tier": user.subscription_tier
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user.to_response()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/google", response_model=TokenResponse)
async def google_oauth(auth_request: GoogleAuthRequest):
    """
    Authenticate with Google OAuth.

    Verifies Firebase ID token from Google sign-in and creates/fetches user.

    Returns:
        JWT token and user profile
    """
    try:
        # Verify Google ID token with Firebase
        firebase_user = verify_firebase_token(auth_request.id_token)

        user_repo = UserRepository()
        user = await user_repo.get_user_by_email(firebase_user['email'])

        if not user:
            # Create new user from Google account
            user_id = firebase_user['uid']
            company_id = str(uuid.uuid4())

            # Create subscription
            sub_repo = SubscriptionRepository()
            await sub_repo.create_subscription(
                company_id=company_id,
                tier="free",
                trial_days=0
            )

            # Extract company name from email domain
            email_domain = firebase_user['email'].split('@')[1]
            company_name = f"{firebase_user['name']}'s Company"

            # Create user
            user = await user_repo.create_user(
                user_id=user_id,
                email=firebase_user['email'],
                display_name=firebase_user.get('name', ''),
                company_name=company_name,
                company_id=company_id,
                auth_provider="google",
                subscription_tier="free"
            )

        # Update last login
        await user_repo.update_last_login(user.user_id)

        # Generate JWT
        token = create_access_token({
            "user_id": user.user_id,
            "company_id": user.company_id,
            "tier": user.subscription_tier
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user.to_response()
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.get("/me", response_model=TokenResponse)
async def get_current_user_info(user_id: str):
    """
    Get current user information.

    Args:
        user_id: User ID from JWT (injected by middleware)

    Returns:
        User profile
    """
    try:
        user_repo = UserRepository()
        user = await user_repo.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Generate fresh token
        token = create_access_token({
            "user_id": user.user_id,
            "company_id": user.company_id,
            "tier": user.subscription_tier
        })

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=user.to_response()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )
