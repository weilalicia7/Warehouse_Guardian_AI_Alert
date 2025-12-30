"""
Payment Router
Handles Stripe payment integration for subscription upgrades.
"""

import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from api.dependencies import get_current_user
from models.user import UserInDB
from database.repositories.subscription_repository import SubscriptionRepository
from database.firestore_client import get_firestore_client

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

router = APIRouter()

# ========================================
# Request/Response Models
# ========================================

class CreateCheckoutSessionRequest(BaseModel):
    """Request to create Stripe checkout session."""
    price_id: str  # Stripe Price ID for the subscription
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CreateCheckoutSessionResponse(BaseModel):
    """Response with checkout session URL."""
    session_id: str
    checkout_url: str


class CreatePortalSessionResponse(BaseModel):
    """Response with customer portal URL."""
    portal_url: str


# ========================================
# Stripe Checkout Session
# ========================================

@router.post("/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a Stripe checkout session for subscription upgrade.

    Returns a checkout URL where the user can complete payment.
    """
    try:
        # Get user's subscription
        db = get_firestore_client()
        subscription_repo = SubscriptionRepository(db)
        subscription = subscription_repo.get_by_user_id(current_user.user_id)

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found"
            )

        # Check if already paid
        if subscription.tier == 'paid':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has paid subscription"
            )

        # Create or retrieve Stripe customer
        stripe_customer_id = subscription.stripe_customer_id

        if not stripe_customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.display_name,
                metadata={
                    'user_id': current_user.user_id,
                    'company_id': current_user.company_id
                }
            )
            stripe_customer_id = customer.id

            # Save customer ID to subscription
            subscription_repo.update(
                current_user.user_id,
                {'stripe_customer_id': stripe_customer_id}
            )

        # Prepare URLs
        success_url = request.success_url or f"{FRONTEND_URL}/dashboard?payment=success"
        cancel_url = request.cancel_url or f"{FRONTEND_URL}/pricing?payment=cancelled"

        # Create Stripe Checkout session
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': request.price_id,  # Stripe Price ID (e.g., price_1ABC...)
                'quantity': 1
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': current_user.user_id,
                'company_id': current_user.company_id
            },
            # Allow promotion codes
            allow_promotion_codes=True,
            # Collect billing address
            billing_address_collection='required',
            # Customer update options
            customer_update={
                'address': 'auto',
                'name': 'auto'
            }
        )

        return CreateCheckoutSessionResponse(
            session_id=session.id,
            checkout_url=session.url
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )


# ========================================
# Stripe Customer Portal
# ========================================

@router.post("/create-portal-session", response_model=CreatePortalSessionResponse)
async def create_portal_session(
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a Stripe customer portal session.

    Allows users to manage their subscription, update payment method, view invoices.
    """
    try:
        # Get subscription
        db = get_firestore_client()
        subscription_repo = SubscriptionRepository(db)
        subscription = subscription_repo.get_by_user_id(current_user.user_id)

        if not subscription or not subscription.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No Stripe customer found. Please upgrade first."
            )

        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=f"{FRONTEND_URL}/settings"
        )

        return CreatePortalSessionResponse(
            portal_url=session.url
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portal session: {str(e)}"
        )


# ========================================
# Stripe Webhooks
# ========================================

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.

    Events handled:
    - checkout.session.completed: Subscription created
    - customer.subscription.updated: Subscription updated
    - customer.subscription.deleted: Subscription cancelled
    - invoice.payment_failed: Payment failed
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured"
        )

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle events
    event_type = event['type']
    event_data = event['data']['object']

    db = get_firestore_client()
    subscription_repo = SubscriptionRepository(db)

    if event_type == 'checkout.session.completed':
        # Payment successful, activate subscription
        session = event_data
        user_id = session['metadata'].get('user_id')

        if user_id:
            subscription_repo.update(user_id, {
                'tier': 'paid',
                'stripe_subscription_id': session.get('subscription'),
                'stripe_customer_id': session.get('customer'),
                'payment_status': 'active',
                'features': {
                    'real_time_alerts': True,
                    'qr_scans_limit': -1,  # Unlimited
                    'advanced_analytics': True,
                    'team_collaboration': True,
                    'api_access': True,
                    'priority_support': True
                }
            })
            print(f"[OK] Subscription activated for user {user_id}")

    elif event_type == 'customer.subscription.updated':
        # Subscription updated (e.g., plan change)
        subscription = event_data
        stripe_subscription_id = subscription['id']

        # Find user by subscription ID
        # Note: This requires a query - you may need to add this to repository
        print(f"[INFO] Subscription updated: {stripe_subscription_id}")

    elif event_type == 'customer.subscription.deleted':
        # Subscription cancelled
        subscription = event_data
        stripe_subscription_id = subscription['id']

        # Downgrade to free tier
        # Note: Find user by subscription ID
        print(f"[INFO] Subscription cancelled: {stripe_subscription_id}")

    elif event_type == 'invoice.payment_failed':
        # Payment failed
        invoice = event_data
        customer_id = invoice.get('customer')

        print(f"[WARN] Payment failed for customer: {customer_id}")
        # TODO: Send notification to user

    return JSONResponse(status_code=200, content={"received": True})


# ========================================
# Get Subscription Status
# ========================================

@router.get("/subscription-status")
async def get_subscription_status(
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get current user's subscription status.

    Returns subscription tier, features, and usage limits.
    """
    try:
        db = get_firestore_client()
        subscription_repo = SubscriptionRepository(db)
        subscription = subscription_repo.get_by_user_id(current_user.user_id)

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found"
            )

        return {
            "tier": subscription.tier,
            "features": subscription.features,
            "payment_status": subscription.payment_status,
            "stripe_customer_id": subscription.stripe_customer_id,
            "stripe_subscription_id": subscription.stripe_subscription_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscription status: {str(e)}"
        )
