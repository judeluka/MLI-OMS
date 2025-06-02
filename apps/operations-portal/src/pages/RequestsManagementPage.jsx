import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Comprehensive mock data for all requests from all agencies
const mockAllRequests = [
  {
    id: 'REQ001',
    agencyId: 1,
    agencyName: 'Global Education Partners',
    dateSubmitted: '2024-01-15',
    requestType: 'ALLOCATION_CHANGE',
    relatedGroupId: 'GRP001',
    relatedGroupName: 'Summer English Intensive 2024',
    description: '+5 allocations',
    detailedNotes: 'We have additional students who would like to join the Summer English Intensive program. Please increase our allocation from 25 to 30 students.',
    internalMliNotes: 'Agency has good payment history. Consider approval.',
    status: 'Pending',
    assignedTo: 'Jane Roberts',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'REQ002',
    agencyId: 1,
    agencyName: 'Global Education Partners',
    dateSubmitted: '2024-01-12',
    requestType: 'DATE_CHANGE',
    relatedGroupId: 'GRP002',
    relatedGroupName: 'Academic Preparation Course',
    description: 'Change arrival to 03/08/2024',
    detailedNotes: 'Due to visa processing delays, our group needs to arrive 2 days later than originally planned. Could we change the arrival date from 01/08/2024 to 03/08/2024?',
    internalMliNotes: 'Check accommodation availability for new dates.',
    status: 'Action Required',
    assignedTo: 'Michael Chen',
    lastUpdated: '2024-01-14'
  },
  {
    id: 'REQ003',
    agencyId: 1,
    agencyName: 'Global Education Partners',
    dateSubmitted: '2024-01-08',
    requestType: 'EXTRA_REQUEST',
    relatedGroupId: 'GRP001',
    relatedGroupName: 'Summer English Intensive 2024',
    description: 'Request for London Eye experience',
    detailedNotes: 'Our students are very interested in visiting the London Eye during their stay. Could this be arranged as an additional activity?',
    internalMliNotes: 'Standard extra activity. Quote £25 per student.',
    status: 'Approved',
    assignedTo: 'Sarah Wilson',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'REQ004',
    agencyId: 2,
    agencyName: 'International Study Tours',
    dateSubmitted: '2024-01-20',
    requestType: 'ALLOCATION_CHANGE',
    relatedGroupId: 'GRP003',
    relatedGroupName: 'Business English Workshop',
    description: '-3 allocations',
    detailedNotes: 'Unfortunately, 3 students had to cancel due to work commitments. Please reduce our allocation from 15 to 12 students.',
    internalMliNotes: 'Cancellation within policy. Refund to be processed.',
    status: 'Approved',
    assignedTo: 'Jane Roberts',
    lastUpdated: '2024-01-21'
  },
  {
    id: 'REQ005',
    agencyId: 4,
    agencyName: 'Pacific Education Group',
    dateSubmitted: '2024-01-25',
    requestType: 'EXTRA_REQUEST',
    relatedGroupId: 'GRP004',
    relatedGroupName: 'Cultural Exchange Program',
    description: 'Request for traditional afternoon tea experience',
    detailedNotes: 'As part of the cultural exchange program, our students would love to experience a traditional British afternoon tea. Can this be arranged?',
    internalMliNotes: 'Partner with local tea rooms. Quote pending.',
    status: 'Pending',
    assignedTo: 'Michael Chen',
    lastUpdated: '2024-01-25'
  },
  {
    id: 'REQ006',
    agencyId: 4,
    agencyName: 'Pacific Education Group',
    dateSubmitted: '2024-01-18',
    requestType: 'DATE_CHANGE',
    relatedGroupId: 'GRP004',
    relatedGroupName: 'Cultural Exchange Program',
    description: 'Change departure to 18/09/2024',
    detailedNotes: 'Students would like to extend their stay by 2 days to experience the weekend in London. Can we change departure from 16/09/2024 to 18/09/2024?',
    internalMliNotes: 'Extension approved. Additional accommodation costs apply.',
    status: 'Denied',
    assignedTo: 'Sarah Wilson',
    lastUpdated: '2024-01-20'
  },
  {
    id: 'REQ007',
    agencyId: 3,
    agencyName: 'Euro Language Academy',
    dateSubmitted: '2024-01-22',
    requestType: 'ALLOCATION_CHANGE',
    relatedGroupId: null,
    relatedGroupName: 'N/A',
    description: 'Initial allocation request',
    detailedNotes: 'We would like to request an initial allocation of 20 students for a General English course starting in March 2024.',
    internalMliNotes: 'New agency. Verify credentials and payment terms.',
    status: 'Action Required',
    assignedTo: 'Jane Roberts',
    lastUpdated: '2024-01-23'
  },
  {
    id: 'REQ008',
    agencyId: 2,
    agencyName: 'International Study Tours',
    dateSubmitted: '2024-01-28',
    requestType: 'EXTRA_REQUEST',
    relatedGroupId: 'GRP003',
    relatedGroupName: 'Business English Workshop',
    description: 'Request for Windsor Castle visit',
    detailedNotes: 'Our business students would like to visit Windsor Castle as part of their cultural education. Please arrange a half-day excursion.',
    internalMliNotes: 'Check group availability and transportation options.',
    status: 'Pending',
    assignedTo: 'Michael Chen',
    lastUpdated: '2024-01-28'
  }
];

