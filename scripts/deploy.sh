#!/bin/bash

# Business Guardian AI - Deployment Script
# Deploys to Google Cloud Run

set -e

echo "🚀 Business Guardian AI - Deployment Script"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"business-guardian-ai"}
REGION=${REGION:-"us-west1"}
BACKEND_SERVICE="business-guardian-backend"
FRONTEND_SERVICE="business-guardian-frontend"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI found${NC}"
echo ""

# Set project
echo "📋 Setting Google Cloud project..."
gcloud config set project $PROJECT_ID
echo ""

# Deploy backend
deploy_backend() {
    echo "🐍 Deploying Backend to Cloud Run..."

    cd backend

    gcloud run deploy $BACKEND_SERVICE \
        --source . \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --timeout 300 \
        --max-instances 10 \
        --set-env-vars "NODE_ENV=production" \
        --quiet

    # Get backend URL
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
        --region $REGION \
        --format 'value(status.url)')

    echo -e "${GREEN}✅ Backend deployed to: $BACKEND_URL${NC}"

    cd ..
    echo ""

    export BACKEND_URL
}

# Deploy frontend
deploy_frontend() {
    echo "⚛️  Deploying Frontend to Cloud Run..."

    cd frontend

    # Build with backend URL
    echo "REACT_APP_API_URL=$BACKEND_URL" > .env.production

    gcloud run deploy $FRONTEND_SERVICE \
        --source . \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --timeout 60 \
        --max-instances 10 \
        --quiet

    # Get frontend URL
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
        --region $REGION \
        --format 'value(status.url)')

    echo -e "${GREEN}✅ Frontend deployed to: $FRONTEND_URL${NC}"

    cd ..
    echo ""
}

# Build and push Docker images (alternative method)
deploy_docker() {
    echo "🐳 Building and pushing Docker images..."

    # Enable Container Registry API
    gcloud services enable containerregistry.googleapis.com

    # Backend
    echo "Building backend image..."
    docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest ./backend
    docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest

    # Frontend
    echo "Building frontend image..."
    docker build -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest ./frontend
    docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest

    echo -e "${GREEN}✅ Docker images pushed to GCR${NC}"
    echo ""
}

# Main deployment
main() {
    echo "Choose deployment method:"
    echo "1) Source-based deployment (recommended)"
    echo "2) Docker image deployment"
    read -p "Enter choice [1-2]: " choice

    case $choice in
        1)
            deploy_backend
            deploy_frontend
            ;;
        2)
            deploy_docker
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac

    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "Application URLs:"
    echo "Backend:  $BACKEND_URL"
    echo "Frontend: $FRONTEND_URL"
    echo ""
    echo "To view logs:"
    echo "gcloud run logs tail $BACKEND_SERVICE --region $REGION"
    echo "gcloud run logs tail $FRONTEND_SERVICE --region $REGION"
    echo ""
}

# Run main
main
