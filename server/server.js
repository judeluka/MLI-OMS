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

// --- NEW: Endpoint to Fetch All Programme Slots for a Centre ---
app.get('/api/centres/:centreName/programme-slots', async (req, res) => {
    const { centreName } = req.params;
    const { viewType = 'classes' } = req.query;
    if (!centreName) {
        return res.status(400).json({ success: false, message: 'Centre name is required.' });
    }
    let client;
    try {
        client = await pool.connect();
        // Get all groups for this centre
        const groupsResult = await client.query(
            `SELECT id FROM "groups" WHERE LOWER("Centre") = LOWER($1)`,
            [centreName]
        );
        const groupIds = groupsResult.rows.map(row => row.id);
        if (groupIds.length === 0) {
            return res.status(200).json({ success: true, slots: {} });
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
        res.status(200).json({ success: true, slots: slotsMap });
    } catch (err) {
        console.error('Error fetching programme slots for centre:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch programme slots for centre.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch Centre Occupancy Data ---
app.get('/api/centres/occupancy', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`
            SELECT 
                "Centre",
                "ArrivalDate",
                "DepartureDate",
                "StudentAllocation",
                "LeaderAllocation"
            FROM "groups"
            WHERE "Centre" IS NOT NULL
            ORDER BY "ArrivalDate" ASC
        `);

        // Process the data to get daily occupancy for each centre
        const occupancyData = {};
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        result.rows.forEach(row => {
            const centre = row.Centre;
            if (!occupancyData[centre]) {
                occupancyData[centre] = {};
            }

            const startDate = new Date(row.ArrivalDate);
            const endDate = new Date(row.DepartureDate);
            
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
                occupancyData[centre][dateStr].students += row.StudentAllocation || 0;
                occupancyData[centre][dateStr].leaders += row.LeaderAllocation || 0;
            }
        });

        // Convert to array format for the frontend
        const formattedData = Object.entries(occupancyData).map(([centre, dates]) => ({
            centre,
            data: Object.entries(dates).map(([date, values]) => ({
                date,
                students: values.students,
                leaders: values.leaders
            }))
        }));

        res.status(200).json({ success: true, occupancyData: formattedData });
    } catch (err) {
        console.error('Error fetching centre occupancy data:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch centre occupancy data.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoints for Activities ---
app.get('/api/activities', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT * FROM activities ORDER BY name ASC');
        res.status(200).json({ success: true, activities: result.rows });
    } catch (err) {
        console.error('Error fetching activities:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch activities.' });
    } finally {
        if (client) client.release();
    }
});

app.post('/api/activities', async (req, res) => {
    const { name, address, description, type, latitude, longitude } = req.body;
    
    // Basic validation
    if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required fields.' });
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `INSERT INTO activities (name, address, description, type, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, address, description, type, latitude, longitude]
        );
        res.status(201).json({ success: true, activity: result.rows[0] });
    } catch (err) {
        console.error('Error creating activity:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to create activity.' });
    } finally {
        if (client) client.release();
    }
});

// Add new endpoint for flight details
app.post('/api/groups/:groupId/flight-details', async (req, res) => {
    const { groupId } = req.params;
    const { type, time, flightCode, airport } = req.body;

    // Basic validation
    if (!type || !time || !flightCode || !airport) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: type, time, flightCode, airport' 
        });
    }

    if (type !== 'Arrival' && type !== 'Departure') {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid flight type. Must be either "Arrival" or "Departure"' 
        });
    }

    let client;
    try {
        client = await pool.connect();
        
        // Update the appropriate columns based on flight type
        const updateQuery = type === 'Arrival' 
            ? `UPDATE "groups" 
               SET "FlightArrivalTime" = $1, 
                   "FlightArrivalCode" = $2, 
                   "FlightArrivalAirport" = $3 
               WHERE id = $4 
               RETURNING *`
            : `UPDATE "groups" 
               SET "FlightDepartureTime" = $1, 
                   "FlightDepartureCode" = $2, 
                   "FlightDepartureAirport" = $3 
               WHERE id = $4 
               RETURNING *`;

        const result = await client.query(updateQuery, [time, flightCode, airport, groupId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Group not found' 
            });
        }

        const updatedGroup = result.rows[0];
        res.status(200).json({
            success: true,
            message: 'Flight details updated successfully',
            group: {
                id: updatedGroup.id,
                flightArrivalTime: updatedGroup.FlightArrivalTime,
                flightArrivalCode: updatedGroup.FlightArrivalCode,
                flightArrivalAirport: updatedGroup.FlightArrivalAirport,
                flightDepartureTime: updatedGroup.FlightDepartureTime,
                flightDepartureCode: updatedGroup.FlightDepartureCode,
                flightDepartureAirport: updatedGroup.FlightDepartureAirport
            }
        });
    } catch (err) {
        console.error('Error updating flight details:', err.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update flight details' 
        });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch Single Activity ---
app.get('/api/activities/:activityId', async (req, res) => {
    const { activityId } = req.params;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT * FROM activities WHERE id = $1', [activityId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        res.status(200).json({ success: true, activity: result.rows[0] });
    } catch (err) {
        console.error('Error fetching activity:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch activity' });
    } finally {
        if (client) client.release();
    }
});

// --- UPDATE: Add PUT endpoint for updating activities ---
app.put('/api/activities/:activityId', async (req, res) => {
    const { activityId } = req.params;
    const { name, type, address, description, latitude, longitude } = req.body;
    
    // Basic validation
    if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required fields.' });
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `UPDATE activities 
             SET name = $1, type = $2, address = $3, description = $4, latitude = $5, longitude = $6
             WHERE id = $7
             RETURNING *`,
            [name, type, address, description, latitude, longitude, activityId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        
        res.status(200).json({ success: true, activity: result.rows[0] });
    } catch (err) {
        console.error('Error updating activity:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to update activity' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch Activity Participation Statistics ---
app.get('/api/activities/:activityId/participation', async (req, res) => {
    const { activityId } = req.params;
    let client;
    try {
        client = await pool.connect();
        
        // First get the activity name
        const activityResult = await client.query('SELECT name FROM activities WHERE id = $1', [activityId]);
        if (activityResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }
        const activityName = activityResult.rows[0].name;

        // Then get all programme slots for this activity
        const result = await client.query(`
            SELECT 
                gps.slot_date,
                g."Centre",
                g."StudentAllocation",
                g."LeaderAllocation"
            FROM group_programme_slots gps
            JOIN "groups" g ON g.id = gps.group_id
            WHERE gps.description = $1
            AND gps.slot_type IN ('ACTIVITY_MORNING', 'ACTIVITY_AFTERNOON')
            ORDER BY gps.slot_date ASC, g."Centre" ASC
        `, [activityName]);

        // Process the data to get daily totals per centre
        const participationData = {};
        result.rows.forEach(row => {
            const date = formatDateToYYYYMMDD(row.slot_date);
            const centre = row.Centre;
            
            if (!participationData[date]) {
                participationData[date] = {};
            }
            if (!participationData[date][centre]) {
                participationData[date][centre] = {
                    students: 0,
                    leaders: 0
                };
            }
            
            participationData[date][centre].students += row.StudentAllocation || 0;
            participationData[date][centre].leaders += row.LeaderAllocation || 0;
        });

        res.status(200).json({ 
            success: true, 
            participationData,
            dates: Object.keys(participationData).sort(),
            centres: [...new Set(result.rows.map(row => row.Centre))].sort()
        });
    } catch (err) {
        console.error('Error fetching activity participation:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch activity participation data' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoints for Flights ---
// Get all flights
app.get('/api/flights', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT id, flight_type, flight_date, flight_time, flight_code FROM flights ORDER BY flight_date DESC, flight_time DESC');
        res.status(200).json({ success: true, flights: result.rows });
    } catch (err) {
        console.error('Error fetching flights:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch flights.' });
    } finally {
        if (client) client.release();
    }
});

// Add a new flight
app.post('/api/flights', async (req, res) => {
    const { flight_type, flight_date, flight_time, flight_code } = req.body;
    // Validate required fields
    if (!flight_type || !flight_date || !flight_time || !flight_code) {
        return res.status(400).json({ success: false, message: 'Missing required fields: flight_type, flight_date, flight_time, flight_code.' });
    }
    // Normalize flight_type to lowercase
    const normalizedType = flight_type.toLowerCase();
    if (normalizedType !== 'arrival' && normalizedType !== 'departure') {
        return res.status(400).json({ success: false, message: 'Invalid flight_type. Must be "arrival" or "departure".' });
    }
    let client;
    try {
        client = await pool.connect();
        const insertQuery = `INSERT INTO flights (flight_type, flight_date, flight_time, flight_code) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await client.query(insertQuery, [normalizedType, flight_date, flight_time, flight_code]);
        res.status(201).json({ success: true, flight: result.rows[0] });
    } catch (err) {
        console.error('Error adding flight:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to add flight.' });
    } finally {
        if (client) client.release();
    }
});

