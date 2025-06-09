#!/bin/bash

# Deployment script for Toxic NightBot

echo "🚀 Deploying Toxic NightBot..."

# Stop existing process
echo "Stopping existing bot..."
pm2 stop toxic-nightbot 2>/dev/null || true

# Update code (if using git)
if [ -d ".git" ]; then
    echo "Pulling latest code..."
    git pull origin main
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Create logs directory
mkdir -p logs

# Check environment configuration
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please run: npm run setup"
    exit 1
fi

# Start bot with PM2
echo "Starting bot with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup (run once)
pm2 startup

echo "✅ Deployment complete!"
echo "Monitor with: pm2 monit"
echo "View logs with: pm2 logs toxic-nightbot"
