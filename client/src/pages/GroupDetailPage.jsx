// src/pages/GroupDetailPage.jsx
import React, { useState, useEffect } from 'react';
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

function GroupDetailPage() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for flight details form
  const [flightDetails, setFlightDetails] = useState({
    type: 'arrival', // 'arrival' or 'departure'
    time: '',
    flightCode: '',
    airport: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch group details
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setError("Group ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setGroupInfo(null);

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
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

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

  // Add function to handle flight details submission
  const handleFlightDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/flight-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: flightDetails.type,
          time: flightDetails.time,
          flightCode: flightDetails.flightCode,
          airport: flightDetails.airport
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save flight details');
      }

      // Update local state with new flight details
      const updatedGroup = await response.json();
      setGroupInfo(prev => ({
        ...prev,
        ...(flightDetails.type === 'arrival' 
          ? { flightArrivalTime: flightDetails.time, flightArrivalCode: flightDetails.flightCode, flightArrivalAirport: flightDetails.airport }
          : { flightDepartureTime: flightDetails.time, flightDepartureCode: flightDetails.flightCode, flightDepartureAirport: flightDetails.airport }
        )
      }));

      // Reset form
      setFlightDetails({
        type: 'arrival',
        time: '',
        flightCode: '',
        airport: ''
      });
    } catch (err) {
      console.error('Error saving flight details:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Flight Details Form */}
      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Flight Details</h3>
        
        <form onSubmit={handleFlightDetailsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Flight Type
              </label>
              <select
                value={flightDetails.type}
                onChange={(e) => setFlightDetails(prev => ({ ...prev, type: e.target.value }))}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              >
                <option value="arrival">Arrival</option>
                <option value="departure">Departure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={flightDetails.time}
                onChange={(e) => setFlightDetails(prev => ({ ...prev, time: e.target.value }))}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Flight Code
              </label>
              <input
                type="text"
                value={flightDetails.flightCode}
                onChange={(e) => setFlightDetails(prev => ({ ...prev, flightCode: e.target.value }))}
                placeholder="e.g., BA123"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Airport
              </label>
              <input
                type="text"
                value={flightDetails.airport}
                onChange={(e) => setFlightDetails(prev => ({ ...prev, airport: e.target.value }))}
                placeholder="e.g., Heathrow (LHR)"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm mt-2">
              {submitError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Flight Details'}
            </button>
          </div>
        </form>

        {/* Display current flight details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-2">Arrival Flight</h4>
            <p className="text-sm text-slate-600">
              Time: {groupInfo?.flightArrivalTime || 'Not set'}<br />
              Flight: {groupInfo?.flightArrivalCode || 'Not set'}<br />
              Airport: {groupInfo?.flightArrivalAirport || 'Not set'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-700 mb-2">Departure Flight</h4>
            <p className="text-sm text-slate-600">
              Time: {groupInfo?.flightDepartureTime || 'Not set'}<br />
              Flight: {groupInfo?.flightDepartureCode || 'Not set'}<br />
              Airport: {groupInfo?.flightDepartureAirport || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Programme Link */}
      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-700">Programme</h3>
          <Link 
            to={`/dashboard/groups/${groupId}/programme`}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
          >
            View Full Programme
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          View the complete programme schedule for this group, including all activities, classes, and meals.
        </p>
      </div>
    </div>
  );
}

export default GroupDetailPage;
