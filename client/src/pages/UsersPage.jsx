// src/UsersPage.jsx
import React from 'react';

function UsersPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Manage Users</h2>
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-8">
        <p className="text-slate-700">This is where user management content will go.</p>
        {/* Add user table, search, filters, etc. here */}
      </div>
    </div>
  );
}

export default UsersPage;
