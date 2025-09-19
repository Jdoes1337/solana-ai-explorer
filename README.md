# Solana AI Explorer

A powerful blockchain explorer that allows users to ask complex questions about the Solana blockchain using natural language. Built with OpenAI GPT-4 for natural language processing and Solana Web3.js for blockchain data access.

## 🌟 Features

- **Natural Language Queries**: Ask complex questions like "search the addresses that interacted with xxxxx wallet in the past week"
- **Real-time Blockchain Data**: Access live Solana blockchain data through RPC endpoints
- **Intelligent Caching**: Redis-based caching for improved performance
- **Modern UI**: Beautiful, responsive web interface
- **Multiple Query Types**: Support for wallet interactions, token purchases, transaction history, and more

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Redis server
- OpenAI API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo>
   cd solana-ai-explorer
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**:
   ```bash
   # Create PostgreSQL database
   createdb solana_explorer
   
   # Run database setup
   node scripts/setup.js
   ```

4. **Start the services**:
   ```bash
   # Start Redis (if not running)
   redis-server
   
   # Start the application
   npm run dev
   ```

5. **Open the application**:
   - Backend API: http://localhost:3001
   - Frontend: Open `client/index.html` in your browser

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_helius_api_key  # Optional, for enhanced data

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/solana_explorer
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Solana RPC Providers

For better performance and reliability, consider using:

- **Helius** (Recommended): Enhanced Solana data with better APIs
- **QuickNode**: Reliable RPC endpoints
- **Alchemy**: Professional blockchain infrastructure

## 📝 Example Queries

The system supports various types of natural language queries:

### Wallet Interactions
```
"search the addresses that interacted with 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM in the past week"
"find all wallets that transacted with this address in the last 30 days"
```

### Token Analysis
```
"give me a list of tokens this wallet purchased in the past 40 days"
"what tokens does this wallet hold?"
"show me the token balances for this address"
```

### Transaction History
```
"show me the transaction history for this address"
"get the last 50 transactions for this wallet"
"find failed transactions for this address"
```

### General Queries
```
"what is the current block height?"
"show me recent blocks"
"get account information for this address"
```

## 🏗️ Architecture

### Backend Components

1. **Express.js Server**: RESTful API with rate limiting and security
2. **Solana Service**: Blockchain data access layer
3. **NLP Service**: OpenAI integration for query processing
4. **Database Layer**: PostgreSQL for data storage, Redis for caching
5. **Query Router**: Handles different types of blockchain queries

### Frontend Components

1. **HTML/CSS/JavaScript**: Modern, responsive interface
2. **Tailwind CSS**: Utility-first styling
3. **Font Awesome**: Icons and visual elements
4. **Real-time Updates**: Dynamic query processing and results display

### Data Flow

1. User enters natural language query
2. Frontend sends query to `/api/query` endpoint
3. NLP Service parses query using OpenAI GPT-4
4. Query Router maps intent to appropriate blockchain operations
5. Solana Service fetches data from blockchain
6. Results are cached and returned to user
7. Frontend displays formatted results

## 🔍 API Endpoints

### Query Processing
- `POST /api/query` - Process natural language queries

### Blockchain Data
- `GET /api/blockchain/account/:address` - Get account information
- `GET /api/blockchain/transactions/:address` - Get transaction history
- `GET /api/blockchain/tokens/:address` - Get token accounts
- `GET /api/blockchain/blocks` - Get recent blocks
- `GET /api/blockchain/interactions/:address` - Get wallet interactions
- `GET /api/blockchain/purchases/:address` - Get token purchases

### System
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed system information

## 🚀 Deployment

### Production Setup

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
3. **Redis**: Use managed Redis (AWS ElastiCache, Redis Cloud)
4. **Hosting**: Deploy to Vercel, Heroku, or AWS
5. **CDN**: Use CloudFlare for static assets

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure API key management
- CORS configuration
- Helmet.js for security headers
- Redis for session management

## 📊 Performance Optimization

- **Caching**: Redis caching for frequently accessed data
- **Database Indexing**: Optimized PostgreSQL indexes
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: Prevents API abuse
- **Compression**: Gzip compression for responses

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API endpoints
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "show me recent blocks"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Support for more blockchain networks
- [ ] Advanced analytics and visualizations
- [ ] User authentication and saved queries
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Export functionality for data
- [ ] Integration with DeFi protocols

---

Built with ❤️ using OpenAI GPT-4, Solana Web3.js, and modern web technologies.