// Mock service functions
const fetchAllRequests = (filters = {}, pagination = { page: 1, limit: 10 }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRequests = [...mockAllRequests];
      
      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredRequests = filteredRequests.filter(request => 
          request.id.toLowerCase().includes(searchTerm) ||
          request.agencyName.toLowerCase().includes(searchTerm) ||
          request.relatedGroupName?.toLowerCase().includes(searchTerm) ||
          request.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.agency) {
        filteredRequests = filteredRequests.filter(request => 
          request.agencyName === filters.agency
        );
      }
      
      if (filters.requestType && filters.requestType !== 'All Types') {
        filteredRequests = filteredRequests.filter(request => 
          request.requestType === filters.requestType
        );
      }
      
      if (filters.status && filters.status !== 'All Statuses') {
        filteredRequests = filteredRequests.filter(request => 
          request.status === filters.status
        );
      }
      
      if (filters.dateFrom || filters.dateTo) {
        filteredRequests = filteredRequests.filter(request => {
          const requestDate = new Date(request.dateSubmitted);
          const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
          const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
          
          if (fromDate && requestDate < fromDate) return false;
          if (toDate && requestDate > toDate) return false;
          return true;
        });
      }
      
      // Apply sorting
      if (filters.sortBy) {
        filteredRequests.sort((a, b) => {
          let aVal = a[filters.sortBy];
          let bVal = b[filters.sortBy];
          
          if (filters.sortBy === 'dateSubmitted' || filters.sortBy === 'lastUpdated') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }
          
          if (filters.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
      }
      
      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
      
      resolve({
        success: true,
        data: paginatedRequests,
        meta: {
          currentPage: pagination.page,
          totalPages: Math.ceil(filteredRequests.length / pagination.limit),
          totalItems: filteredRequests.length,
          itemsPerPage: pagination.limit
        }
      });
    }, 300);
  });
};

const approveRequest = (requestId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockAllRequests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        mockAllRequests[requestIndex].status = 'Approved';
        mockAllRequests[requestIndex].lastUpdated = new Date().toISOString().split('T')[0];
      }
      
      resolve({
        success: true,
        message: 'Request approved successfully'
      });
    }, 500);
  });
};

const denyRequest = (requestId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockAllRequests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        mockAllRequests[requestIndex].status = 'Denied';
        mockAllRequests[requestIndex].lastUpdated = new Date().toISOString().split('T')[0];
      }
      
      resolve({
        success: true,
        message: 'Request denied successfully'
      });
    }, 500);
  });
};

const RequestsManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    search: '',
    agency: '',
    requestType: 'All Types',
    status: 'All Statuses',
    dateFrom: '',
    dateTo: '',
    sortBy: 'dateSubmitted',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Load requests data
  useEffect(() => {
    loadRequests();
  }, [filters, pagination.page]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAllRequests(filters, {
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setRequests(response.data);
        setPagination(prev => ({
          ...prev,
          totalPages: response.meta.totalPages,
          totalItems: response.meta.totalItems
        }));
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sorting
  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle request actions
  const handleApproveRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await approveRequest(requestId);
      await loadRequests(); // Reload data
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDenyRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await denyRequest(requestId);
      await loadRequests(); // Reload data
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error denying request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  // Helper functions
  const getRequestTypeDisplay = (type) => {
    switch(type) {
      case 'ALLOCATION_CHANGE': return 'Allocation Change';
      case 'DATE_CHANGE': return 'Date Change';
      case 'EXTRA_REQUEST': return 'Extra Request';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Denied': return 'bg-red-100 text-red-800';
      case 'Action Required': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueAgencies = [...new Set(mockAllRequests.map(req => req.agencyName))];
  const requestTypes = ['All Types', 'ALLOCATION_CHANGE', 'DATE_CHANGE', 'EXTRA_REQUEST'];
  const statuses = ['All Statuses', 'Pending', 'Approved', 'Denied', 'Action Required'];

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Requests Management</h1>
          <p className="mt-2 text-lg text-gray-600">Review, process, and manage all incoming requests from agency partners</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Filter Bar */}
          <div className="px-8 py-6 border-b border-gray-200/60 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by Request ID, Agency, Group..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Agency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
                <select
                  value={filters.agency}
                  onChange={(e) => handleFilterChange('agency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Agencies</option>
                  {uniqueAgencies.map(agency => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>

              {/* Request Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                <select
                  value={filters.requestType}
                  onChange={(e) => handleFilterChange('requestType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {requestTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'All Types' ? type : getRequestTypeDisplay(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto">
            {error ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
                <p className="text-gray-600 mb-8">{error}</p>
                <button
                  onClick={loadRequests}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            ) : requests.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">No requests match your current search criteria. Try adjusting your filters.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200/60">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th 
                      className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      Request ID
                      {filters.sortBy === 'id' && (
                        <span className="ml-1">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('agencyName')}
                    >
                      Agency Name
                      {filters.sortBy === 'agencyName' && (
                        <span className="ml-1">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dateSubmitted')}
                    >
                      Date Submitted
                      {filters.sortBy === 'dateSubmitted' && (
                        <span className="ml-1">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Request Type
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Related Group
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Brief Description
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th 
                      className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('lastUpdated')}
                    >
                      Last Updated
                      {filters.sortBy === 'lastUpdated' && (
                        <span className="ml-1">
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/60">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-gray-900">{request.id}</div>
                      </td>
                      <td className="px-6 py-6">
                        <Link 
                          to={`/dashboard/agencies/${request.agencyId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {request.agencyName}
                        </Link>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">{new Date(request.dateSubmitted).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">{getRequestTypeDisplay(request.requestType)}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">{request.relatedGroupName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={request.description}>
                          {request.description}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">{request.assignedTo}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-900">{new Date(request.lastUpdated).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button 
                            onClick={() => handleViewRequestDetails(request)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            View Details
                          </button>
                          {(request.status === 'Pending' || request.status === 'Action Required') && (
                            <>
                              <button 
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading ? 'Processing...' : 'Approve'}
                              </button>
                              <button 
                                onClick={() => handleDenyRequest(request.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading ? 'Processing...' : 'Deny'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-8 py-6 border-t border-gray-200/60 bg-gray-50/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} requests
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              {/* Request Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Request ID</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date Submitted</label>
                    <p className="text-sm text-gray-900">{new Date(selectedRequest.dateSubmitted).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Request Type</label>
                    <p className="text-sm font-medium text-gray-900">{getRequestTypeDisplay(selectedRequest.requestType)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Assigned To</label>
                    <p className="text-sm text-gray-900">{selectedRequest.assignedTo}</p>
                  </div>
                </div>
              </div>

              {/* Agency and Group Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Agency</label>
                  <Link 
                    to={`/dashboard/agencies/${selectedRequest.agencyId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {selectedRequest.agencyName}
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Related Group</label>
                  <p className="text-sm text-gray-900">{selectedRequest.relatedGroupName || 'N/A'}</p>
                </div>
              </div>

              {/* Request Description */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Brief Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selectedRequest.description}</p>
              </div>

              {/* Detailed Notes from Agency */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Detailed Request Notes</label>
                <div className="text-sm text-gray-900 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {selectedRequest.detailedNotes}
                </div>
              </div>

              {/* Internal MLI Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Internal MLI Notes</label>
                <div className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  {selectedRequest.internalMliNotes}
                </div>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Current Status</label>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <p className="text-sm text-gray-500">Last updated: {new Date(selectedRequest.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
                
                {(selectedRequest.status === 'Pending' || selectedRequest.status === 'Action Required') && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDenyRequest(selectedRequest.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Deny Request'}
                    </button>
                    <button
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Approve Request'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsManagementPage; 