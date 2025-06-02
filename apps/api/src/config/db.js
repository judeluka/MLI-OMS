const { Pool } = require('pg');

// --- Database Configuration ---
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('FATAL ERROR: DATABASE_URL is not defined in the environment variables.');
    process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  // ssl: { rejectUnauthorized: false } // If needed for Neon
});

// Test database connection
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection
}; 