const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../config/database');
const solanaService = require('../services/solanaService');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check database connection
    try {
      await pool.query('SELECT 1');
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check Redis connection
    try {
      await redisClient.ping();
      health.services.redis = 'connected';
    } catch (error) {
      health.services.redis = 'disconnected';
      health.status = 'degraded';
    }

    // Check Solana connection
    try {
      await solanaService.connection.getSlot();
      health.services.solana = 'connected';
    } catch (error) {
      health.services.solana = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
