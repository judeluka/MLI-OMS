// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/', routes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Test database connection on startup
(async () => {
  try {
    await db.testConnection();
    console.log('Successfully connected to the database.');
  } catch (err) {
    console.error('Database connection failed:', err.stack);
    process.exit(1);
  }
})(); 