# Business Guardian AI - Cloud Run Deployment Guide

**Google Cloud AI Partner Catalyst Hackathon**

This guide walks through deploying Business Guardian AI to Google Cloud Run for production demo.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options](#deployment-options)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend API Deployment](#backend-api-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Testing Deployment](#testing-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Accounts:
- [x] Google Cloud Platform account (project: `business-guardian-ai`)
- [x] Confluent Cloud account with running cluster
- [x] Google Gemini API key
- [x] GitHub repository (optional, for CI/CD)

### Required Tools:
```bash
# Verify installations:
gcloud --version          # Google Cloud SDK
docker --version          # Docker Engine
node --version            # Node.js 18+
python --version          # Python 3.11+
```

### Enable Google Cloud APIs:
```bash
gcloud config set project business-guardian-ai

# Enable required APIs
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Cloud Run       │         │  Cloud Run       │          │
│  │  (Frontend)      │◄────────┤  (Backend API)   │          │
│  │                  │         │                  │          │
│  │  React Dashboard │         │  FastAPI Server  │          │
│  │  Port: 8080      │         │  Port: 8080      │          │
│  └──────────────────┘         └──────────────────┘          │
│         │                              │                     │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│         ┌──────────────────────────────┐                    │
│         │  Confluent Cloud (External)  │                    │
│         │  - Kafka Cluster             │                    │
│         │  - 10 Topics                 │                    │
│         └──────────────────────────────┘                    │
│                        │                                     │
│                        ▼                                     │
│         ┌──────────────────────────────┐                    │
│         │  Google Cloud AI             │                    │
│         │  - Vertex AI (ML)            │                    │
│         │  - Gemini API (Alerts)       │                    │
│         └──────────────────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Options

### Option A: Quick Deploy (Recommended for Demo)
Deploy both frontend and backend to Cloud Run with automated builds.

**Pros:**
- Fast deployment (~5-10 minutes)
- Automatic HTTPS
- Auto-scaling
- Pay-per-use pricing

**Cons:**
- Limited to stateless applications
- Cold start latency (mitigated with min instances)

### Option B: Full Production
Deploy with Cloud SQL, Cloud Storage, and Load Balancer.

**Pros:**
- Enterprise-grade
- Better performance
- Persistent storage

**Cons:**
- More complex setup
- Higher cost
- Overkill for hackathon

**Use Option A for this hackathon.**

---

## 🎨 Frontend Deployment

### Step 1: Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 6;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if backend on same domain)
    location /api {
        proxy_pass https://business-guardian-api-xxxxx-uc.a.run.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Update Frontend Environment

Create `frontend/.env.production`:

```env
VITE_API_URL=https://business-guardian-api-xxxxx-uc.a.run.app
VITE_ENVIRONMENT=production
```

Update `frontend/vite.config.ts` to use environment variables:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
```

### Step 4: Deploy Frontend to Cloud Run

```bash
# Navigate to frontend directory
cd frontend

# Build and deploy in one command
gcloud run deploy business-guardian-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "VITE_API_URL=https://business-guardian-api-xxxxx-uc.a.run.app"

# Or build Docker image manually:
docker build -t gcr.io/business-guardian-ai/frontend:latest .
docker push gcr.io/business-guardian-ai/frontend:latest

gcloud run deploy business-guardian-frontend \
  --image gcr.io/business-guardian-ai/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1
```

### Step 5: Verify Frontend Deployment

```bash
# Get frontend URL
gcloud run services describe business-guardian-frontend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

# Example output:
# https://business-guardian-frontend-xxxxx-uc.a.run.app

# Test in browser
curl https://business-guardian-frontend-xxxxx-uc.a.run.app
```

---

## 🔧 Backend API Deployment

### Step 1: Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 guardian && \
    chown -R guardian:guardian /app

USER guardian

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start FastAPI server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Step 2: Create FastAPI Application

Create `backend/api/main.py`:

```python
"""
Business Guardian AI - FastAPI Backend
Serves ML predictions and fraud alerts
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import os
import json
import joblib
from confluent_kafka import Consumer, Producer
import google.generativeai as genai

app = FastAPI(
    title="Business Guardian AI API",
    description="Real-time fraud detection API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://business-guardian-frontend-xxxxx-uc.a.run.app",
        "http://localhost:5173",  # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model_path = os.getenv("MODEL_PATH", "/app/ml/models/fraud_detector.pkl")
if os.path.exists(model_path):
    ml_model = joblib.load(model_path)
else:
    ml_model = None
    print("[WARN] ML model not found, predictions disabled")

# Configure Gemini
gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    gemini_model = None
    print("[WARN] Gemini API key not found, AI alerts disabled")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Business Guardian AI",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return {
        "status": "healthy",
        "ml_model": "loaded" if ml_model else "unavailable",
        "gemini_ai": "enabled" if gemini_model else "unavailable"
    }


class FraudPredictionRequest(BaseModel):
    """Request model for fraud prediction"""
    qr_scan_location_risk: float
    user_risk_score: float
    quantity_change: int
    transaction_amount: float
    time_since_last_scan: float
    items_missing_count: int
    weight_anomaly: bool
    camera_anomaly: bool
    digital_mismatch: bool


@app.post("/api/predict")
async def predict_fraud(request: FraudPredictionRequest):
    """
    Predict fraud probability for a transaction

    Returns:
        fraud_probability: float (0-1)
        threat_score: int (0-100)
        recommended_action: str
    """
    if not ml_model:
        raise HTTPException(status_code=503, detail="ML model not available")

    # Prepare features
    features = [
        request.qr_scan_location_risk,
        request.user_risk_score,
        request.quantity_change,
        request.transaction_amount,
        request.time_since_last_scan,
        request.items_missing_count,
        1 if request.weight_anomaly else 0,
        1 if request.camera_anomaly else 0,
        1 if request.digital_mismatch else 0,
    ]

    # Make prediction
    fraud_prob = ml_model.predict_proba([features])[0][1]
    threat_score = int(fraud_prob * 100)

    # Determine action
    if threat_score >= 90:
        action = "BLOCK_EXIT_IMMEDIATELY"
    elif threat_score >= 70:
        action = "ALERT_SECURITY"
    elif threat_score >= 50:
        action = "FLAG_FOR_REVIEW"
    else:
        action = "MONITOR"

    return {
        "fraud_probability": round(fraud_prob, 4),
        "threat_score": threat_score,
        "recommended_action": action
    }


@app.get("/api/alerts")
async def get_recent_alerts():
    """
    Get recent fraud alerts from Confluent Cloud

    Returns:
        List of recent alerts
    """
    # In production, this would consume from Kafka
    # For demo, return mock data
    mock_alerts = [
        {
            "alert_id": "ALERT-001",
            "alert_type": "unauthorized_exit",
            "severity": "critical",
            "title": "Exit Blocked - Invalid QR Code",
            "product_name": "Dell XPS 15 Laptop",
            "location": "Exit Gate A",
            "threat_score": 98.5,
            "timestamp_detected": 1703001234567,
            "requires_action": True
        }
    ]

    return {"alerts": mock_alerts, "count": len(mock_alerts)}


@app.post("/api/generate-alert")
async def generate_ai_alert(alert_data: Dict):
    """
    Generate intelligent alert using Gemini AI

    Args:
        alert_data: Alert details

    Returns:
        AI-generated alert description and recommendations
    """
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not available")

    prompt = f"""
Generate a concise security alert for:

Alert Type: {alert_data.get('alert_type', 'unknown')}
Severity: {alert_data.get('severity', 'medium')}
Threat Score: {alert_data.get('threat_score', 0)}/100

Provide:
1. Brief description (2 sentences)
2. Recommended action (1 sentence)
"""

    try:
        response = gemini_model.generate_content(prompt)
        return {
            "ai_description": response.text,
            "model": "gemini-2.5-flash"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

### Step 3: Update Backend Requirements

Ensure `backend/requirements.txt` includes:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
confluent-kafka==2.3.0
google-generativeai==0.3.1
google-cloud-aiplatform==1.38.0
python-dotenv==1.0.0
joblib==1.3.2
numpy==1.26.2
pandas==2.1.3
scikit-learn==1.3.2
```

### Step 4: Deploy Backend to Cloud Run

```bash
# Navigate to backend directory
cd backend

# Create .env.yaml for Cloud Run secrets
cat > .env.yaml <<EOF
CONFLUENT_API_KEY: "YOUR_CONFLUENT_API_KEY_HERE"
CONFLUENT_API_SECRET: "YOUR_CONFLUENT_API_SECRET_HERE"
CONFLUENT_BOOTSTRAP_SERVER: "YOUR_CONFLUENT_BOOTSTRAP_SERVER_HERE"
GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE"
GOOGLE_CLOUD_PROJECT: "your-gcp-project-id"
QR_SECRET_KEY: "your-secret-key-min-32-chars"
MODEL_PATH: "/app/ml/models/fraud_detector.pkl"
EOF

# Deploy with secrets
gcloud run deploy business-guardian-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --timeout 60s \
  --env-vars-file .env.yaml

# Or build Docker image manually:
docker build -t gcr.io/business-guardian-ai/backend:latest .
docker push gcr.io/business-guardian-ai/backend:latest

gcloud run deploy business-guardian-api \
  --image gcr.io/business-guardian-ai/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --env-vars-file .env.yaml
```

### Step 5: Verify Backend Deployment

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe business-guardian-api \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')

echo "Backend URL: $BACKEND_URL"

# Test health endpoint
curl $BACKEND_URL/health

# Expected output:
# {"status":"healthy","ml_model":"loaded","gemini_ai":"enabled"}

# Test prediction endpoint
curl -X POST $BACKEND_URL/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "qr_scan_location_risk": 0.8,
    "user_risk_score": 0.9,
    "quantity_change": 30,
    "transaction_amount": 38999.70,
    "time_since_last_scan": 120,
    "items_missing_count": 30,
    "weight_anomaly": true,
    "camera_anomaly": true,
    "digital_mismatch": true
  }'

