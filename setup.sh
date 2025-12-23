#!/bin/bash
# Quick setup script for Learnflow deployment

set -e  # Exit on error

echo "================================================"
echo "   LEARNFLOW DEPLOYMENT QUICK SETUP"
echo "================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/5] Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Please install it first."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required. Please install it first."; exit 1; }
echo -e "${GREEN}✓ Node.js and npm found${NC}"
echo ""

# Install root dependencies
echo -e "${BLUE}[2/5] Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}[3/5] Installing frontend dependencies...${NC}"
cd frontend/learnflow
npm install
cd ../../
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Create environment files
echo -e "${BLUE}[4/5] Setting up environment variables...${NC}"

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ Please update .env.local with your actual credentials${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

if [ ! -f "frontend/learnflow/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.example..."
    cp frontend/learnflow/.env.example frontend/learnflow/.env.local
    echo -e "${YELLOW}⚠ Please update frontend/.env.local with your API URL${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.local already exists${NC}"
fi

echo ""

# Verify Vercel files
echo -e "${BLUE}[5/5] Verifying Vercel configuration...${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json found${NC}"
else
    echo -e "${YELLOW}⚠ vercel.json not found${NC}"
fi

if [ -f "frontend/learnflow/vercel.json" ]; then
    echo -e "${GREEN}✓ frontend/learnflow/vercel.json found${NC}"
else
    echo -e "${YELLOW}⚠ frontend/learnflow/vercel.json not found${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your database URL"
echo "2. Update frontend/.env.local with your API URL"
echo "3. Run 'vercel login' to authenticate"
echo "4. Run 'vercel --prod' to deploy"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
