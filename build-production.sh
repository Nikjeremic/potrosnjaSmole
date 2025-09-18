#!/bin/bash

echo "🚀 Building application for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build backend
echo "🔧 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Production build completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env.production with your actual values:"
echo "   - JWT_SECRET: Generate a secure secret key"
echo "   - MONGODB_URI: Your production MongoDB connection string"
echo "   - ALLOWED_ORIGINS: Your production domain"
echo ""
echo "2. Deploy to your hosting platform:"
echo "   - For Vercel: vercel --prod"
echo "   - For other platforms: Follow their deployment instructions"
echo ""
echo "3. Make sure your MongoDB database is accessible from production"
