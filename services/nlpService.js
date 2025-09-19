const OpenAI = require('openai');

class NLPService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
  }

  // Parse natural language query and extract intent and entities
  async parseQuery(query) {
    try {
      const systemPrompt = `You are an expert at parsing natural language queries about Solana blockchain data. 
      Extract the intent and entities from user queries and return a structured JSON response.

      Available intents:
      - get_wallet_interactions: Find addresses that interacted with a specific wallet
      - get_token_purchases: Get tokens purchased by a wallet
      - get_transaction_history: Get transaction history for a wallet
      - get_account_info: Get basic account information
      - get_token_balances: Get token balances for a wallet
      - get_recent_blocks: Get recent blockchain blocks

      Entities to extract:
      - wallet_address: Solana wallet addresses (base58 format)
      - timeframe: Time periods (days, weeks, months)
      - token_address: Specific token mint addresses
      - limit: Number of results to return

      Example queries:
      "search the addresses that interacted with 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM in the past week"
      "give me a list of tokens this wallet purchased in the past 40 days"
      "show me the transaction history for this address"
      "what tokens does this wallet hold?"

      Return JSON in this format:
      {
        "intent": "intent_name",
        "entities": {
          "wallet_address": "address_if_found",
          "timeframe": "timeframe_if_specified",
          "token_address": "token_address_if_specified",
          "limit": "limit_if_specified"
        },
        "confidence": 0.95,
        "original_query": "original user query"
      }`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return parsedResponse;
    } catch (error) {
      console.error('Error parsing query:', error);
      throw new Error(`Failed to parse query: ${error.message}`);
    }
  }

  // Generate human-readable response from data
  async generateResponse(query, data, intent) {
    try {
      const systemPrompt = `You are a helpful assistant that explains Solana blockchain data in a clear, 
      user-friendly way. Convert the raw blockchain data into a natural language response that answers 
      the user's question.

      Be concise but informative. Include relevant details like:
      - Transaction counts
      - Time ranges
      - Token amounts (with proper formatting)
      - Addresses (truncated for readability)
      - Key insights or patterns

      Format addresses as: first 4 chars...last 4 chars (e.g., 9WzD...WWM)
      Format large numbers with commas
      Be conversational but professional`;

      const userPrompt = `User query: "${query}"
      
Intent: ${intent}

Data: ${JSON.stringify(data, null, 2)}

Generate a helpful response:`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating response:', error);
      return `Here's the data for your query: ${JSON.stringify(data, null, 2)}`;
    }
  }

  // Validate Solana address format
  validateSolanaAddress(address) {
    try {
      const { PublicKey } = require('@solana/web3.js');
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  // Extract timeframes from natural language
  parseTimeframe(timeframeText) {
    const timeframe = timeframeText.toLowerCase();
    const daysMatch = timeframe.match(/(\d+)\s*days?/);
    const weeksMatch = timeframe.match(/(\d+)\s*weeks?/);
    const monthsMatch = timeframe.match(/(\d+)\s*months?/);
    
    if (daysMatch) return parseInt(daysMatch[1]);
    if (weeksMatch) return parseInt(weeksMatch[1]) * 7;
    if (monthsMatch) return parseInt(monthsMatch[1]) * 30;
    
    return 7; // Default to 7 days
  }
}

module.exports = new NLPService();
