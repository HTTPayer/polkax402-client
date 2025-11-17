#!/bin/bash
# Deployment script for Polkax402 Backend
# Run this on your local machine to deploy to EC2

set -e

# Configuration
EC2_HOST="your-ec2-instance.amazonaws.com"  # Change this to your EC2 public DNS or IP
EC2_USER="ubuntu"                           # Change if using different user (e.g., ec2-user for Amazon Linux)
APP_DIR="/opt/polkax402"

echo "🚀 Deploying Polkax402 Backend to EC2..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.production.example"
    exit 1
fi

# Build locally (optional - can also build on server)
echo "🏗️  Building locally..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf polkax402-backend.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='frontend' \
    --exclude='*.log' \
    --exclude='tests' \
    package.json \
    package-lock.json \
    tsconfig.json \
    Dockerfile \
    docker-compose.yml \
    .dockerignore \
    src \
    docs \
    deploy

# Copy to EC2
echo "📤 Uploading to EC2..."
scp polkax402-backend.tar.gz $EC2_USER@$EC2_HOST:~/ 
scp .env $EC2_USER@$EC2_HOST:~/.env.polkax402

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh $EC2_USER@$EC2_HOST << 'ENDSSH'
    # Stop existing containers
    cd /opt/polkax402 2>/dev/null && docker-compose down || true
    
    # Create/clean app directory
    sudo mkdir -p /opt/polkax402
    sudo chown -R $USER:$USER /opt/polkax402
    cd /opt/polkax402
    
    # Extract new version
    tar -xzf ~/polkax402-backend.tar.gz
    mv ~/.env.polkax402 .env
    rm ~/polkax402-backend.tar.gz
    
    # Build and start containers
    docker-compose build
    docker-compose up -d
    
    # Show logs
    echo ""
    echo "📋 Container logs:"
    docker-compose logs --tail=50
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🔍 Check status: docker-compose ps"
    echo "📋 View logs: docker-compose logs -f"
ENDSSH

# Cleanup local package
rm polkax402-backend.tar.gz

echo ""
echo "✅ Deployment successful!"
echo "🌐 Your API should be running at https://polkax402.com"
echo "💡 Test it: curl https://polkax402.com/health"
