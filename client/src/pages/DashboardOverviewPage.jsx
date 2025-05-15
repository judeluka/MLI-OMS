// src/DashboardOverviewPage.jsx
import React from 'react';

function DashboardOverviewPage() {
  // User email can be fetched from localStorage here too if needed for specific page logic,
  // or passed down if the layout structure changes. For now, the layout header shows it.

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Overview</h2>
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
