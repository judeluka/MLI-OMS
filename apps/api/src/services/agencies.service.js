const { pool } = require('../config/db');

const getAllAgencies = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM public.agencies ORDER BY name ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllAgencies
}; 