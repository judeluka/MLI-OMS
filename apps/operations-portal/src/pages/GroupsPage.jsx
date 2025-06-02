// src/pages/GroupsPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Modern Icon Components
const PlusIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const MagnifyingGlassIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const FunnelIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);

const EyeIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const PencilIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

// Helper function to get sort icon - matching ParticipantsPage.jsx exactly
const SortIcon = ({ direction }) => {
  if (!direction) {
    return <span className="ml-1 text-gray-400">↕</span>;
  }
  return direction === 'ascending' ? <span className="ml-1 text-gray-600">▲</span> : <span className="ml-1 text-gray-600">▼</span>;
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

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-4xl">
                <div className="modal-header">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {groupData?.id ? 'Edit Group' : 'Create New Group'}
                    </h3>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="groupName" className="form-label">Group Name*</label>
                                <input 
                                    type="text" 
                                    name="groupName" 
                                    id="groupName" 
                                    value={formData.groupName || ''} 
                                    onChange={handleChange} 
                                    className={`form-input ${formErrors.groupName ? 'border-red-500' : ''}`} 
                                />
                                {formErrors.groupName && <p className="form-error">{formErrors.groupName}</p>}
                            </div>
                            <div>
                                <label htmlFor="agency" className="form-label">Agency</label>
                                <input 
                                    type="text" 
                                    name="agency" 
                                    id="agency" 
                                    value={formData.agency || ''} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                />
                            </div>
                            <div>
                                <label htmlFor="arrivalDate" className="form-label">Arrival Date*</label>
                                <input 
                                    type="date" 
                                    name="arrivalDate" 
                                    id="arrivalDate" 
                                    value={formData.arrivalDate || ''} 
                                    onChange={handleChange} 
                                    className={`form-input ${formErrors.arrivalDate ? 'border-red-500' : ''}`} 
                                />
                                {formErrors.arrivalDate && <p className="form-error">{formErrors.arrivalDate}</p>}
                            </div>
                            <div>
                                <label htmlFor="departureDate" className="form-label">Departure Date*</label>
                                <input 
                                    type="date" 
                                    name="departureDate" 
                                    id="departureDate" 
                                    value={formData.departureDate || ''} 
                                    onChange={handleChange} 
                                    className={`form-input ${formErrors.departureDate ? 'border-red-500' : ''}`} 
                                />
                                {formErrors.departureDate && <p className="form-error">{formErrors.departureDate}</p>}
                            </div>
                            <div>
                                <label htmlFor="studentAllocation" className="form-label">Student Allocation</label>
                                <input 
                                    type="number" 
                                    name="studentAllocation" 
                                    id="studentAllocation" 
                                    value={formData.studentAllocation === null ? '' : formData.studentAllocation} 
                                    onChange={handleChange} 
                                    className={`form-input ${formErrors.studentAllocation ? 'border-red-500' : ''}`} 
                                />
                                {formErrors.studentAllocation && <p className="form-error">{formErrors.studentAllocation}</p>}
                            </div>
                            <div>
                                <label htmlFor="leaderAllocation" className="form-label">Leader Allocation</label>
                                <input 
                                    type="number" 
                                    name="leaderAllocation" 
                                    id="leaderAllocation" 
                                    value={formData.leaderAllocation === null ? '' : formData.leaderAllocation} 
                                    onChange={handleChange} 
                                    className={`form-input ${formErrors.leaderAllocation ? 'border-red-500' : ''}`} 
                                />
                                {formErrors.leaderAllocation && <p className="form-error">{formErrors.leaderAllocation}</p>}
                            </div>
                            <div>
                                <label htmlFor="studentBookings" className="form-label">Student Bookings</label>
                                <input 
                                    type="number" 
                                    name="studentBookings" 
                                    id="studentBookings" 
                                    value={formData.studentBookings === null ? '' : formData.studentBookings} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                />
                            </div>
                            <div>
                                <label htmlFor="leaderBookings" className="form-label">Leader Bookings</label>
                                <input 
                                    type="number" 
                                    name="leaderBookings" 
                                    id="leaderBookings" 
                                    value={formData.leaderBookings === null ? '' : formData.leaderBookings} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="centre" className="form-label">Centre</label>
                                <select 
                                    name="centre" 
                                    id="centre" 
                                    value={formData.centre || ''} 
                                    onChange={handleChange} 
                                    className="form-select"
                                >
                                    <option value="">Select Centre</option>
                                    {availableCentres.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        onClick={handleSubmit}
                        className="btn-primary"
                    >
                        {groupData?.id ? 'Update Group' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

function GroupsPage() {
  const [groupsData, setGroupsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedCentre, setSelectedCentre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [apiFeedback, setApiFeedback] = useState({ message: '', type: '' });
  
  // New state for multi-select functionality
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Define table headers with a 'key' for sorting and a 'sortable' flag
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
      console.error('Error fetching groups:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (apiFeedback.message) {
      const timer = setTimeout(() => {
        setApiFeedback({ message: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [apiFeedback]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedGroups.size === groupsData.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(groupsData.map(group => group.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGroups.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedGroups.size} group(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedGroups).map(async (groupId) => {
        const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(`Failed to delete group ${groupId}: ${errorData.message || response.status}`);
        }
        return response.json();
      });

      await Promise.all(deletePromises);
      
      // Refresh the groups list
      await fetchGroups();
      setSelectedGroups(new Set());
      setApiFeedback({ message: `Successfully deleted ${selectedGroups.size} group(s).`, type: 'success' });
    } catch (err) {
      console.error('Error deleting groups:', err);
      setApiFeedback({ message: `Error deleting groups: ${err.message}`, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModal = (group = null) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingGroup 
        ? `http://localhost:5000/api/groups/${editingGroup.id}`
        : 'http://localhost:5000/api/groups';
      
      const method = editingGroup ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchGroups(); // Refresh the list
        handleCloseModal();
        setApiFeedback({ 
          message: editingGroup ? 'Group updated successfully!' : 'Group created successfully!', 
          type: 'success' 
        });
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setApiFeedback({ message: `Error: ${err.message}`, type: 'error' });
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatFlightInfo = (flights) => {
    if (!flights || flights.length === 0) {
      return <span className="text-gray-500 text-sm">No flights</span>;
    }
    
    return (
      <div className="space-y-1">
        {flights.slice(0, 2).map((flight, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium">{flight.flightNumber}</span>
            {flight.time && (
              <span className="text-gray-600 ml-1">
                ({formatFlightTime(flight.time)})
              </span>
            )}
          </div>
        ))}
        {flights.length > 2 && (
          <div className="text-xs text-gray-500">
            +{flights.length - 2} more
          </div>
        )}
      </div>
    );
  };

  const formatFlightTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      if (isNaN(hour) || isNaN(minute)) return timeString;
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filteredData = groupsData.filter(group => {
      const matchesSearch = !searchTerm || 
        group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.agency?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCentre = !selectedCentre || group.centre === selectedCentre;
      
      return matchesSearch && matchesCentre;
    });

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (aString < bString) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [groupsData, sortConfig, selectedCentre, searchTerm]);

  // Get unique centres for filter dropdown
  const availableCentres = useMemo(() => {
    const centres = [...new Set(groupsData.map(group => group.centre).filter(Boolean))];
    return centres.sort();
  }, [groupsData]);

  if (isLoading) {
    return (
      <div className="page-content">
        <div className="animate-pulse space-y-6">
          <div className="page-header">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="card p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Groups Management</h1>
          <p className="page-subtitle">Manage group registrations and allocations</p>
        </div>
        <div className="alert-error">
          <div className="alert-title">Error Loading Groups</div>
          <div className="alert-description">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          {/* Centered Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Groups Management</h1>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">Manage group registrations, allocations, and flight information</p>
          </div>
        </div>

        {/* API Feedback */}
        {apiFeedback.message && (
          <div className={`mb-8 ${apiFeedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 mt-0.5 ${apiFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={apiFeedback.type === 'success' ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${apiFeedback.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{apiFeedback.message}</p>
              </div>
              <div className="ml-3">
                <button
                  onClick={() => setApiFeedback({ message: '', type: '' })}
                  className={`inline-flex transition-colors duration-200 ${apiFeedback.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Groups Management Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Managed Groups</h2>
                <span className="text-sm text-gray-500 font-medium">
                  ({filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? 'group' : 'groups'})
                </span>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Group
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              {/* Search */}
              <div className="flex items-center gap-3">
                <label htmlFor="search" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Search:</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Group name or agency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-4 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Centre Filter */}
              <div className="flex items-center gap-3">
                <label htmlFor="centreFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Centre:</label>
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    id="centreFilter"
                    value={selectedCentre}
                    onChange={(e) => setSelectedCentre(e.target.value)}
                    className="w-40 px-4 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">All Centres</option>
                    {availableCentres.map(centre => (
                      <option key={centre} value={centre}>{centre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delete Selected Button */}
              {selectedGroups.size > 0 && (
                <div className="ml-auto">
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete ({selectedGroups.size})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            {filteredAndSortedData.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.985 2.985 0 01-.184 1.005A4.2 4.2 0 0019.5 10.5a4.2 4.2 0 00-1.314-.199 2.985 2.985 0 01.184-1.005M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                  {searchTerm || selectedCentre 
                    ? 'No groups match your current filters. Try adjusting your search criteria.' 
                    : 'No groups found. Click "New Group" to add your first group.'}
                </p>
                {!searchTerm && !selectedCentre && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Group
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200/60">
                <thead className="bg-gray-50/50">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        scope="col"
                        className={`px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                          header.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200' : ''
                        }`}
                        onClick={header.sortable ? () => requestSort(header.key) : undefined}
                      >
                        <div className="flex items-center justify-center">
                          {header.key === 'select' ? (
                            <input
                              type="checkbox"
                              checked={selectedGroups.size === groupsData.length && groupsData.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              title="Select all"
                            />
                          ) : (
                            <>
                              {header.label}
                              {header.sortable && (
                                <span className="ml-1">
                                  <SortIcon direction={sortConfig.key === header.key ? sortConfig.direction : null} />
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/60">
                  {filteredAndSortedData.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(group.id)}
                          onChange={() => handleSelectGroup(group.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{group.agency || 'N/A'}</td>
                      <td className="px-6 py-5 text-sm font-medium text-center">
                        <Link to={`/dashboard/groups/${group.id}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 focus:outline-none focus:underline">
                          {group.groupName || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{formatDateForDisplay(group.arrivalDate)}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{formatDateForDisplay(group.departureDate)}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{group.studentAllocation || 0}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{group.leaderAllocation || 0}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{group.studentBookings || 0}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{group.leaderBookings || 0}</td>
                      <td className="px-6 py-5 text-sm font-medium text-center">
                        {group.centre ? (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{group.centre}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{formatFlightInfo(group.arrivalFlights)}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{formatFlightInfo(group.departureFlights)}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <Link
                            to={`/dashboard/groups/${group.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleOpenModal(group)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Results Summary */}
          <div className="px-6 py-4 border-t border-gray-200/60 bg-gray-50/30">
            <div className="text-sm text-gray-600 font-medium">
              Showing {filteredAndSortedData.length} of {groupsData.length} groups
              {selectedGroups.size > 0 && ` (${selectedGroups.size} selected)`}
            </div>
          </div>
        </div>
      </div>

      {/* Group Form Modal */}
      <GroupFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        groupData={editingGroup}
        availableCentres={availableCentres}
      />
    </div>
  );
}

export default GroupsPage;
