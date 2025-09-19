const express = require('express');
const router = express.Router();
const solanaService = require('../services/solanaService');
const { redisClient } = require('../config/database');

// Get account information
router.get('/account/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Check cache
    const cacheKey = `account:${address}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const accountInfo = await solanaService.getAccountInfo(address);
    
    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(accountInfo));
    
    res.json({
      success: true,
      data: accountInfo,
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get account info',
      message: error.message
    });
  }
});

// Get transaction history
router.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50 } = req.query;
    
    // Check cache
    const cacheKey = `transactions:${address}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const transactions = await solanaService.getTransactionHistory(address, parseInt(limit));
    
    // Cache for 2 minutes (transactions change frequently)
    await redisClient.setEx(cacheKey, 120, JSON.stringify(transactions));
    
    res.json({
      success: true,
      data: transactions,
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get transaction history',
      message: error.message
    });
  }
});

// Get token accounts
router.get('/tokens/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Check cache
    const cacheKey = `tokens:${address}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const tokenAccounts = await solanaService.getTokenAccounts(address);
    
    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(tokenAccounts));
    
    res.json({
      success: true,
      data: tokenAccounts,
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get token accounts',
      message: error.message
    });
  }
});

// Get recent blocks
router.get('/blocks', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Check cache
    const cacheKey = `blocks:${limit}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const blocks = await solanaService.getRecentBlocks(parseInt(limit));
    
    // Cache for 30 seconds (blocks change frequently)
    await redisClient.setEx(cacheKey, 30, JSON.stringify(blocks));
    
    res.json({
      success: true,
      data: blocks,
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get recent blocks',
      message: error.message
    });
  }
});

// Get wallet interactions
router.get('/interactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { days = 7 } = req.query;
    
    // Check cache
    const cacheKey = `interactions:${address}:${days}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const interactions = await solanaService.getWalletInteractions(address, parseInt(days));
    
    // Cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(interactions));
    
    res.json({
      success: true,
      data: {
        wallet_address: address,
        timeframe_days: parseInt(days),
        interaction_count: interactions.length,
        interactions: interactions.slice(0, 100) // Limit to 100
      },
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get wallet interactions',
      message: error.message
    });
  }
});

// Get token purchases
router.get('/purchases/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { days = 40 } = req.query;
    
    // Check cache
    const cacheKey = `purchases:${address}:${days}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        cached: true
      });
    }

    const purchases = await solanaService.getTokenPurchases(address, parseInt(days));
    
    // Cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(purchases));
    
    res.json({
      success: true,
      data: {
        wallet_address: address,
        timeframe_days: parseInt(days),
        purchase_count: purchases.length,
        purchases: purchases.slice(0, 100) // Limit to 100
      },
      cached: false
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to get token purchases',
      message: error.message
    });
  }
});

module.exports = router;
