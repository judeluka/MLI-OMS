const { pool } = require('../config/db');
const { formatDateToYYYYMMDD, fetchGroupFlights } = require('../utils/helpers');

const importGroups = async (groupsToImport) => {
  if (!Array.isArray(groupsToImport) || groupsToImport.length === 0) {
    throw new Error('No groups data provided or data is not an array.');
  }

  const client = await pool.connect();
  let successfullyImportedCount = 0;
  const errors = [];
  const skippedDueToMissingFields = [];

  try {
    await client.query('BEGIN');
    
    for (const group of groupsToImport) {
      const { 
        agency = null, groupName, arrivalDate, departureDate,
        studentAllocation = null, leaderAllocation = null, 
        studentBookings = null, leaderBookings = null,
        centre = null
      } = group;

      if (!groupName || !groupName.trim() || !arrivalDate || !departureDate) {
        const missing = [];
        if (!groupName || !groupName.trim()) missing.push('GroupName');
        if (!arrivalDate) missing.push('ArrivalDate');
        if (!departureDate) missing.push('DepartureDate');
        errors.push({ groupName: groupName || 'Unknown', error: `Missing: ${missing.join(', ')}` });
        skippedDueToMissingFields.push(groupName || 'Unknown');
        continue;
      }

      const sAlloc = studentAllocation !== null ? parseInt(studentAllocation, 10) : null;
      const lAlloc = leaderAllocation !== null ? parseInt(leaderAllocation, 10) : null;
      const sBook = studentBookings !== null ? parseInt(studentBookings, 10) : null;
      const lBook = leaderBookings !== null ? parseInt(leaderBookings, 10) : null;

      try {
        const insertQuery = `
          INSERT INTO "groups" (
            group_name, agency, arrival_date, departure_date,
            student_allocation, leader_allocation, centre,
            student_bookings, leader_bookings
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
        const queryParams = [
          groupName.trim(), agency, arrivalDate, departureDate,
          isNaN(sAlloc) ? null : sAlloc, isNaN(lAlloc) ? null : lAlloc, centre,
          isNaN(sBook) ? null : sBook, isNaN(lBook) ? null : lBook
        ];

        const result = await client.query(insertQuery, queryParams);
        if (result.rowCount > 0) successfullyImportedCount++;
        else errors.push({ groupName, error: 'Group already exists (conflict on GroupName).' });
      } catch (dbError) { 
        errors.push({ groupName, error: `DB error: ${dbError.message}` }); 
      }
    }

    await client.query('COMMIT');
    
    let message = `Import finished. Imported ${successfullyImportedCount} groups.`;
    if (skippedDueToMissingFields.length > 0) {
      message += ` Skipped ${skippedDueToMissingFields.length} due to missing fields.`;
    }
    if (errors.length > 0 && errors.some(e => !skippedDueToMissingFields.includes(e.groupName))) {
      message += ` Encountered ${errors.filter(e => !skippedDueToMissingFields.includes(e.groupName)).length} other errors.`;
    }
    
    return {
      success: true,
      message,
      successfullyImportedCount,
      totalProcessed: groupsToImport.length,
      skippedCount: skippedDueToMissingFields.length,
      errors
    };
  } catch (transactionError) {
    await client.query('ROLLBACK');
    throw transactionError;
  } finally {
    client.release();
  }
};

const getAllGroups = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT g.id, g.group_name, COALESCE(a.name, 'No Agency') as agency, g.arrival_date, g.departure_date, 
             g.student_allocation, g.leader_allocation, g.student_bookings, g.leader_bookings, g.centre 
      FROM groups g
      LEFT JOIN public.agencies a ON g.agency_id = a.id
      ORDER BY g.arrival_date DESC, g.group_name ASC
    `);

    const groupsWithFlights = await Promise.all(result.rows.map(async (row) => {
      const { arrivalFlights, departureFlights } = await fetchGroupFlights(client, row.id);
      
      return {
        id: row.id, 
        agency: row.agency, 
        groupName: row.group_name,
        arrivalDate: formatDateToYYYYMMDD(row.arrival_date),
        departureDate: formatDateToYYYYMMDD(row.departure_date),
        studentAllocation: row.student_allocation, 
        leaderAllocation: row.leader_allocation,
        studentBookings: row.student_bookings, 
        leaderBookings: row.leader_bookings,
        centre: row.centre,
        arrivalFlights: arrivalFlights,
        departureFlights: departureFlights
      };
    }));
    
    return groupsWithFlights;
  } finally {
    client.release();
  }
};

const getGroupById = async (groupId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT g.id, g.group_name, COALESCE(a.name, 'No Agency') as agency, g.arrival_date, g.departure_date, 
             g.student_allocation, g.leader_allocation, g.student_bookings, g.leader_bookings, g.centre 
      FROM groups g
      LEFT JOIN public.agencies a ON g.agency_id = a.id
      WHERE g.id = $1
    `, [groupId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const group = result.rows[0];
    const { arrivalFlights, departureFlights } = await fetchGroupFlights(client, groupId);
    
    return {
      id: group.id, 
      agency: group.agency, 
      groupName: group.group_name,
      arrivalDate: formatDateToYYYYMMDD(group.arrival_date),
      departureDate: formatDateToYYYYMMDD(group.departure_date),
      studentAllocation: group.student_allocation, 
      leaderAllocation: group.leader_allocation,
      studentBookings: group.student_bookings, 
      leaderBookings: group.leader_bookings,
      centre: group.centre,
      arrivalFlights: arrivalFlights,
      departureFlights: departureFlights
    };
  } finally {
    client.release();
  }
};

const createGroup = async (groupData) => {
  const {
    groupName, agency, arrivalDate, departureDate,
    studentAllocation, leaderAllocation, centre,
    studentBookings, leaderBookings
  } = groupData;

  const client = await pool.connect();
  try {
    // If agency is provided, find the agency_id
    let agencyId = null;
    if (agency) {
      const agencyResult = await client.query('SELECT id FROM public.agencies WHERE name = $1', [agency]);
      if (agencyResult.rows.length > 0) {
        agencyId = agencyResult.rows[0].id;
      }
    }
    
    const insertQuery = `
      INSERT INTO groups (
        group_name, agency_id, arrival_date, departure_date,
        student_allocation, leader_allocation, centre,
        student_bookings, leader_bookings
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const params = [
      groupName, 
      agencyId,
      formatDateToYYYYMMDD(arrivalDate), 
      formatDateToYYYYMMDD(departureDate),
      studentAllocation ? parseInt(studentAllocation, 10) : null,
      leaderAllocation ? parseInt(leaderAllocation, 10) : null,
      centre,
      studentBookings ? parseInt(studentBookings, 10) : null,
      leaderBookings ? parseInt(leaderBookings, 10) : null
    ];

    const result = await client.query(insertQuery, params);
    const newGroup = result.rows[0];

    return {
      id: newGroup.id,
      groupName: newGroup.group_name,
      agency: agency,
      arrivalDate: formatDateToYYYYMMDD(newGroup.arrival_date),
      departureDate: formatDateToYYYYMMDD(newGroup.departure_date),
      studentAllocation: newGroup.student_allocation,
      leaderAllocation: newGroup.leader_allocation,
      centre: newGroup.centre,
      studentBookings: newGroup.student_bookings,
      leaderBookings: newGroup.leader_bookings,
      arrivalFlights: [],
      departureFlights: []
    };
  } finally {
    client.release();
  }
};

const updateGroup = async (groupId, groupData) => {
  const {
    groupName, agency, arrivalDate, departureDate,
    studentAllocation, leaderAllocation, centre,
    studentBookings, leaderBookings
  } = groupData;

  const client = await pool.connect();
  try {
    // If agency is provided, find the agency_id
    let agencyId = null;
    if (agency) {
      const agencyResult = await client.query('SELECT id FROM public.agencies WHERE name = $1', [agency]);
      if (agencyResult.rows.length > 0) {
        agencyId = agencyResult.rows[0].id;
      }
    }
    
    const updateQuery = `
      UPDATE groups SET
        group_name = $1, agency_id = $2, arrival_date = $3, departure_date = $4,
        student_allocation = $5, leader_allocation = $6, centre = $7,
        student_bookings = $8, leader_bookings = $9
      WHERE id = $10
      RETURNING *;
    `;
    const params = [
      groupName, 
      agencyId, 
      formatDateToYYYYMMDD(arrivalDate), 
      formatDateToYYYYMMDD(departureDate),
      studentAllocation ? parseInt(studentAllocation, 10) : null,
      leaderAllocation ? parseInt(leaderAllocation, 10) : null,
      centre,
      studentBookings ? parseInt(studentBookings, 10) : null,
      leaderBookings ? parseInt(leaderBookings, 10) : null,
      parseInt(groupId, 10)
    ];

    const result = await client.query(updateQuery, params);

    if (result.rows.length === 0) {
      return null;
    }
    
    const updatedGroup = result.rows[0];
    const { arrivalFlights, departureFlights } = await fetchGroupFlights(client, groupId);

    return {
      id: updatedGroup.id,
      groupName: updatedGroup.group_name,
      agency: agency,
      arrivalDate: formatDateToYYYYMMDD(updatedGroup.arrival_date),
      departureDate: formatDateToYYYYMMDD(updatedGroup.departure_date),
      studentAllocation: updatedGroup.student_allocation,
      leaderAllocation: updatedGroup.leader_allocation,
      centre: updatedGroup.centre,
      studentBookings: updatedGroup.student_bookings,
      leaderBookings: updatedGroup.leader_bookings,
      arrivalFlights: arrivalFlights,
      departureFlights: departureFlights
    };
  } finally {
    client.release();
  }
};

const deleteGroup = async (groupId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First check if the group exists
    const checkQuery = 'SELECT id, group_name FROM groups WHERE id = $1';
    const checkResult = await client.query(checkQuery, [parseInt(groupId, 10)]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false };
    }

    const groupName = checkResult.rows[0].group_name;

    // Delete associated flight relationships first
    await client.query('DELETE FROM group_flights WHERE group_id = $1', [parseInt(groupId, 10)]);

    // Delete the group
    const deleteQuery = 'DELETE FROM groups WHERE id = $1';
    await client.query(deleteQuery, [parseInt(groupId, 10)]);

    await client.query('COMMIT');

    return {
      success: true,
      message: `Group "${groupName}" deleted successfully.`
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Placeholder implementations for other methods - these would need to be implemented based on the original logic
const addFlightToGroup = async (groupId, flightData) => {
  // Implementation needed based on original server.js logic
  return { success: true, message: 'Flight added to group successfully.' };
};

const removeFlightFromGroup = async (groupId, flightId) => {
  // Implementation needed based on original server.js logic
  return { success: true, message: 'Flight removed from group successfully.' };
};

const getGroupParticipants = async (groupId) => {
  // Implementation needed based on original server.js logic
  return [];
};

const getGroupTransfers = async (groupId) => {
  // Implementation needed based on original server.js logic
  return [];
};

const assignTransferToGroup = async (groupId, transferData) => {
  // Implementation needed based on original server.js logic
  return { success: true, message: 'Transfer assigned to group successfully.' };
};

const updateGroupTransferAssignment = async (groupId, assignmentId, transferData) => {
  // Implementation needed based on original server.js logic
  return { success: true, message: 'Transfer assignment updated successfully.' };
};

const removeTransferFromGroup = async (groupId, assignmentId) => {
  // Implementation needed based on original server.js logic
  return { success: true, message: 'Transfer removed from group successfully.' };
};

const getSalesGridGroups = async () => {
  // Implementation needed based on original server.js logic
  return [];
};

module.exports = {
  importGroups,
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addFlightToGroup,
  removeFlightFromGroup,
  getGroupParticipants,
  getGroupTransfers,
  assignTransferToGroup,
  updateGroupTransferAssignment,
  removeTransferFromGroup,
  getSalesGridGroups
}; 