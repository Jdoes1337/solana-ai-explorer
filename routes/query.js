const express = require('express');
const router = express.Router();
const nlpService = require('../services/nlpService');
const solanaService = require('../services/solanaService');
const { redisClient } = require('../config/database');

// Main query endpoint
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query is required and must be a string' 
      });
    }

    // Check cache first
    const cacheKey = `query:${Buffer.from(query).toString('base64')}`;
    const cachedResult = await redisClient.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: JSON.parse(cachedResult),
        cached: true
      });
    }

    // Parse the natural language query
    const parsedQuery = await nlpService.parseQuery(query);
    
    if (!parsedQuery.intent) {
      return res.status(400).json({
        error: 'Could not understand the query. Please try rephrasing.',
        parsedQuery
      });
    }

    // Execute the query based on intent
    let result;
    switch (parsedQuery.intent) {
      case 'get_wallet_interactions':
        result = await handleWalletInteractions(parsedQuery);
        break;
      case 'get_token_purchases':
        result = await handleTokenPurchases(parsedQuery);
        break;
      case 'get_transaction_history':
        result = await handleTransactionHistory(parsedQuery);
        break;
      case 'get_account_info':
        result = await handleAccountInfo(parsedQuery);
        break;
      case 'get_token_balances':
        result = await handleTokenBalances(parsedQuery);
        break;
      case 'get_recent_blocks':
        result = await handleRecentBlocks(parsedQuery);
        break;
      default:
        return res.status(400).json({
          error: 'Unsupported query type',
          intent: parsedQuery.intent
        });
    }

    // Generate human-readable response
    const response = await nlpService.generateResponse(
      query, 
      result, 
      parsedQuery.intent
    );

    const finalResult = {
      query: parsedQuery,
      data: result,
      response: response,
      timestamp: new Date().toISOString()
    };

    // Cache the result for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(finalResult));

    res.json({
      success: true,
      data: finalResult,
      cached: false
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message
    });
  }
});

// Helper functions for different query types
async function handleWalletInteractions(parsedQuery) {
  const { wallet_address, timeframe } = parsedQuery.entities;
  
  if (!wallet_address) {
    throw new Error('Wallet address is required for this query');
  }

  if (!nlpService.validateSolanaAddress(wallet_address)) {
    throw new Error('Invalid Solana address format');
  }

  const days = timeframe ? nlpService.parseTimeframe(timeframe) : 7;
  const interactions = await solanaService.getWalletInteractions(wallet_address, days);
  
  return {
    wallet_address,
    timeframe_days: days,
    interaction_count: interactions.length,
    interactions: interactions.slice(0, 50) // Limit to 50 for performance
  };
}

async function handleTokenPurchases(parsedQuery) {
  const { wallet_address, timeframe } = parsedQuery.entities;
  
  if (!wallet_address) {
    throw new Error('Wallet address is required for this query');
  }

  if (!nlpService.validateSolanaAddress(wallet_address)) {
    throw new Error('Invalid Solana address format');
  }

  const days = timeframe ? nlpService.parseTimeframe(timeframe) : 40;
  const purchases = await solanaService.getTokenPurchases(wallet_address, days);
  
  return {
    wallet_address,
    timeframe_days: days,
    purchase_count: purchases.length,
    purchases: purchases.slice(0, 50) // Limit to 50 for performance
  };
}

async function handleTransactionHistory(parsedQuery) {
  const { wallet_address, limit } = parsedQuery.entities;
  
  if (!wallet_address) {
    throw new Error('Wallet address is required for this query');
  }

  if (!nlpService.validateSolanaAddress(wallet_address)) {
    throw new Error('Invalid Solana address format');
  }

  const txLimit = limit ? parseInt(limit) : 50;
  const transactions = await solanaService.getTransactionHistory(wallet_address, txLimit);
  
  return {
    wallet_address,
    transaction_count: transactions.length,
    transactions: transactions.map(tx => ({
      signature: tx.signature,
      blockTime: tx.blockTime,
      slot: tx.slot,
      confirmationStatus: tx.confirmationStatus
    }))
  };
}

async function handleAccountInfo(parsedQuery) {
  const { wallet_address } = parsedQuery.entities;
  
  if (!wallet_address) {
    throw new Error('Wallet address is required for this query');
  }

  if (!nlpService.validateSolanaAddress(wallet_address)) {
    throw new Error('Invalid Solana address format');
  }

  const accountInfo = await solanaService.getAccountInfo(wallet_address);
  
  return {
    wallet_address,
    account_info: accountInfo
  };
}

async function handleTokenBalances(parsedQuery) {
  const { wallet_address } = parsedQuery.entities;
  
  if (!wallet_address) {
    throw new Error('Wallet address is required for this query');
  }

  if (!nlpService.validateSolanaAddress(wallet_address)) {
    throw new Error('Invalid Solana address format');
  }

  const tokenAccounts = await solanaService.getTokenAccounts(wallet_address);
  
  return {
    wallet_address,
    token_count: tokenAccounts.length,
    tokens: tokenAccounts
  };
}

async function handleRecentBlocks(parsedQuery) {
  const { limit } = parsedQuery.entities;
  const blockLimit = limit ? parseInt(limit) : 10;
  
  const blocks = await solanaService.getRecentBlocks(blockLimit);
  
  return {
    block_count: blocks.length,
    blocks: blocks
  };
}

module.exports = router;
