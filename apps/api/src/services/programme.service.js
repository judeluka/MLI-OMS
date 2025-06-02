const { pool } = require('../config/db');
const { formatDateToYYYYMMDD } = require('../utils/helpers');

const saveProgrammeSlot = async (slotData) => {
  const { groupId, date, slotType, description, viewType } = slotData;
  
  const client = await pool.connect();
  try {
    const upsertQuery = `
      INSERT INTO group_programme_slots (group_id, slot_date, slot_type, description, view_type, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (group_id, slot_date, slot_type, view_type)
      DO UPDATE SET 
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *; 
    `;

    const result = await client.query(upsertQuery, [groupId, date, slotType, description || null, viewType]);
    
    return { 
      success: true, 
      message: 'Programme slot saved.', 
      slot: result.rows[0] 
    };
  } finally {
    client.release();
  }
};

const getGroupProgramme = async (groupId, viewType) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, group_id, slot_date, slot_type, description, view_type 
       FROM group_programme_slots 
       WHERE group_id = $1 AND view_type = $2 
       ORDER BY slot_date ASC, slot_type ASC`,
      [groupId, viewType]
    );

    // Transform the flat list into the key-value structure expected by frontend
    const programmeMap = {};
    result.rows.forEach(row => {
      const formattedDate = formatDateToYYYYMMDD(row.slot_date);
      if (formattedDate) {
        programmeMap[`${formattedDate}-${row.slot_type}`] = row.description;
      }
    });
    
    return programmeMap;
  } finally {
    client.release();
  }
};

const getCentreProgrammeSlots = async (centreName, viewType) => {
  const client = await pool.connect();
  try {
    // Get all groups for this centre
    const groupsResult = await client.query(
      `SELECT id FROM "groups" WHERE LOWER(centre) = LOWER($1)`,
      [centreName]
    );
    
    const groupIds = groupsResult.rows.map(row => row.id);
    if (groupIds.length === 0) {
      return {};
    }

    // Get all programme slots for these groups and viewType
    const slotsResult = await client.query(
      `SELECT id, group_id, slot_date, slot_type, description, view_type 
       FROM group_programme_slots 
       WHERE group_id = ANY($1) AND view_type = $2`,
      [groupIds, viewType]
    );

    // Map to { 'YYYY-MM-DD-GroupId': { slotType, description } }
    const slotsMap = {};
    slotsResult.rows.forEach(row => {
      const dateStr = formatDateToYYYYMMDD(row.slot_date);
      if (!dateStr) return;
      
      const key = `${dateStr}-${row.group_id}`;
      if (!slotsMap[key]) slotsMap[key] = {};
      slotsMap[key][row.slot_type] = row.description;
    });

    return slotsMap;
  } finally {
    client.release();
  }
};

module.exports = {
  saveProgrammeSlot,
  getGroupProgramme,
  getCentreProgrammeSlots
}; 