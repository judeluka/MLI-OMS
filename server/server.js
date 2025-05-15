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
    if (isNaN(d.getTime())) {
        console.warn("Invalid date passed to formatDateToYYYYMMDD:", dateObj);
        return null;
    }
    const year = d.getFullYear(); // Use getFullYear for local date parts
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


// --- Routes ---
app.get('/', (req, res) => {
  res.send('Server is running. Database connection status logged to console.');
});

app.post('/login', async (req, res) => {
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
    console.log("Received request to /api/import/groups");
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
                centre = null, flightArrivalTime = null, flightDepartureTime = null
            } = group;

            if (!groupName || !groupName.trim() || !arrivalDate || !departureDate) {
                const missing = [];
                if (!groupName || !groupName.trim()) missing.push('GroupName');
                if (!arrivalDate) missing.push('ArrivalDate');
                if (!departureDate) missing.push('DepartureDate');
                const errorDetail = `Missing mandatory fields: ${missing.join(', ')}.`;
                errors.push({ groupName: groupName || 'Unknown Group (Name Missing)', error: errorDetail });
                skippedDueToMissingFields.push(groupName || 'Unknown Group (Name Missing)');
                continue;
            }

            const sAlloc = studentAllocation !== null ? parseInt(studentAllocation, 10) : null;
            const lAlloc = leaderAllocation !== null ? parseInt(leaderAllocation, 10) : null;
            const sBook = studentBookings !== null ? parseInt(studentBookings, 10) : null;
            const lBook = leaderBookings !== null ? parseInt(leaderBookings, 10) : null;
            
            try {
                const insertQuery = `
                    INSERT INTO "groups" (
                        "GroupName", "Agency", "ArrivalDate", "DepartureDate",
                        "StudentAllocation", "LeaderAllocation", "Centre", 
                        "StudentBookings", "LeaderBookings", "FlightArrivalTime", "FlightDepartureTime"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT ("GroupName") DO NOTHING;
                `;
                const queryParams = [
                    groupName.trim(), agency, arrivalDate, departureDate,
                    isNaN(sAlloc) ? null : sAlloc, isNaN(lAlloc) ? null : lAlloc, centre,
                    isNaN(sBook) ? null : sBook, isNaN(lBook) ? null : lBook,
                    flightArrivalTime, flightDepartureTime
                ];
                const result = await client.query(insertQuery, queryParams);
                if (result.rowCount > 0) successfullyImportedCount++;
                else errors.push({ groupName, error: 'Group already exists or was not inserted (conflict on GroupName).' });
            } catch (dbError) {
                errors.push({ groupName, error: `Database error: ${dbError.message}` });
            }
        }
        await client.query('COMMIT');
        let message = `Import process finished. Successfully imported ${successfullyImportedCount} groups.`;
        if (skippedDueToMissingFields.length > 0) message += ` Skipped ${skippedDueToMissingFields.length} groups due to missing mandatory fields.`;
        const otherErrors = errors.filter(e => !skippedDueToMissingFields.includes(e.groupName || 'Unknown Group (Name Missing)'));
        if (otherErrors.length > 0) message += ` Encountered ${otherErrors.length} other errors during insertion.`;
        res.status(200).json({
            success: true, message, successfullyImportedCount,
            totalProcessed: groupsToImport.length,
            skippedCount: skippedDueToMissingFields.length, errors,
        });
    } catch (transactionError) {
        if (client) { try { await client.query('ROLLBACK'); } catch (rbError) { console.error("Rollback error:", rbError.stack); } }
        console.error('Transaction error during group import:', transactionError.stack);
        res.status(500).json({ success: false, message: 'An internal server error occurred during the import transaction.' });
    } finally {
        if (client) client.release();
    }
});

app.get('/api/groups', async (req, res) => {
    console.log("Received request to GET /api/groups");
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`
            SELECT 
                id, "GroupName", "Agency", "ArrivalDate", "DepartureDate", 
                "StudentAllocation", "LeaderAllocation", "StudentBookings", "LeaderBookings", 
                "Centre", "FlightArrivalTime", "FlightDepartureTime" 
            FROM "groups" 
            ORDER BY "ArrivalDate" DESC, "GroupName" ASC
        `);
        
        const groups = result.rows.map(row => ({
            id: row.id,
            agency: row.Agency,
            groupName: row.GroupName,
            arrivalDate: formatDateToYYYYMMDD(row.ArrivalDate),
            departureDate: formatDateToYYYYMMDD(row.DepartureDate),
            studentAllocation: row.StudentAllocation,
            leaderAllocation: row.LeaderAllocation,
            studentBookings: row.StudentBookings,
            leaderBookings: row.LeaderBookings,
            centre: row.Centre,
            flightArrivalTime: row.FlightArrivalTime,
            flightDepartureTime: row.FlightDepartureTime
        }));
        res.status(200).json({ success: true, groups: groups });
    } catch (err) {
        console.error('Error fetching groups:', err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch groups.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch a Single Group's Details ---
app.get('/api/groups/:groupId', async (req, res) => {
    const { groupId } = req.params;
    console.log(`Received request to GET /api/groups/${groupId}`);
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(
            `SELECT 
                id, "GroupName", "Agency", "ArrivalDate", "DepartureDate", 
                "StudentAllocation", "LeaderAllocation", "StudentBookings", "LeaderBookings", 
                "Centre", "FlightArrivalTime", "FlightDepartureTime" 
             FROM "groups" WHERE id = $1`,
            [groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Group not found.' });
        }

        const group = result.rows[0];
        res.status(200).json({
            success: true,
            group: { // Map to camelCase for frontend consistency
                id: group.id,
                agency: group.Agency,
                groupName: group.GroupName,
                arrivalDate: formatDateToYYYYMMDD(group.ArrivalDate),
                departureDate: formatDateToYYYYMMDD(group.DepartureDate),
                studentAllocation: group.StudentAllocation,
                leaderAllocation: group.LeaderAllocation,
                studentBookings: group.StudentBookings,
                leaderBookings: group.LeaderBookings,
                centre: group.Centre,
                flightArrivalTime: group.FlightArrivalTime,
                flightDepartureTime: group.FlightDepartureTime
            }
        });
    } catch (err) {
        console.error(`Error fetching group ${groupId}:`, err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch group details.' });
    } finally {
        if (client) client.release();
    }
});

// --- NEW: Endpoint to Fetch Participants for a Group ---
app.get('/api/groups/:groupId/participants', async (req, res) => {
    const { groupId } = req.params;
    console.log(`Received request to GET /api/groups/${groupId}/participants`);
    let client;
    try {
        client = await pool.connect();
        // Adjust column names to match your 'participants' table schema
        const result = await client.query(
            `SELECT 
                id, type, first_name, surname, age, dob, test_level, allergies, notes 
             FROM participants WHERE group_id = $1 ORDER BY type DESC, surname ASC, first_name ASC`,
            [groupId]
        );
        
        // Map database column names (snake_case) to camelCase keys for the frontend
        const participants = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            firstName: row.first_name,
            surname: row.surname,
            age: row.age,
            dob: formatDateToYYYYMMDD(row.dob), // Format date of birth
            testLevel: row.test_level,
            allergies: row.allergies,
            notes: row.notes
        }));

        res.status(200).json({ success: true, participants: participants });
    } catch (err) {
        console.error(`Error fetching participants for group ${groupId}:`, err.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch participants.' });
    } finally {
        if (client) client.release();
    }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Access the server at http://localhost:${port}`);
});
