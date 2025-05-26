import React, { useState, useEffect } from 'react';

// Helper to format date as 'DD MMM YYYY'
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
// Helper to format time as 'HH:mm'
function formatTime(timeStr) {
  if (!timeStr) return '';
  // Handles 'HH:mm:ss' or 'HH:mm'
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// Sort icon
const SortIcon = ({ direction }) => {
  if (!direction) return <span className="ml-1 text-slate-400">↕</span>;
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
};

function FlightsPage() {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    flight_type: '',
    flight_date: '',
    flight_time: '',
    flight_code: '',
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'flight_date', direction: 'descending' });
  
  // New state for date mismatch detection
  const [dateMismatches, setDateMismatches] = useState([]);
  const [showMismatchAlert, setShowMismatchAlert] = useState(false);
  const [isCheckingMismatches, setIsCheckingMismatches] = useState(false);

  useEffect(() => {
    fetchFlights();
    checkDateMismatches();
  }, []);

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/flights');
      const data = await res.json();
      if (data.success) {
        setFlights(data.flights);
      } else {
        setError(data.message || 'Failed to fetch flights');
      }
    } catch (err) {
      setError('Failed to fetch flights');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check for date mismatches between groups and their flights
  const checkDateMismatches = async () => {
    setIsCheckingMismatches(true);
    try {
      // Fetch all groups
      const groupsRes = await fetch('http://localhost:5000/api/groups');
      const groupsData = await groupsRes.json();
      
      if (!groupsData.success) {
        console.error('Failed to fetch groups for mismatch check');
        return;
      }

      const mismatches = [];

      // Check each group for date mismatches
      for (const group of groupsData.groups) {
        const groupArrivalDate = new Date(group.arrivalDate);
        const groupDepartureDate = new Date(group.departureDate);

        // Check arrival flights
        if (group.arrivalFlights && group.arrivalFlights.length > 0) {
          for (const flight of group.arrivalFlights) {
            const flightDate = new Date(flight.flight_date);
            if (flightDate.toDateString() !== groupArrivalDate.toDateString()) {
              mismatches.push({
                type: 'arrival',
                groupName: group.groupName,
                groupId: group.id,
                groupDate: group.arrivalDate,
                flightCode: flight.flight_code,
                flightDate: flight.flight_date,
                flightId: flight.flight_id
              });
            }
          }
        }

        // Check departure flights
        if (group.departureFlights && group.departureFlights.length > 0) {
          for (const flight of group.departureFlights) {
            const flightDate = new Date(flight.flight_date);
            if (flightDate.toDateString() !== groupDepartureDate.toDateString()) {
              mismatches.push({
                type: 'departure',
                groupName: group.groupName,
                groupId: group.id,
                groupDate: group.departureDate,
                flightCode: flight.flight_code,
                flightDate: flight.flight_date,
                flightId: flight.flight_id
              });
            }
          }
        }
      }

      setDateMismatches(mismatches);
      if (mismatches.length > 0) {
        setShowMismatchAlert(true);
      }
    } catch (err) {
      console.error('Error checking date mismatches:', err);
    } finally {
      setIsCheckingMismatches(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowForm(false);
        setFormData({ flight_type: '', flight_date: '', flight_time: '', flight_code: '' });
        fetchFlights();
        // Check for mismatches after adding new flight
        checkDateMismatches();
      } else {
        setFormError(data.message || 'Failed to add flight');
      }
    } catch (err) {
      setFormError('Failed to add flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      } else {
        return { key, direction: 'ascending' };
      }
    });
  };

  const sortedFlights = React.useMemo(() => {
    const sorted = [...flights];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      // For date/time, compare as date/time
      if (sortConfig.key === 'flight_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortConfig.key === 'flight_time') {
        // Compare as time strings
        aVal = aVal || '';
        bVal = bVal || '';
      } else if (sortConfig.key === 'id') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [flights, sortConfig]);

  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'Type', key: 'flight_type' },
    { label: 'Date', key: 'flight_date' },
    { label: 'Time', key: 'flight_time' },
    { label: 'Code', key: 'flight_code' },
    { label: 'Actions', key: 'actions' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Flights</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={checkDateMismatches}
            disabled={isCheckingMismatches}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {isCheckingMismatches ? 'Checking...' : 'Check Date Mismatches'}
          </button>
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Add Flight'}
          </button>
        </div>
      </div>

      {/* Date Mismatch Alert */}
      {showMismatchAlert && dateMismatches.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Date Mismatches Detected!</h3>
                <p className="text-red-700 mt-1">
                  Found {dateMismatches.length} mismatch{dateMismatches.length !== 1 ? 'es' : ''} between group dates and flight dates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMismatchAlert(false)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 max-h-64 overflow-y-auto">
            <div className="space-y-3">
              {dateMismatches.map((mismatch, index) => (
                <div key={index} className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mismatch.type === 'arrival' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {mismatch.type}
                        </span>
                        <span className="font-semibold text-slate-800">{mismatch.groupName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-sm text-slate-600">{mismatch.flightCode}</span>
                      </div>
                      <div className="text-sm text-slate-700">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Group {mismatch.type} date:</span>
                            <div className="text-slate-900 font-mono">{formatDate(mismatch.groupDate)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Flight date:</span>
                            <div className="text-slate-900 font-mono">{formatDate(mismatch.flightDate)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <a
                        href={`/dashboard/groups/${mismatch.groupId}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      >
                        View Group
                      </a>
                      <a
                        href={`/dashboard/flights/${mismatch.flightId}`}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        View Flight
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm text-red-600">
              <strong>Tip:</strong> These mismatches may indicate scheduling conflicts. Please review and update the group dates or flight assignments as needed.
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white shadow rounded-lg p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Type</label>
              <select
                name="flight_type"
                value={formData.flight_type}
                onChange={handleInputChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              >
                <option value="">Select type</option>
                <option value="arrival">Arrival</option>
                <option value="departure">Departure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Date</label>
              <input
                type="date"
                name="flight_date"
                value={formData.flight_date}
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
                value={formData.flight_time}
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
                value={formData.flight_code}
                onChange={handleInputChange}
                placeholder="e.g., BA123"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>
          </div>
          {formError && <div className="text-red-600 text-sm">{formError}</div>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Flight'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-6 text-center text-slate-700">Loading flights...</div>
      ) : error ? (
        <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full w-full divide-y divide-slate-200 border border-slate-300 text-sm">
            <thead className="bg-slate-100">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0 cursor-pointer select-none"
                    onClick={() => handleSort(header.key)}
                  >
                    {header.label}
                    {sortConfig.key === header.key && <SortIcon direction={sortConfig.direction} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedFlights.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No flights found.</td>
                </tr>
              ) : (
                sortedFlights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{flight.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">{flight.flight_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(flight.flight_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatTime(flight.flight_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{flight.flight_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <a
                        href={`/dashboard/flights/${flight.id}`}
                        className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 text-xs font-medium transition-colors"
                      >
                        View/Edit
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FlightsPage; 