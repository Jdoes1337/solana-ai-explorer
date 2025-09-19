#!/bin/bash

# Solana AI Explorer Deployment Script
# This script helps you deploy to various platforms

set -e

echo "🚀 Solana AI Explorer Deployment Helper"
echo "========================================"

# Check if required files exist
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the right directory?"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Please create it first."
    exit 1
fi

echo "✅ Project files found"

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    railway login
    railway init
    railway up
    echo "✅ Deployed to Railway!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "▲ Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    vercel --prod
    echo "✅ Deployed to Vercel!"
}

# Function to deploy to Render
deploy_render() {
    echo "🎨 Deploying to Render..."
    echo "Please follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Add PostgreSQL and Redis services"
    echo "5. Set environment variables from .env.production"
    echo "6. Deploy!"
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker first."
        exit 1
    fi
    
    docker build -t solana-ai-explorer .
    echo "✅ Docker image built!"
    echo "Run with: docker run -p 3001:3001 --env-file .env.production solana-ai-explorer"
}

# Main menu
echo ""
echo "Choose your deployment platform:"
echo "1) Railway (Recommended)"
echo "2) Vercel"
echo "3) Render"
echo "4) Docker"
echo "5) Show deployment guide"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_vercel
        ;;
    3)
        deploy_render
        ;;
    4)
        deploy_docker
        ;;
    5)
        echo "📖 Opening deployment guide..."
        if command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.md
        else
            cat DEPLOYMENT_GUIDE.md
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "Don't forget to:"
echo "1. Set up your environment variables"
echo "2. Configure your domain (if needed)"
echo "3. Test your deployment"
echo "4. Monitor your application"
