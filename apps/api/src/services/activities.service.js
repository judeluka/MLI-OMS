const { pool } = require('../config/db');

const getAllActivities = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM activities ORDER BY name ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createActivity = async (activityData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the activities table structure
    // This is a placeholder implementation
    const { name, description, category } = activityData;
    const result = await client.query(
      'INSERT INTO activities (name, description, category) VALUES ($1, $2, $3) RETURNING *',
      [name, description, category]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getActivityById = async (activityId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM activities WHERE id = $1', [activityId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const updateActivity = async (activityId, activityData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the activities table structure
    // This is a placeholder implementation
    const { name, description, category } = activityData;
    const result = await client.query(
      'UPDATE activities SET name = $1, description = $2, category = $3 WHERE id = $4 RETURNING *',
      [name, description, category, activityId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const getActivityParticipation = async (activityId) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the participation tracking structure
    // This is a placeholder implementation
    const result = await client.query(
      'SELECT * FROM activity_participation WHERE activity_id = $1',
      [activityId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllActivities,
  createActivity,
  getActivityById,
  updateActivity,
  getActivityParticipation
}; 