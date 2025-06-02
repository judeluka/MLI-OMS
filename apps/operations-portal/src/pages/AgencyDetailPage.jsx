import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Mock data for individual agency details
const mockAgencyDetails = {
  1: {
    id: 1,
    name: "Global Education Partners",
    primaryContact: "Sarah Johnson",
    email: "sarah.johnson@globaledu.com",
    phone: "+44 20 7123 4567",
    address: "123 Education Street",
    city: "London",
    postcode: "SW1A 1AA",
    country: "United Kingdom",
    status: "Active",
    dateJoined: "2022-03-15",
    totalBookings: 45,
    totalStudents: 234
  },
  2: {
    id: 2,
    name: "International Study Tours",
    primaryContact: "Michael Chen",
    email: "m.chen@studytours.com",
    phone: "+1 555 123 4567",
    address: "456 Global Avenue",
    city: "New York",
    postcode: "10001",
    country: "United States",
    status: "Active",
    dateJoined: "2021-09-22",
    totalBookings: 32,
    totalStudents: 187
  },
  3: {
    id: 3,
    name: "Euro Language Academy",
    primaryContact: "Anna Mueller",
    email: "anna.mueller@eurolang.de",
    phone: "+49 30 123 4567",
    address: "789 Learning Boulevard",
    city: "Berlin",
    postcode: "10115",
    country: "Germany",
    status: "Pending",
    dateJoined: "2024-01-10",
    totalBookings: 0,
    totalStudents: 0
  },
  4: {
    id: 4,
    name: "Pacific Education Group",
    primaryContact: "Yuki Tanaka",
    email: "y.tanaka@pacificedu.jp",
    phone: "+81 3 1234 5678",
    address: "321 Academic Plaza",
    city: "Tokyo",
    postcode: "100-0001",
    country: "Japan",
    status: "Active",
    dateJoined: "2020-11-08",
    totalBookings: 28,
    totalStudents: 156
  },
  5: {
    id: 5,
    name: "Nordic Study Solutions",
    primaryContact: "Erik Larsson",
    email: "erik.larsson@nordicstudy.se",
    phone: "+46 8 123 4567",
    address: "654 Innovation Street",
    city: "Stockholm",
    postcode: "11122",
    country: "Sweden",
    status: "Inactive",
    dateJoined: "2019-05-14",
    totalBookings: 12,
    totalStudents: 67
  }
};

// Mock data for groups associated with agencies
const mockGroupsByAgency = {
  1: [
    {
      id: 'GRP001',
      name: 'Summer English Intensive 2024',
      program: 'General English',
      startDate: '2024-07-15',
      endDate: '2024-07-29',
      allocations: 25,
      namesConfirmed: 23,
      status: 'Confirmed'
    },
    {
      id: 'GRP002',
      name: 'Academic Preparation Course',
      program: 'Academic English',
      startDate: '2024-08-05',
      endDate: '2024-08-26',
      allocations: 20,
      namesConfirmed: 20,
      status: 'In Progress'
    }
  ],
  2: [
    {
      id: 'GRP003',
      name: 'Business English Workshop',
      program: 'Business English',
      startDate: '2024-06-10',
      endDate: '2024-06-24',
      allocations: 15,
      namesConfirmed: 12,
      status: 'Confirmed'
    }
  ],
  4: [
    {
      id: 'GRP004',
      name: 'Cultural Exchange Program',
      program: 'General English + Activities',
      startDate: '2024-09-02',
      endDate: '2024-09-16',
      allocations: 30,
      namesConfirmed: 28,
      status: 'Pending'
    }
  ]
};

