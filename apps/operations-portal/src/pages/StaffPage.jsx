import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffPage = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    dietary_requirements: '',
    date_of_birth: '',
    contract_start_date: '',
    contract_end_date: ''
  });

  // Fetch staff from the API
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.staff || []);
      } else {
        setError(data.message || 'Failed to fetch staff');
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for adding new staff
  const handleAddStaff = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      dietary_requirements: '',
      date_of_birth: '',
      contract_start_date: '',
      contract_end_date: ''
    });
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing staff
  const handleEditStaff = (staffMember) => {
    setFormData({
      first_name: staffMember.first_name || '',
      last_name: staffMember.last_name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      role: staffMember.role || '',
      dietary_requirements: staffMember.dietary_requirements || '',
      date_of_birth: staffMember.date_of_birth ? staffMember.date_of_birth.split('T')[0] : '',
      contract_start_date: staffMember.contract_start_date ? staffMember.contract_start_date.split('T')[0] : '',
      contract_end_date: staffMember.contract_end_date ? staffMember.contract_end_date.split('T')[0] : ''
    });
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchStaff(); // Refresh the list
      } else {
        setError(data.message || 'Failed to save staff member');
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      setError('Failed to save staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async (staffMember) => {
    if (!window.confirm(`Are you sure you want to delete "${staffMember.first_name} ${staffMember.last_name}"?`)) {
      return;
    }
    
    setIsDeleting(staffMember.id);
    
    try {
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchStaff(); // Refresh the list
      } else {
        setError(data.message || 'Failed to delete staff member');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading staff...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
            <p className="mt-2 text-base text-gray-600 leading-relaxed">Manage your organization's staff members</p>
          </div>
        </div>

        {/* Enhanced Error Alert */}
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

        {/* Enhanced Staff List Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-200/60 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
                <span className="text-sm text-gray-500 font-medium">
                  ({staff.length} {staff.length === 1 ? 'member' : 'members'})
                </span>
              </div>
              <button
                onClick={handleAddStaff}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Staff Member
              </button>
            </div>
          </div>
          
          {staff.length === 0 ? (
            /* Enhanced Empty State */
            <div className="text-center py-16 px-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">Get started by adding your first staff member to begin managing your team.</p>
              <button
                onClick={handleAddStaff}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Staff Member
              </button>
            </div>
          ) : (
            /* Enhanced Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/60">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contract Period
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/60">
                  {staff.map((staffMember) => (
                    <tr key={staffMember.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-semibold text-white">
                                {staffMember.first_name.charAt(0)}{staffMember.last_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              <button
                                onClick={() => navigate(`/dashboard/staff/${staffMember.id}`)}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 focus:outline-none focus:underline"
                              >
                                {staffMember.first_name} {staffMember.last_name}
                              </button>
                            </div>
                            {staffMember.date_of_birth && (
                              <div className="text-sm text-gray-500">
                                DOB: {new Date(staffMember.date_of_birth).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-gray-900 mb-1">{staffMember.email}</div>
                        {staffMember.phone && (
                          <div className="text-sm text-gray-500">{staffMember.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-gray-900 mb-1">{staffMember.role || 'Not specified'}</div>
                        {staffMember.dietary_requirements && (
                          <div className="text-sm text-gray-500">Dietary: {staffMember.dietary_requirements}</div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm">
                        {staffMember.contract_start_date ? (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              Start: {new Date(staffMember.contract_start_date).toLocaleDateString()}
                            </div>
                            {staffMember.contract_end_date && (
                              <div className="text-gray-500">
                                End: {new Date(staffMember.contract_end_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center space-x-3">
                          <button
                            onClick={() => navigate(`/dashboard/staff/${staffMember.id}`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditStaff(staffMember)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staffMember)}
                            disabled={isDeleting === staffMember.id}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting === staffMember.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                  <div className="w-full">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter first name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter last name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
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
                            Phone
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
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      {/* Work Information */}
                      <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-3">
                          <h4 className="text-lg font-semibold text-gray-900">Work Information</h4>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          >
                            <option value="">Select a role</option>
                            <option value="Centre Manager">Centre Manager</option>
                            <option value="Director of Studies">Director of Studies</option>
                            <option value="Assistant Director of Studies">Assistant Director of Studies</option>
                            <option value="Activity Co-Ordinator">Activity Co-Ordinator</option>
                            <option value="Assistant Centre Manager">Assistant Centre Manager</option>
                            <option value="Activity Leader">Activity Leader</option>
                            <option value="Teacher">Teacher</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Dietary Requirements
                          </label>
                          <textarea
                            name="dietary_requirements"
                            value={formData.dietary_requirements}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                            placeholder="Any dietary restrictions or requirements"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contract Start Date
                          </label>
                          <input
                            type="date"
                            name="contract_start_date"
                            value={formData.contract_start_date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contract End Date
                          </label>
                          <input
                            type="date"
                            name="contract_end_date"
                            value={formData.contract_end_date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Leave empty for permanent contract"
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
                        Saving...
                      </>
                    ) : (
                      editingStaff ? 'Update Staff Member' : 'Create Staff Member'
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

export default StaffPage; 