# Expected output:
# {"fraud_probability":1.0,"threat_score":100,"recommended_action":"BLOCK_EXIT_IMMEDIATELY"}
```

---

## 🔐 Environment Configuration

### Using Google Secret Manager (Recommended)

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "YOUR_CONFLUENT_API_KEY_HERE" | \
  gcloud secrets create confluent-api-key --data-file=-

echo -n "YOUR_CONFLUENT_API_SECRET_HERE" | \
  gcloud secrets create confluent-api-secret --data-file=-

echo -n "YOUR_GEMINI_API_KEY_HERE" | \
  gcloud secrets create gemini-api-key --data-file=-

# Deploy with secrets
gcloud run deploy business-guardian-api \
  --image gcr.io/business-guardian-ai/backend:latest \
  --update-secrets CONFLUENT_API_KEY=confluent-api-key:latest \
  --update-secrets CONFLUENT_API_SECRET=confluent-api-secret:latest \
  --update-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --region us-central1
```

---

## 🧪 Testing Deployment

### 1. Frontend Testing

```bash
# Get frontend URL
FRONTEND_URL=$(gcloud run services describe business-guardian-frontend \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')

# Open in browser
open $FRONTEND_URL

# Or test with curl
curl -I $FRONTEND_URL
# Should return: HTTP/2 200
```

