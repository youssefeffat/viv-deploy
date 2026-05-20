#!/bin/bash

# Deployment script for VPS
# This script helps deploy the application to a VPS server

set -e

echo "🚀 Viveris Carbone Deployment Script"
echo "======================================"

# Load environment variables safely
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "⚠️  Warning: .env file not found. Using environment variables or defaults."
fi

# Check required variables
if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ Error: DOCKER_USERNAME not set in environment or .env"
    echo "Please set DOCKER_USERNAME in .env or export it."
    exit 1
fi

echo ""
echo "📦 Configuration:"
echo "   Docker Username: $DOCKER_USERNAME"
echo "   Backend Tag: ${BACKEND_IMAGE_TAG:-latest}"
echo "   Frontend Tag: ${FRONTEND_IMAGE_TAG:-latest}"
echo ""

# Function to build and push images
build_and_push() {
    echo "🔨 Building Docker images..."
    
    # Build backend
    echo "   Building backend..."
    docker build -t $DOCKER_USERNAME/viveris-backend:${BACKEND_IMAGE_TAG:-latest} ./backend
    
    # Build frontend
    echo "   Building frontend..."
    docker build -t $DOCKER_USERNAME/viveris-frontend:${FRONTEND_IMAGE_TAG:-latest} ./frontend
    
    echo "✅ Images built successfully!"
    echo ""
    
    echo "📤 Pushing images to DockerHub..."
    
    # Push backend
    echo "   Pushing backend..."
    docker push $DOCKER_USERNAME/viveris-backend:${BACKEND_IMAGE_TAG:-latest}
    
    # Push frontend
    echo "   Pushing frontend..."
    docker push $DOCKER_USERNAME/viveris-frontend:${FRONTEND_IMAGE_TAG:-latest}
    
    echo "✅ Images pushed successfully!"
}

# Function to deploy locally
deploy_local() {
    echo "🏠 Deploying locally..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.prod.yml pull
    
    # Start containers
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Local deployment complete!"
    echo ""
    echo "📊 Container status:"
    docker-compose -f docker-compose.prod.yml ps
}

# Function to deploy to VPS
deploy_vps() {
    if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
        echo "❌ Error: VPS_HOST and VPS_USER must be set in .env"
        exit 1
    fi
    
    echo "🌐 Deploying to VPS ($VPS_HOST)..."
    
    # SSH into VPS and deploy
    ssh $VPS_USER@$VPS_HOST << EOF
        cd ~/viveris-carbone-backend || exit 1
        
        # Pull latest code
        git pull origin main
        
        # Pull Docker images
        docker pull $DOCKER_USERNAME/viveris-backend:${BACKEND_IMAGE_TAG:-latest}
        docker pull $DOCKER_USERNAME/viveris-frontend:${FRONTEND_IMAGE_TAG:-latest}
        
        # Stop old containers
        docker-compose -f docker-compose.prod.yml down
        
        # Start new containers
        docker-compose -f docker-compose.prod.yml up -d
        
        # Show status
        docker-compose -f docker-compose.prod.yml ps
EOF
    
    echo "✅ VPS deployment complete!"
}

# Main menu
echo "Select deployment option:"
echo "1) Build and push images to DockerHub"
echo "2) Deploy locally (production mode)"
echo "3) Deploy to VPS"
echo "4) Full deployment (build, push, and deploy to VPS)"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        build_and_push
        ;;
    2)
        deploy_local
        ;;
    3)
        deploy_vps
        ;;
    4)
        build_and_push
        echo ""
        deploy_vps
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
