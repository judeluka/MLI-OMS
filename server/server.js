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

// Helper function to fetch flights for a group
const fetchGroupFlights = async (client, groupId) => {
    const flightsQuery = `
        SELECT 
            f.id AS flight_id,
            f.flight_code,
            f.flight_type,
            f.flight_date,
            f.flight_time
        FROM 
            flights f
        INNER JOIN 
            group_flights gf ON f.id = gf.flight_id
        WHERE 
            gf.group_id = $1
        ORDER BY 
            f.flight_date ASC, f.flight_time ASC
    `;
    
    const flightsResult = await client.query(flightsQuery, [groupId]);
    
    // Separate flights by type
    const arrivalFlights = flightsResult.rows.filter(f => f.flight_type === 'arrival');
    const departureFlights = flightsResult.rows.filter(f => f.flight_type === 'departure');
    
    return { arrivalFlights, departureFlights };
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
  // Updated import groups logic - removed flight columns from groups table
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
            const { 
                agency = null, groupName, arrivalDate, departureDate,
                studentAllocation = null, leaderAllocation = null, studentBookings = null, leaderBookings = null,
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
                // Updated query - removed flight columns and timestamp columns that don't exist
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
  // Updated get all groups logic - removed flight columns, now includes flight arrays
    let client;
    try {
        client = await pool.connect();
        // Get basic group information without flight columns
        const result = await client.query(`
            SELECT id, group_name, agency, arrival_date, departure_date, 
                   student_allocation, leader_allocation, student_bookings, leader_bookings, centre 
            FROM "groups" 
            ORDER BY arrival_date DESC, group_name ASC
        `);
        
        // For each group, fetch associated flights
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
        
        res.status(200).json({ success: true, groups: groupsWithFlights });
    } catch (err) { 
        console.error('Error fetching groups:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch groups.' });
    } finally { 
        if (client) client.release(); 
    }
});

app.get('/api/groups/:groupId', async (req, res) => {
  // Updated get single group details logic - removed flight columns, now includes flight arrays
    const { groupId } = req.params;
    let client;
    try {
        client = await pool.connect();
        // Get basic group information without flight columns
        const result = await client.query(`
            SELECT id, group_name, agency, arrival_date, departure_date, 
                   student_allocation, leader_allocation, student_bookings, leader_bookings, centre 
            FROM "groups" 
            WHERE id = $1
        `, [groupId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }
        
        const group = result.rows[0];
        
        // Fetch associated flights
        const { arrivalFlights, departureFlights } = await fetchGroupFlights(client, groupId);
        
        res.status(200).json({
            success: true,
            group: {
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
            }
        });
    } catch (err) { 
        console.error('Error fetching group details:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch group details.' });
    } finally { 
        if (client) client.release(); 
    }
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
            `SELECT id FROM "groups" WHERE LOWER(centre) = LOWER($1)`,
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

// --- UPDATED: New endpoint for managing group-flight associations ---
app.post('/api/groups/:groupId/flights', async (req, res) => {
    const { groupId } = req.params;
    const { flights } = req.body; // Array of flight objects: [{ flight_type, flight_date, flight_time, flight_code, airport }]

    // Basic validation
    if (!flights || !Array.isArray(flights)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required field: flights (must be an array)' 
        });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // First, remove all existing flight associations for this group
        await client.query('DELETE FROM group_flights WHERE group_id = $1', [groupId]);

        const associatedFlights = [];

        // Process each flight
        for (const flightData of flights) {
            const { flight_type, flight_date, flight_time, flight_code, airport } = flightData;

            // Validate required fields
            if (!flight_type || !flight_date || !flight_time || !flight_code) {
                throw new Error(`Missing required flight fields: flight_type, flight_date, flight_time, flight_code`);
            }

            // Check if flight already exists
            let flightResult = await client.query(
                'SELECT id FROM flights WHERE flight_type = $1 AND flight_date = $2 AND flight_time = $3 AND flight_code = $4',
                [flight_type.toLowerCase(), flight_date, flight_time, flight_code]
            );

            let flightId;
            if (flightResult.rows.length > 0) {
                // Flight exists, use existing ID
                flightId = flightResult.rows[0].id;
            } else {
                // Create new flight
                const newFlightResult = await client.query(
                    'INSERT INTO flights (flight_type, flight_date, flight_time, flight_code) VALUES ($1, $2, $3, $4) RETURNING id',
                    [flight_type.toLowerCase(), flight_date, flight_time, flight_code]
                );
                flightId = newFlightResult.rows[0].id;
            }

            // Associate flight with group
            await client.query(
                'INSERT INTO group_flights (group_id, flight_id) VALUES ($1, $2)',
                [groupId, flightId]
            );

            associatedFlights.push({
                flight_id: flightId,
                flight_type: flight_type.toLowerCase(),
                flight_date,
                flight_time,
                flight_code,
                airport
            });
        }

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `Successfully associated ${associatedFlights.length} flights with group`,
            flights: associatedFlights
        });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error managing group flights:', err.stack);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Failed to manage group flights' 
        });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to remove a specific flight association from a group ---