### 2. Backend API Testing

```bash
# Test all endpoints
BACKEND_URL=$(gcloud run services describe business-guardian-api \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')

# Root endpoint
curl $BACKEND_URL/

# Health check
curl $BACKEND_URL/health

# Fraud prediction
curl -X POST $BACKEND_URL/api/predict \
  -H "Content-Type: application/json" \
  -d '{"qr_scan_location_risk": 0.8, "user_risk_score": 0.9, "quantity_change": 30, "transaction_amount": 38999.70, "time_since_last_scan": 120, "items_missing_count": 30, "weight_anomaly": true, "camera_anomaly": true, "digital_mismatch": true}'

# Recent alerts
curl $BACKEND_URL/api/alerts
```

### 3. End-to-End Integration Test

```bash
# Create test script
cat > test_deployment.sh <<'EOF'
#!/bin/bash

BACKEND_URL="https://business-guardian-api-xxxxx-uc.a.run.app"
FRONTEND_URL="https://business-guardian-frontend-xxxxx-uc.a.run.app"

echo "[*] Testing Business Guardian AI Deployment"
echo "=========================================="

echo "[1/4] Testing frontend availability..."
if curl -sf $FRONTEND_URL > /dev/null; then
    echo "    [OK] Frontend is live"
else
    echo "    [ERROR] Frontend unreachable"
    exit 1
fi

echo "[2/4] Testing backend health..."
HEALTH=$(curl -s $BACKEND_URL/health)
if echo $HEALTH | grep -q "healthy"; then
    echo "    [OK] Backend is healthy"
else
    echo "    [ERROR] Backend unhealthy"
    exit 1
fi

echo "[3/4] Testing ML prediction..."
PREDICTION=$(curl -s -X POST $BACKEND_URL/api/predict \
  -H "Content-Type: application/json" \
  -d '{"qr_scan_location_risk": 0.9, "user_risk_score": 0.9, "quantity_change": 30, "transaction_amount": 38999, "time_since_last_scan": 120, "items_missing_count": 30, "weight_anomaly": true, "camera_anomaly": true, "digital_mismatch": true}')

if echo $PREDICTION | grep -q "threat_score"; then
    echo "    [OK] ML predictions working"
    echo "    Prediction: $PREDICTION"
else
    echo "    [ERROR] ML prediction failed"
    exit 1
fi

echo "[4/4] Testing alert retrieval..."
ALERTS=$(curl -s $BACKEND_URL/api/alerts)
if echo $ALERTS | grep -q "alerts"; then
    echo "    [OK] Alert system working"
else
    echo "    [ERROR] Alerts unavailable"
    exit 1
fi

echo "=========================================="
echo "[SUCCESS] All tests passed!"
echo "Frontend: $FRONTEND_URL"
echo "Backend API: $BACKEND_URL"
EOF

chmod +x test_deployment.sh
./test_deployment.sh
```

