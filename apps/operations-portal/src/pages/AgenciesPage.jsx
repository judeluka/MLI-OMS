import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock data for agencies
const mockAgencies = [
  {
    id: 1,
    name: "Global Education Partners",
    primaryContact: "Sarah Johnson",
    email: "sarah.johnson@globaledu.com",
    phone: "+44 20 7123 4567",
    country: "United Kingdom",
    status: "Active",
    totalBookings: 45,
    totalStudents: 234
  },
  {
    id: 2,
    name: "International Study Tours",
    primaryContact: "Michael Chen",
    email: "m.chen@studytours.com",
    phone: "+1 555 123 4567",
    country: "United States",
    status: "Active",
    totalBookings: 32,
    totalStudents: 187
  },
  {
    id: 3,
    name: "Euro Language Academy",
    primaryContact: "Anna Mueller",
    email: "anna.mueller@eurolang.de",
    phone: "+49 30 123 4567",
    country: "Germany",
    status: "Pending",
    totalBookings: 0,
    totalStudents: 0
  },
  {
    id: 4,
    name: "Pacific Education Group",
    primaryContact: "Yuki Tanaka",
    email: "y.tanaka@pacificedu.jp",
    phone: "+81 3 1234 5678",
    country: "Japan",
    status: "Active",
    totalBookings: 28,
    totalStudents: 156
  },
  {
    id: 5,
    name: "Nordic Study Solutions",
    primaryContact: "Erik Larsson",
    email: "erik.larsson@nordicstudy.se",
    phone: "+46 8 123 4567",
    country: "Sweden",
    status: "Inactive",
    totalBookings: 12,
    totalStudents: 67
  }
];

// Mock service functions
const fetchAgencies = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        agencies: mockAgencies
      });
    }, 500);
  });
};

const createAgency = (agencyData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAgency = {
        id: Date.now(),
        ...agencyData,
        totalBookings: 0,
        totalStudents: 0
      };
      mockAgencies.push(newAgency);
      resolve({
        success: true,
        agency: newAgency
      });
    }, 1000);
  });
};

const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    primaryContact: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: '',
    status: 'Active',
    notes: ''
  });

  // Fetch agencies from the mock API
  const loadAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAgencies();
      
      if (response.success) {
        setAgencies(response.agencies || []);
      } else {
        setError(response.message || 'Failed to fetch agencies');
      }
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError('Failed to load agencies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load agencies on component mount
  useEffect(() => {
    loadAgencies();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await createAgency(formData);
      
      if (response.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          primaryContact: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postcode: '',
          country: '',
          status: 'Active',
          notes: ''
        });
        loadAgencies(); // Refresh the list
      } else {
        setError(response.message || 'Failed to create agency');
      }
    } catch (err) {
      console.error('Error creating agency:', err);
      setError('Failed to create agency. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setFormData({
      name: '',
      primaryContact: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postcode: '',
      country: '',
      status: 'Active',
      notes: ''
    });
  };

  // Filter agencies based on search term and status
  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = !searchTerm || 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || agency.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading agencies...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agencies Management</h1>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">View, manage, and create your agency partners</p>
          </div>
          
          {/* Button Section */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Agency
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <div className="ml-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Agency name or contact..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <label htmlFor="statusFilter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</label>
                <select
                  id="statusFilter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {filteredAgencies.length} {filteredAgencies.length === 1 ? 'agency' : 'agencies'}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            {filteredAgencies.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18v18m9-18v18m2.25-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75h.75m-3.75 3.75H21m-4.5-6.75h.75m-3.75 3.75h.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agencies Found</h3>
                  <p className="text-gray-600 max-w-md leading-relaxed mb-8">
                    {searchTerm || selectedStatus 
                      ? 'No agencies match your current filters. Try adjusting your search criteria.' 
                      : 'No agency partners found. Click "New Agency" to add your first agency partner.'}
                  </p>
                  {!searchTerm && !selectedStatus && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Agency
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200/60">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Agency Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Primary Contact
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Bookings/Students
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/60">
                  {filteredAgencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-semibold text-white">
                                {agency.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {agency.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm font-medium text-gray-900">{agency.primaryContact}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm font-medium text-gray-900 mb-1">{agency.email}</div>
                        <div className="text-sm text-gray-500">{agency.phone}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm font-medium text-gray-900">{agency.country}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          agency.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : agency.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {agency.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="text-sm font-medium text-gray-900">{agency.totalBookings} bookings</div>
                        <div className="text-sm text-gray-500">{agency.totalStudents} students</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center items-center space-x-3">
                          <Link
                            to={`/dashboard/agencies/${agency.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            View
                          </Link>
                          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                            Edit
                          </button>
                          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1">
                            {agency.status === 'Active' ? 'Deactivate' : 'Activate'}
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
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                  <div className="w-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Create New Agency
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Agency Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter agency name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Primary Contact Person *
                          </label>
                          <input
                            type="text"
                            name="primaryContact"
                            value={formData.primaryContact}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter contact person name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          >
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter street address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              placeholder="Enter city"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Postcode
                            </label>
                            <input
                              type="text"
                              name="postcode"
                              value={formData.postcode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              placeholder="Enter postcode"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter country"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Internal Notes
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                            placeholder="Any internal notes about this agency..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="bg-gray-50/50 px-6 py-4 sm:px-8 sm:py-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating Agency...
                      </>
                    ) : (
                      'Create Agency'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto transition-all duration-200"
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

export default AgenciesPage; 