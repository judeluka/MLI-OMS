// src/pages/GroupDetailPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Placeholder for actual programme data from scheduler - this would also be fetched
// Or derived from classSchedule/activitySchedule if those are central
// For now, we'll keep this as a local placeholder.
// Key: 'YYYY-MM-DD-GroupId-Slot' (e.g., '2025-05-17-1-Morning')
// Value: Activity/Class name.
const groupProgrammeData = {
    '2025-05-16-1-Arrival': 'Check-in & Welcome Talk',
    '2025-05-17-1-Morning': 'English Class A1',
    '2025-05-17-1-Afternoon': 'Museum Visit',
    '2025-05-17-1-Evening': 'Movie Night',
    '2025-05-18-1-Morning': 'History Class B1',
    '2025-05-18-1-Afternoon': 'City Tour',
    '2025-05-18-1-Evening': 'Quiz Night',
    '2025-05-22-1-Departure': 'Check-out & Airport Transfer',

    '2025-05-20-2-Arrival': 'Arrival & Orientation',
    '2025-05-21-2-Morning': 'Language Workshop',
    '2025-05-21-2-Afternoon': 'Local Market Trip',
    '2025-05-21-2-Evening': 'Cultural Dinner',
};

// Helper function to get sort icon
const SortIcon = ({ direction }) => {
  if (!direction) return <span className="ml-1 text-slate-400">↕</span>;
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
};

// Helper to generate dates for the programme table
// Ensures dates are treated as UTC to avoid timezone shifts from YYYY-MM-DD strings
const getProgrammeDates = (arrivalStr, departureStr) => {
    if (!arrivalStr || !departureStr) return [];
    const dates = [];
    
    const startParts = arrivalStr.split('-');
    const endParts = departureStr.split('-');

    if (startParts.length !== 3 || endParts.length !== 3) return []; // Invalid format

    let currentDate = new Date(Date.UTC(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2])));
    let stopDate = new Date(Date.UTC(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2])));

    if (isNaN(currentDate.getTime()) || isNaN(stopDate.getTime())) return []; // Invalid date objects

    while (currentDate <= stopDate) {
        dates.push(new Date(currentDate)); // Store as Date objects (which are UTC timestamps internally)
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return dates;
};


function GroupDetailPage() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null); // For fetched group details
  // const [programmeDataForGroup, setProgrammeDataForGroup] = useState({}); // Future: fetch this too

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('programme'); // Default to programme tab

  // Fetch group details when component mounts or groupId changes
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        setError("Group ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setGroupInfo(null); // Reset previous data

      try {
        // Fetch group metadata
        const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
        if (!groupResponse.ok) {
          const errData = await groupResponse.json().catch(() => ({ message: `Failed to fetch group details: ${groupResponse.status}` }));
          throw new Error(errData.message);
        }
        const groupDataResult = await groupResponse.json();
        if (groupDataResult.success && groupDataResult.group) {
          setGroupInfo(groupDataResult.group);
        } else {
          throw new Error(groupDataResult.message || 'Could not retrieve group details.');
        }
      } catch (err) {
        console.error("Error fetching group details:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // Memoize programme dates based on fetched groupInfo
  const programmeDates = useMemo(() => 
    groupInfo?.arrivalDate && groupInfo?.departureDate 
        ? getProgrammeDates(groupInfo.arrivalDate, groupInfo.departureDate) 
        : [], 
  [groupInfo?.arrivalDate, groupInfo?.departureDate]);

  // Formats YYYY-MM-DD to DD MMM YYYY (UTC)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS months 0-indexed
            const day = parseInt(parts[2], 10);
            const date = new Date(Date.UTC(year, month, day));
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
        }
        return dateString;
    } catch (e) { return dateString; }
  };
  
  // Formats Date object to Weekday, DD Month YYYY (UTC)
  const formatDateForProgrammeHeader = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); // Shortened weekday
  };
  
  // Formats Date object to YYYY-MM-DD (UTC)
  const toYYYYMMDD = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return null;
    const month = `${dateObj.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${dateObj.getUTCDate()}`.padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    return `${year}-${month}-${day}`;
  };

  const programmeTableHeaders = [
    "Date", "Breakfast", "Morning Activity", "Lunch", "Afternoon Activity", "Dinner", "Evening Activity"
  ];

  if (isLoading) {
    return <div className="p-6 text-center text-slate-700">Loading group details...</div>;
  }
  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>;
  }
  if (!groupInfo) { 
    return <div className="p-6 text-center text-slate-700">Group not found or could not be loaded.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Group: <span className="text-sky-600">{groupInfo.groupName || 'N/A'}</span> (ID: {groupId})
        </h2>
        <Link 
            to="/dashboard/groups" 
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md shadow-sm transition-colors"
        >
            &larr; Back to All Groups
        </Link>
      </div>

      {/* Programme Content Directly Displayed (Removed Tab Navigation) */}
      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">
          Programme for {groupInfo.groupName}
        </h3>
        <p className="text-sm text-slate-500 mb-1">
          Client: {groupInfo.agency || 'N/A'}
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Arrival: {formatDateForDisplay(groupInfo.arrivalDate)} | 
          Departure: {formatDateForDisplay(groupInfo.departureDate)}
        </p>

        {programmeDates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full divide-y divide-slate-200 border border-slate-300 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {programmeTableHeaders.map(header => (
                    <th 
                        key={header} 
                        // Updated classes for header cells
                        className={`px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0 
                                    ${header === "Date" ? "text-left" : "text-center"}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {programmeDates.map((date) => { 
                  const dateStrYYYYMMDD = toYYYYMMDD(date); 
                  const isArrivalDay = dateStrYYYYMMDD === groupInfo.arrivalDate;
                  const isDepartureDay = dateStrYYYYMMDD === groupInfo.departureDate;
                  
                  let morningActivity = groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Morning`] || '-';
                  let afternoonActivity = groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Afternoon`] || '-';
                  let eveningActivity = groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Evening`] || '-';

                  if (isArrivalDay) {
                      morningActivity = groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Arrival`] || 'Arrival Activities';
                      if (!groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Afternoon`]) afternoonActivity = '-';
                      if (!groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Evening`]) eveningActivity = '-';
                  }
                  if (isDepartureDay) {
                      if (groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Departure`]) {
                          morningActivity = groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Departure`];
                          if (!groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Afternoon`]) afternoonActivity = '-';
                          if (!groupProgrammeData[`${dateStrYYYYMMDD}-${groupId}-Evening`]) eveningActivity = '-';
                      }
                  }

                  return (
                    <tr key={dateStrYYYYMMDD} className={`${isArrivalDay ? 'bg-green-50' : isDepartureDay ? 'bg-red-50' : 'bg-white'} hover:bg-slate-50`}>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 font-medium text-slate-700">{formatDateForProgrammeHeader(date)}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 text-slate-600 text-center">Breakfast</td>
                      <td className={`px-3 py-2 border-r border-slate-300 text-slate-600 text-center ${isArrivalDay && morningActivity !== '-' ? 'text-green-700 font-semibold' : ''}`}>{morningActivity}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 text-slate-600 text-center">Lunch</td>
                      <td className={`px-3 py-2 border-r border-slate-300 text-slate-600 text-center ${isDepartureDay && afternoonActivity !== '-' ? 'text-red-700 font-semibold' : ''}`}>{afternoonActivity}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 text-slate-600 text-center">Dinner</td>
                      <td className="px-3 py-2 text-slate-600 text-center">{eveningActivity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">Programme dates not available for this group, or group arrival/departure not set.</p>
        )}
      </div>
    </div>
  );
}

export default GroupDetailPage;
