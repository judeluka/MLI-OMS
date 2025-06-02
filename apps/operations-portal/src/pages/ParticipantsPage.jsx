import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Helper function to get sort icon
const SortIcon = ({ direction }) => {
  if (!direction) {
    return <span className="ml-1 text-gray-400">↕</span>;
  }
  return direction === 'ascending' ? <span className="ml-1 text-gray-600">▲</span> : <span className="ml-1 text-gray-600">▼</span>;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'N/A';
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (e) {
    return 'N/A';
  }
};

function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'last_name', direction: 'ascending' });
  
  // Filter states
  const [selectedType, setSelectedType] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(25);
  
  // Available groups for filter
  const [availableGroups, setAvailableGroups] = useState([]);

  // Define table headers
  const headers = [
    { label: 'First Name', key: 'first_name', sortable: true },
    { label: 'Last Name', key: 'last_name', sortable: true },
    { label: 'Type', key: 'participant_type', sortable: true },
    { label: 'Age', key: 'date_of_birth', sortable: true },
    { label: 'Group', key: 'group_name', sortable: true },
    { label: 'Test Score', key: 'test_score', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false }
  ];

  // Fetch participants data
  const fetchParticipants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === 'ascending' ? 'ASC' : 'DESC'
      });

      if (selectedType) params.append('participantType', selectedType);
      if (selectedGroup) params.append('groupId', selectedGroup);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5000/api/participants?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch participants from API.');
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
      setError(err.message);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available groups for filter
  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableGroups(data.groups || []);
        }
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    fetchParticipants();
  }, [currentPage, sortConfig, selectedType, selectedGroup, searchTerm]);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle filter changes
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 text-sm font-medium border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
            i === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/60">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} participants
        </div>
        <div className="flex">{pages}</div>
      </div>
    );
  };

  if (isLoading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading participants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Participants</h3>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          {/* Centered Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Participants</h1>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">View and manage all students and leaders</p>
          </div>
          
          {/* Button Section */}
          <div className="flex justify-end">
            <Link
              to="/dashboard/participants/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Participant
            </Link>
          </div>
        </div>

        {/* Enhanced Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Filters Section */}
          <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              {/* Search */}
              <div className="flex items-center gap-3">
                <label htmlFor="search" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Search:</label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Name or passport..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-3">
                <label htmlFor="typeFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Type:</label>
                <select
                  id="typeFilter"
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">All Types</option>
                  <option value="student">Students</option>
                  <option value="leader">Leaders</option>
                </select>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-3">
                <label htmlFor="groupFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Group:</label>
                <select
                  id="groupFilter"
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">All Groups</option>
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
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
                      onClick={() => header.sortable && handleSort(header.key)}
                    >
                      <div className="flex items-center justify-center">
                        {header.label}
                        {header.sortable && (
                          <span className="ml-1">
                            <SortIcon direction={sortConfig.key === header.key ? sortConfig.direction : null} />
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200/60">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">{participant.first_name}</td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900">{participant.last_name}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          participant.participant_type === 'student' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {participant.participant_type === 'student' ? 'Student' : 'Leader'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">{calculateAge(participant.date_of_birth)}</td>
                      <td className="px-6 py-5 text-sm font-medium text-center">
                        {participant.group_name ? (
                          <Link 
                            to={`/dashboard/groups/${participant.group_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 focus:outline-none focus:underline"
                          >
                            {participant.group_name}
                          </Link>
                        ) : (
                          <span className="text-gray-500 italic">No group assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-900 text-center">
                        {participant.test_score !== null ? participant.test_score : <span className="text-gray-500 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <Link 
                            to={`/dashboard/participants/${participant.id}`} 
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            View
                          </Link>
                          <Link 
                            to={`/dashboard/participants/${participant.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Participants Found</h3>
                        <p className="text-gray-600 max-w-md leading-relaxed">
                          {searchTerm || selectedType || selectedGroup 
                            ? 'No participants match your current filters. Try adjusting your search criteria.' 
                            : 'No participants found in the database. You can add new participants using the button above.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}

export default ParticipantsPage; 