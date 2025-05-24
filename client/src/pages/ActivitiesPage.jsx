import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    type: '',
    latitude: '',
    longitude: ''
  });

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/activities');
        const data = await response.json();
        if (data.success) {
          setActivities(data.activities);
        } else {
          setError('Failed to fetch activities');
        }
      } catch (err) {
        setError('Error fetching activities');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setActivities(prev => [...prev, data.activity]);
        setFormData({
          name: '',
          address: '',
          description: '',
          type: '',
          latitude: '',
          longitude: ''
        });
        setShowForm(false);
      } else {
        setError('Failed to create activity');
      }
    } catch (err) {
      setError('Error creating activity');
      console.error('Error:', err);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-700">Loading activities...</div>;
  }

  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">Activities</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Activity'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Add New Activity</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
              >
                Create Activity
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-1/5">Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-1/5">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-1/5">Address</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-1/5">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-1/5">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    <Link 
                      to={`/dashboard/activities/${activity.id}`}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      {activity.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{activity.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{activity.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{activity.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {activity.latitude && activity.longitude 
                      ? `${Number(activity.latitude).toFixed(6)}, ${Number(activity.longitude).toFixed(6)}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPage; 