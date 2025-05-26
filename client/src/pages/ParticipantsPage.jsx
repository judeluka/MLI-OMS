import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Helper function to get sort icon
const SortIcon = ({ direction }) => {
  if (!direction) {
    return <span className="ml-1 text-slate-400">↕</span>;
  }
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
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
          className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-l-md hover:bg-slate-50"
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
          className={`px-3 py-2 text-sm font-medium border ${
            i === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-slate-500 bg-white border-slate-300 hover:bg-slate-50'
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
          className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-r-md hover:bg-slate-50"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-700">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} participants
        </div>
        <div className="flex">{pages}</div>
      </div>
    );
  };

  if (isLoading && participants.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-700 text-lg">Loading participants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm" role="alert">
        <h3 className="text-lg font-semibold mb-2">Error Loading Participants</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-800 text-white shadow-2xl rounded-xl p-6">
        <h1 className="text-3xl font-bold text-white">Manage Participants</h1>
        <p className="text-slate-300 mt-2">View and manage all students and leaders</p>
      </div>

      {/* Controls Section */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Search */}
            <div className="flex items-center space-x-3">
              <label htmlFor="search" className="text-base font-medium text-slate-700 whitespace-nowrap">Search:</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Name or passport..."
                className="block w-64 pl-3 pr-3 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm transition-colors duration-150"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-3">
              <label htmlFor="typeFilter" className="text-base font-medium text-slate-700 whitespace-nowrap">Type:</label>
              <select
                id="typeFilter"
                value={selectedType}
                onChange={handleTypeChange}
                className="block w-40 pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm transition-colors duration-150"
              >
                <option value="">All Types</option>
                <option value="student">Students</option>
                <option value="leader">Leaders</option>
              </select>
            </div>

            {/* Group Filter */}
            <div className="flex items-center space-x-3">
              <label htmlFor="groupFilter" className="text-base font-medium text-slate-700 whitespace-nowrap">Group:</label>
              <select
                id="groupFilter"
                value={selectedGroup}
                onChange={handleGroupChange}
                className="block w-48 pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm transition-colors duration-150"
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

          {/* Create New Participant Button */}
          <Link
            to="/dashboard/participants/new"
            className="inline-flex items-center px-6 py-2.5 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Participant
          </Link>
        </div>
      </div>

      {/* Participants Table */}
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
                    }`}
                    onClick={() => header.sortable && handleSort(header.key)}
                  >
                    <div className="flex items-center">
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
            <tbody className="bg-white divide-y divide-slate-200">
              {participants.length > 0 ? (
                participants.map((participant, index) => (
                  <tr key={participant.id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{participant.first_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{participant.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        participant.participant_type === 'student' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {participant.participant_type === 'student' ? 'Student' : 'Leader'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">{calculateAge(participant.date_of_birth)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800">
                      {participant.group_name ? (
                        <Link 
                          to={`/dashboard/groups/${participant.group_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
                        >
                          {participant.group_name}
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic">No group assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-800 text-center">
                      {participant.test_score !== null ? participant.test_score : <span className="text-slate-500 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                      <div className="flex items-center space-x-3">
                        <Link 
                          to={`/dashboard/participants/${participant.id}`} 
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/dashboard/participants/${participant.id}/edit`}
                          className="text-amber-600 hover:text-amber-800 font-medium transition-colors duration-150"
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
                      <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-600 mb-2">No Participants Found</h3>
                      <p className="text-base text-slate-500 max-w-md">
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

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}

export default ParticipantsPage; 