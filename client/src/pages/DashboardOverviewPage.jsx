// src/DashboardOverviewPage.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardOverviewPage() {
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOccupancyData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/centres/occupancy');
        const data = await response.json();
        if (data.success) {
          setOccupancyData(data.occupancyData);
        } else {
          setError('Failed to fetch occupancy data');
        }
      } catch (err) {
        setError('Error fetching occupancy data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancyData();
  }, []);

  const renderOccupancyChart = (centreData) => {
    if (!centreData || !centreData.data || centreData.data.length === 0) {
      return <p className="text-slate-600">No data available for this centre</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={centreData.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="students" 
            stroke="#8884d8" 
            name="Students"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="leaders" 
            stroke="#82ca9d" 
            name="Leaders"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Overview</h2>
      
      {/* Occupancy Charts Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Centre Occupancy</h3>
        {loading ? (
          <p className="text-slate-600">Loading occupancy data...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {occupancyData.map((centreData) => (
              <div key={centreData.centre} className="bg-white shadow-lg rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-700 mb-4">
                  {centreData.centre}
                </h4>
                {renderOccupancyChart(centreData)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
        <p className="text-slate-700 text-lg mb-4">Welcome to your dashboard overview!</p>
        <p className="text-slate-600 mb-6">This page shows a summary of important information.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Quick Stats</h3>
            <p className="text-slate-600">Users Online: <span className="font-bold">1</span> (Placeholder)</p>
            <p className="text-slate-600">New Signups Today: <span className="font-bold">0</span> (Placeholder)</p>
            <p className="text-slate-600">Pending Tasks: <span className="font-bold">3</span> (Placeholder)</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Recent Activity</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>User 'jane.doe@example.com' updated profile. (Placeholder)</li>
              <li>New comment on 'Blog Post Alpha'. (Placeholder)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;