// Mock data for transfers associated with agencies
const mockTransfersByAgency = {
  1: [
    {
      id: 'TRF001',
      groupName: 'Summer English Intensive 2024',
      transferDate: '2024-07-15',
      transferType: 'Airport Arrival',
      flightNumber: 'BA123',
      numberOfPax: 25,
      status: 'Confirmed'
    },
    {
      id: 'TRF002',
      groupName: 'Summer English Intensive 2024',
      transferDate: '2024-07-29',
      transferType: 'Airport Departure',
      flightNumber: 'BA456',
      numberOfPax: 25,
      status: 'Confirmed'
    },
    {
      id: 'TRF003',
      groupName: 'Academic Preparation Course',
      transferDate: '2024-08-05',
      transferType: 'Airport Arrival',
      flightNumber: 'VS789',
      numberOfPax: 20,
      status: 'Pending'
    }
  ],
  2: [
    {
      id: 'TRF004',
      groupName: 'Business English Workshop',
      transferDate: '2024-06-10',
      transferType: 'Airport Arrival',
      flightNumber: 'AA101',
      numberOfPax: 15,
      status: 'Completed'
    }
  ],
  4: [
    {
      id: 'TRF005',
      groupName: 'Cultural Exchange Program',
      transferDate: '2024-09-02',
      transferType: 'Airport Arrival',
      flightNumber: 'NH202',
      numberOfPax: 30,
      status: 'Requested'
    }
  ]
};

// Mock data for requests associated with agencies
const mockRequestsByAgency = {
  1: [
    {
      id: 'REQ001',
      dateSubmitted: '2024-01-15',
      requestType: 'ALLOCATION_CHANGE',
      relatedGroupId: 'GRP001',
      relatedGroupName: 'Summer English Intensive 2024',
      description: '+5 allocations',
      detailedNotes: 'We have additional students who would like to join the Summer English Intensive program. Please increase our allocation from 25 to 30 students.',
      internalMliNotes: 'Agency has good payment history. Consider approval.',
      status: 'Pending',
      agencyId: 1
    },
    {
      id: 'REQ002',
      dateSubmitted: '2024-01-12',
      requestType: 'DATE_CHANGE',
      relatedGroupId: 'GRP002',
      relatedGroupName: 'Academic Preparation Course',
      description: 'Change arrival to 03/08/2024',
      detailedNotes: 'Due to visa processing delays, our group needs to arrive 2 days later than originally planned. Could we change the arrival date from 01/08/2024 to 03/08/2024?',
      internalMliNotes: 'Check accommodation availability for new dates.',
      status: 'Action Required',
      agencyId: 1
    },
    {
      id: 'REQ003',
      dateSubmitted: '2024-01-08',
      requestType: 'EXTRA_REQUEST',
      relatedGroupId: 'GRP001',
      relatedGroupName: 'Summer English Intensive 2024',
      description: 'Request for London Eye experience',
      detailedNotes: 'Our students are very interested in visiting the London Eye during their stay. Could this be arranged as an additional activity?',
      internalMliNotes: 'Standard extra activity. Quote £25 per student.',
      status: 'Approved',
      agencyId: 1
    }
  ],
  2: [
    {
      id: 'REQ004',
      dateSubmitted: '2024-01-20',
      requestType: 'ALLOCATION_CHANGE',
      relatedGroupId: 'GRP003',
      relatedGroupName: 'Business English Workshop',
      description: '-3 allocations',
      detailedNotes: 'Unfortunately, 3 students had to cancel due to work commitments. Please reduce our allocation from 15 to 12 students.',
      internalMliNotes: 'Cancellation within policy. Refund to be processed.',
      status: 'Approved',
      agencyId: 2
    }
  ],
  4: [
    {
      id: 'REQ005',
      dateSubmitted: '2024-01-25',
      requestType: 'EXTRA_REQUEST',
      relatedGroupId: 'GRP004',
      relatedGroupName: 'Cultural Exchange Program',
      description: 'Request for traditional afternoon tea experience',
      detailedNotes: 'As part of the cultural exchange program, our students would love to experience a traditional British afternoon tea. Can this be arranged?',
      internalMliNotes: 'Partner with local tea rooms. Quote pending.',
      status: 'Pending',
      agencyId: 4
    },
    {
      id: 'REQ006',
      dateSubmitted: '2024-01-18',
      requestType: 'DATE_CHANGE',
      relatedGroupId: 'GRP004',
      relatedGroupName: 'Cultural Exchange Program',
      description: 'Change departure to 18/09/2024',
      detailedNotes: 'Students would like to extend their stay by 2 days to experience the weekend in London. Can we change departure from 16/09/2024 to 18/09/2024?',
      internalMliNotes: 'Extension approved. Additional accommodation costs apply.',
      status: 'Denied',
      agencyId: 4
    }
  ]
};

