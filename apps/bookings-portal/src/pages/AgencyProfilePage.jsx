const AgencyProfilePage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agency Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your agency information and settings
        </p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Agency Profile Management</h3>
        <p className="text-gray-600">
          This page will allow agencies to view and edit their profile information,
          contact details, preferences, and account settings.
        </p>
      </div>
    </div>
  );
};

export default AgencyProfilePage; 