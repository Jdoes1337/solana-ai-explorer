const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Solana AI Explorer is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed system info
router.get('/detailed', async (req, res) => {
  try {
    const info = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {}
    };

    // Database info
    try {
      const dbResult = await pool.query('SELECT version()');
      info.services.database = {
        status: 'connected',
        version: dbResult.rows[0].version
      };
    } catch (error) {
      info.services.database = {
        status: 'disconnected',
        error: error.message
      };
    }

    // Redis info
    try {
      const redisInfo = await redisClient.info('server');
      info.services.redis = {
        status: 'connected',
        info: redisInfo
      };
    } catch (error) {
      info.services.redis = {
        status: 'disconnected',
        error: error.message
      };
    }

    // Solana info
    try {
      const slot = await solanaService.connection.getSlot();
      const blockHeight = await solanaService.connection.getBlockHeight();
      info.services.solana = {
        status: 'connected',
        currentSlot: slot,
        blockHeight: blockHeight
      };
    } catch (error) {
      info.services.solana = {
        status: 'disconnected',
        error: error.message
      };
    }

    res.json(info);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get system info',
      message: error.message
    });
  }
});

module.exports = router;
