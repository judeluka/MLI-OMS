import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

function IndividualFlightPage() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchFlight();
  }, [flightId]);

  const fetchFlight = async () => {
    setIsLoading(true);
    setError(null);
    setFlight(null);
    setGroups([]);
    setEditData(null);
    try {
      const res = await fetch(`http://localhost:5000/api/flights/${flightId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFlight(data.flight);
        setEditData({
          flight_type: data.flight.flight_type,
          flight_date: data.flight.flight_date,
          flight_time: data.flight.flight_time,
          flight_code: data.flight.flight_code,
        });
        // Fetch groups associated with this flight
        fetchGroups(data.flight);
      } else {
        setError(data.message || 'Failed to fetch flight');
      }
    } catch (err) {
      setError('Failed to fetch flight');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (flightObj) => {
    // Fetch groups associated with this specific flight using the new many-to-many relationship
    try {
      const res = await fetch(`http://localhost:5000/api/flights/${flightObj.id}/groups`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGroups(data.groups || []);
      } else {
        console.error('Failed to fetch associated groups:', data.message);
        setGroups([]);
      }
    } catch (err) {
      console.error('Error fetching associated groups:', err);
      setGroups([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`http://localhost:5000/api/flights/${flightId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setFlight(data.flight);
      } else {
        setSaveError(data.message || 'Failed to save changes');
      }
    } catch (err) {
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-700">Loading flight details...</div>;
  }
  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>;
  }
  if (!flight) {
    return <div className="p-6 text-center text-slate-700">Flight not found.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Flight: <span className="text-sky-600">{flight.flight_code}</span> (ID: {flightId})
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md shadow-sm transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-6 max-w-xl">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Edit Flight Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Flight Type</label>
            <select
              name="flight_type"
              value={editData.flight_type}
              onChange={handleInputChange}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            >
              <option value="arrival">Arrival</option>
              <option value="departure">Departure</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Flight Date</label>
            <input
              type="date"
              name="flight_date"
              value={editData.flight_date}
              onChange={handleInputChange}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Flight Time</label>
            <input
              type="time"
              name="flight_time"
              value={editData.flight_time}
              onChange={handleInputChange}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Flight Code</label>
            <input
              type="text"
              name="flight_code"
              value={editData.flight_code}
              onChange={handleInputChange}
              placeholder="e.g., BA123"
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            />
          </div>
        </div>
        {saveError && <div className="text-red-600 text-sm mt-2">{saveError}</div>}
        {saveSuccess && <div className="text-green-600 text-sm mt-2">Saved successfully!</div>}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Groups Associated with this Flight</h3>
        {groups.length === 0 ? (
          <div className="text-slate-500">No groups found for this flight.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full divide-y divide-slate-200 border border-slate-300 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Group Name</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Agency</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Arrival</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Departure</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Centre</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {groups.map((g) => (
                  <tr key={g.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{g.groupName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{g.agency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(g.arrivalDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(g.departureDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{g.centre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <Link
                        to={`/dashboard/groups/${g.id}`}
                        className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 text-xs font-medium transition-colors"
                      >
                        View Group
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualFlightPage; 