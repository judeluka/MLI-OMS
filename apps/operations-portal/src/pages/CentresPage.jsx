import React, { useState, useEffect } from 'react';

const CentresPage = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location_address: ''
  });

  // Fetch centres from the API
  const fetchCentres = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/centres');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Make sure the backend server is running on port 5000.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCentres(data.centres || []);
      } else {
        setError(data.message || 'Failed to fetch centres');
      }
    } catch (err) {
      console.error('Error fetching centres:', err);
      if (err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend server is running on port 5000.');
      } else {
        setError(err.message || 'Failed to load centres. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open modal for adding new centre
  const handleAddCentre = () => {
    setEditingCentre(null);
    setFormData({ name: '', location_address: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing centre
  const handleEditCentre = (centre) => {
    setEditingCentre(centre);
    setFormData({
      name: centre.name || '',
      location_address: centre.location_address || ''
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCentre(null);
    setFormData({ name: '', location_address: '' });
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Centre name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingCentre ? `/api/centres/${editingCentre.id}` : '/api/centres';
      const method = editingCentre ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchCentres(); // Refresh the list
        handleCloseModal();
      } else {
        setError(data.message || 'Failed to save centre');
      }
    } catch (err) {
      console.error('Error saving centre:', err);
      setError('Failed to save centre. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete centre
  const handleDeleteCentre = async (centre) => {
    if (!window.confirm(`Are you sure you want to delete "${centre.name}"?`)) {
      return;
    }

    setIsDeleting(centre.id);
    setError(null);

    try {
      const response = await fetch(`/api/centres/${centre.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchCentres(); // Refresh the list
      } else {
        setError(data.message || 'Failed to delete centre');
      }
    } catch (err) {
      console.error('Error deleting centre:', err);
      setError('Failed to delete centre. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading centres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Centres</h1>
          <p className="text-slate-600 mt-2">Manage your centres and their locations</p>
        </div>
        <button 
          onClick={handleAddCentre}
          className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add Centre</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <svg className="h-5 w-5 text-red-400 hover:text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {centres.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-slate-300">
          <div className="mx-auto h-16 w-16 text-slate-400 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No centres found</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first centre.</p>
          <button 
            onClick={handleAddCentre}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors inline-flex items-center space-x-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Your First Centre</span>
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Centre Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Location Address</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {centres.map((centre) => (
                  <tr key={centre.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{centre.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {centre.location_address || (
                        <span className="text-slate-400 italic">No address provided</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditCentre(centre)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit centre"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteCentre(centre)}
                          disabled={isDeleting === centre.id}
                          className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete centre"
                        >
                          {isDeleting === centre.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {centres.length > 0 && (
        <div className="text-sm text-slate-500 text-center bg-slate-50 py-3 rounded-lg">
          Showing {centres.length} centre{centres.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCentre ? 'Edit Centre' : 'Add New Centre'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Centre Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter centre name"
                />
              </div>
              
              <div>
                <label htmlFor="location_address" className="block text-sm font-medium text-slate-700 mb-1">
                  Location Address
                </label>
                <textarea
                  id="location_address"
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Enter location address (optional)"
                />
              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingCentre ? 'Update Centre' : 'Add Centre'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentresPage; 