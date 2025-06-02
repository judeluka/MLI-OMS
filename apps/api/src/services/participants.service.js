const { pool } = require('../config/db');

const getAllParticipants = async (queryParams = {}) => {
  const client = await pool.connect();
  try {
    // Implementation would include pagination, filtering, sorting based on queryParams
    const result = await client.query('SELECT * FROM participants ORDER BY last_name ASC, first_name ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createParticipant = async (participantData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the participants table structure
    const { first_name, last_name, participant_type, group_id } = participantData;
    const result = await client.query(
      'INSERT INTO participants (first_name, last_name, participant_type, group_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, participant_type, group_id]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getParticipantById = async (participantId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM participants WHERE id = $1', [participantId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const updateParticipant = async (participantId, participantData) => {
  const client = await pool.connect();
  try {
    const { first_name, last_name, participant_type, group_id } = participantData;
    const result = await client.query(
      'UPDATE participants SET first_name = $1, last_name = $2, participant_type = $3, group_id = $4 WHERE id = $5 RETURNING *',
      [first_name, last_name, participant_type, group_id, participantId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const deleteParticipant = async (participantId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM participants WHERE id = $1 RETURNING *', [participantId]);
    if (result.rows.length > 0) {
      return { success: true, message: 'Participant deleted successfully.' };
    }
    return { success: false };
  } finally {
    client.release();
  }
};

module.exports = {
  getAllParticipants,
  createParticipant,
  getParticipantById,
  updateParticipant,
  deleteParticipant
}; 