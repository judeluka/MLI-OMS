const { pool } = require('../config/db');

const getAllTransfers = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM transfers ORDER BY created_at DESC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createTransfer = async (transferData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the transfers table structure
    const { type, description, date, time } = transferData;
    const result = await client.query(
      'INSERT INTO transfers (type, description, date, time) VALUES ($1, $2, $3, $4) RETURNING *',
      [type, description, date, time]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getTransportTransfers = async () => {
  const client = await pool.connect();
  try {
    // Implementation for transport-specific transfers
    const result = await client.query('SELECT * FROM transfers WHERE type = $1 ORDER BY date ASC', ['transport']);
    return result.rows;
  } finally {
    client.release();
  }
};

const getTransferById = async (transferId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM transfers WHERE id = $1', [transferId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const updateTransfer = async (transferId, transferData) => {
  const client = await pool.connect();
  try {
    const { type, description, date, time } = transferData;
    const result = await client.query(
      'UPDATE transfers SET type = $1, description = $2, date = $3, time = $4 WHERE id = $5 RETURNING *',
      [type, description, date, time, transferId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const deleteTransfer = async (transferId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM transfers WHERE id = $1 RETURNING *', [transferId]);
    if (result.rows.length > 0) {
      return { success: true, message: 'Transfer deleted successfully.' };
    }
    return { success: false };
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTransfers,
  createTransfer,
  getTransportTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer
}; 