// Get a single flight by ID
app.get('/api/flights/:flightId', async (req, res) => {
    const { flightId } = req.params;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT id, flight_type, flight_date, flight_time, flight_code FROM flights WHERE id = $1', [flightId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Flight not found.' });
        }
        res.status(200).json({ success: true, flight: result.rows[0] });
    } catch (err) {
        console.error('Error fetching flight:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch flight.' });
    } finally {
        if (client) client.release();
    }
});

// Update a flight by ID
app.put('/api/flights/:flightId', async (req, res) => {
    const { flightId } = req.params;
    const { flight_type, flight_date, flight_time, flight_code } = req.body;
    if (!flight_type || !flight_date || !flight_time || !flight_code) {
        return res.status(400).json({ success: false, message: 'Missing required fields: flight_type, flight_date, flight_time, flight_code.' });
    }
    const normalizedType = flight_type.toLowerCase();
    if (normalizedType !== 'arrival' && normalizedType !== 'departure') {
        return res.status(400).json({ success: false, message: 'Invalid flight_type. Must be "arrival" or "departure".' });
    }
    let client;
    try {
        client = await pool.connect();
        const updateQuery = `UPDATE flights SET flight_type = $1, flight_date = $2, flight_time = $3, flight_code = $4 WHERE id = $5 RETURNING *`;
        const result = await client.query(updateQuery, [normalizedType, flight_date, flight_time, flight_code, flightId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Flight not found.' });
        }
        res.status(200).json({ success: true, flight: result.rows[0] });
    } catch (err) {
        console.error('Error updating flight:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to update flight.' });
    } finally {
        if (client) client.release();
    }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Access the server at http://localhost:${port}`);
});
