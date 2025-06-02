const DocumentsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents & Resources</h1>
        <p className="mt-2 text-gray-600">
          Access camp documentation, resources, and support materials
        </p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Documents & Resources Center</h3>
        <p className="text-gray-600">
          This page will provide access to camp brochures, handbooks, packing lists,
          visa support documents, and other important resources for agencies.
        </p>
      </div>
    </div>
  );
};

export default DocumentsPage; 