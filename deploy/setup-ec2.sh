#!/bin/bash
# EC2 Setup Script for Polkax402 Backend
# Run this on your EC2 instance

set -e

echo "🚀 Setting up Polkax402 Backend on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed. You may need to log out and back in for group changes to take effect."
else
    echo "Docker already installed."
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose already installed."
fi

# Install Nginx
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
else
    echo "Nginx already installed."
fi

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo "Certbot already installed."
fi

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/polkax402
sudo chown -R $USER:$USER /opt/polkax402

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy your project to /opt/polkax402"
echo "2. Create .env file with your configuration"
echo "3. Run: cd /opt/polkax402 && docker-compose up -d"
echo "4. Configure nginx: sudo cp deploy/nginx.conf /etc/nginx/sites-available/polkax402.com"
echo "5. Enable site: sudo ln -s /etc/nginx/sites-available/polkax402.com /etc/nginx/sites-enabled/"
echo "6. Test nginx: sudo nginx -t"
echo "7. Reload nginx: sudo systemctl reload nginx"
echo "8. Get SSL certificate: sudo certbot --nginx -d polkax402.com -d www.polkax402.com"
