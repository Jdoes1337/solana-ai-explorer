-- Solana AI Explorer Database Schema
-- PostgreSQL database schema for storing blockchain data

-- Create database (run this separately)
-- CREATE DATABASE solana_explorer;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(44) UNIQUE NOT NULL,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_count INTEGER DEFAULT 0,
    is_program BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature VARCHAR(88) UNIQUE NOT NULL,
    slot BIGINT NOT NULL,
    block_time TIMESTAMP,
    fee BIGINT,
    success BOOLEAN,
    error_message TEXT,
    account_keys TEXT[], -- Array of account addresses
    instructions JSONB, -- Store instruction data as JSON
    logs TEXT[], -- Array of log messages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token accounts table
CREATE TABLE IF NOT EXISTS token_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(44) UNIQUE NOT NULL,
    owner VARCHAR(44) NOT NULL,
    mint VARCHAR(44) NOT NULL,
    amount BIGINT DEFAULT 0,
    decimals INTEGER DEFAULT 0,
    ui_amount DECIMAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token metadata table
CREATE TABLE IF NOT EXISTS token_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mint VARCHAR(44) UNIQUE NOT NULL,
    name VARCHAR(255),
    symbol VARCHAR(20),
    decimals INTEGER DEFAULT 9,
    logo_uri TEXT,
    description TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet interactions table (for caching interaction data)
CREATE TABLE IF NOT EXISTS wallet_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) NOT NULL,
    interacted_with VARCHAR(44) NOT NULL,
    interaction_count INTEGER DEFAULT 1,
    first_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_address, interacted_with)
);

-- Query cache table
CREATE TABLE IF NOT EXISTS query_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash VARCHAR(64) UNIQUE NOT NULL,
    query_text TEXT NOT NULL,
    result_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_first_seen ON wallets(first_seen);
CREATE INDEX IF NOT EXISTS idx_wallets_last_updated ON wallets(last_updated);

CREATE INDEX IF NOT EXISTS idx_transactions_signature ON transactions(signature);
CREATE INDEX IF NOT EXISTS idx_transactions_slot ON transactions(slot);
CREATE INDEX IF NOT EXISTS idx_transactions_block_time ON transactions(block_time);
CREATE INDEX IF NOT EXISTS idx_transactions_account_keys ON transactions USING GIN(account_keys);

CREATE INDEX IF NOT EXISTS idx_token_accounts_owner ON token_accounts(owner);
CREATE INDEX IF NOT EXISTS idx_token_accounts_mint ON token_accounts(mint);
CREATE INDEX IF NOT EXISTS idx_token_accounts_address ON token_accounts(address);

CREATE INDEX IF NOT EXISTS idx_token_metadata_mint ON token_metadata(mint);
CREATE INDEX IF NOT EXISTS idx_token_metadata_symbol ON token_metadata(symbol);

CREATE INDEX IF NOT EXISTS idx_wallet_interactions_wallet ON wallet_interactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_interactions_interacted ON wallet_interactions(interacted_with);
CREATE INDEX IF NOT EXISTS idx_wallet_interactions_last ON wallet_interactions(last_interaction);

CREATE INDEX IF NOT EXISTS idx_query_cache_hash ON query_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON query_cache(expires_at);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_wallets_address_trgm ON wallets USING GIN(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_transactions_signature_trgm ON transactions USING GIN(signature gin_trgm_ops);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_accounts_updated_at BEFORE UPDATE ON token_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_metadata_updated_at BEFORE UPDATE ON token_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW wallet_summary AS
SELECT 
    w.address,
    w.first_seen,
    w.last_updated,
    w.transaction_count,
    COUNT(DISTINCT ta.mint) as token_count,
    COALESCE(SUM(ta.ui_amount), 0) as total_token_value
FROM wallets w
LEFT JOIN token_accounts ta ON w.address = ta.owner
GROUP BY w.address, w.first_seen, w.last_updated, w.transaction_count;

CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.signature,
    t.slot,
    t.block_time,
    t.fee,
    t.success,
    t.account_keys,
    COUNT(*) OVER() as total_count
FROM transactions t
WHERE t.block_time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY t.block_time DESC;

-- Sample data insertion (optional)
-- INSERT INTO wallets (address, is_program) VALUES 
-- ('11111111111111111111111111111112', true), -- System Program
-- ('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', true); -- Token Program
