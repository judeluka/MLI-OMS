const { pool } = require('../config/db');

const getAllFlights = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM flights ORDER BY flight_date DESC, flight_time ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createFlight = async (flightData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the flights table structure
    const { flight_code, flight_type, flight_date, flight_time } = flightData;
    const result = await client.query(
      'INSERT INTO flights (flight_code, flight_type, flight_date, flight_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [flight_code, flight_type, flight_date, flight_time]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getFlightById = async (flightId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM flights WHERE id = $1', [flightId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const updateFlight = async (flightId, flightData) => {
  const client = await pool.connect();
  try {
    const { flight_code, flight_type, flight_date, flight_time } = flightData;
    const result = await client.query(
      'UPDATE flights SET flight_code = $1, flight_type = $2, flight_date = $3, flight_time = $4 WHERE id = $5 RETURNING *',
      [flight_code, flight_type, flight_date, flight_time, flightId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const getFlightGroups = async (flightId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT g.* FROM groups g
      INNER JOIN group_flights gf ON g.id = gf.group_id
      WHERE gf.flight_id = $1
    `, [flightId]);
    return result.rows;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllFlights,
  createFlight,
  getFlightById,
  updateFlight,
  getFlightGroups
}; 