const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const axios = require('axios');

class SolanaService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    this.heliusApiKey = process.env.HELIUS_API_KEY;
  }

  // Get account information
  async getAccountInfo(address) {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        throw new Error('Account not found');
      }

      return {
        address,
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
        data: accountInfo.data
      };
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  // Get transaction history for an address
  async getTransactionHistory(address, limit = 50) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            err: sig.err,
            transaction: tx
          };
        })
      );

      return transactions.filter(tx => tx.transaction !== null);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  // Get token accounts for an address
  async getTokenAccounts(address) {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      return tokenAccounts.value.map(account => ({
        address: account.pubkey.toString(),
        mint: account.account.data.parsed.info.mint,
        owner: account.account.data.parsed.info.owner,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      throw new Error(`Failed to get token accounts: ${error.message}`);
    }
  }

  // Get recent block information
  async getRecentBlocks(limit = 10) {
    try {
      const slot = await this.connection.getSlot();
      const blocks = [];
      
      for (let i = 0; i < limit; i++) {
        const block = await this.connection.getBlock(slot - i);
        if (block) {
          blocks.push({
            slot: slot - i,
            blockTime: block.blockTime,
            transactionCount: block.transactions.length,
            parentSlot: block.parentSlot
          });
        }
      }
      
      return blocks;
    } catch (error) {
      throw new Error(`Failed to get recent blocks: ${error.message}`);
    }
  }

  // Enhanced data using Helius API (if available)
  async getEnhancedTransactionData(signature) {
    if (!this.heliusApiKey) {
      throw new Error('Helius API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.helius.xyz/v0/transactions?api-key=${this.heliusApiKey}`,
        {
          params: { 'transaction-signatures': signature }
        }
      );
      
      return response.data[0];
    } catch (error) {
      throw new Error(`Failed to get enhanced transaction data: ${error.message}`);
    }
  }

  // Get wallet interactions (addresses that interacted with a specific wallet)
  async getWalletInteractions(address, timeframe = 7) {
    try {
      const transactions = await this.getTransactionHistory(address, 1000);
      const cutoffTime = Date.now() / 1000 - (timeframe * 24 * 60 * 60);
      
      const interactions = new Set();
      
      for (const tx of transactions) {
        if (tx.blockTime && tx.blockTime > cutoffTime && tx.transaction) {
          const message = tx.transaction.transaction.message;
          
          // Extract all addresses from the transaction
          message.accountKeys.forEach(key => {
            if (key.toString() !== address) {
              interactions.add(key.toString());
            }
          });
        }
      }
      
      return Array.from(interactions);
    } catch (error) {
      throw new Error(`Failed to get wallet interactions: ${error.message}`);
    }
  }

  // Get token purchases for a wallet
  async getTokenPurchases(address, timeframe = 40) {
    try {
      const transactions = await this.getTransactionHistory(address, 1000);
      const cutoffTime = Date.now() / 1000 - (timeframe * 24 * 60 * 60);
      
      const purchases = [];
      
      for (const tx of transactions) {
        if (tx.blockTime && tx.blockTime > cutoffTime && tx.transaction) {
          const message = tx.transaction.transaction.message;
          const instructions = message.instructions;
          
          // Look for token transfer instructions
          for (const instruction of instructions) {
            if (instruction.programId.toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
              // This is a token instruction - could be a purchase
              purchases.push({
                signature: tx.signature,
                blockTime: tx.blockTime,
                instruction: instruction
              });
            }
          }
        }
      }
      
      return purchases;
    } catch (error) {
      throw new Error(`Failed to get token purchases: ${error.message}`);
    }
  }
}

module.exports = new SolanaService();
