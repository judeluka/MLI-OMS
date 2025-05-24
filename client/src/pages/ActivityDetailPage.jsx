import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ActivityDetailPage() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [participationData, setParticipationData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  // Fetch activity details and participation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activity details
        const activityResponse = await fetch(`http://localhost:5000/api/activities/${activityId}`);
        const activityData = await activityResponse.json();
        
        if (activityData.success) {
          setActivity(activityData.activity);
          setFormData({
            name: activityData.activity.name,
            type: activityData.activity.type,
            address: activityData.activity.address || '',
            description: activityData.activity.description || '',
            latitude: activityData.activity.latitude || '',
            longitude: activityData.activity.longitude || ''
          });

          // Fetch participation data
          const participationResponse = await fetch(`http://localhost:5000/api/activities/${activityId}/participation`);
          const participationResult = await participationResponse.json();
          
          if (participationResult.success) {
            setParticipationData(participationResult);
          }
        } else {
          setError('Failed to fetch activity details');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activityId]);

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
      const response = await fetch(`http://localhost:5000/api/activities/${activityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        setIsEditing(false);
      } else {
        setError('Failed to update activity');
      }
    } catch (err) {
      setError('Error updating activity');
      console.error('Error:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-700">Loading activity details...</div>;
  }

  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>;
  }

  if (!activity) {
    return <div className="p-6 text-center text-slate-700">Activity not found</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">
          Activity: <span className="text-sky-600">{activity.name}</span>
        </h2>
        <div className="flex gap-2">
          <Link 
            to="/dashboard/activities" 
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md shadow-sm transition-colors"
          >
            &larr; Back to Activities
          </Link>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Activity'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Edit Activity</h3>
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">Activity Details</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Name</dt>
                    <dd className="mt-1 text-sm text-slate-900">{activity.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Type</dt>
                    <dd className="mt-1 text-sm text-slate-900">{activity.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Address</dt>
                    <dd className="mt-1 text-sm text-slate-900">{activity.address || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Description</dt>
                    <dd className="mt-1 text-sm text-slate-900">{activity.description || 'No description available'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Location</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {activity.latitude && activity.longitude 
                        ? `${Number(activity.latitude).toFixed(6)}, ${Number(activity.longitude).toFixed(6)}`
                        : 'Location not specified'}
                    </dd>
                  </div>
                </dl>
              </div>
              {activity.latitude && activity.longitude && (
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Map Location</h3>
                  <div className="aspect-video bg-slate-100 rounded-lg">
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      Map view coming soon
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participation Grid */}
          {participationData && (
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-medium text-slate-700 mb-4">Participation Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      {participationData.centres.map(centre => (
                        <th key={centre} className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {centre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {participationData.dates.map(date => (
                      <tr key={date} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 whitespace-nowrap">
                          {formatDate(date)}
                        </td>
                        {participationData.centres.map(centre => {
                          const data = participationData.participationData[date][centre] || { students: 0, leaders: 0 };
                          return (
                            <td key={`${date}-${centre}`} className="px-4 py-2 text-sm text-slate-500 text-center">
                              {data.students > 0 || data.leaders > 0 ? (
                                <div>
                                  <span className="font-medium text-sky-600">{data.students}</span>
                                  <span className="text-slate-400"> students</span>
                                  <br />
                                  <span className="font-medium text-emerald-600">{data.leaders}</span>
                                  <span className="text-slate-400"> leaders</span>
                                </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityDetailPage; 