// Mock service functions
const fetchAgencyDetails = (agencyId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const agency = mockAgencyDetails[agencyId];
      if (agency) {
        resolve({
          success: true,
          data: agency
        });
      } else {
        reject({
          success: false,
          message: 'Agency not found'
        });
      }
    }, 500);
  });
};

const fetchGroupsByAgency = (agencyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const groups = mockGroupsByAgency[agencyId] || [];
      resolve({
        success: true,
        data: groups
      });
    }, 300);
  });
};

const fetchTransfersByAgency = (agencyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transfers = mockTransfersByAgency[agencyId] || [];
      resolve({
        success: true,
        data: transfers
      });
    }, 300);
  });
};

const fetchRequestsByAgency = (agencyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requests = mockRequestsByAgency[agencyId] || [];
      resolve({
        success: true,
        data: requests
      });
    }, 300);
  });
};

const approveRequest = (requestId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find and update the request in mock data
      Object.keys(mockRequestsByAgency).forEach(agencyId => {
        const requests = mockRequestsByAgency[agencyId];
        const requestIndex = requests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
          requests[requestIndex].status = 'Approved';
        }
      });
      
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
      // Find and update the request in mock data
      Object.keys(mockRequestsByAgency).forEach(agencyId => {
        const requests = mockRequestsByAgency[agencyId];
        const requestIndex = requests.findIndex(req => req.id === requestId);
        if (requestIndex !== -1) {
          requests[requestIndex].status = 'Denied';
        }
      });
      
      resolve({
        success: true,
        message: 'Request denied successfully'
      });
    }, 500);
  });
};

