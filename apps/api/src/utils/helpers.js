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

module.exports = {
    formatDateToYYYYMMDD,
    fetchGroupFlights
}; 