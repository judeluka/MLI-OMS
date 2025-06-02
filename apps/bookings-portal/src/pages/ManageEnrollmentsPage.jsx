const ManageEnrollmentsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Enrollments</h1>
        <p className="mt-2 text-gray-600">
          View and manage all your group enrollments
        </p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enrollments Management</h3>
        <p className="text-gray-600">
          This page will display a comprehensive list of all enrollments with filtering, 
          search capabilities, and detailed management options.
        </p>
      </div>
    </div>
  );
};

export default ManageEnrollmentsPage; 