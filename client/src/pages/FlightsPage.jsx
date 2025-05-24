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

  useEffect(() => {
    fetchFlights();
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
        <button
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : 'Add Flight'}
        </button>
      </div>

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