---

## 🐛 Troubleshooting

### Issue 1: Cold Start Latency

**Problem:** First request takes 5-10 seconds

**Solution:**
```bash
# Set minimum instances to keep container warm
gcloud run services update business-guardian-api \
  --min-instances 1 \
  --region us-central1

# Or use Cloud Scheduler to ping every 5 minutes
gcloud scheduler jobs create http keep-alive-backend \
  --schedule "*/5 * * * *" \
  --uri "https://business-guardian-api-xxxxx-uc.a.run.app/health" \
  --http-method GET
```

### Issue 2: CORS Errors

**Problem:** Frontend can't access backend API

**Solution:**
Update `backend/api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://business-guardian-frontend-xxxxx-uc.a.run.app",
        "http://localhost:5173",
        "*"  # Allow all origins (development only!)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 3: Environment Variables Not Loading

**Problem:** Secrets/config not available in container

**Solution:**
```bash
# Verify env vars are set
gcloud run services describe business-guardian-api \
  --region us-central1 \
  --format yaml | grep -A 20 "env:"

# Update if missing
gcloud run services update business-guardian-api \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE" \
  --region us-central1
```

### Issue 4: Container Build Fails

**Problem:** Docker build errors

**Solution:**
```bash
# Build locally first to debug
cd backend
docker build -t test-backend .

# Check logs for specific error
docker run -p 8080:8080 test-backend

# Common fixes:
# - Add missing dependencies to requirements.txt
# - Fix path issues in Dockerfile
# - Ensure all files are in .dockerignore correctly
```

### Issue 5: 500 Internal Server Error

**Problem:** API returns 500 errors

**Solution:**
```bash
# Check Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=business-guardian-api" \
  --limit 50 \
  --format json

