// server/server.js
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

// --- Database Configuration ---
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('FATAL ERROR: DATABASE_URL is not defined in the environment variables.');
    process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  // ssl: { rejectUnauthorized: false } // If needed for Neon
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Successfully connected to the database.');
    if (client) client.release();
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Helper function to format a Date object to YYYY-MM-DD string
const formatDateToYYYYMMDD = (dateObj) => {
    if (!dateObj) return null;
    const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.post('/login', async (req, res) => {
  // ... (login logic as before)
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const storedPasswordHash = user.password_hash;
    const passwordMatch = await bcrypt.compare(password, storedPasswordHash);
    if (passwordMatch) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: { id: user.id, email: user.email }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Database or server error during login:', err.stack);
    res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
  } finally {
    if (client) client.release();
  }
});

app.post('/api/import/groups', async (req, res) => {
  // ... (import groups logic as before, ensure column names match your DB)
    const groupsToImport = req.body;
    if (!Array.isArray(groupsToImport) || groupsToImport.length === 0) {
        return res.status(400).json({ success: false, message: 'No groups data provided or data is not an array.' });
    }
    const client = await pool.connect();
    let successfullyImportedCount = 0;
    const errors = [];
    const skippedDueToMissingFields = [];
    try {
        await client.query('BEGIN');
        for (const group of groupsToImport) {
            const { /* ...destructure group properties... */ 
                agency = null, groupName, arrivalDate, departureDate,
                studentAllocation = null, leaderAllocation = null, studentBookings = null, leaderBookings = null,
                centre = null, flightArrivalTime = null, flightDepartureTime = null
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
                    INSERT INTO "groups" ("GroupName", "Agency", "ArrivalDate", "DepartureDate", "StudentAllocation", "LeaderAllocation", "Centre", "StudentBookings", "LeaderBookings", "FlightArrivalTime", "FlightDepartureTime") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT ("GroupName") DO NOTHING;`;
                const queryParams = [
                    groupName.trim(), agency, arrivalDate, departureDate,
                    isNaN(sAlloc) ? null : sAlloc, isNaN(lAlloc) ? null : lAlloc, centre,
                    isNaN(sBook) ? null : sBook, isNaN(lBook) ? null : lBook,
                    flightArrivalTime, flightDepartureTime
                ];
                const result = await client.query(insertQuery, queryParams);
                if (result.rowCount > 0) successfullyImportedCount++;
                else errors.push({ groupName, error: 'Group already exists (conflict on GroupName).' });
            } catch (dbError) { errors.push({ groupName, error: `DB error: ${dbError.message}` }); }
        }
        await client.query('COMMIT');
        let message = `Import finished. Imported ${successfullyImportedCount} groups.`;
        if (skippedDueToMissingFields.length > 0) message += ` Skipped ${skippedDueToMissingFields.length} due to missing fields.`;
        if (errors.length > 0 && errors.some(e => !skippedDueToMissingFields.includes(e.groupName))) message += ` Encountered ${errors.filter(e => !skippedDueToMissingFields.includes(e.groupName)).length} other errors.`;
        res.status(200).json({ success: true, message, successfullyImportedCount, totalProcessed: groupsToImport.length, skippedCount: skippedDueToMissingFields.length, errors });
    } catch (transactionError) {
        if(client) await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: 'Import transaction failed.' });
    } finally {
        if (client) client.release();
    }
});

app.get('/api/groups', async (req, res) => {
  // ... (get all groups logic as before)
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`SELECT id, "GroupName", "Agency", "ArrivalDate", "DepartureDate", "StudentAllocation", "LeaderAllocation", "StudentBookings", "LeaderBookings", "Centre", "FlightArrivalTime", "FlightDepartureTime" FROM "groups" ORDER BY "ArrivalDate" DESC, "GroupName" ASC`);
        const groups = result.rows.map(row => ({
            id: row.id, agency: row.Agency, groupName: row.GroupName,
            arrivalDate: formatDateToYYYYMMDD(row.ArrivalDate),
            departureDate: formatDateToYYYYMMDD(row.DepartureDate),
            studentAllocation: row.StudentAllocation, leaderAllocation: row.LeaderAllocation,
            studentBookings: row.StudentBookings, leaderBookings: row.LeaderBookings,
            centre: row.Centre, flightArrivalTime: row.FlightArrivalTime, flightDepartureTime: row.FlightDepartureTime
        }));
        res.status(200).json({ success: true, groups: groups });
    } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch groups.' });
    } finally { if (client) client.release(); }
});

app.get('/api/groups/:groupId', async (req, res) => {
  // ... (get single group details logic as before)
    const { groupId } = req.params;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`SELECT id, "GroupName", "Agency", "ArrivalDate", "DepartureDate", "StudentAllocation", "LeaderAllocation", "StudentBookings", "LeaderBookings", "Centre", "FlightArrivalTime", "FlightDepartureTime" FROM "groups" WHERE id = $1`, [groupId]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Group not found.' });
        const group = result.rows[0];
        res.status(200).json({
            success: true,
            group: {
                id: group.id, agency: group.Agency, groupName: group.GroupName,
                arrivalDate: formatDateToYYYYMMDD(group.ArrivalDate),
                departureDate: formatDateToYYYYMMDD(group.DepartureDate),
                studentAllocation: group.StudentAllocation, leaderAllocation: group.LeaderAllocation,
                studentBookings: group.StudentBookings, leaderBookings: group.LeaderBookings,
                centre: group.Centre, flightArrivalTime: group.FlightArrivalTime, flightDepartureTime: group.FlightDepartureTime
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: 'Failed to fetch group details.' });
    } finally { if (client) client.release(); }
});

// --- NEW: Endpoint to Save/Update a Programme Slot ---
app.post('/api/programme-slot', async (req, res) => {
    const { groupId, date, slotType, description, viewType } = req.body;
    console.log(`Received request to update programme slot:`, req.body);

    // Basic Validation
    if (!groupId || !date || !slotType || !viewType) {
        return res.status(400).json({ success: false, message: 'Missing required fields: groupId, date, slotType, viewType.' });
    }
    // Description can be empty or null (for 'None' class type or clearing an activity)

    let client;
    try {
        client = await pool.connect();
        // UPSERT logic: Insert or Update if the combination of group_id, slot_date, slot_type, view_type exists
        const upsertQuery = `
            INSERT INTO group_programme_slots (group_id, slot_date, slot_type, description, view_type, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (group_id, slot_date, slot_type, view_type)
            DO UPDATE SET 
                description = EXCLUDED.description,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *; 
        `;
        // If description is empty or "None", we might want to delete instead, or store empty/null.
        // For simplicity, this UPSERT will store empty string if description is empty.
        // To delete if description is effectively 'None' or empty:
        // if (description === null || description.trim() === '' || description.toLowerCase() === 'none') {
        //   const deleteQuery = `DELETE FROM group_programme_slots WHERE group_id = $1 AND slot_date = $2 AND slot_type = $3 AND view_type = $4`;
        //   await client.query(deleteQuery, [groupId, date, slotType, viewType]);
        //   return res.status(200).json({ success: true, message: 'Programme slot cleared.' });
        // }

        const result = await client.query(upsertQuery, [groupId, date, slotType, description || null, viewType]);
        
        console.log("Upsert result:", result.rows[0]);
        res.status(201).json({ success: true, message: 'Programme slot saved.', slot: result.rows[0] });

    } catch (err) {
        console.error('Error saving programme slot:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to save programme slot.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch Programme for a Group ---
app.get('/api/groups/:groupId/programme', async (req, res) => {
    const { groupId } = req.params;
    const { viewType = 'classes' } = req.query; // Default to 'classes' view if not specified
    console.log(`Received request to GET /api/groups/${groupId}/programme for view: ${viewType}`);

    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT id, group_id, slot_date, slot_type, description, view_type 
             FROM group_programme_slots 
             WHERE group_id = $1 AND view_type = $2 
             ORDER BY slot_date ASC, slot_type ASC`, // Ensure consistent order
            [groupId, viewType]
        );

        // Transform the flat list into the key-value structure expected by frontend
        // e.g., {'YYYY-MM-DD-SlotType': 'description'}
        const programmeMap = {};
        result.rows.forEach(row => {
            const formattedDate = formatDateToYYYYMMDD(row.slot_date);
            // For Arrival/Departure, the slot_type might be 'Arrival' or 'Departure'
            // Or they might be stored as descriptions in 'Morning'/'Afternoon' slots on those specific dates.
            // The current groupProgrammeData placeholder uses keys like 'YYYY-MM-DD-GroupId-Arrival'.
            // We need to decide how to structure this. Let's assume slot_type is 'Morning', 'Afternoon', 'Evening'.
            // Arrival/Departure specific activities will be handled by frontend logic based on dates for now.
            if (formattedDate) {
                 // The key for groupProgrammeData on frontend was 'YYYY-MM-DD-GroupId-Slot'
                 // But here we are fetching for a specific groupId already.
                 // Let's make the key 'YYYY-MM-DD-SlotType' for the map.
                programmeMap[`${formattedDate}-${row.slot_type}`] = row.description;
            }
        });
        
        console.log(`Returning programme map for group ${groupId}, view ${viewType}:`, programmeMap);
        res.status(200).json({ success: true, programme: programmeMap });

    } catch (err) {
        console.error(`Error fetching programme for group ${groupId}:`, err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch group programme.' });
    } finally {
        if (client) client.release();
    }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Access the server at http://localhost:${port}`);
});
