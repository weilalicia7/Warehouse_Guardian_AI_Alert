#!/bin/bash

# Business Guardian AI - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Business Guardian AI - Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."

    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3.10+ is required but not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Python found:${NC} $(python3 --version)"
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 18+ is required but not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Node.js found:${NC} $(node --version)"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is required but not installed${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ npm found:${NC} $(npm --version)"
    fi

    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker found:${NC} $(docker --version)"
    else
        echo -e "${YELLOW}⚠️  Docker not found (optional)${NC}"
    fi

    echo ""
}

# Setup environment file
setup_env() {
    echo "🔧 Setting up environment variables..."

    if [ ! -f .env ]; then
        echo "Creating .env file from template..."
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your API keys${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
    fi

    echo ""
}

# Setup backend
setup_backend() {
    echo "🐍 Setting up Python backend..."

    cd backend

    # Create virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
        echo -e "${GREEN}✅ Virtual environment created${NC}"
    else
        echo -e "${YELLOW}⚠️  Virtual environment already exists${NC}"
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install dependencies
    echo "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies installed${NC}"

    cd ..
    echo ""
}

# Setup frontend
setup_frontend() {
    echo "⚛️  Setting up React frontend..."

    cd frontend

    # Install dependencies
    echo "Installing npm dependencies..."
    npm install
    echo -e "${GREEN}✅ npm dependencies installed${NC}"

    cd ..
    echo ""
}

# Create directories
create_directories() {
    echo "📁 Creating project directories..."

    mkdir -p backend/confluent/kafka_setup
    mkdir -p backend/confluent/flink_jobs
    mkdir -p backend/confluent/connectors
    mkdir -p backend/google_cloud/vertex_ai
    mkdir -p backend/google_cloud/gemini
    mkdir -p backend/google_cloud/cloud_functions
    mkdir -p backend/google_cloud/models
    mkdir -p backend/services/qr_verification
    mkdir -p backend/services/fraud_detection
    mkdir -p backend/services/alert_manager
    mkdir -p data/mock_generators
    mkdir -p data/sample_data
    mkdir -p data/schemas
    mkdir -p tests/unit
    mkdir -p tests/integration
    mkdir -p tests/e2e
    mkdir -p logs

    echo -e "${GREEN}✅ Directories created${NC}"
    echo ""
}

# Initialize Git (if not already)
init_git() {
    if [ ! -d ".git" ]; then
        echo "📦 Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit: Project setup complete"
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${YELLOW}⚠️  Git repository already initialized${NC}"
    fi
    echo ""
}

# Main execution
main() {
    check_requirements
    setup_env
    create_directories
    setup_backend
    setup_frontend
    init_git

    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your API keys"
    echo "2. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
    echo "3. Start frontend: cd frontend && npm start"
    echo "4. Visit http://localhost:3000"
    echo ""
    echo "Or use Docker:"
    echo "docker-compose up"
    echo ""
}

# Run main function
main
