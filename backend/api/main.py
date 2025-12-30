"""
Business Guardian AI - FastAPI Application
Main API entry point with authentication, CORS, and routers.
"""

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, status, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Import routers
from api.routers import auth, payment

# Import database clients
from database.firestore_client import get_firestore_client, close_firestore_client
from auth.firebase_auth import initialize_firebase

# Import WebSocket components
from websocket.connection_manager import manager
from websocket.alert_broadcaster import AlertBroadcaster, set_broadcaster
from auth.jwt_handler import verify_access_token

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("="*60)
    print("[START] Starting Business Guardian AI API")
    print("="*60)

    broadcaster_task = None

    try:
        # Initialize Firebase
        initialize_firebase()
        print("[OK] Firebase initialized")

        # Initialize Firestore
        get_firestore_client()
        print("[OK] Firestore client ready")

        # Initialize Kafka → WebSocket broadcaster (if Kafka configured)
        kafka_bootstrap = os.getenv('KAFKA_BOOTSTRAP_SERVERS')
        kafka_api_key = os.getenv('KAFKA_API_KEY')
        kafka_api_secret = os.getenv('KAFKA_API_SECRET')

        if kafka_bootstrap and kafka_api_key and kafka_api_secret:
            kafka_config = {
                'bootstrap.servers': kafka_bootstrap,
                'group.id': 'business-guardian-websocket',
                'auto.offset.reset': 'latest',
                'security.protocol': 'SASL_SSL',
                'sasl.mechanisms': 'PLAIN',
                'sasl.username': kafka_api_key,
                'sasl.password': kafka_api_secret,
            }

            broadcaster = AlertBroadcaster(kafka_config, topic='fraud-alerts')
            set_broadcaster(broadcaster)

            # Start broadcaster as background task
            broadcaster_task = asyncio.create_task(broadcaster.consume_and_broadcast())
            print("[OK] Kafka -> WebSocket broadcaster started")
        else:
            print("[WARN] Kafka not configured - WebSocket will work without real-time alerts")

        print("="*60)
        print("[OK] API ready to accept requests")
        print("="*60)

    except Exception as e:
        print(f"[ERROR] Startup failed: {e}")
        raise

    yield

    # Shutdown
    print("\n" + "="*60)
    print("[STOP] Shutting down Business Guardian AI API")

    # Stop Kafka broadcaster
    if broadcaster_task:
        from websocket.alert_broadcaster import get_broadcaster
        broadcaster = get_broadcaster()
        if broadcaster:
            broadcaster.stop_consumer()
            broadcaster_task.cancel()
            try:
                await broadcaster_task
            except asyncio.CancelledError:
                pass
        print("[OK] Kafka broadcaster stopped")

    close_firestore_client()
    print("[OK] Cleanup complete")
    print("="*60)


# Create FastAPI application
app = FastAPI(
    title="Business Guardian AI API",
    description="Real-time warehouse security and fraud detection platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# ========================================
# CORS Configuration
# ========================================

# Get allowed origins from environment
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
allowed_origins = [
    frontend_url,
    "http://localhost:3000",  # Local development
    "http://localhost:8000",  # Backend local
    "https://business-guardian-ai.vercel.app",  # Vercel deployment
    "https://businessguardian.ai"  # Production domain (when deployed)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)


# ========================================
# Include Routers
# ========================================

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    payment.router,
    prefix="/api/payment",
    tags=["Payment"]
)

# TODO: Add more routers as they're created
# app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
# app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


# ========================================
# WebSocket Endpoint
# ========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """
    WebSocket endpoint for real-time fraud alerts.

    Query parameters:
        token: JWT authentication token

    Message format:
        {
            "type": "fraud_alert",
            "timestamp": "2025-12-29T12:00:00Z",
            "payload": { ... alert data ... }
        }
    """
    # Authenticate WebSocket connection
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return

    try:
        # Verify JWT and extract company_id
        payload = verify_access_token(token)
        company_id = payload.get('company_id')

        if not company_id:
            await websocket.close(code=1008, reason="Invalid token: missing company_id")
            return

        # Accept connection and add to manager
        await manager.connect(websocket, company_id)

        # Send connection success message
        await websocket.send_json({
            "type": "connection_established",
            "timestamp": "2025-12-29T00:00:00Z",
            "company_id": company_id
        })

        # Keep connection alive (wait for disconnect)
        try:
            while True:
                # Receive messages from client (ping/pong for keep-alive)
                data = await websocket.receive_text()

                # Echo back for heartbeat
                if data == "ping":
                    await websocket.send_json({"type": "pong"})

        except WebSocketDisconnect:
            manager.disconnect(websocket, company_id)

    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        await websocket.close(code=1011, reason=f"Server error: {str(e)}")


# ========================================
# Health Check & Root Endpoints
# ========================================

@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    """Root endpoint."""
    return {
        "service": "Business Guardian AI API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns system status and component health.
    """
    return {
        "status": "healthy",
        "timestamp": "2025-12-29T00:00:00Z",
        "components": {
            "api": "online",
            "firebase": "connected",
            "firestore": "connected",
            # TODO: Add Kafka status check
            # "kafka": "connected",
        }
    }


# ========================================
# Exception Handlers
# ========================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 Not Found errors."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "detail": "Endpoint not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 Internal Server errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )


# ========================================
# Development Mode Helpers
# ========================================

if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*60)
    print("[DEV MODE] Running FastAPI with Uvicorn")
    print("="*60 + "\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Hot reload in development
        log_level="info"
    )