# Common causes:
# - Missing ML model file
# - Invalid Gemini API key
# - Kafka connection timeout
```

---

## 📊 Monitoring & Logs

### View Logs:
```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=business-guardian-api" \
  --limit 100 \
  --format "table(timestamp, textPayload)"

# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=business-guardian-frontend" \
  --limit 100 \
  --format "table(timestamp, textPayload)"
```

### Metrics:
```bash
# Get request count
gcloud monitoring time-series list \
  --filter 'metric.type="run.googleapis.com/request_count"' \
  --format json

# Get latency
gcloud monitoring time-series list \
  --filter 'metric.type="run.googleapis.com/request_latencies"' \
  --format json
```

---

## 💰 Cost Optimization

### Estimated Costs (Per Month):

**Cloud Run:**
- Frontend: ~$0-5 (low traffic, scales to zero)
- Backend: ~$5-15 (min instances = 1)

**Cloud Build:** ~$0-2 (first 120 builds free)

**Artifact Registry:** ~$0.10/GB stored

**Total: ~$5-20/month** for demo/hackathon usage

### Tips to Minimize Costs:
1. Set `--min-instances 0` after demo
2. Use `--max-instances 3` to prevent runaway scaling
3. Delete unused container images in Artifact Registry
4. Monitor usage in Cloud Console billing dashboard

---

## ✅ Deployment Checklist

### Pre-Deployment:
- [ ] Google Cloud project created (`business-guardian-ai`)
- [ ] Billing enabled
- [ ] APIs enabled (Cloud Run, Build, Artifact Registry)
- [ ] gcloud CLI installed and authenticated
- [ ] Docker installed
- [ ] All secrets/API keys ready

### Frontend Deployment:
- [ ] Dockerfile created
- [ ] nginx.conf configured
- [ ] Build successful locally
- [ ] Deployed to Cloud Run
- [ ] HTTPS URL accessible
- [ ] React app loads correctly

### Backend Deployment:
- [ ] Dockerfile created
- [ ] FastAPI endpoints working
- [ ] ML model included in container
- [ ] Environment variables configured
- [ ] Deployed to Cloud Run
- [ ] Health check passing
- [ ] API endpoints responding

### Post-Deployment:
- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] ML predictions working
- [ ] Gemini alerts generating
- [ ] Logs streaming correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

---

## 🚀 Quick Deploy Commands

### Deploy Everything:
```bash
#!/bin/bash
set -e

PROJECT_ID="business-guardian-ai"
REGION="us-central1"

echo "[*] Deploying Business Guardian AI to Cloud Run"

# Set project
gcloud config set project $PROJECT_ID

# Deploy backend
echo "[1/2] Deploying backend API..."
cd backend
gcloud run deploy business-guardian-api \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE,CONFLUENT_API_KEY=YOUR_CONFLUENT_API_KEY_HERE,CONFLUENT_API_SECRET=YOUR_CONFLUENT_API_SECRET_HERE,CONFLUENT_BOOTSTRAP_SERVER=YOUR_CONFLUENT_BOOTSTRAP_SERVER_HERE"

BACKEND_URL=$(gcloud run services describe business-guardian-api \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "    Backend URL: $BACKEND_URL"

# Deploy frontend
echo "[2/2] Deploying frontend..."
cd ../frontend
gcloud run deploy business-guardian-frontend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "VITE_API_URL=$BACKEND_URL"

FRONTEND_URL=$(gcloud run services describe business-guardian-frontend \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "    Frontend URL: $FRONTEND_URL"

echo ""
echo "[SUCCESS] Deployment complete!"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""
echo "Test with:"
echo "  curl $BACKEND_URL/health"
echo "  open $FRONTEND_URL"
```

---

**Deployment time: ~10-15 minutes**

**Now you're ready to demo Business Guardian AI live on Google Cloud! 🎉**
