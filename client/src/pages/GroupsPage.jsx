// src/pages/GroupsPage.jsx
import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import { Link } from 'react-router-dom';

// Helper function to get sort icon
const SortIcon = ({ direction }) => {
  if (!direction) {
    return <span className="ml-1 text-slate-400">↕</span>;
  }
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
};


function GroupsPage() {
  const [groupsData, setGroupsData] = useState([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true);   // Add loading state
  const [error, setError] = useState(null);           // Add error state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Fetch groups data from the backend when the component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure your server is running and this endpoint is correct
        const response = await fetch('http://localhost:5000/api/groups'); 
        if (!response.ok) {
          // Try to get error message from backend if available
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          // Backend /api/groups endpoint maps DB columns to camelCase 
          // and formats dates to YYYY-MM-DD
          setGroupsData(data.groups || []);
        } else {
          throw new Error(data.message || 'Failed to fetch groups from API.');
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(err.message);
        setGroupsData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []); // Empty dependency array means this effect runs once on mount


  // Define table headers with a 'key' for sorting and a 'sortable' flag
  // Keys should match the camelCase keys of the data objects in groupsData state
  const headers = [
    { label: 'Agency', key: 'agency', sortable: true },
    { label: 'Group Name', key: 'groupName', sortable: true },
    { label: 'Arrival Date', key: 'arrivalDate', sortable: true },
    { label: 'Departure Date', key: 'departureDate', sortable: true },
    { label: 'Student Allocation', key: 'studentAllocation', sortable: true, numeric: true },
    { label: 'Leader Allocation', key: 'leaderAllocation', sortable: true, numeric: true },
    { label: 'Student Bookings', key: 'studentBookings', sortable: true, numeric: true },
    { label: 'Leader Bookings', key: 'leaderBookings', sortable: true, numeric: true },
    { label: 'Centre', key: 'centre', sortable: true },
    { label: 'Flight Arrival Time', key: 'flightArrivalTime', sortable: true },
    { label: 'Flight Departure Time', key: 'flightDepartureTime', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false }
  ];

  const sortedGroups = useMemo(() => {
    let sortableItems = [...groupsData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        const isNumeric = headers.find(h => h.key === sortConfig.key)?.numeric;
        let comparison = 0;

        if (valA === null || valA === undefined) comparison = 1;
        else if (valB === null || valB === undefined) comparison = -1;
        else if (isNumeric) {
          comparison = (parseFloat(valA) || 0) - (parseFloat(valB) || 0);
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else {
          if (valA < valB) comparison = -1;
          else if (valA > valB) comparison = 1;
        }
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    }
    return sortableItems;
  }, [groupsData, sortConfig, headers]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Helper to format YYYY-MM-DD date strings to a more readable format, ensuring UTC interpretation
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
            const day = parseInt(parts[2], 10);
            const date = new Date(Date.UTC(year, month, day));
            if (isNaN(date.getTime())) {
                return dateString; 
            }
            return date.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                timeZone: 'UTC' 
            });
        }
        return dateString;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-700">Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error fetching groups: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Manage Groups</h2>
      <div className="bg-white shadow-lg rounded-xl p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${header.sortable ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                    onClick={() => header.sortable && requestSort(header.key)}
                  >
                    <div className="flex items-center">
                      {header.label}
                      {header.sortable && (
                        <span className="ml-1">
                          <SortIcon direction={sortConfig.key === header.key ? sortConfig.direction : null} />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedGroups.length > 0 ? (
                sortedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{group.agency || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 hover:text-sky-800 hover:underline">
                      <Link to={`/dashboard/groups/${group.id}`}>{group.groupName}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateForDisplay(group.arrivalDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDateForDisplay(group.departureDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{group.studentAllocation === null ? 'N/A' : group.studentAllocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{group.leaderAllocation === null ? 'N/A' : group.leaderAllocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{group.studentBookings === null ? 'N/A' : group.studentBookings}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{group.leaderBookings === null ? 'N/A' : group.leaderBookings}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{group.centre || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{group.flightArrivalTime || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{group.flightDepartureTime || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/dashboard/groups/${group.id}`} className="text-sky-600 hover:text-sky-800 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-12 text-center text-sm text-slate-500">
                    No groups found in the database. You can import groups from the "Import" page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GroupsPage;
