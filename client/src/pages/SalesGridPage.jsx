import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to format date as 'Mon 26 May'
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  const options = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  };
  return date.toLocaleDateString('en-GB', options);
};

// Helper function to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to generate date range
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(formatDateToYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// Helper function to check if group is staying on a specific date
const getBedsForDate = (group, date) => {
  // Ensure we have valid group data
  if (!group || !group.arrivalDate || !group.departureDate) {
    return 0;
  }

  try {
    const arrivalDate = new Date(group.arrivalDate);
    const departureDate = new Date(group.departureDate);
    const checkDate = new Date(date);
    
    // Validate dates
    if (isNaN(arrivalDate.getTime()) || isNaN(departureDate.getTime()) || isNaN(checkDate.getTime())) {
      return 0;
    }
    
    // Group requires beds if: date >= arrival AND date < departure
    if (checkDate >= arrivalDate && checkDate < departureDate) {
      // Ensure totalBeds is a valid number
      const totalBeds = parseInt(group.totalBeds) || 0;
      return totalBeds;
    }
    
    return 0;
  } catch (error) {
    console.error('Error in getBedsForDate:', error, { group, date });
    return 0;
  }
};

// Sorting function
const sortGroups = (groups, sortColumn, sortDirection) => {
  return [...groups].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortColumn) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'groupName':
        aValue = a.groupName.toLowerCase();
        bValue = b.groupName.toLowerCase();
        break;
      case 'arrivalDate':
        aValue = new Date(a.arrivalDate);
        bValue = new Date(b.arrivalDate);
        break;
      case 'departureDate':
        aValue = new Date(a.departureDate);
        bValue = new Date(b.departureDate);
        break;
      case 'numberOfLeaders':
        aValue = a.numberOfLeaders || 0;
        bValue = b.numberOfLeaders || 0;
        break;
      case 'numberOfStudents':
        aValue = a.numberOfStudents || 0;
        bValue = b.numberOfStudents || 0;
        break;
      case 'totalBeds':
        aValue = a.totalBeds || 0;
        bValue = b.totalBeds || 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Sort indicator component
const SortIndicator = ({ column, sortColumn, sortDirection }) => {
  if (column !== sortColumn) {
    return (
      <svg className="w-4 h-4 ml-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  
  return sortDirection === 'asc' ? (
    <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
};

// Editable Cell Component
const EditableCell = React.memo(({ value, type, field, groupId, onSave, onCancel, isEditing, onEdit }) => {
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      onCancel();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(groupId, field, editValue);
    } catch (error) {
      console.error('Error saving:', error);
      setEditValue(value); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onCancel();
    }
  };

  if (!isEditing) {
    return (
      <div 
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded min-h-[24px] flex items-center justify-center text-center w-full"
        onClick={onEdit}
        title="Click to edit"
      >
        {type === 'date' && value ? new Date(value).toLocaleDateString('en-GB') : value || '-'}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-1 w-full">
      <input
        ref={inputRef}
        type={type}
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
        min={type === 'number' ? 0 : undefined}
      />
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </div>
  );
});

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, groupName, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800">Confirm Deletion</h3>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete the group <strong>"{groupName}"</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};

// Add New Group Modal
const AddGroupModal = ({ isOpen, onClose, onSave, selectedCentre, selectedAgency, centres, agencies }) => {
  const [formData, setFormData] = useState({
    groupName: '',
    arrivalDate: '',
    departureDate: '',
    numberOfLeaders: '',
    numberOfStudents: '',
    centre: selectedCentre !== 'all' ? selectedCentre : '',
    agency: selectedAgency !== 'all' ? selectedAgency : ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        groupName: '',
        arrivalDate: '',
        departureDate: '',
        numberOfLeaders: '',
        numberOfStudents: '',
        centre: selectedCentre !== 'all' ? selectedCentre : '',
        agency: selectedAgency !== 'all' ? selectedAgency : ''
      });
      setErrors({});
    }
  }, [isOpen, selectedCentre, selectedAgency]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }
    
    if (!formData.arrivalDate) {
      newErrors.arrivalDate = 'Arrival date is required';
    }
    
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    }
    
    if (formData.arrivalDate && formData.departureDate && 
        new Date(formData.arrivalDate) >= new Date(formData.departureDate)) {
      newErrors.departureDate = 'Departure date must be after arrival date';
    }
    
    if (!formData.centre) {
      newErrors.centre = 'Centre is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        numberOfLeaders: parseInt(formData.numberOfLeaders) || 0,
        numberOfStudents: parseInt(formData.numberOfStudents) || 0
      });
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Add New Group</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Group Name *</label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.groupName ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Enter group name"
            />
            {errors.groupName && <p className="text-red-600 text-sm mt-1">{errors.groupName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Centre *</label>
            <select
              value={formData.centre}
              onChange={(e) => setFormData(prev => ({ ...prev, centre: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.centre ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Select a centre</option>
              {centres.map(centre => (
                <option key={centre.value} value={centre.value}>
                  {centre.name}
                </option>
              ))}
            </select>
            {errors.centre && <p className="text-red-600 text-sm mt-1">{errors.centre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agency</label>
            <select
              value={formData.agency}
              onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an agency (optional)</option>
              {agencies.map(agency => (
                <option key={agency.value} value={agency.value}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date *</label>
              <input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.arrivalDate ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.arrivalDate && <p className="text-red-600 text-sm mt-1">{errors.arrivalDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date *</label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.departureDate ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.departureDate && <p className="text-red-600 text-sm mt-1">{errors.departureDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1"># Leaders</label>
              <input
                type="number"
                min="0"
                value={formData.numberOfLeaders}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfLeaders: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1"># Students</label>
              <input
                type="number"
                min="0"
                value={formData.numberOfStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-slate-600 ml-2">Loading sales grid data...</p>
  </div>
);

// Custom Header Component for Full-Width Layout
const SalesGridHeader = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const storedUser = localStorage.getItem('user');
  let userEmail = 'Guest';
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      userEmail = userData.email || 'User';
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h1 className="text-xl font-semibold text-slate-800">Sales Grid - Bed Night Occupancy</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">
            Logged in as: <span className="font-medium text-slate-700">{userEmail}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center text-slate-600 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

function SalesGridPage({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [sortedGroups, setSortedGroups] = useState([]);
  const [centres, setCentres] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState('all');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Editing state
  const [editingCell, setEditingCell] = useState(null); // { groupId, field }
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, group: null, isLoading: false });
  
  // Dynamic date range - calculated from groups data
  const [dateRange, setDateRange] = useState({
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date())
  });
  
  const [dateColumns, setDateColumns] = useState([]);
  const scrollableRef = useRef(null);

  // Add custom styles for the sales grid
  const salesGridStyles = `
    .sales-grid-table {
      table-layout: fixed;
    }
    
    /* Fixed column widths */
    .w-col-1 { width: 60px; min-width: 60px; }      /* ID */
    .w-col-2 { width: 140px; min-width: 140px; }    /* Group Name */
    .w-col-3 { width: 100px; min-width: 100px; }    /* Arrival */
    .w-col-4 { width: 100px; min-width: 100px; }    /* Departure */
    .w-col-5 { width: 80px; min-width: 80px; }      /* Leaders */
    .w-col-6 { width: 80px; min-width: 80px; }      /* Students */
    .w-col-7 { width: 70px; min-width: 70px; }      /* Total */
    .w-col-8 { width: 80px; min-width: 80px; }      /* Actions */
    
    /* Date columns */
    .date-column {
      width: 80px;
      min-width: 80px;
      max-width: 80px;
    }
    
    /* Sticky column positioning - cumulative widths */
    .sticky-col-1 { left: 0px; }                    /* 0 */
    .sticky-col-2 { left: 60px; }                   /* 60 */
    .sticky-col-3 { left: 200px; }                  /* 60 + 140 = 200 */
    .sticky-col-4 { left: 300px; }                  /* 200 + 100 = 300 */
    .sticky-col-5 { left: 400px; }                  /* 300 + 100 = 400 */
    .sticky-col-6 { left: 480px; }                  /* 400 + 80 = 480 */
    .sticky-col-7 { left: 560px; }                  /* 480 + 80 = 560 */
    .sticky-col-8 { left: 630px; }                  /* 560 + 70 = 630 */
    
    /* Ensure text doesn't wrap in headers */
    .sales-grid-table th {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Date column headers - allow wrapping for better fit */
    .date-header {
      white-space: normal;
      line-height: 1.2;
      padding: 8px 4px;
    }
    
    /* Ensure sticky columns have proper z-index and background */
    .sales-grid-table .sticky {
      position: sticky;
      z-index: 10;
      background-color: inherit;
    }
    
    /* Higher z-index for header sticky columns */
    .sales-grid-table thead .sticky {
      z-index: 20;
      background-color: rgb(248 250 252); /* bg-slate-50 */
    }
    
    /* Ensure sticky columns maintain their background on scroll */
    .sales-grid-table tbody tr:nth-child(even) .sticky {
      background-color: rgb(248 250 252); /* bg-slate-50 for even rows */
    }
    
    .sales-grid-table tbody tr:nth-child(odd) .sticky {
      background-color: white; /* bg-white for odd rows */
    }
    
    /* Special handling for totals row */
    .sales-grid-table tbody tr:first-child .sticky {
      background-color: rgb(219 234 254); /* bg-blue-100 for totals row */
    }
    
    /* Ensure borders are visible on sticky columns */
    .sales-grid-table .sticky {
      border-right: 2px solid rgb(147 197 253); /* border-blue-300 */
    }
  `;

  // Calculate dynamic date range based on groups
  const calculateDateRange = (groups) => {
    if (!groups || groups.length === 0) {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate)
      };
    }

    // Find earliest arrival and latest departure
    let earliestArrival = new Date(groups[0].arrivalDate);
    let latestDeparture = new Date(groups[0].departureDate);

    groups.forEach(group => {
      const arrival = new Date(group.arrivalDate);
      const departure = new Date(group.departureDate);
      
      if (arrival < earliestArrival) earliestArrival = arrival;
      if (departure > latestDeparture) latestDeparture = departure;
    });

    // Add 2 days buffer before and after
    const startDate = new Date(earliestArrival);
    startDate.setDate(startDate.getDate() - 2);
    
    const endDate = new Date(latestDeparture);
    endDate.setDate(endDate.getDate() + 2);

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate)
    };
  };

  // Fetch centres on component mount
  useEffect(() => {
    fetchCentres();
    fetchAgencies();
  }, []);

  // Fetch groups when centre or agency changes
  useEffect(() => {
    fetchGroups();
  }, [selectedCentre, selectedAgency]);

  // Update date range when groups change
  useEffect(() => {
    if (groups.length > 0) {
      const dynamicDateRange = calculateDateRange(groups);
      console.log('Dynamic date range:', dynamicDateRange);
      setDateRange(dynamicDateRange);
    }
  }, [groups]);

  // Generate date columns when date range changes
  useEffect(() => {
    const dates = generateDateRange(dateRange.startDate, dateRange.endDate);
    console.log('Generated date columns:', dates);
    setDateColumns(dates);
  }, [dateRange]);

  // Sort groups when groups, sortColumn, or sortDirection changes
  useEffect(() => {
    if (groups.length > 0) {
      const sorted = sortGroups(groups, sortColumn, sortDirection);
      // Display ALL groups - no limit
      setSortedGroups(sorted);
    } else {
      setSortedGroups([]);
    }
  }, [groups, sortColumn, sortDirection]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCentres = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/centres');
      const data = await response.json();
      if (data.success) {
        setCentres(data.centres);
      } else {
        setError('Failed to fetch centres');
      }
    } catch (err) {
      console.error('Error fetching centres:', err);
      setError('Failed to fetch centres');
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/agencies');
      const data = await response.json();
      if (data.success) {
        setAgencies(data.agencies);
      } else {
        setError('Failed to fetch agencies');
      }
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError('Failed to fetch agencies');
    }
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (selectedCentre !== 'all') {
        params.append('centreName', selectedCentre);
      }

      if (selectedAgency !== 'all') {
        params.append('agencyName', selectedAgency);
      }

      console.log('Fetching groups with params:', params.toString());
      const response = await fetch(`http://localhost:5000/api/sales-grid-groups?${params}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        // Ensure totalBeds is calculated correctly for all groups
        const processedGroups = data.groups.map(group => {
          const numberOfStudents = parseInt(group.numberOfStudents) || 0;
          const numberOfLeaders = parseInt(group.numberOfLeaders) || 0;
          const totalBeds = numberOfStudents + numberOfLeaders;
          
          return {
            ...group,
            numberOfStudents,
            numberOfLeaders,
            totalBeds
          };
        });
        
        console.log('Processed groups:', processedGroups);
        setGroups(processedGroups);
      } else {
        console.error('API Error:', data.message);
        setError(data.message || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to fetch groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCentreChange = (e) => {
    setSelectedCentre(e.target.value);
  };

  const handleAgencyChange = (e) => {
    setSelectedAgency(e.target.value);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCellEdit = (groupId, field) => {
    setEditingCell({ groupId, field });
  };

  const handleCellSave = async (groupId, field, value) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const updateData = {
        groupName: group.groupName,
        agency: group.agency,
        arrivalDate: group.arrivalDate,
        departureDate: group.departureDate,
        studentAllocation: group.numberOfStudents,
        leaderAllocation: group.numberOfLeaders,
        centre: group.centre,
        studentBookings: group.numberOfStudents,
        leaderBookings: group.numberOfLeaders
      };

      // Update the specific field
      switch (field) {
        case 'groupName':
          updateData.groupName = value;
          break;
        case 'arrivalDate':
          updateData.arrivalDate = value;
          break;
        case 'departureDate':
          updateData.departureDate = value;
          break;
        case 'numberOfLeaders':
          updateData.leaderAllocation = parseInt(value) || 0;
          updateData.leaderBookings = parseInt(value) || 0;
          break;
        case 'numberOfStudents':
          updateData.studentAllocation = parseInt(value) || 0;
          updateData.studentBookings = parseInt(value) || 0;
          break;
      }

      const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with proper totalBeds calculation
        setGroups(prevGroups => 
          prevGroups.map(g => {
            if (g.id === groupId) {
              // Calculate new values based on the field being updated
              let newNumberOfLeaders = g.numberOfLeaders;
              let newNumberOfStudents = g.numberOfStudents;
              let updatedFieldValue = value;

              // Update the specific field value
              if (field === 'numberOfLeaders') {
                newNumberOfLeaders = parseInt(value) || 0;
              } else if (field === 'numberOfStudents') {
                newNumberOfStudents = parseInt(value) || 0;
              } else if (field.includes('Date')) {
                updatedFieldValue = value;
              } else if (field.includes('number')) {
                updatedFieldValue = parseInt(value) || 0;
              }

              // Calculate the new totalBeds correctly
              const newTotalBeds = newNumberOfLeaders + newNumberOfStudents;

              return {
                ...g,
                [field]: updatedFieldValue,
                numberOfLeaders: newNumberOfLeaders,
                numberOfStudents: newNumberOfStudents,
                totalBeds: newTotalBeds
              };
            }
            return g;
          })
        );
        setSuccessMessage('Group updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group: ' + error.message);
    } finally {
      setEditingCell(null);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleAddGroup = async (groupData) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: groupData.groupName,
          agency: groupData.agency || '',
          arrivalDate: groupData.arrivalDate,
          departureDate: groupData.departureDate,
          studentAllocation: groupData.numberOfStudents,
          leaderAllocation: groupData.numberOfLeaders,
          centre: groupData.centre,
          studentBookings: groupData.numberOfStudents,
          leaderBookings: groupData.numberOfLeaders
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add to local state
        const newGroup = {
          id: data.group.id,
          groupName: data.group.groupName,
          agency: data.group.agency,
          centre: data.group.centre,
          arrivalDate: data.group.arrivalDate,
          departureDate: data.group.departureDate,
          numberOfStudents: data.group.studentAllocation || 0,
          numberOfLeaders: data.group.leaderAllocation || 0,
          totalBeds: (data.group.studentAllocation || 0) + (data.group.leaderAllocation || 0)
        };
        
        setGroups(prevGroups => [...prevGroups, newGroup]);
        setSuccessMessage('Group created successfully');
      } else {
        throw new Error(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group: ' + error.message);
      throw error;
    }
  };

  const handleDeleteGroup = async (group) => {
    setDeleteModal({ isOpen: true, group, isLoading: false });
  };

  const confirmDeleteGroup = async () => {
    const { group } = deleteModal;
    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setGroups(prevGroups => prevGroups.filter(g => g.id !== group.id));
        setSuccessMessage('Group deleted successfully');
        setDeleteModal({ isOpen: false, group: null, isLoading: false });
      } else {
        throw new Error(data.message || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group: ' + error.message);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const calculateColumnTotals = () => {
    const totals = {};
    
    // Ensure we have valid data
    if (!dateColumns || !Array.isArray(dateColumns) || !sortedGroups || !Array.isArray(sortedGroups)) {
      return totals;
    }
    
    dateColumns.forEach(date => {
      try {
        totals[date] = sortedGroups.reduce((sum, group) => {
          const beds = getBedsForDate(group, date);
          return sum + (parseInt(beds) || 0);
        }, 0);
      } catch (error) {
        console.error('Error calculating totals for date:', date, error);
        totals[date] = 0;
      }
    });
    
    return totals;
  };

  const columnTotals = calculateColumnTotals();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Custom Header */}
      <SalesGridHeader onLogout={onLogout} />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Page Description */}
        <div className="text-center">
          <p className="text-slate-600">
            View group occupancy and bed requirements across selected date range
          </p>
        </div>

        {/* Filters and Add Button */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Centre</label>
              <select
                value={selectedCentre}
                onChange={handleCentreChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Centres</option>
                {centres.map(centre => (
                  <option key={centre.value} value={centre.value}>
                    {centre.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Agency</label>
              <select
                value={selectedAgency}
                onChange={handleAgencyChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Agencies</option>
                {agencies.map(agency => (
                  <option key={agency.value} value={agency.value}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <button
                onClick={fetchGroups}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Grid
              </button>
            </div>

            <div>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Group
              </button>
            </div>
          </div>
          
          {/* Dynamic Date Range Display */}
          <div className="mt-4 p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">
              <strong>Date Range:</strong> {dateRange.startDate} to {dateRange.endDate} 
              <span className="text-slate-500 ml-2">
                (Automatically calculated from {groups.length} filtered groups)
              </span>
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Summary Stats - Moved to top */}
        {!isLoading && sortedGroups.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {sortedGroups.length}
                </div>
                <div className="text-sm text-blue-600">
                  Total Groups
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {sortedGroups.reduce((sum, group) => sum + group.numberOfStudents, 0)}
                </div>
                <div className="text-sm text-green-600">Total Students</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {sortedGroups.reduce((sum, group) => sum + group.numberOfLeaders, 0)}
                </div>
                <div className="text-sm text-orange-600">Total Leaders</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...Object.values(columnTotals))}
                </div>
                <div className="text-sm text-purple-600">Peak Daily Beds</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Grid Container */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <LoadingSpinner />
          ) : sortedGroups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-slate-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <p className="text-lg font-medium text-slate-600">No groups found</p>
                <p className="text-sm text-slate-500 mt-1">
                  No groups match the selected filters:
                </p>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <p><strong>Centre:</strong> {selectedCentre === 'all' ? 'All Centres' : selectedCentre}</p>
                  <p><strong>Agency:</strong> {selectedAgency === 'all' ? 'All Agencies' : selectedAgency}</p>
                  <p className="mt-2">Try adjusting your filters or add a new group</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 sales-grid-table">
                <thead className="bg-slate-50">
                  <tr>
                    {/* Fixed columns */}
                    <th 
                      className="sticky sticky-col-1 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-1"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        ID
                        <SortIndicator column="id" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-2 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-2"
                      onClick={() => handleSort('groupName')}
                    >
                      <div className="flex items-center">
                        Group Name
                        <SortIndicator column="groupName" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-3 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-3"
                      onClick={() => handleSort('arrivalDate')}
                    >
                      <div className="flex items-center">
                        Arrival
                        <SortIndicator column="arrivalDate" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-4 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-4"
                      onClick={() => handleSort('departureDate')}
                    >
                      <div className="flex items-center">
                        Departure
                        <SortIndicator column="departureDate" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-5 z-10 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-5"
                      onClick={() => handleSort('numberOfLeaders')}
                    >
                      <div className="flex items-center justify-center">
                        Leaders
                        <SortIndicator column="numberOfLeaders" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-6 z-10 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-6"
                      onClick={() => handleSort('numberOfStudents')}
                    >
                      <div className="flex items-center justify-center">
                        Students
                        <SortIndicator column="numberOfStudents" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th 
                      className="sticky sticky-col-7 z-10 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 cursor-pointer hover:bg-slate-100 select-none w-col-7"
                      onClick={() => handleSort('totalBeds')}
                    >
                      <div className="flex items-center justify-center">
                        Total
                        <SortIndicator column="totalBeds" sortColumn={sortColumn} sortDirection={sortDirection} />
                      </div>
                    </th>
                    <th className="sticky sticky-col-8 z-10 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-r-2 border-blue-300 w-col-8">
                      Actions
                    </th>
                    
                    {/* Date columns */}
                    {dateColumns.map(date => (
                      <th key={date} className="date-column date-header px-2 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        <div className="leading-tight">
                          {formatDateHeader(date)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {/* Totals Row */}
                  <tr className="bg-blue-100 border-b-2 border-blue-300">
                    <td className="sticky sticky-col-1 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 w-col-1 text-center">
                      TOTALS
                    </td>
                    <td className="sticky sticky-col-2 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 w-col-2 text-center">
                      {sortedGroups.length} groups
                    </td>
                    <td className="sticky sticky-col-3 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 w-col-3 text-center">
                      -
                    </td>
                    <td className="sticky sticky-col-4 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 w-col-4 text-center">
                      -
                    </td>
                    <td className="sticky sticky-col-5 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 text-center w-col-5">
                      {sortedGroups.reduce((sum, group) => sum + group.numberOfLeaders, 0)}
                    </td>
                    <td className="sticky sticky-col-6 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 text-center w-col-6">
                      {sortedGroups.reduce((sum, group) => sum + group.numberOfStudents, 0)}
                    </td>
                    <td className="sticky sticky-col-7 z-10 bg-blue-100 px-4 py-3 text-sm font-bold text-slate-900 border-r-2 border-blue-300 text-center w-col-7">
                      {sortedGroups.reduce((sum, group) => sum + group.totalBeds, 0)}
                    </td>
                    <td className="sticky sticky-col-8 z-10 bg-blue-100 px-4 py-3 border-r-2 border-blue-300 w-col-8 text-center"></td>
                    
                    {/* Date totals */}
                    {dateColumns.map(date => (
                      <td key={date} className="date-column px-2 py-3 text-sm font-bold text-center border-r border-slate-200">
                        {columnTotals[date] > 0 ? (
                          <span className="inline-flex items-center justify-center w-10 h-8 bg-blue-200 text-blue-900 text-xs font-bold rounded">
                            {columnTotals[date]}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Group rows */}
                  {sortedGroups.map((group, index) => (
                    <tr key={group.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="sticky sticky-col-1 z-10 bg-inherit px-4 py-3 text-sm text-slate-900 border-r-2 border-blue-300 w-col-1 text-center">
                        {group.id}
                      </td>
                      <td className="sticky sticky-col-2 z-10 bg-inherit px-4 py-3 text-sm font-medium text-slate-900 border-r-2 border-blue-300 w-col-2">
                        <EditableCell
                          value={group.groupName}
                          type="text"
                          field="groupName"
                          groupId={group.id}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          isEditing={editingCell?.groupId === group.id && editingCell?.field === 'groupName'}
                          onEdit={() => handleCellEdit(group.id, 'groupName')}
                        />
                      </td>
                      <td className="sticky sticky-col-3 z-10 bg-inherit px-4 py-3 text-sm text-slate-900 border-r-2 border-blue-300 w-col-3">
                        <EditableCell
                          value={group.arrivalDate}
                          type="date"
                          field="arrivalDate"
                          groupId={group.id}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          isEditing={editingCell?.groupId === group.id && editingCell?.field === 'arrivalDate'}
                          onEdit={() => handleCellEdit(group.id, 'arrivalDate')}
                        />
                      </td>
                      <td className="sticky sticky-col-4 z-10 bg-inherit px-4 py-3 text-sm text-slate-900 border-r-2 border-blue-300 w-col-4">
                        <EditableCell
                          value={group.departureDate}
                          type="date"
                          field="departureDate"
                          groupId={group.id}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          isEditing={editingCell?.groupId === group.id && editingCell?.field === 'departureDate'}
                          onEdit={() => handleCellEdit(group.id, 'departureDate')}
                        />
                      </td>
                      <td className="sticky sticky-col-5 z-10 bg-inherit px-4 py-3 text-sm text-slate-900 border-r-2 border-blue-300 text-center w-col-5">
                        <EditableCell
                          value={group.numberOfLeaders}
                          type="number"
                          field="numberOfLeaders"
                          groupId={group.id}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          isEditing={editingCell?.groupId === group.id && editingCell?.field === 'numberOfLeaders'}
                          onEdit={() => handleCellEdit(group.id, 'numberOfLeaders')}
                        />
                      </td>
                      <td className="sticky sticky-col-6 z-10 bg-inherit px-4 py-3 text-sm text-slate-900 border-r-2 border-blue-300 text-center w-col-6">
                        <EditableCell
                          value={group.numberOfStudents}
                          type="number"
                          field="numberOfStudents"
                          groupId={group.id}
                          onSave={handleCellSave}
                          onCancel={handleCellCancel}
                          isEditing={editingCell?.groupId === group.id && editingCell?.field === 'numberOfStudents'}
                          onEdit={() => handleCellEdit(group.id, 'numberOfStudents')}
                        />
                      </td>
                      <td className="sticky sticky-col-7 z-10 bg-inherit px-4 py-3 text-sm font-semibold text-slate-900 border-r-2 border-blue-300 text-center bg-blue-50 w-col-7">
                        <div className="flex items-center justify-center">
                          {group.totalBeds}
                        </div>
                      </td>
                      <td className="sticky sticky-col-8 z-10 bg-inherit px-4 py-3 border-r-2 border-blue-300 w-col-8 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete group"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      
                      {/* Date columns for this group */}
                      {dateColumns.map(date => {
                        const beds = getBedsForDate(group, date);
                        return (
                          <td key={date} className="date-column px-2 py-3 text-sm text-center border-r border-slate-200">
                            {beds > 0 ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                {beds}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddGroup}
        selectedCentre={selectedCentre}
        selectedAgency={selectedAgency}
        centres={centres}
        agencies={agencies}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        groupName={deleteModal.group?.groupName}
        onConfirm={confirmDeleteGroup}
        onCancel={() => setDeleteModal({ isOpen: false, group: null, isLoading: false })}
        isLoading={deleteModal.isLoading}
      />

      {/* Add the custom styles */}
      <style>{salesGridStyles}</style>
    </div>
  );
}

export default SalesGridPage; 