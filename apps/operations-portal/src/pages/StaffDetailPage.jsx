import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StaffDetailPage = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [accommodationAssignments, setAccommodationAssignments] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [centres, setCentres] = useState([]);
  const [showWorkAssignmentModal, setShowWorkAssignmentModal] = useState(false);
  const [workAssignmentForm, setWorkAssignmentForm] = useState({
    centre_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [showAccommodationModal, setShowAccommodationModal] = useState(false);
  const [accommodationForm, setAccommodationForm] = useState({
    centre_id: '',
    start_date: '',
    end_date: '',
    accommodation_name: '',
    address: '',
    room_type: '',
    meal_plan: '',
    cost_per_night: '',
    accommodation_grade: 'standard',
    booking_reference: '',
    special_requirements: '',
    notes: ''
  });

  // Fetch staff member details
  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/staff/${staffId}`);
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.staff);
      } else {
        setError(data.message || 'Failed to fetch staff details');
      }
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setError('Failed to load staff details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accommodation assignments
  const fetchAccommodationAssignments = async () => {
    try {
      const response = await fetch(`/api/staff/${staffId}/accommodation-assignments`);
      const data = await response.json();
      if (data.success) {
        setAccommodationAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching accommodation assignments:', err);
    }
  };

  // Fetch work assignments
  const fetchWorkAssignments = async () => {
    try {
      const response = await fetch(`/api/staff/${staffId}/work-assignments`);
      const data = await response.json();
      if (data.success) {
        setWorkAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching work assignments:', err);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/staff/${staffId}/documents`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  // Fetch centres
  const fetchCentres = async () => {
    try {
      const response = await fetch('/api/centres');
      const data = await response.json();
      if (data.success) {
        setCentres(data.centres || []);
      }
    } catch (err) {
      console.error('Error fetching centres:', err);
    }
  };

  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/staff/${staffId}/schedule`);
      const data = await response.json();
      if (data.success) {
        setSchedule(data.schedule || []);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    if (staffId) {
      fetchStaffDetails();
      fetchAccommodationAssignments();
      fetchWorkAssignments();
      fetchDocuments();
      fetchCentres();
      fetchSchedule();
    }
  }, [staffId]);

  // Handle delete staff member
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${staff.first_name} ${staff.last_name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/dashboard/staff');
      } else {
        setError(data.message || 'Failed to delete staff member');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Calculate contract duration
  const calculateContractDuration = (startDate, endDate) => {
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  // Check if contract is active
  const isContractActive = (startDate, endDate) => {
    if (!startDate) return false;
    const today = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    return today >= start && (!end || today <= end);
  };

  // Handle work assignment form submission
  const handleWorkAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/staff/${staffId}/work-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workAssignmentForm),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowWorkAssignmentModal(false);
        setWorkAssignmentForm({
          centre_id: '',
          start_date: '',
          end_date: '',
          notes: ''
        });
        fetchWorkAssignments();
      } else {
        setError(data.message || 'Failed to create work assignment');
      }
    } catch (err) {
      console.error('Error creating work assignment:', err);
      setError('Failed to create work assignment. Please try again.');
    }
  };

  // Handle accommodation assignment form submission
  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/staff/${staffId}/accommodation-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accommodationForm),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAccommodationModal(false);
        setAccommodationForm({
          centre_id: '',
          start_date: '',
          end_date: '',
          accommodation_name: '',
          address: '',
          room_type: '',
          meal_plan: '',
          cost_per_night: '',
          accommodation_grade: 'standard',
          booking_reference: '',
          special_requirements: '',
          notes: ''
        });
        fetchAccommodationAssignments();
      } else {
        setError(data.message || 'Failed to create accommodation assignment');
      }
    } catch (err) {
      console.error('Error creating accommodation assignment:', err);
      setError('Failed to create accommodation assignment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading staff details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Staff</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/staff')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Member Not Found</h3>
          <p className="text-gray-600 mb-4">The staff member you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard/staff')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'assignments', name: 'Assignments', icon: '🏢' },
    { id: 'accommodation', name: 'Accommodation', icon: '🏠' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'documents', name: 'Documents', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/staff')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {staff.first_name} {staff.last_name}
                  </h1>
                  <p className="text-sm text-gray-600">{staff.role || 'Staff Member'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{staff.first_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{staff.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-blue-600">
                      <a href={`mailto:${staff.email}`} className="hover:text-blue-800">
                        {staff.email}
                      </a>
                    </dd>
                  </div>
                  {staff.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-blue-600">
                        <a href={`tel:${staff.phone}`} className="hover:text-blue-800">
                          {staff.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {staff.date_of_birth && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(staff.date_of_birth).toLocaleDateString()}
                        {calculateAge(staff.date_of_birth) && (
                          <span className="text-gray-500 ml-2">
                            (Age: {calculateAge(staff.date_of_birth)})
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                  {staff.dietary_requirements && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dietary Requirements</dt>
                      <dd className="mt-1 text-sm text-gray-900">{staff.dietary_requirements}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Contract Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Contract Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">{staff.role || 'Not specified'}</dd>
                  </div>
                  {staff.contract_start_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contract Start</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(staff.contract_start_date).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {staff.contract_end_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contract End</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(staff.contract_end_date).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {staff.contract_start_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {calculateContractDuration(staff.contract_start_date, staff.contract_end_date)}
                      </dd>
                    </div>
                  )}
                  {staff.contract_start_date && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                          isContractActive(staff.contract_start_date, staff.contract_end_date)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isContractActive(staff.contract_start_date, staff.contract_end_date) ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Staff ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">#{staff.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(staff.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Work Assignments</h3>
                  <button 
                    onClick={() => setShowWorkAssignmentModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Assignment
                  </button>
                </div>
                {workAssignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.centre_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.start_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No work assignments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new work assignment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accommodation' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Accommodation History</h3>
                  <button 
                    onClick={() => setShowAccommodationModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Accommodation
                  </button>
                </div>
                {accommodationAssignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accommodation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {accommodationAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.accommodation_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.centre_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.start_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Current'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.room_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No accommodation history</h3>
                    <p className="mt-1 text-sm text-gray-500">No accommodation assignments have been recorded for this staff member.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Current Assignments Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Schedule Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-900">Active Work Assignments</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {workAssignments.filter(w => w.is_active).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-900">Current Accommodations</p>
                        <p className="text-2xl font-bold text-green-600">
                          {accommodationAssignments.filter(a => !a.end_date || new Date(a.end_date) >= new Date()).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-900">Documents</p>
                        <p className="text-2xl font-bold text-purple-600">{documents.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Work Assignments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Current Work Assignments</h3>
                {workAssignments.filter(w => w.is_active).length > 0 ? (
                  <div className="space-y-3">
                    {workAssignments.filter(w => w.is_active).map((assignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{assignment.centre_name}</h4>
                            <p className="text-sm text-gray-500">
                              Started: {new Date(assignment.start_date).toLocaleDateString()}
                              {assignment.end_date && ` • Ends: ${new Date(assignment.end_date).toLocaleDateString()}`}
                            </p>
                            {assignment.notes && (
                              <p className="text-sm text-gray-600 mt-1">{assignment.notes}</p>
                            )}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No active work assignments</p>
                )}
              </div>
            </div>

            {/* Weekly Schedule Placeholder */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Schedule</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Schedule Entry
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="text-center">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{day}</h4>
                      <div className="space-y-2">
                        {schedule.filter(s => s.day === day).length > 0 ? (
                          schedule.filter(s => s.day === day).map((item, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 text-xs p-2 rounded">
                              <p className="font-medium">{item.time}</p>
                              <p>{item.activity}</p>
                              {item.location && <p className="text-blue-600">{item.location}</p>}
                            </div>
                          ))
                        ) : (
                          <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No schedule</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Events & Deadlines</h3>
                <div className="space-y-3">
                  {/* Show upcoming contract end dates */}
                  {workAssignments.filter(w => w.end_date && new Date(w.end_date) > new Date()).map((assignment) => (
                    <div key={`work-${assignment.id}`} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Work assignment ending at {assignment.centre_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(assignment.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show upcoming accommodation check-outs */}
                  {accommodationAssignments.filter(a => a.end_date && new Date(a.end_date) > new Date()).map((assignment) => (
                    <div key={`acc-${assignment.id}`} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Accommodation check-out: {assignment.accommodation_name || 'Accommodation'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(assignment.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {workAssignments.filter(w => w.end_date && new Date(w.end_date) > new Date()).length === 0 && 
                   accommodationAssignments.filter(a => a.end_date && new Date(a.end_date) > new Date()).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming events or deadlines</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Documents</h3>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload Document
                  </button>
                </div>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((document) => (
                      <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
                              <p className="text-sm text-gray-500">{document.type}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">No documents have been uploaded for this staff member.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Assignment Modal */}
      {showWorkAssignmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleWorkAssignmentSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Work Assignment
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Centre *
                      </label>
                      <select
                        value={workAssignmentForm.centre_id}
                        onChange={(e) => setWorkAssignmentForm(prev => ({ ...prev, centre_id: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a centre</option>
                        {centres.map((centre) => (
                          <option key={centre.id} value={centre.id}>
                            {centre.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={workAssignmentForm.start_date}
                        onChange={(e) => setWorkAssignmentForm(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={workAssignmentForm.end_date}
                        onChange={(e) => setWorkAssignmentForm(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={workAssignmentForm.notes}
                        onChange={(e) => setWorkAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional notes about this assignment"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkAssignmentModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Accommodation Assignment Modal */}
      {showAccommodationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleAccommodationSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Accommodation Assignment
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Centre
                      </label>
                      <select
                        value={accommodationForm.centre_id}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, centre_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a centre</option>
                        {centres.map((centre) => (
                          <option key={centre.id} value={centre.id}>
                            {centre.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accommodation Name
                      </label>
                      <input
                        type="text"
                        value={accommodationForm.accommodation_name}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, accommodation_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Hotel/Residence name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={accommodationForm.start_date}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={accommodationForm.end_date}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, end_date: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type
                      </label>
                      <input
                        type="text"
                        value={accommodationForm.room_type}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, room_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Single, Double, Twin, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meal Plan
                      </label>
                      <select
                        value={accommodationForm.meal_plan}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, meal_plan: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select meal plan</option>
                        <option value="No meals">No meals</option>
                        <option value="Breakfast only">Breakfast only</option>
                        <option value="Half board">Half board</option>
                        <option value="Full board">Full board</option>
                        <option value="All inclusive">All inclusive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost per Night
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={accommodationForm.cost_per_night}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, cost_per_night: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Reference
                      </label>
                      <input
                        type="text"
                        value={accommodationForm.booking_reference}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, booking_reference: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Booking confirmation number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={accommodationForm.address}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Accommodation address"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requirements
                      </label>
                      <textarea
                        value={accommodationForm.special_requirements}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, special_requirements: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requirements or accessibility needs"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={accommodationForm.notes}
                        onChange={(e) => setAccommodationForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional notes about this accommodation assignment"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAccommodationModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDetailPage; 