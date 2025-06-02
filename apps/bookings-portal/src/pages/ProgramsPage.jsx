const ProgramsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Summer Camp Programs</h1>
        <p className="mt-2 text-gray-600">
          Explore our exciting English language summer camp programs
        </p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Programs Page Coming Soon</h3>
        <p className="text-gray-600">
          This page will showcase all available summer camp programs with detailed information, 
          pricing, and booking options.
        </p>
      </div>
    </div>
  );
};

export default ProgramsPage; 