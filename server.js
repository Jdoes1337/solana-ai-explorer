const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize database connections (optional for basic functionality)
let dbInitialized = false;
try {
  const { initConnections } = require('./config/database');
  initConnections().then(() => {
    dbInitialized = true;
    console.log('✅ Database connections initialized');
  }).catch(err => {
    console.log('⚠️ Database connections failed, running without database:', err.message);
  });
} catch (error) {
  console.log('⚠️ Database module not available, running without database');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/query', require('./routes/query'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/health', require('./routes/health'));

// Serve static files
app.use(express.static('client'));

// Serve frontend at root
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'client' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Frontend available at: http://localhost:${PORT}/client/index.html`);
});

module.exports = app;
