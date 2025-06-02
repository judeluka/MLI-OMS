import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { enrollmentService } from '../services/campService';
import { formatDate, formatCurrency, getStatusConfig } from '../utils';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, enrollmentsResponse] = await Promise.all([
        enrollmentService.fetchDashboardData(),
        enrollmentService.fetchEnrollments()
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      if (enrollmentsResponse.success) {
        // Get recent enrollments (last 5)
        const recent = enrollmentsResponse.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 5);
        setRecentEnrollments(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Active Enrollments',
      value: dashboardData?.totalActiveEnrollments || 0,
      icon: UserGroupIcon,
      color: 'primary',
      description: 'Groups currently enrolled'
    },
    {
      title: 'Total Students',
      value: dashboardData?.totalStudentsEnrolled || 0,
      icon: CalendarDaysIcon,
      color: 'secondary',
      description: 'Students in summer camps'
    },
    {
      title: 'Upcoming Arrivals',
      value: dashboardData?.upcomingArrivals || 0,
      icon: ClockIcon,
      color: 'accent',
      description: 'Students arriving soon'
    }
  ];

  const quickActions = [
    {
      title: 'New Group Enrollment',
      description: 'Start enrolling a new group of students',
      icon: PlusCircleIcon,
      action: () => navigate('/enroll'),
      color: 'primary'
    },
    {
      title: 'Browse Programs',
      description: 'Explore our summer camp programs',
      icon: AcademicCapIcon,
      action: () => navigate('/programs'),
      color: 'secondary'
    },
    {
      title: 'Manage Enrollments',
      description: 'View and manage existing enrollments',
      icon: UserGroupIcon,
      action: () => navigate('/enrollments'),
      color: 'accent'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your agency's summer camp enrollments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {stat.title}
                </div>
                <div className="text-xs text-gray-500">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="card p-6 text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                  <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Enrollments</h2>
            <Link
              to="/enrollments"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="card">
            {recentEnrollments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentEnrollments.map((enrollment) => {
                  const statusConfig = getStatusConfig(enrollment.status);
                  return (
                    <Link
                      key={enrollment.id}
                      to={`/enrollments/${enrollment.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {enrollment.groupName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {enrollment.programName} • {enrollment.numberOfStudents} students
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(enrollment.startDate)} - {formatDate(enrollment.endDate)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <span className={`${statusConfig.className} whitespace-nowrap`}>
                            {statusConfig.label}
                          </span>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(enrollment.totalPrice)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600">No enrollments yet</div>
                <button
                  onClick={() => navigate('/enroll')}
                  className="mt-4 btn-primary"
                >
                  Create your first enrollment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="space-y-4">
            {dashboardData?.pendingDocuments > 0 && (
              <div className="card p-4 border-l-4 border-accent-500">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-accent-600 mt-0.5" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Documents Required
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {dashboardData.pendingDocuments} enrollment(s) require document submission
                    </div>
                    <Link
                      to="/enrollments?filter=pending_documents"
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium mt-2 inline-block"
                    >
                      Review now →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {dashboardData?.recentActivity && (
              <div className="card">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900">
                            {activity.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp, 'MMM dd, h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 