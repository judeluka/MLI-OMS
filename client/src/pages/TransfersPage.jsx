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
  const [h, m] = timeStr.split(':');
  if (!h || !m) return timeStr;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

// Sort icon component
const SortIcon = ({ direction }) => {
  if (!direction) return <span className="ml-1 text-slate-400">↕</span>;
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
};

// Delete confirmation modal
const DeleteConfirmModal = ({ transfer, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
    <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
      <div className="text-center">
        <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Transfer</h3>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete this transfer from <strong>{transfer.origin_location}</strong> to <strong>{transfer.destination_location}</strong>?
          <br />
          <span className="text-sm text-slate-500 mt-2 block">This action cannot be undone.</span>
        </p>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Transfer'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    transfer_date: '',
    transfer_time: '',
    flight_id: '',
    origin_location: '',
    destination_location: '',
    capacity: '',
    supplier_details: '',
    notes: ''
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'transfer_date', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 25
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, transfer: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchFlights();
  }, [pagination.currentPage, sortConfig, searchTerm, typeFilter]);

  const fetchTransfers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === 'ascending' ? 'ASC' : 'DESC'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter) params.append('type', typeFilter);

      const res = await fetch(`http://localhost:5000/api/transfers?${params}`);
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch transfers');
      }
    } catch (err) {
      setError('Failed to fetch transfers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/flights');
      const data = await res.json();
      if (data.success) {
        setFlights(data.flights);
      }
    } catch (err) {
      console.error('Failed to fetch flights:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      type: '',
      transfer_date: '',
      transfer_time: '',
      flight_id: '',
      origin_location: '',
      destination_location: '',
      capacity: '',
      supplier_details: '',
      notes: ''
    });
    setFormError(null);
    setEditingTransfer(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const url = editingTransfer 
        ? `http://localhost:5000/api/transfers/${editingTransfer.id}`
        : 'http://localhost:5000/api/transfers';
      
      const method = editingTransfer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowForm(false);
        resetForm();
        fetchTransfers();
      } else {
        setFormError(data.message || `Failed to ${editingTransfer ? 'update' : 'create'} transfer`);
      }
    } catch (err) {
      setFormError(`Failed to ${editingTransfer ? 'update' : 'create'} transfer`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (transfer) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transfers/${transfer.id}`);
      const data = await res.json();
      if (data.success) {
        setEditingTransfer(data.transfer);
        setFormData({
          type: data.transfer.type,
          transfer_date: data.transfer.transfer_date,
          transfer_time: data.transfer.transfer_time,
          flight_id: data.transfer.flight_id || '',
          origin_location: data.transfer.origin_location,
          destination_location: data.transfer.destination_location,
          capacity: data.transfer.capacity || '',
          supplier_details: data.transfer.supplier_details || '',
          notes: data.transfer.notes || ''
        });
        setShowForm(true);
      }
    } catch (err) {
      setError('Failed to fetch transfer details');
    }
  };

  const handleDelete = (transfer) => {
    setDeleteConfirm({ show: true, transfer });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.transfer) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/transfers/${deleteConfirm.transfer.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteConfirm({ show: false, transfer: null });
        fetchTransfers();
      } else {
        setError(data.message || 'Failed to delete transfer');
        setDeleteConfirm({ show: false, transfer: null });
      }
    } catch (err) {
      setError('Failed to delete transfer');
      setDeleteConfirm({ show: false, transfer: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      } else {
        return { key, direction: 'ascending' };
      }
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const headers = [
    { label: 'ID', key: 'id' },
    { label: 'Type', key: 'type' },
    { label: 'Date', key: 'transfer_date' },
    { label: 'Time', key: 'transfer_time' },
    { label: 'Flight', key: 'flight_code' },
    { label: 'Origin', key: 'origin_location' },
    { label: 'Destination', key: 'destination_location' },
    { label: 'Capacity', key: 'capacity' },
    { label: 'Actions', key: 'actions' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Transfers</h2>
          <p className="text-slate-600 mt-1">Manage airport transfers and transportation</p>
        </div>
        <button
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
          onClick={() => {
            resetForm();
            setShowForm((v) => !v);
          }}
        >
          {showForm ? 'Cancel' : 'Add Transfer'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by location or flight code..."
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={handleTypeFilter}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="arrival">Arrival</option>
              <option value="departure">Departure</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTransfers}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white shadow rounded-lg p-6 mb-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingTransfer ? 'Edit Transfer' : 'Create New Transfer'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                name="transfer_date"
                value={formData.transfer_date}
                onChange={handleInputChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                name="transfer_time"
                value={formData.transfer_time}
                onChange={handleInputChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Associated Flight</label>
              <select
                name="flight_id"
                value={formData.flight_id}
                onChange={handleInputChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              >
                <option value="">No associated flight</option>
                {flights.map(flight => (
                  <option key={flight.id} value={flight.id}>
                    {flight.flight_code} - {flight.flight_type} ({formatDate(flight.flight_date)} {formatTime(flight.flight_time)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin Location *</label>
              <input
                type="text"
                name="origin_location"
                value={formData.origin_location}
                onChange={handleInputChange}
                placeholder="e.g., Heathrow Airport"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination Location *</label>
              <input
                type="text"
                name="destination_location"
                value={formData.destination_location}
                onChange={handleInputChange}
                placeholder="e.g., City Center Hotel"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                min="1"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Details</label>
              <input
                type="text"
                name="supplier_details"
                value={formData.supplier_details}
                onChange={handleInputChange}
                placeholder="e.g., ABC Transport Company, Contact: +44 123 456 7890"
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes or special instructions..."
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            />
          </div>

          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="text-sm">{formError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (editingTransfer ? 'Updating...' : 'Creating...') : (editingTransfer ? 'Update Transfer' : 'Create Transfer')}
            </button>
          </div>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Transfers Table */}
      {isLoading ? (
        <div className="p-6 text-center text-slate-700">
          <svg className="animate-spin h-8 w-8 text-sky-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading transfers...
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                        header.key !== 'actions' ? 'cursor-pointer select-none hover:bg-slate-100' : ''
                      }`}
                      onClick={() => header.key !== 'actions' && handleSort(header.key)}
                    >
                      <div className="flex items-center">
                        {header.label}
                        {header.key !== 'actions' && sortConfig.key === header.key && (
                          <SortIcon direction={sortConfig.direction} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="text-lg font-medium">No transfers found</p>
                        <p className="text-sm mt-1">Create your first transfer to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{transfer.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transfer.type === 'arrival' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {transfer.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatDate(transfer.transfer_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatTime(transfer.transfer_time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {transfer.flight_code ? (
                          <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                            {transfer.flight_code}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate" title={transfer.origin_location}>
                        {transfer.origin_location}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate" title={transfer.destination_location}>
                        {transfer.destination_location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {transfer.capacity || <span className="text-slate-500 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transfer)}
                            className="text-sky-600 hover:text-sky-800 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transfer)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-slate-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalCount}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-sky-50 border-sky-500 text-sky-600'
                              : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <DeleteConfirmModal
          transfer={deleteConfirm.transfer}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, transfer: null })}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

export default TransfersPage; 