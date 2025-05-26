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

// Define a new component for the Group Form Modal
const GroupFormModal = ({ isOpen, onClose, onSubmit, groupData, availableCentres }) => {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        // Initialize form with groupData if provided (for editing), else empty
        setFormData(groupData || {
            groupName: '', agency: '', arrivalDate: '', departureDate: '',
            studentAllocation: '', leaderAllocation: '', centre: '',
            studentBookings: '', leaderBookings: '',
            flightArrivalTime: '', flightDepartureTime: ''
        });
        setFormErrors({}); // Clear errors when modal opens or groupData changes
    }, [isOpen, groupData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Basic real-time validation feedback (optional)
        if (formErrors[name] && value.trim()) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.groupName?.trim()) errors.groupName = "Group Name is required.";
        if (!formData.arrivalDate) errors.arrivalDate = "Arrival Date is required.";
        if (!formData.departureDate) errors.departureDate = "Departure Date is required.";
        // Add more specific validations as needed (e.g., date format, numeric checks)
        if (formData.arrivalDate && formData.departureDate && new Date(formData.arrivalDate) > new Date(formData.departureDate)) {
            errors.departureDate = "Departure Date cannot be before Arrival Date.";
        }
        if (formData.studentAllocation && isNaN(Number(formData.studentAllocation))) {
            errors.studentAllocation = "Must be a number.";
        }
        if (formData.leaderAllocation && isNaN(Number(formData.leaderAllocation))) {
            errors.leaderAllocation = "Must be a number.";
        }
        // ... and so on for other numeric fields

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare data for submission (e.g. parse numbers)
            const submissionData = {
                ...formData,
                studentAllocation: formData.studentAllocation ? parseInt(formData.studentAllocation, 10) : null,
                leaderAllocation: formData.leaderAllocation ? parseInt(formData.leaderAllocation, 10) : null,
                studentBookings: formData.studentBookings ? parseInt(formData.studentBookings, 10) : null,
                leaderBookings: formData.leaderBookings ? parseInt(formData.leaderBookings, 10) : null,
            };
            onSubmit(submissionData);
        }
    };

    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-base shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150";
    const labelClass = "block text-base font-medium text-slate-700";
    const errorClass = "text-sm text-red-500 mt-1";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">{groupData?.id ? 'Edit Group' : 'Create New Group'}</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="groupName" className={labelClass}>Group Name*</label>
                            <input type="text" name="groupName" id="groupName" value={formData.groupName || ''} onChange={handleChange} className={`${inputClass} ${formErrors.groupName ? 'border-red-500' : ''}`} />
                            {formErrors.groupName && <p className={errorClass}>{formErrors.groupName}</p>}
                        </div>
                        <div>
                            <label htmlFor="agency" className={labelClass}>Agency</label>
                            <input type="text" name="agency" id="agency" value={formData.agency || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="arrivalDate" className={labelClass}>Arrival Date*</label>
                            <input type="date" name="arrivalDate" id="arrivalDate" value={formData.arrivalDate || ''} onChange={handleChange} className={`${inputClass} ${formErrors.arrivalDate ? 'border-red-500' : ''}`} />
                            {formErrors.arrivalDate && <p className={errorClass}>{formErrors.arrivalDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="departureDate" className={labelClass}>Departure Date*</label>
                            <input type="date" name="departureDate" id="departureDate" value={formData.departureDate || ''} onChange={handleChange} className={`${inputClass} ${formErrors.departureDate ? 'border-red-500' : ''}`} />
                            {formErrors.departureDate && <p className={errorClass}>{formErrors.departureDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="studentAllocation" className={labelClass}>Student Allocation</label>
                            <input type="number" name="studentAllocation" id="studentAllocation" value={formData.studentAllocation === null ? '' : formData.studentAllocation} onChange={handleChange} className={`${inputClass} ${formErrors.studentAllocation ? 'border-red-500' : ''}`} />
                            {formErrors.studentAllocation && <p className={errorClass}>{formErrors.studentAllocation}</p>}
                        </div>
                        <div>
                            <label htmlFor="leaderAllocation" className={labelClass}>Leader Allocation</label>
                            <input type="number" name="leaderAllocation" id="leaderAllocation" value={formData.leaderAllocation === null ? '' : formData.leaderAllocation} onChange={handleChange} className={`${inputClass} ${formErrors.leaderAllocation ? 'border-red-500' : ''}`} />
                            {formErrors.leaderAllocation && <p className={errorClass}>{formErrors.leaderAllocation}</p>}
                        </div>
                         <div>
                            <label htmlFor="studentBookings" className={labelClass}>Student Bookings</label>
                            <input type="number" name="studentBookings" id="studentBookings" value={formData.studentBookings === null ? '' : formData.studentBookings} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="leaderBookings" className={labelClass}>Leader Bookings</label>
                            <input type="number" name="leaderBookings" id="leaderBookings" value={formData.leaderBookings === null ? '' : formData.leaderBookings} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="centre" className={labelClass}>Centre</label>
                             <select name="centre" id="centre" value={formData.centre || ''} onChange={handleChange} className={inputClass}>
                                <option value="">Select Centre</option>
                                {availableCentres.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors duration-150"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
                        >
                            {groupData?.id ? 'Update Group' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


function GroupsPage() {
  const [groupsData, setGroupsData] = useState([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(true);   // Add loading state
  const [error, setError] = useState(null);           // Add error state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedCentre, setSelectedCentre] = useState(''); // Add centre filter state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // null for new, group object for editing
  const [apiFeedback, setApiFeedback] = useState({ message: '', type: '' }); // For success/error messages from API
  
  // New state for multi-select functionality
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Define table headers with a 'key' for sorting and a 'sortable' flag
  // Keys should match the camelCase keys of the data objects in groupsData state
  const headers = [
    { label: 'Select', key: 'select', sortable: false },
    { label: 'Agency', key: 'agency', sortable: true },
    { label: 'Group Name', key: 'groupName', sortable: true },
    { label: 'Arrival Date', key: 'arrivalDate', sortable: true },
    { label: 'Departure Date', key: 'departureDate', sortable: true },
    { label: 'Student Allocation', key: 'studentAllocation', sortable: true, numeric: true },
    { label: 'Leader Allocation', key: 'leaderAllocation', sortable: true, numeric: true },
    { label: 'Student Bookings', key: 'studentBookings', sortable: true, numeric: true },
    { label: 'Leader Bookings', key: 'leaderBookings', sortable: true, numeric: true },
    { label: 'Centre', key: 'centre', sortable: true },
    { label: 'Arrival Flights', key: 'arrivalFlights', sortable: false },
    { label: 'Departure Flights', key: 'departureFlights', sortable: false },
    { label: 'Actions', key: 'actions', sortable: false }
  ];

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/groups');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setGroupsData(data.groups || []);
      } else {
        throw new Error(data.message || 'Failed to fetch groups from API.');
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError(err.message);
      setGroupsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch groups data from the backend when the component mounts
  useEffect(() => {
    fetchGroups();
  }, []); // Empty dependency array means this effect runs once on mount

  // Get unique centres for the filter dropdown and modal
  const uniqueCentres = useMemo(() => {
    const centres = new Set(groupsData.map(group => group.centre).filter(Boolean));
    return Array.from(centres).sort();
  }, [groupsData]);

  // Multi-select functionality
  const handleSelectGroup = (groupId) => {
    const newSelectedGroups = new Set(selectedGroups);
    if (newSelectedGroups.has(groupId)) {
      newSelectedGroups.delete(groupId);
    } else {
      newSelectedGroups.add(groupId);
    }
    setSelectedGroups(newSelectedGroups);
  };

  const handleSelectAll = () => {
    if (selectedGroups.size === filteredAndSortedGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(filteredAndSortedGroups.map(group => group.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGroups.size === 0) return;
    
    const confirmation = window.confirm(
      `Are you sure you want to delete ${selectedGroups.size} selected group(s)? This action cannot be undone.`
    );
    
    if (!confirmation) return;

    setIsDeleting(true);
    setApiFeedback({ message: '', type: '' });

    try {
      const deletePromises = Array.from(selectedGroups).map(groupId =>
        fetch(`http://localhost:5000/api/groups/${groupId}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        setApiFeedback({
          message: `Successfully deleted ${successCount} group(s).${failureCount > 0 ? ` ${failureCount} deletion(s) failed.` : ''}`,
          type: successCount === results.length ? 'success' : 'warning'
        });
        fetchGroups(); // Refresh the list
        setSelectedGroups(new Set()); // Clear selection
      } else {
        throw new Error('Failed to delete any groups.');
      }
    } catch (error) {
      console.error('Error deleting groups:', error);
      setApiFeedback({
        message: 'Failed to delete selected groups. Please try again.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModal = (group = null) => {
    // Dates from backend are YYYY-MM-DD. HTML date input also expects YYYY-MM-DD.
    // Ensure existing date formats are correct for the form.
    let groupForForm = group;
    if (group) {
        groupForForm = {
            ...group,
            // arrivalDate and departureDate should already be in 'YYYY-MM-DD' from backend
            // If they were Date objects, they would need formatting:
            // arrivalDate: group.arrivalDate ? new Date(group.arrivalDate).toISOString().split('T')[0] : '',
            // departureDate: group.departureDate ? new Date(group.departureDate).toISOString().split('T')[0] : '',
        };
    }
    setEditingGroup(groupForForm);
    setApiFeedback({ message: '', type: '' }); // Clear previous feedback
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleFormSubmit = async (formData) => {
    const url = editingGroup?.id ? `http://localhost:5000/api/groups/${editingGroup.id}` : 'http://localhost:5000/api/groups';
    const method = editingGroup?.id ? 'PUT' : 'POST';
    setApiFeedback({ message: '', type: '' });
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || `Failed to ${editingGroup?.id ? 'update' : 'create'} group`);
        }
        setApiFeedback({ message: result.message || `Group ${editingGroup?.id ? 'updated' : 'created'} successfully!`, type: 'success' });
        fetchGroups();
        handleCloseModal();
    } catch (error) {
        console.error(`Error ${editingGroup?.id ? 'updating' : 'creating'} group:`, error);
        setApiFeedback({ message: error.message, type: 'error' });
    }
  };

  // Filter and sort groups
  const filteredAndSortedGroups = useMemo(() => {
    let filteredItems = groupsData;
    
    // Apply centre filter
    if (selectedCentre) {
      filteredItems = filteredItems.filter(group => group.centre === selectedCentre);
    }

    // Apply sorting
    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
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
    return filteredItems;
  }, [groupsData, sortConfig, selectedCentre, headers]);

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

  // Helper function to format flight information for display
  const formatFlightInfo = (flights) => {
    if (!flights || flights.length === 0) {
      return <span className="text-slate-500 italic">No flights</span>;
    }
    
    if (flights.length === 1) {
      const flight = flights[0];
      return (
        <div className="text-sm">
          <div className="font-medium">{flight.flight_code}</div>
          <div className="text-slate-600">{formatFlightTime(flight.flight_time)}</div>
        </div>
      );
    }
    
    return (
      <div className="text-sm">
        <div className="font-medium">{flights.length} flights</div>
        <div className="text-slate-600">
          {flights.map(f => f.flight_code).join(', ')}
        </div>
      </div>
    );
  };

  // Helper function to format flight time
  const formatFlightTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Remove seconds if present
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-700 text-lg">Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm" role="alert">
        <h3 className="text-lg font-semibold mb-2">Error Loading Groups</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-800 text-white shadow-2xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white">Manage Groups</h1>
        <p className="text-slate-300 mt-2">Create, edit, and manage language learning groups</p>
      </div>
      
      {/* API Feedback */}
      {apiFeedback.message && (
          <div className={`p-4 rounded-lg text-base shadow-sm ${
            apiFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            apiFeedback.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`} role="alert">
              {apiFeedback.message}
          </div>
      )}

      {/* Controls Section */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Filter Dropdown */}
            <div className="flex items-center space-x-3">
              <label htmlFor="centreFilter" className="text-base font-medium text-slate-700 whitespace-nowrap">Filter by Centre:</label>
              <select
                id="centreFilter"
                value={selectedCentre}
                onChange={(e) => setSelectedCentre(e.target.value)}
                className="block w-48 pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm transition-colors duration-150"
              >
                <option value="">All Centres</option>
                {uniqueCentres.map((centre) => (
                  <option key={centre} value={centre}>
                    {centre}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete Selected Button */}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedGroups.size === 0 || isDeleting}
              className={`inline-flex items-center px-4 py-2.5 text-base font-medium rounded-lg shadow-sm transition-all duration-150 ${
                selectedGroups.size === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transform hover:scale-105'
              }`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedGroups.size})
                </>
              )}
            </button>
          </div>

          {/* Create New Group Button */}
          <button
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center px-6 py-2.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Group
          </button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className={`px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider ${
                      header.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-150' : ''
                    } ${header.key === 'select' ? 'w-16' : ''}`}
                    onClick={() => header.sortable && requestSort(header.key)}
                  >
                    {header.key === 'select' ? (
                      <input
                        type="checkbox"
                        checked={filteredAndSortedGroups.length > 0 && selectedGroups.size === filteredAndSortedGroups.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    ) : (
                      <div className="flex items-center">
                        {header.label}
                        {header.sortable && (
                          <span className="ml-1">
                            <SortIcon direction={sortConfig.key === header.key ? sortConfig.direction : null} />
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAndSortedGroups.length > 0 ? (
                filteredAndSortedGroups.map((group, index) => (
                  <tr key={group.id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.id)}
                        onChange={() => handleSelectGroup(group.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{group.agency || <span className="text-slate-500 italic">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                      <Link 
                        to={`/dashboard/groups/${group.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
                      >
                        {group.groupName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{formatDateForDisplay(group.arrivalDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{formatDateForDisplay(group.departureDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 text-center">{group.studentAllocation === null ? <span className="text-slate-500 italic">N/A</span> : group.studentAllocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 text-center">{group.leaderAllocation === null ? <span className="text-slate-500 italic">N/A</span> : group.leaderAllocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 text-center">{group.studentBookings === null ? <span className="text-slate-500 italic">N/A</span> : group.studentBookings}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 text-center">{group.leaderBookings === null ? <span className="text-slate-500 italic">N/A</span> : group.leaderBookings}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{group.centre || <span className="text-slate-500 italic">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{formatFlightInfo(group.arrivalFlights)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{formatFlightInfo(group.departureFlights)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                      <div className="flex items-center space-x-3">
                        <Link 
                          to={`/dashboard/groups/${group.id}`} 
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleOpenModal(group)}
                          className="text-amber-600 hover:text-amber-800 font-medium transition-colors duration-150"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No Groups Found</h3>
                      <p className="text-base text-slate-500 max-w-md">
                        {selectedCentre ? `No groups found for centre "${selectedCentre}"` : 'No groups found in the database. You can import groups from the "Import" page or create a new group.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Form Modal */}
      <GroupFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        groupData={editingGroup}
        availableCentres={uniqueCentres}
      />
    </div>
  );
}

export default GroupsPage;
