const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔧 Setting up database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Insert some initial data
    await insertInitialData(pool);
    
    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function insertInitialData(pool) {
  try {
    console.log('📝 Inserting initial data...');
    
    // Insert common Solana programs
    const programs = [
      { address: '11111111111111111111111111111112', is_program: true }, // System Program
      { address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', is_program: true }, // Token Program
      { address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', is_program: true }, // Associated Token Program
      { address: 'SysvarRent111111111111111111111111111111111', is_program: true }, // Rent Sysvar
      { address: 'SysvarC1ock11111111111111111111111111111111', is_program: true }, // Clock Sysvar
    ];

    for (const program of programs) {
      await pool.query(
        'INSERT INTO wallets (address, is_program) VALUES ($1, $2) ON CONFLICT (address) DO NOTHING',
        [program.address, program.is_program]
      );
    }
    
    console.log('✅ Initial data inserted');
  } catch (error) {
    console.error('❌ Failed to insert initial data:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
