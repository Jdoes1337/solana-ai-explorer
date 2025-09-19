#!/bin/bash

echo "🚀 Installing Solana AI Explorer dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

echo "🎉 Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up your .env file (copy from .env.example)"
echo "2. Install and start PostgreSQL"
echo "3. Install and start Redis"
echo "4. Get an OpenAI API key"
echo "5. Run: node scripts/setup.js"
echo "6. Run: npm run dev"