app.delete('/api/groups/:groupId/flights/:flightId', async (req, res) => {
    const { groupId, flightId } = req.params;

    let client;
    try {
        client = await pool.connect();
        
        // Check if the association exists
        const checkResult = await client.query(
            'SELECT * FROM group_flights WHERE group_id = $1 AND flight_id = $2',
            [groupId, flightId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Flight association not found for this group'
            });
        }

        // Remove the association
        await client.query(
            'DELETE FROM group_flights WHERE group_id = $1 AND flight_id = $2',
            [groupId, flightId]
        );

        res.status(200).json({
            success: true,
            message: 'Flight association removed successfully'
        });

    } catch (err) {
        console.error('Error removing flight association:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to remove flight association'
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
                g.centre,
                g.student_allocation,
                g.leader_allocation
            FROM group_programme_slots gps
            JOIN "groups" g ON g.id = gps.group_id
            WHERE gps.description = $1
            AND gps.slot_type IN ('ACTIVITY_MORNING', 'ACTIVITY_AFTERNOON')
            ORDER BY gps.slot_date ASC, g.centre ASC
        `, [activityName]);

        // Process the data to get daily totals per centre
        const participationData = {};
        result.rows.forEach(row => {
            const date = formatDateToYYYYMMDD(row.slot_date);
            const centre = row.centre;
            
            if (!participationData[date]) {
                participationData[date] = {};
            }
            if (!participationData[date][centre]) {
                participationData[date][centre] = {
                    students: 0,
                    leaders: 0
                };
            }
            
            participationData[date][centre].students += row.student_allocation || 0;
            participationData[date][centre].leaders += row.leader_allocation || 0;
        });

        res.status(200).json({ 
            success: true, 
            participationData,
            dates: Object.keys(participationData).sort(),
            centres: [...new Set(result.rows.map(row => row.centre))].sort()
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

// --- NEW: Endpoint to fetch groups associated with a specific flight ---
app.get('/api/flights/:flightId/groups', async (req, res) => {
    const { flightId } = req.params;
    let client;
    try {
        client = await pool.connect();
        
        // Get groups associated with this flight through the group_flights linking table
        const result = await client.query(`
            SELECT 
                g.id, 
                g.group_name as "groupName", 
                g.agency as "agency", 
                g.arrival_date as "arrivalDate", 
                g.departure_date as "departureDate", 
                g.centre as "centre",
                g.student_allocation as "studentAllocation",
                g.leader_allocation as "leaderAllocation"
            FROM "groups" g
            INNER JOIN group_flights gf ON g.id = gf.group_id
            WHERE gf.flight_id = $1
            ORDER BY g.group_name ASC
        `, [flightId]);

        // Format the dates for frontend consumption
        const groups = result.rows.map(row => ({
            ...row,
            arrivalDate: formatDateToYYYYMMDD(row.arrivalDate),
            departureDate: formatDateToYYYYMMDD(row.departureDate)
        }));

        res.status(200).json({ success: true, groups });
    } catch (err) {
        console.error('Error fetching groups for flight:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch groups for flight.' });
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

// --- NEW: Endpoint to Create a New Group ---
app.post('/api/groups', async (req, res) => {
    const {
        groupName, agency, arrivalDate, departureDate,
        studentAllocation, leaderAllocation, centre,
        studentBookings, leaderBookings
    } = req.body;

    // Basic Validation
    if (!groupName || !arrivalDate || !departureDate) {
        return res.status(400).json({ success: false, message: 'Missing required fields: GroupName, ArrivalDate, DepartureDate.' });
    }

    let client;
    try {
        client = await pool.connect();
        // Updated query - removed flight columns and timestamp columns that don't exist
        const insertQuery = `
            INSERT INTO "groups" (
                "GroupName", "Agency", "ArrivalDate", "DepartureDate",
                "StudentAllocation", "LeaderAllocation", "Centre",
                "StudentBookings", "LeaderBookings"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const params = [
            groupName, agency, formatDateToYYYYMMDD(arrivalDate), formatDateToYYYYMMDD(departureDate),
            studentAllocation ? parseInt(studentAllocation, 10) : null,
            leaderAllocation ? parseInt(leaderAllocation, 10) : null,
            centre,
            studentBookings ? parseInt(studentBookings, 10) : null,
            leaderBookings ? parseInt(leaderBookings, 10) : null
        ];

        const result = await client.query(insertQuery, params);
        const newGroup = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Group created successfully.',
            group: {
                id: newGroup.id,
                groupName: newGroup.group_name,
                agency: newGroup.agency,
                arrivalDate: formatDateToYYYYMMDD(newGroup.arrival_date),
                departureDate: formatDateToYYYYMMDD(newGroup.departure_date),
                studentAllocation: newGroup.student_allocation,
                leaderAllocation: newGroup.leader_allocation,
                centre: newGroup.centre,
                studentBookings: newGroup.student_bookings,
                leaderBookings: newGroup.leader_bookings,
                arrivalFlights: [],
                departureFlights: []
            }
        });
    } catch (err) {
        console.error('Error creating group:', err.stack);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ success: false, message: `Failed to create group. A group with the name "${groupName}" likely already exists.` });
        }
        res.status(500).json({ success: false, message: 'Failed to create group.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Update an Existing Group ---
app.put('/api/groups/:groupId', async (req, res) => {
    const { groupId } = req.params;
    const {
        groupName, agency, arrivalDate, departureDate,
        studentAllocation, leaderAllocation, centre,
        studentBookings, leaderBookings
    } = req.body;

    // Basic Validation
    if (!groupName || !arrivalDate || !departureDate) {
        return res.status(400).json({ success: false, message: 'Missing required fields: GroupName, ArrivalDate, DepartureDate.' });
    }
    if (isNaN(parseInt(groupId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid Group ID.'});
    }

    let client;
    try {
        client = await pool.connect();
        // Updated query - removed flight columns and timestamp columns that don't exist
        const updateQuery = `
            UPDATE "groups" SET
                group_name = $1, agency = $2, arrival_date = $3, departure_date = $4,
                student_allocation = $5, leader_allocation = $6, centre = $7,
                student_bookings = $8, leader_bookings = $9
            WHERE id = $10
            RETURNING *;
        `;
        const params = [
            groupName, agency, formatDateToYYYYMMDD(arrivalDate), formatDateToYYYYMMDD(departureDate),
            studentAllocation ? parseInt(studentAllocation, 10) : null,
            leaderAllocation ? parseInt(leaderAllocation, 10) : null,
            centre,
            studentBookings ? parseInt(studentBookings, 10) : null,
            leaderBookings ? parseInt(leaderBookings, 10) : null,
            parseInt(groupId, 10)
        ];

        const result = await client.query(updateQuery, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found or no changes made.' });
        }
        const updatedGroup = result.rows[0];

        // Fetch associated flights for the response
        const { arrivalFlights, departureFlights } = await fetchGroupFlights(client, groupId);

        res.status(200).json({
            success: true,
            message: 'Group updated successfully.',
            group: {
                id: updatedGroup.id,
                groupName: updatedGroup.group_name,
                agency: updatedGroup.agency,
                arrivalDate: formatDateToYYYYMMDD(updatedGroup.arrival_date),
                departureDate: formatDateToYYYYMMDD(updatedGroup.departure_date),
                studentAllocation: updatedGroup.student_allocation,
                leaderAllocation: updatedGroup.leader_allocation,
                centre: updatedGroup.centre,
                studentBookings: updatedGroup.student_bookings,
                leaderBookings: updatedGroup.leader_bookings,
                arrivalFlights: arrivalFlights,
                departureFlights: departureFlights
            }
        });
    } catch (err) {
        console.error('Error updating group:', err.stack);
         if (err.code === '23505') { // Unique violation for GroupName
            return res.status(409).json({ success: false, message: `Failed to update group. Another group with the name "${groupName}" may already exist.` });
        }
        res.status(500).json({ success: false, message: 'Failed to update group.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Delete a Group ---
app.delete('/api/groups/:groupId', async (req, res) => {
    const { groupId } = req.params;

    // Basic Validation
    if (isNaN(parseInt(groupId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid Group ID.' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        
        // First check if the group exists
        const checkQuery = 'SELECT id, group_name FROM "groups" WHERE id = $1';
        const checkResult = await client.query(checkQuery, [parseInt(groupId, 10)]);
        
        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        const groupName = checkResult.rows[0].group_name;

        // Delete associated flight relationships first
        await client.query('DELETE FROM group_flights WHERE group_id = $1', [parseInt(groupId, 10)]);

        // Delete the group
        const deleteQuery = 'DELETE FROM "groups" WHERE id = $1';
        await client.query(deleteQuery, [parseInt(groupId, 10)]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `Group "${groupName}" deleted successfully.`
        });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error deleting group:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to delete group.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoints for Participants ---

// Helper function to validate participant data
const validateParticipantData = (data) => {
    const errors = [];
    
    if (!data.first_name || !data.first_name.trim()) {
        errors.push('First name is required');
    }
    if (!data.last_name || !data.last_name.trim()) {
        errors.push('Last name is required');
    }
    if (!data.participant_type || !['student', 'leader'].includes(data.participant_type)) {
        errors.push('Participant type must be either "student" or "leader"');
    }
    if (data.sex && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(data.sex)) {
        errors.push('Invalid sex value');
    }
    if (data.test_score !== null && data.test_score !== undefined) {
        const score = parseInt(data.test_score, 10);
        if (isNaN(score) || score < 0 || score > 50) {
            errors.push('Test score must be between 0 and 50');
        }
    }
    
    return errors;
};

// GET /api/participants - Fetch all participants with pagination and optional sorting
app.get('/api/participants', async (req, res) => {
    const { 
        page = 1, 
        limit = 50, 
        sortBy = 'last_name', 
        sortOrder = 'ASC',
        groupId,
        participantType,
        search
    } = req.query;

    let client;
    try {
        client = await pool.connect();
        
        // Build the query with optional filters
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        let paramCount = 0;

        if (groupId) {
            paramCount++;
            whereClause += ` AND p.group_id = $${paramCount}`;
            queryParams.push(parseInt(groupId, 10));
        }

        if (participantType) {
            paramCount++;
            whereClause += ` AND p.participant_type = $${paramCount}`;
            queryParams.push(participantType);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (LOWER(p.first_name) LIKE $${paramCount} OR LOWER(p.last_name) LIKE $${paramCount} OR LOWER(p.passport_number) LIKE $${paramCount})`;
            queryParams.push(`%${search.toLowerCase()}%`);
        }

        // Validate sort parameters
        const allowedSortFields = ['first_name', 'last_name', 'participant_type', 'date_of_birth', 'test_score', 'id'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'last_name';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        // Calculate offset for pagination
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        // Main query with JOIN to get group name
        const query = `
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.date_of_birth,
                p.sex,
                p.participant_type,
                p.group_id,
                p.nationality,
                p.passport_number,
                p.passport_issue_date,
                p.passport_expiry_date,
                p.dietary_allergies,
                p.medical_issues,
                p.test_score,
                g.group_name as group_name
            FROM participants p
            LEFT JOIN "groups" g ON p.group_id = g.id
            ${whereClause}
            ORDER BY p.${validSortBy} ${validSortOrder}
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(parseInt(limit, 10), offset);

        const result = await client.query(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM participants p
            LEFT JOIN "groups" g ON p.group_id = g.id
            ${whereClause}
        `;
        const countResult = await client.query(countQuery, queryParams.slice(0, paramCount));
        const totalCount = parseInt(countResult.rows[0].total, 10);

        res.status(200).json({
            success: true,
            participants: result.rows,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
                totalCount,
                limit: parseInt(limit, 10)
            }
        });
    } catch (err) {
        console.error('Error fetching participants:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch participants.' });
    } finally {
        if (client) client.release();
    }
});

// POST /api/participants - Create a new participant
app.post('/api/participants', async (req, res) => {
    const {
        first_name, last_name, date_of_birth, sex, participant_type,
        group_id, nationality, passport_number, passport_issue_date,
        passport_expiry_date, dietary_allergies, medical_issues, test_score
    } = req.body;

    // Validate input
    const validationErrors = validateParticipantData(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: validationErrors 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if group exists if group_id is provided
        if (group_id) {
            const groupCheck = await client.query('SELECT id FROM "groups" WHERE id = $1', [group_id]);
            if (groupCheck.rows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid group ID. Group does not exist.' 
                });
            }
        }

        const insertQuery = `
            INSERT INTO participants (
                first_name, last_name, date_of_birth, sex, participant_type,
                group_id, nationality, passport_number, passport_issue_date,
                passport_expiry_date, dietary_allergies, medical_issues, test_score
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const params = [
            first_name.trim(),
            last_name.trim(),
            date_of_birth || null,
            sex || null,
            participant_type,
            group_id ? parseInt(group_id, 10) : null,
            nationality || null,
            passport_number || null,
            passport_issue_date || null,
            passport_expiry_date || null,
            dietary_allergies || null,
            medical_issues || null,
            test_score ? parseInt(test_score, 10) : null
        ];

        const result = await client.query(insertQuery, params);
        
        res.status(201).json({
            success: true,
            message: 'Participant created successfully.',
            participant: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating participant:', err.stack);
        if (err.code === '23505') { // Unique violation (passport number)
            return res.status(409).json({ 
                success: false, 
                message: 'A participant with this passport number already exists.' 
            });
        }
        res.status(500).json({ success: false, message: 'Failed to create participant.' });
    } finally {
        if (client) client.release();
    }
});

// GET /api/participants/:id - Fetch a single participant by ID
app.get('/api/participants/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid participant ID.' });
    }

    let client;
    try {
        client = await pool.connect();
        
        const query = `
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.date_of_birth,
                p.sex,
                p.participant_type,
                p.group_id,
                p.nationality,
                p.passport_number,
                p.passport_issue_date,
                p.passport_expiry_date,
                p.dietary_allergies,
                p.medical_issues,
                p.test_score,
                g.group_name as group_name
            FROM participants p
            LEFT JOIN "groups" g ON p.group_id = g.id
            WHERE p.id = $1
        `;

        const result = await client.query(query, [parseInt(id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Participant not found.' });
        }

        res.status(200).json({
            success: true,
            participant: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching participant:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch participant.' });
    } finally {
        if (client) client.release();
    }
});

// PUT /api/participants/:id - Update an existing participant
app.put('/api/participants/:id', async (req, res) => {
    const { id } = req.params;
    const {
        first_name, last_name, date_of_birth, sex, participant_type,
        group_id, nationality, passport_number, passport_issue_date,
        passport_expiry_date, dietary_allergies, medical_issues, test_score
    } = req.body;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid participant ID.' });
    }

    // Validate input
    const validationErrors = validateParticipantData(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: validationErrors 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if participant exists
        const existsCheck = await client.query('SELECT id FROM participants WHERE id = $1', [parseInt(id, 10)]);
        if (existsCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Participant not found.' });
        }

        // Check if group exists if group_id is provided
        if (group_id) {
            const groupCheck = await client.query('SELECT id FROM "groups" WHERE id = $1', [group_id]);
            if (groupCheck.rows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid group ID. Group does not exist.' 
                });
            }
        }

        const updateQuery = `
            UPDATE participants SET
                first_name = $1,
                last_name = $2,
                date_of_birth = $3,
                sex = $4,
                participant_type = $5,
                group_id = $6,
                nationality = $7,
                passport_number = $8,
                passport_issue_date = $9,
                passport_expiry_date = $10,
                dietary_allergies = $11,
                medical_issues = $12,
                test_score = $13
            WHERE id = $14
            RETURNING *
        `;

        const params = [
            first_name.trim(),
            last_name.trim(),
            date_of_birth || null,
            sex || null,
            participant_type,
            group_id ? parseInt(group_id, 10) : null,
            nationality || null,
            passport_number || null,
            passport_issue_date || null,
            passport_expiry_date || null,
            dietary_allergies || null,
            medical_issues || null,
            test_score ? parseInt(test_score, 10) : null,
            parseInt(id, 10)
        ];

        const result = await client.query(updateQuery, params);

        res.status(200).json({
            success: true,
            message: 'Participant updated successfully.',
            participant: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating participant:', err.stack);
        if (err.code === '23505') { // Unique violation (passport number)
            return res.status(409).json({ 
                success: false, 
                message: 'A participant with this passport number already exists.' 
            });
        }
        res.status(500).json({ success: false, message: 'Failed to update participant.' });
    } finally {
        if (client) client.release();
    }
});

// DELETE /api/participants/:id - Delete a participant
app.delete('/api/participants/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid participant ID.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if participant exists
        const existsCheck = await client.query('SELECT id, first_name, last_name FROM participants WHERE id = $1', [parseInt(id, 10)]);
        if (existsCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Participant not found.' });
        }

        const participant = existsCheck.rows[0];

        // Delete the participant
        await client.query('DELETE FROM participants WHERE id = $1', [parseInt(id, 10)]);

        res.status(200).json({
            success: true,
            message: `Participant "${participant.first_name} ${participant.last_name}" deleted successfully.`
        });
    } catch (err) {
        console.error('Error deleting participant:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to delete participant.' });
    } finally {
        if (client) client.release();
    }
});

// GET /api/groups/:groupId/participants - Fetch all participants for a specific group
app.get('/api/groups/:groupId/participants', async (req, res) => {
    const { groupId } = req.params;

    if (isNaN(parseInt(groupId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid group ID.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if group exists
        const groupCheck = await client.query('SELECT id, group_name FROM "groups" WHERE id = $1', [parseInt(groupId, 10)]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        const query = `
            SELECT 
                id,
                first_name,
                last_name,
                date_of_birth,
                sex,
                participant_type,
                nationality,
                passport_number,
                passport_issue_date,
                passport_expiry_date,
                dietary_allergies,
                medical_issues,
                test_score
            FROM participants
            WHERE group_id = $1
            ORDER BY last_name ASC, first_name ASC
        `;

        const result = await client.query(query, [parseInt(groupId, 10)]);

        res.status(200).json({
            success: true,
            participants: result.rows,
            group: groupCheck.rows[0]
        });
    } catch (err) {
        console.error('Error fetching group participants:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch group participants.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoints for Transfers Management ---

// GET /api/transfers - Fetch all transfers with optional filtering and pagination
app.get('/api/transfers', async (req, res) => {
    const { 
        page = 1, 
        limit = 50, 
        type, 
        search,
        sortBy = 'transfer_date',
        sortOrder = 'DESC'
    } = req.query;

    let client;
    try {
        client = await pool.connect();
        
        // Build the query with optional filters
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        let paramCount = 0;

        if (type && ['arrival', 'departure'].includes(type)) {
            paramCount++;
            whereClause += ` AND t.type = $${paramCount}`;
            queryParams.push(type);
        }

        if (search) {
            paramCount++;
            whereClause += ` AND (LOWER(t.origin_location) LIKE $${paramCount} OR LOWER(t.destination_location) LIKE $${paramCount} OR LOWER(f.flight_code) LIKE $${paramCount})`;
            queryParams.push(`%${search.toLowerCase()}%`);
        }

        // Validate sort parameters
        const allowedSortFields = ['transfer_date', 'transfer_time', 'type', 'origin_location', 'destination_location', 'capacity', 'id'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'transfer_date';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        // Calculate offset for pagination
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        // Main query with JOIN to get flight information
        const query = `
            SELECT 
                t.id,
                t.type,
                t.transfer_date,
                t.transfer_time,
                t.flight_id,
                t.origin_location,
                t.destination_location,
                t.capacity,
                t.supplier_details,
                t.notes,
                t.created_at,
                t.updated_at,
                f.flight_code,
                f.flight_type as flight_type
            FROM transfers t
            LEFT JOIN flights f ON t.flight_id = f.id
            ${whereClause}
            ORDER BY t.${validSortBy} ${validSortOrder}, t.transfer_time ${validSortOrder}
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        queryParams.push(parseInt(limit, 10), offset);

        const result = await client.query(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM transfers t
            LEFT JOIN flights f ON t.flight_id = f.id
            ${whereClause}
        `;
        const countResult = await client.query(countQuery, queryParams.slice(0, paramCount));
        const totalCount = parseInt(countResult.rows[0].total, 10);

        res.status(200).json({
            success: true,
            transfers: result.rows,
            pagination: {
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
                totalCount,
                limit: parseInt(limit, 10)
            }
        });
    } catch (err) {
        console.error('Error fetching transfers:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch transfers.' });
    } finally {
        if (client) client.release();
    }
});

// POST /api/transfers - Create a new transfer
app.post('/api/transfers', async (req, res) => {
    const {
        type, transfer_date, transfer_time, flight_id,
        origin_location, destination_location, capacity,
        supplier_details, notes
    } = req.body;

    // Validate required fields
    if (!type || !transfer_date || !transfer_time || !origin_location || !destination_location) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: type, transfer_date, transfer_time, origin_location, destination_location' 
        });
    }

    // Validate type
    if (!['arrival', 'departure'].includes(type)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid type. Must be "arrival" or "departure"' 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if flight exists if flight_id is provided
        if (flight_id) {
            const flightCheck = await client.query('SELECT id FROM flights WHERE id = $1', [flight_id]);
            if (flightCheck.rows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid flight ID. Flight does not exist.' 
                });
            }
        }

        const insertQuery = `
            INSERT INTO transfers (
                type, transfer_date, transfer_time, flight_id,
                origin_location, destination_location, capacity,
                supplier_details, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const params = [
            type,
            transfer_date,
            transfer_time,
            flight_id ? parseInt(flight_id, 10) : null,
            origin_location.trim(),
            destination_location.trim(),
            capacity ? parseInt(capacity, 10) : null,
            supplier_details || null,
            notes || null
        ];

        const result = await client.query(insertQuery, params);
        
        res.status(201).json({
            success: true,
            message: 'Transfer created successfully.',
            transfer: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating transfer:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to create transfer.' });
    } finally {
        if (client) client.release();
    }
});

// GET /api/transfers/:id - Fetch a single transfer by ID
app.get('/api/transfers/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid transfer ID.' });
    }

    let client;
    try {
        client = await pool.connect();
        
        const query = `
            SELECT 
                t.id,
                t.type,
                t.transfer_date,
                t.transfer_time,
                t.flight_id,
                t.origin_location,
                t.destination_location,
                t.capacity,
                t.supplier_details,
                t.notes,
                t.created_at,
                t.updated_at,
                f.flight_code,
                f.flight_type as flight_type,
                f.flight_date,
                f.flight_time
            FROM transfers t
            LEFT JOIN flights f ON t.flight_id = f.id
            WHERE t.id = $1
        `;

        const result = await client.query(query, [parseInt(id, 10)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transfer not found.' });
        }

        res.status(200).json({
            success: true,
            transfer: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching transfer:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch transfer.' });
    } finally {
        if (client) client.release();
    }
});

// PUT /api/transfers/:id - Update an existing transfer
app.put('/api/transfers/:id', async (req, res) => {
    const { id } = req.params;
    const {
        type, transfer_date, transfer_time, flight_id,
        origin_location, destination_location, capacity,
        supplier_details, notes
    } = req.body;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid transfer ID.' });
    }

    // Validate required fields
    if (!type || !transfer_date || !transfer_time || !origin_location || !destination_location) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: type, transfer_date, transfer_time, origin_location, destination_location' 
        });
    }

    // Validate type
    if (!['arrival', 'departure'].includes(type)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid type. Must be "arrival" or "departure"' 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if transfer exists
        const existsCheck = await client.query('SELECT id FROM transfers WHERE id = $1', [parseInt(id, 10)]);
        if (existsCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transfer not found.' });
        }

        // Check if flight exists if flight_id is provided
        if (flight_id) {
            const flightCheck = await client.query('SELECT id FROM flights WHERE id = $1', [flight_id]);
            if (flightCheck.rows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid flight ID. Flight does not exist.' 
                });
            }
        }

        const updateQuery = `
            UPDATE transfers SET
                type = $1,
                transfer_date = $2,
                transfer_time = $3,
                flight_id = $4,
                origin_location = $5,
                destination_location = $6,
                capacity = $7,
                supplier_details = $8,
                notes = $9,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING *
        `;

        const params = [
            type,
            transfer_date,
            transfer_time,
            flight_id ? parseInt(flight_id, 10) : null,
            origin_location.trim(),
            destination_location.trim(),
            capacity ? parseInt(capacity, 10) : null,
            supplier_details || null,
            notes || null,
            parseInt(id, 10)
        ];

        const result = await client.query(updateQuery, params);

        res.status(200).json({
            success: true,
            message: 'Transfer updated successfully.',
            transfer: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating transfer:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to update transfer.' });
    } finally {
        if (client) client.release();
    }
});

// DELETE /api/transfers/:id - Delete a transfer
app.delete('/api/transfers/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid transfer ID.' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Check if transfer exists and get details
        const existsCheck = await client.query('SELECT id, origin_location, destination_location FROM transfers WHERE id = $1', [parseInt(id, 10)]);
        if (existsCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Transfer not found.' });
        }

        const transfer = existsCheck.rows[0];

        // Check if transfer is assigned to any groups
        const assignmentCheck = await client.query('SELECT COUNT(*) as count FROM group_transfers WHERE transfer_id = $1', [parseInt(id, 10)]);
        const assignmentCount = parseInt(assignmentCheck.rows[0].count, 10);

        if (assignmentCount > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete transfer. It is currently assigned to ${assignmentCount} group(s). Please unassign it first.` 
            });
        }

        // Delete the transfer
        await client.query('DELETE FROM transfers WHERE id = $1', [parseInt(id, 10)]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `Transfer from "${transfer.origin_location}" to "${transfer.destination_location}" deleted successfully.`
        });
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Error deleting transfer:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to delete transfer.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoints for Group-Transfer Assignments ---

// GET /api/groups/:groupId/transfers - Fetch all transfers assigned to a specific group
app.get('/api/groups/:groupId/transfers', async (req, res) => {
    const { groupId } = req.params;

    if (isNaN(parseInt(groupId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid group ID.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if group exists
        const groupCheck = await client.query('SELECT id, group_name FROM "groups" WHERE id = $1', [parseInt(groupId, 10)]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        const query = `
            SELECT 
                gt.id as assignment_id,
                gt.pax_count_for_group,
                gt.assignment_notes,
                gt.created_at as assigned_at,
                t.id as transfer_id,
                t.type,
                t.transfer_date,
                t.transfer_time,
                t.origin_location,
                t.destination_location,
                t.capacity,
                t.supplier_details,
                t.notes as transfer_notes,
                f.flight_code,
                f.flight_type as flight_type,
                f.flight_date,
                f.flight_time
            FROM group_transfers gt
            INNER JOIN transfers t ON gt.transfer_id = t.id
            LEFT JOIN flights f ON t.flight_id = f.id
            WHERE gt.group_id = $1
            ORDER BY t.transfer_date ASC, t.transfer_time ASC
        `;

        const result = await client.query(query, [parseInt(groupId, 10)]);

        res.status(200).json({
            success: true,
            transfers: result.rows,
            group: groupCheck.rows[0]
        });
    } catch (err) {
        console.error('Error fetching group transfers:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch group transfers.' });
    } finally {
        if (client) client.release();
    }
});

// POST /api/groups/:groupId/transfers - Assign an existing transfer to a group
app.post('/api/groups/:groupId/transfers', async (req, res) => {
    const { groupId } = req.params;
    const { transfer_id, pax_count_for_group, assignment_notes } = req.body;

    if (isNaN(parseInt(groupId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid group ID.' });
    }

    // Validate required fields
    if (!transfer_id || !pax_count_for_group) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: transfer_id, pax_count_for_group' 
        });
    }

    if (parseInt(pax_count_for_group, 10) <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'pax_count_for_group must be greater than 0' 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if group exists
        const groupCheck = await client.query('SELECT id FROM "groups" WHERE id = $1', [parseInt(groupId, 10)]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        // Check if transfer exists
        const transferCheck = await client.query('SELECT id, capacity FROM transfers WHERE id = $1', [parseInt(transfer_id, 10)]);
        if (transferCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transfer not found.' });
        }

        // Check if assignment already exists
        const existingAssignment = await client.query(
            'SELECT id FROM group_transfers WHERE group_id = $1 AND transfer_id = $2',
            [parseInt(groupId, 10), parseInt(transfer_id, 10)]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'This transfer is already assigned to this group.' 
            });
        }

        const insertQuery = `
            INSERT INTO group_transfers (
                group_id, transfer_id, pax_count_for_group, assignment_notes
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const params = [
            parseInt(groupId, 10),
            parseInt(transfer_id, 10),
            parseInt(pax_count_for_group, 10),
            assignment_notes || null
        ];

        const result = await client.query(insertQuery, params);

        res.status(201).json({
            success: true,
            message: 'Transfer assigned to group successfully.',
            assignment: result.rows[0]
        });
    } catch (err) {
        console.error('Error assigning transfer to group:', err.stack);
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ 
                success: false, 
                message: 'This transfer is already assigned to this group.' 
            });
        }
        res.status(500).json({ success: false, message: 'Failed to assign transfer to group.' });
    } finally {
        if (client) client.release();
    }
});

// PUT /api/groups/:groupId/transfers/:assignmentId - Update a group-transfer assignment
app.put('/api/groups/:groupId/transfers/:assignmentId', async (req, res) => {
    const { groupId, assignmentId } = req.params;
    const { pax_count_for_group, assignment_notes } = req.body;

    if (isNaN(parseInt(groupId, 10)) || isNaN(parseInt(assignmentId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid group ID or assignment ID.' });
    }

    // Validate required fields
    if (!pax_count_for_group) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required field: pax_count_for_group' 
        });
    }

    if (parseInt(pax_count_for_group, 10) <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'pax_count_for_group must be greater than 0' 
        });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if assignment exists and belongs to the group
        const existsCheck = await client.query(
            'SELECT id FROM group_transfers WHERE id = $1 AND group_id = $2',
            [parseInt(assignmentId, 10), parseInt(groupId, 10)]
        );

        if (existsCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transfer assignment not found for this group.' });
        }

        const updateQuery = `
            UPDATE group_transfers SET
                pax_count_for_group = $1,
                assignment_notes = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND group_id = $4
            RETURNING *
        `;

        const params = [
            parseInt(pax_count_for_group, 10),
            assignment_notes || null,
            parseInt(assignmentId, 10),
            parseInt(groupId, 10)
        ];

        const result = await client.query(updateQuery, params);

        res.status(200).json({
            success: true,
            message: 'Transfer assignment updated successfully.',
            assignment: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating transfer assignment:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to update transfer assignment.' });
    } finally {
        if (client) client.release();
    }
});

// DELETE /api/groups/:groupId/transfers/:assignmentId - Unassign a transfer from a group
app.delete('/api/groups/:groupId/transfers/:assignmentId', async (req, res) => {
    const { groupId, assignmentId } = req.params;

    if (isNaN(parseInt(groupId, 10)) || isNaN(parseInt(assignmentId, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid group ID or assignment ID.' });
    }

    let client;
    try {
        client = await pool.connect();

        // Check if assignment exists and get details
        const existsCheck = await client.query(`
            SELECT 
                gt.id,
                t.origin_location,
                t.destination_location,
                t.type
            FROM group_transfers gt
            INNER JOIN transfers t ON gt.transfer_id = t.id
            WHERE gt.id = $1 AND gt.group_id = $2
        `, [parseInt(assignmentId, 10), parseInt(groupId, 10)]);

        if (existsCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transfer assignment not found for this group.' });
        }

        const assignment = existsCheck.rows[0];

        // Delete the assignment
        await client.query('DELETE FROM group_transfers WHERE id = $1 AND group_id = $2', [parseInt(assignmentId, 10), parseInt(groupId, 10)]);

        res.status(200).json({
            success: true,
            message: `Transfer assignment (${assignment.type}: ${assignment.origin_location} → ${assignment.destination_location}) removed from group successfully.`
        });
    } catch (err) {
        console.error('Error unassigning transfer from group:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to unassign transfer from group.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint for Sales Grid - Group Occupancy Data ---
app.get('/api/sales-grid-groups', async (req, res) => {
    const { 
        centreId, 
        centreName, 
        agencyId,
        agencyName,
        startDate, 
        endDate 
    } = req.query;

    let client;
    try {
        client = await pool.connect();
        
        // Build the query with optional filters
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        let paramCount = 0;

        // Filter by centre (either by ID or name)
        if (centreId && centreId !== 'all') {
            paramCount++;
            whereClause += ` AND g.id = $${paramCount}`;
            queryParams.push(parseInt(centreId, 10));
        } else if (centreName && centreName !== 'all') {
            paramCount++;
            whereClause += ` AND LOWER(g.centre) = LOWER($${paramCount})`;
            queryParams.push(centreName);
        }

        // Filter by agency (either by ID or name)
        if (agencyId && agencyId !== 'all') {
            paramCount++;
            whereClause += ` AND g.agency_id = $${paramCount}`;
            queryParams.push(parseInt(agencyId, 10));
        } else if (agencyName && agencyName !== 'all') {
            paramCount++;
            whereClause += ` AND LOWER(g.agency) = LOWER($${paramCount})`;
            queryParams.push(agencyName);
        }

        // Optional date range filtering for performance optimization (but not for limiting display)
        if (startDate && endDate) {
            paramCount++;
            whereClause += ` AND g.departure_date >= $${paramCount}`;
            queryParams.push(startDate);
            
            paramCount++;
            whereClause += ` AND g.arrival_date <= $${paramCount}`;
            queryParams.push(endDate);
        }

        const query = `
            SELECT 
                g.id,
                g.group_name as group_name,
                g.agency as agency,
                g.centre as centre,
                g.arrival_date as arrival_date,
                g.departure_date as departure_date,
                COALESCE(g.student_allocation, 0) as number_of_students,
                COALESCE(g.leader_allocation, 0) as number_of_leaders,
                (COALESCE(g.student_allocation, 0) + COALESCE(g.leader_allocation, 0)) as total_beds
            FROM "groups" g
            ${whereClause}
            ORDER BY g.arrival_date ASC, g.group_name ASC
        `;

        const result = await client.query(query, queryParams);

        // Format dates for frontend consumption
        const groups = result.rows.map(row => ({
            id: row.id,
            groupName: row.group_name,
            agency: row.agency,
            centre: row.centre,
            arrivalDate: formatDateToYYYYMMDD(row.arrival_date),
            departureDate: formatDateToYYYYMMDD(row.departure_date),
            numberOfStudents: row.number_of_students,
            numberOfLeaders: row.number_of_leaders,
            totalBeds: row.total_beds
        }));

        res.status(200).json({
            success: true,
            groups: groups,
            totalCount: groups.length
        });
    } catch (err) {
        console.error('Error fetching sales grid groups:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch sales grid data.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to get list of agencies for the dropdown ---
app.get('/api/agencies', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        
        const query = `
            SELECT DISTINCT agency as agency_name
            FROM "groups"
            WHERE agency IS NOT NULL AND agency != ''
            ORDER BY agency ASC
        `;

        const result = await client.query(query);
        
        const agencies = result.rows.map(row => ({
            name: row.agency_name,
            value: row.agency_name
        }));

        res.status(200).json({
            success: true,
            agencies: agencies
        });
    } catch (err) {
        console.error('Error fetching agencies:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch agencies.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to get list of centres for the dropdown ---
app.get('/api/centres', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        
        const query = `
            SELECT DISTINCT centre as centre_name
            FROM "groups"
            WHERE centre IS NOT NULL AND centre != ''
            ORDER BY centre ASC
        `;

        const result = await client.query(query);
        
        const centres = result.rows.map(row => ({
            name: row.centre_name,
            value: row.centre_name
        }));

        res.status(200).json({
            success: true,
            centres: centres
        });
    } catch (err) {
        console.error('Error fetching centres:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch centres.' });
    } finally {
        if (client) client.release();
    }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Access the server at http://localhost:${port}`);
});
