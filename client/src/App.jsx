// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom'; // Added useParams here

// Assuming components are in these locations based on your imports
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import GroupProgrammePage from './pages/GroupProgrammePage';
import ImportPage from './pages/ImportPage';
import ProgrammesPage from './pages/ProgrammesPage';
import SchedulerPage from './pages/SchedulerPage'; // Import the actual SchedulerPage
import ActivitiesPage from './pages/ActivitiesPage'; // Add this import
import RotaPage from './pages/RotaPage'; // Add RotaPage import
import ActivityDetailPage from './pages/ActivityDetailPage';
import FlightsPage from './pages/FlightsPage';
import IndividualFlightPage from './pages/IndividualFlightPage';

import './App.css';

// This ProtectedRoute is specifically for routes that use DashboardLayout
const ProtectedRouteWithDashboardLayout = ({ isAuthenticated, onLogout }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // DashboardLayout internally uses <Outlet /> to render child components
  return <DashboardLayout onLogout={onLogout} />;
};

// A more generic ProtectedRoute for pages that might not use DashboardLayout
const GenericProtectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children; // Render the passed component (e.g., SchedulerPage)
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    console.log("App: User logged in");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    console.log("App: User logged out");
  };

  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page - Publicly accessible */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          }
        />

        {/* Dashboard Routes - Uses DashboardLayout */}
        <Route
          path="/dashboard"
          element={<ProtectedRouteWithDashboardLayout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="groups" element={<Outlet />}>
            <Route index element={<GroupsPage />} />
            <Route path=":groupId" element={<GroupDetailPage />} />
            <Route path=":groupId/programme" element={<GroupProgrammePage />} />
          </Route>
          <Route path="programmes" element={<ProgrammesPage />} /> {/* This page links to the separate scheduler */}
          <Route path="rota" element={<RotaPage />} /> {/* Add Rota route */}
          <Route path="activities" element={<ActivitiesPage />} /> {/* Add this route */}
          <Route path="flights" element={<FlightsPage />} /> {/* Add Flights route */}
          <Route path="flights/:flightId" element={<IndividualFlightPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="activities/:activityId" element={<ActivityDetailPage />} />
          {/* Note: The scheduler route is no longer nested here if it needs a different layout */}
        </Route>

        {/* Scheduler Route - Protected, but uses its own layout (or no layout wrapper from App.jsx) */}
        <Route
          path="/scheduler/:centreName"
          element={
            <GenericProtectedRoute isAuthenticated={isAuthenticated}>
              <SchedulerPage />
            </GenericProtectedRoute>
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all 404 Page */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-2xl">Page Not Found</p>
            <a href="/" className="mt-8 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-md">Go Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
