# 🚀 Solana AI Explorer Setup Guide

## Prerequisites Installation

### 1. Install Node.js
```bash
# Option A: Download from https://nodejs.org/ (Recommended)
# Option B: Using Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

### 2. Install PostgreSQL
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb solana_explorer
```

### 3. Install Redis
```bash
# Using Homebrew
brew install redis
brew services start redis
```

### 4. Get API Keys
- **OpenAI API Key**: Visit [platform.openai.com](https://platform.openai.com/api-keys)
- **Helius API Key** (Optional): Visit [helius.xyz](https://helius.xyz) for enhanced Solana data

## Project Setup

### 1. Install Dependencies
```bash
./install-dependencies.sh
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Set Up Database
```bash
# Run database setup
node scripts/setup.js
```

### 4. Start the Application
```bash
# Start the server
npm run dev
```

### 5. Open the Frontend
Open `client/index.html` in your web browser

## Environment Configuration

Edit your `.env` file with these values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_helius_api_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Database Configuration
DATABASE_URL=postgresql://your_username@localhost:5432/solana_explorer
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_random_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Test Query
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "show me recent blocks"}'
```

### 3. Frontend Test
Open `client/index.html` and try the example queries

## Troubleshooting

### Common Issues

1. **Node.js not found**: Install Node.js from nodejs.org
2. **Database connection failed**: Make sure PostgreSQL is running
3. **Redis connection failed**: Make sure Redis is running
4. **OpenAI API errors**: Check your API key and credits
5. **Port already in use**: Change PORT in .env file

### Getting Help

- Check the logs in the terminal
- Verify all services are running
- Ensure API keys are correct
- Check database and Redis connections

## Next Steps After Setup

1. **Test with real queries**: Try the example queries in the frontend
2. **Add your own queries**: Experiment with different natural language queries
3. **Monitor performance**: Check the health endpoint for system status
4. **Scale up**: Consider using managed services for production

## Production Deployment

For production deployment:
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Use managed Redis (AWS ElastiCache, Redis Cloud)
- Set up proper environment variables
- Use a reverse proxy (nginx)
- Set up monitoring and logging
