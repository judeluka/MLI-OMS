// src/DashboardOverviewPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Modern Icon Components
const UserGroupIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-3.471-1.154c.138-.05.275-.105.412-.165M12 15c-2.485 0-4.5-2.015-4.5-4.5S9.515 6 12 6s4.5 2.015 4.5 4.5S14.485 15 12 15Zm0 0v6m0-6H9m3 0h3" />
  </svg>
);

const UsersIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const MapPinIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const ClockIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PlusCircleIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const AcademicCapIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443a55.381 55.381 0 0 1 5.25 2.882V15" />
  </svg>
);

const CalendarDaysIcon = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5M12 15V9m0 0-2.25 2.25M12 9l2.25 2.25" />
  </svg>
);

const ArrowRightIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const ExclamationTriangleIcon = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

function DashboardOverviewPage() {
  const navigate = useNavigate();
  const [occupancyData, setOccupancyData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalGroups: 0,
    totalParticipants: 0,
    activeCentres: 0,
    upcomingArrivals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch occupancy data
        const occupancyResponse = await fetch('http://localhost:5000/api/centres/occupancy');
        const occupancyResult = await occupancyResponse.json();
        
        if (occupancyResult.success) {
          setOccupancyData(occupancyResult.occupancyData);
        }

        // Mock dashboard stats - replace with actual API calls
        setDashboardStats({
          totalGroups: 12,
          totalParticipants: 156,
          activeCentres: 3,
          upcomingArrivals: 23
        });

      } catch (err) {
        setError('Error fetching dashboard data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Active Groups',
      value: dashboardStats.totalGroups,
      icon: UserGroupIcon,
      color: 'blue',
      description: 'Groups currently enrolled'
    },
    {
      title: 'Total Participants',
      value: dashboardStats.totalParticipants,
      icon: UsersIcon,
      color: 'green',
      description: 'Students in programs'
    },
    {
      title: 'Active Centres',
      value: dashboardStats.activeCentres,
      icon: MapPinIcon,
      color: 'purple',
      description: 'Operational locations'
    },
    {
      title: 'Upcoming Arrivals',
      value: dashboardStats.upcomingArrivals,
      icon: ClockIcon,
      color: 'orange',
      description: 'Arrivals this week'
    }
  ];

  // Quick actions configuration
  const quickActions = [
    {
      title: 'New Group Registration',
      description: 'Register a new group for upcoming programs',
      icon: PlusCircleIcon,
      action: () => navigate('/dashboard/groups'),
      color: 'blue'
    },
    {
      title: 'Manage Programmes',
      description: 'View and manage educational programmes',
      icon: AcademicCapIcon,
      action: () => navigate('/dashboard/programmes'),
      color: 'green'
    },
    {
      title: 'Schedule Overview',
      description: 'View and manage centre schedules',
      icon: CalendarDaysIcon,
      action: () => navigate('/dashboard/rota'),
      color: 'purple'
    }
  ];

  // Recent activities (mock data)
  const recentActivities = [
    {
      id: 1,
      type: 'group_registered',
      title: 'New group registered',
      description: 'Milan Arts Academy Summer - 15 students',
      time: '2 hours ago',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      id: 2,
      type: 'arrival_scheduled',
      title: 'Arrival scheduled',
      description: 'Stockholm Business Academy - Tomorrow at 10:30 AM',
      time: '4 hours ago',
      icon: ClockIcon,
      color: 'green'
    },
    {
      id: 3,
      type: 'centre_update',
      title: 'Centre capacity updated',
      description: 'Dublin Centre - Capacity increased to 50',
      time: '6 hours ago',
      icon: MapPinIcon,
      color: 'purple'
    }
  ];

  const renderOccupancyChart = (centreData) => {
    if (!centreData || !centreData.data || centreData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No occupancy data available</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={centreData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#d1d5db" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="students" 
            stroke="#3b82f6" 
            name="Students"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="leaders" 
            stroke="#10b981" 
            name="Leaders"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="animate-pulse space-y-8">
          <div className="page-header">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Operations Overview</h1>
        <p className="page-subtitle">
          Welcome back! Here's an overview of your operations across all centres and programmes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stats-card">
            <div className="flex items-center">
              <div className={`stats-card-icon bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <div className="stats-card-value">
                  {stat.value}
                </div>
                <div className="stats-card-label">
                  {stat.title}
                </div>
                <div className="stats-card-description">
                  {stat.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="action-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="action-card group text-left"
            >
              <div className="flex items-start">
                <div className={`action-card-icon bg-${action.color}-100 group-hover:bg-${action.color}-200`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="action-card-title">
                    {action.title}
                  </div>
                  <div className="action-card-description">
                    {action.description}
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Centre Occupancy Charts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Centre Occupancy</h2>
            <Link
              to="/dashboard/centres"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all centres
            </Link>
          </div>
          
          {error ? (
            <div className="card p-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : occupancyData.length > 0 ? (
            <div className="space-y-6">
              {occupancyData.map((centreData, index) => (
                <div key={index} className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {centreData.centre}
                    </h3>
                  </div>
                  <div className="card-body">
                    {renderOccupancyChart(centreData)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6">
              <div className="text-center">
                <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No occupancy data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/dashboard/activities"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="card">
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg bg-${activity.color}-100 flex-shrink-0`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Alerts & Notifications</h3>
            <div className="space-y-3">
              <div className="alert-warning">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="alert-title">Documents Required</div>
                    <div className="alert-description">
                      2 groups require document submission for processing.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="alert-info">
                <div className="flex">
                  <ClockIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="alert-title">Upcoming Arrivals</div>
                    <div className="alert-description">
                      Stockholm Business Academy arrives tomorrow at 10:30 AM.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverviewPage;
