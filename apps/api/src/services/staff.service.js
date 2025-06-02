const { pool } = require('../config/db');

const getAllStaff = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM staff ORDER BY last_name ASC, first_name ASC');
    return result.rows;
  } finally {
    client.release();
  }
};

const createStaff = async (staffData) => {
  const client = await pool.connect();
  try {
    // Implementation would depend on the staff table structure
    const { first_name, last_name, position, email } = staffData;
    const result = await client.query(
      'INSERT INTO staff (first_name, last_name, position, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, position, email]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getAccommodationAssignments = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT sa.*, s.first_name, s.last_name 
      FROM staff_accommodation_assignments sa
      JOIN staff s ON sa.staff_id = s.id
      ORDER BY sa.start_date DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
};

const getStaffById = async (staffId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM staff WHERE id = $1', [staffId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const updateStaff = async (staffId, staffData) => {
  const client = await pool.connect();
  try {
    const { first_name, last_name, position, email } = staffData;
    const result = await client.query(
      'UPDATE staff SET first_name = $1, last_name = $2, position = $3, email = $4 WHERE id = $5 RETURNING *',
      [first_name, last_name, position, email, staffId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

const deleteStaff = async (staffId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM staff WHERE id = $1 RETURNING *', [staffId]);
    if (result.rows.length > 0) {
      return { success: true, message: 'Staff deleted successfully.' };
    }
    return { success: false };
  } finally {
    client.release();
  }
};

const getStaffAccommodationAssignments = async (staffId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM staff_accommodation_assignments WHERE staff_id = $1 ORDER BY start_date DESC',
      [staffId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const getStaffWorkAssignments = async (staffId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM staff_work_assignments WHERE staff_id = $1 ORDER BY start_date DESC',
      [staffId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const getStaffDocuments = async (staffId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM staff_documents WHERE staff_id = $1 ORDER BY created_at DESC',
      [staffId]
    );
    return result.rows;
  } finally {
    client.release();
  }
};

const createStaffWorkAssignment = async (staffId, assignmentData) => {
  const client = await pool.connect();
  try {
    const { role, start_date, end_date, description } = assignmentData;
    const result = await client.query(
      'INSERT INTO staff_work_assignments (staff_id, role, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [staffId, role, start_date, end_date, description]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const createStaffAccommodationAssignment = async (staffId, assignmentData) => {
  const client = await pool.connect();
  try {
    const { accommodation_type, start_date, end_date, location } = assignmentData;
    const result = await client.query(
      'INSERT INTO staff_accommodation_assignments (staff_id, accommodation_type, start_date, end_date, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [staffId, accommodation_type, start_date, end_date, location]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  getAccommodationAssignments,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffAccommodationAssignments,
  getStaffWorkAssignments,
  getStaffDocuments,
  createStaffWorkAssignment,
  createStaffAccommodationAssignment
}; 