const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const authenticateUser = async (email, password) => {
  let client;
  
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    const user = result.rows[0];
    const storedPasswordHash = user.password_hash;
    const passwordMatch = await bcrypt.compare(password, storedPasswordHash);
    
    if (passwordMatch) {
      return {
        success: true,
        user: { id: user.id, email: user.email }
      };
    } else {
      return { success: false, message: 'Invalid email or password' };
    }
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  authenticateUser
}; 