// Custom Tab Component
const TabButton = ({ isActive, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-6 py-3 font-medium text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </button>
);

const TabPanel = ({ isActive, children }) => (
  <div className={`${isActive ? 'block' : 'hidden'}`}>
    {children}
  </div>
);

const AgencyDetailPage = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState(null);
  const [groups, setGroups] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadAgencyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [agencyResponse, groupsResponse, transfersResponse, requestsResponse] = await Promise.all([
          fetchAgencyDetails(agencyId),
          fetchGroupsByAgency(agencyId),
          fetchTransfersByAgency(agencyId),
          fetchRequestsByAgency(agencyId)
        ]);

        if (agencyResponse.success) {
          setAgency(agencyResponse.data);
          setGroups(groupsResponse.data);
          setTransfers(transfersResponse.data);
          setRequests(requestsResponse.data);
        } else {
          setError('Agency not found');
        }
      } catch (err) {
        console.error('Error loading agency data:', err);
        setError('Failed to load agency data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      loadAgencyData();
    }
  }, [agencyId]);

  // Handle request actions
  const handleApproveRequest = async (requestId) => {
    setActionLoading(true);
    try {
      await approveRequest(requestId);
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: 'Approved' } : req
        )
      );
      // Close modal if open
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
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status: 'Denied' } : req
        )
      );
      // Close modal if open
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

  // Calculate allocations summary
  const allocationsSummary = groups.reduce((acc, group) => {
    acc.totalAllocations += group.allocations;
    acc.totalNamesConfirmed += group.namesConfirmed;
    return acc;
  }, { totalAllocations: 0, totalNamesConfirmed: 0 });

  const confirmationPercentage = allocationsSummary.totalAllocations > 0 
    ? Math.round((allocationsSummary.totalNamesConfirmed / allocationsSummary.totalAllocations) * 100)
    : 0;

  // Count active groups
  const activeGroupsCount = groups.filter(group => group.status !== 'Completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading agency details...</p>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency Not Found</h3>
          <p className="text-gray-600 mb-8">{error || 'The requested agency could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard/agencies')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 sm:px-8 lg:px-12 py-8">
        {/* Persistent Page Header */}
        <div className="mb-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard/agencies"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18v18m9-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75H21m-4.5-6.75h.75m-3.75 3.75h.75" />
                  </svg>
                  Agencies
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">{agency.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-16 w-16 mr-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {agency.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{agency.name}</h1>
                  <p className="mt-1 text-lg text-gray-600">{agency.primaryContact} • {agency.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                agency.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : agency.status === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {agency.status}
              </span>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Agency
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <TabButton
                isActive={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              >
                Overview
              </TabButton>
              
              <TabButton
                isActive={activeTab === 'groups'}
                onClick={() => setActiveTab('groups')}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              >
                Group Enrollments
                {groups.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {groups.length}
                  </span>
                )}
              </TabButton>
              
              <TabButton
                isActive={activeTab === 'transfers'}
                onClick={() => setActiveTab('transfers')}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
              >
                Transfers
                {transfers.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {transfers.length}
                  </span>
                )}
              </TabButton>
              
              <TabButton
                isActive={activeTab === 'requests'}
                onClick={() => setActiveTab('requests')}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6" />
                  </svg>
                }
              >
                Requests
                {requests.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {requests.length}
                  </span>
                )}
              </TabButton>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Overview Tab */}
          <TabPanel isActive={activeTab === 'overview'}>
            <div className="space-y-8">
              {/* Top Section: Individual Stat Cards */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Allocations Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                    <div className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Total Allocations</p>
                          <p className="text-2xl font-bold text-gray-900">{allocationsSummary.totalAllocations}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Names Confirmed Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                    <div className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Names Confirmed</p>
                          <p className="text-2xl font-bold text-gray-900">{allocationsSummary.totalNamesConfirmed}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Groups Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                    <div className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Active Groups</p>
                          <p className="text-2xl font-bold text-gray-900">{activeGroupsCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Progress Section */}
              {allocationsSummary.totalAllocations > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
                    <h3 className="text-lg font-semibold text-gray-900">Confirmation Progress</h3>
                  </div>
                  <div className="px-6 py-6">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-medium text-gray-700">Overall booking confirmations</span>
                      <span className="font-semibold text-gray-900">{confirmationPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${confirmationPercentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm text-gray-600">
                      <span>{allocationsSummary.totalNamesConfirmed} confirmed</span>
                      <span>{allocationsSummary.totalAllocations} total</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Section: Contact Details and Supplementary Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                  </div>
                  <div className="px-6 py-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Primary Contact</label>
                      <p className="text-sm font-semibold text-gray-900">{agency.primaryContact}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{agency.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                      <p className="text-sm text-gray-900">{agency.phone}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                      <p className="text-sm text-gray-900">
                        {agency.address}<br />
                        {agency.city}, {agency.postcode}<br />
                        {agency.country}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Date Joined</label>
                      <p className="text-sm text-gray-900">{new Date(agency.dateJoined).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Account Management Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
                    <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
                  </div>
                  <div className="px-6 py-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Assigned Account Manager</label>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">JR</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">Jane Roberts</p>
                          <p className="text-xs text-gray-500">jane.roberts@mli.com</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Recent Activity</label>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">Group enrollment confirmed</p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">Transfer arrangements updated</p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">Contact details updated</p>
                            <p className="text-xs text-gray-500">2 weeks ago</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Key Notes</label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">Preferred communication via email. Peak booking season is July-August. Requires 48h confirmation notice for transfers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Group Enrollments Tab */}
          <TabPanel isActive={activeTab === 'groups'}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/60 bg-gray-50/30">
                <h2 className="text-xl font-semibold text-gray-900">Group Enrollments</h2>
                <p className="text-sm text-gray-600 mt-1">Detailed breakdown of all group bookings and confirmations</p>
              </div>
              <div className="overflow-x-auto">
                {groups.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">This agency hasn't enrolled any groups yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200/60">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-8 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Group Name
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Session Dates
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Allocations
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bookings vs. Allocation
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/60">
                      {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                          <td className="px-8 py-6">
                            <div className="text-sm font-semibold text-gray-900">{group.name}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm text-gray-900">{group.program}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm text-gray-900">
                              {new Date(group.startDate).toLocaleDateString()} - {new Date(group.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm font-medium text-gray-900">{group.allocations}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm font-semibold text-gray-900">
                              <span className={`${group.namesConfirmed === group.allocations ? 'text-green-600' : 'text-blue-600'}`}>
                                {group.namesConfirmed}/{group.allocations}
                              </span>
                              <span className="text-gray-500 ml-1">Confirmed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  group.namesConfirmed === group.allocations ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${(group.namesConfirmed / group.allocations) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              group.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : group.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {group.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Transfers Tab */}
          <TabPanel isActive={activeTab === 'transfers'}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/60 bg-gray-50/30">
                <h2 className="text-xl font-semibold text-gray-900">Transfer Arrangements</h2>
                <p className="text-sm text-gray-600 mt-1">Transportation arrangements for agency groups</p>
              </div>
              <div className="overflow-x-auto">
                {transfers.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transfers Found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">No transfer arrangements have been made for this agency yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200/60">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Group Name
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Transfer Date
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Transfer Type
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Flight Number
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Number of Pax
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/60">
                      {transfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                          <td className="px-8 py-6">
                            <div className="text-sm font-semibold text-gray-900">{transfer.groupName}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm text-gray-900">{new Date(transfer.transferDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm text-gray-900">{transfer.transferType}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm font-medium text-gray-900">{transfer.flightNumber}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="text-sm font-medium text-gray-900">{transfer.numberOfPax}</div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              transfer.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : transfer.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : transfer.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {transfer.status}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex justify-center items-center space-x-3">
                              <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                View Details
                              </button>
                              <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                                Edit Transfer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Requests Tab */}
          <TabPanel isActive={activeTab === 'requests'}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/60 bg-gray-50/30">
                <h2 className="text-xl font-semibold text-gray-900">Request Management</h2>
                <p className="text-sm text-gray-600 mt-1">View and manage change requests submitted by this agency</p>
              </div>
              <div className="overflow-x-auto">
                {requests.length === 0 ? (
                  <div className="px-8 py-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">This agency hasn't submitted any requests yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200/60">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date Submitted
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
                        <th className="px-6 py-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/60">
                      {requests.map((request) => {
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

                        return (
                          <tr key={request.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                            <td className="px-8 py-6">
                              <div className="text-sm font-semibold text-gray-900">{request.id}</div>
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
                              <div className="text-sm text-gray-900">{request.description}</div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <div className="flex justify-center items-center space-x-2">
                                <button 
                                  onClick={() => handleViewRequestDetails(request)}
                                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                  View Details
                                </button>
                                {request.status === 'Pending' || request.status === 'Action Required' ? (
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => handleApproveRequest(request.id)}
                                      disabled={actionLoading}
                                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading ? 'Processing...' : 'Approve Request'}
                                    </button>
                                    <button
                                      onClick={() => handleDenyRequest(request.id)}
                                      disabled={actionLoading}
                                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading ? 'Processing...' : 'Deny Request'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">No actions available</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </TabPanel>
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
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRequest.requestType === 'ALLOCATION_CHANGE' && 'Allocation Change'}
                      {selectedRequest.requestType === 'DATE_CHANGE' && 'Date Change'}
                      {selectedRequest.requestType === 'EXTRA_REQUEST' && 'Extra Request'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Related Group</label>
                    <p className="text-sm text-gray-900">{selectedRequest.relatedGroupName || 'N/A'}</p>
                  </div>
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
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedRequest.status === 'Denied' ? 'bg-red-100 text-red-800' :
                    selectedRequest.status === 'Action Required' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Action History Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Action History</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">Request submitted by agency</p>
                        <p className="text-xs text-gray-500">{new Date(selectedRequest.dateSubmitted).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {selectedRequest.status !== 'Pending' && (
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          selectedRequest.status === 'Approved' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">Request {selectedRequest.status.toLowerCase()}</p>
                          <p className="text-xs text-gray-500">Today</p>
                        </div>
                      </div>
                    )}
                  </div>
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
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Approve Request'}
                    </button>
                    <button
                      onClick={() => handleDenyRequest(selectedRequest.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Deny Request'}
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

export default AgencyDetailPage; 