const { pool } = require('../config/db');
const { formatDateToYYYYMMDD } = require('../utils/helpers');

const getAllCentres = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM centres ORDER BY name ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createCentre = async (centreData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the centres table structure
    const { name, location, capacity } = centreData;
    const result = await client.query(
      'INSERT INTO centres (name, location, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, location, capacity]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getCentreOccupancy = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        centre,
        arrival_date,
        departure_date,
        student_allocation,
        leader_allocation
      FROM "groups"
      WHERE centre IS NOT NULL
      ORDER BY arrival_date ASC
    `);

    // Process the data to get daily occupancy for each centre
    const occupancyData = {};
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    result.rows.forEach(row => {
      const centre = row.centre;
      if (!occupancyData[centre]) {
        occupancyData[centre] = {};
      }

      const startDate = new Date(row.arrival_date);
      const endDate = new Date(row.departure_date);
      
      // Only include data from the last 30 days
      if (endDate < thirtyDaysAgo) return;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = formatDateToYYYYMMDD(d);
        if (!occupancyData[centre][dateStr]) {
          occupancyData[centre][dateStr] = {
            students: 0,
            leaders: 0
          };
        }
        occupancyData[centre][dateStr].students += row.student_allocation || 0;
        occupancyData[centre][dateStr].leaders += row.leader_allocation || 0;
      }
    });

    return occupancyData;
  } finally {
    client.release();
  }
};

const updateCentre = async (centreId, centreData) => {
  const client = await pool.connect();
  try {
    const { name, location, capacity } = centreData;
    const result = await client.query(
      'UPDATE centres SET name = $1, location = $2, capacity = $3 WHERE id = $4 RETURNING *',
      [name, location, capacity, centreId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const deleteCentre = async (centreId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM centres WHERE id = $1 RETURNING *', [centreId]);
    if (result.rows.length > 0) {
      return { success: true, message: 'Centre deleted successfully.' };
    }
    return { success: false };
  } finally {
    client.release();
  }
};

module.exports = {
  getAllCentres,
  createCentre,
  getCentreOccupancy,
  updateCentre,
  deleteCentre
}; 