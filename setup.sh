#!/bin/bash

# JTML Quick Start Script
# This script sets up the project and runs initial tests

echo "🚀 JTML Quick Start"
echo "===================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✓ Build successful"
echo ""

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but continuing..."
else
    echo "✓ All tests passed"
fi

echo ""

# Run benchmarks
echo "📊 Running benchmarks..."
npm run benchmark

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Try the CLI: node dist/cli.js encode examples/sample-data.json"
echo "  2. Check out examples/basic-usage.ts"
echo "  3. Read the README.md for full documentation"
echo ""
echo "Happy coding! 🎉"
