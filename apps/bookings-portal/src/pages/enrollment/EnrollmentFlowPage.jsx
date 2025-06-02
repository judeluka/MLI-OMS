import useEnrollmentStore from '../../store/enrollmentStore';

const EnrollmentFlowPage = () => {
  const { currentStep, resetEnrollment } = useEnrollmentStore();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Group Enrollment</h1>
        <p className="mt-2 text-gray-600">
          Enroll a new group of students in our summer camp programs
        </p>
      </div>
      
      <div className="card p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Step Enrollment Flow</h3>
        <p className="text-gray-600 mb-4">
          This page will contain the complete 5-step enrollment process with program selection, 
          accommodation options, group details, student information, and confirmation.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Current step: {currentStep} | Zustand store is connected and working
        </p>
        <button 
          onClick={resetEnrollment}
          className="btn-secondary"
        >
          Reset Enrollment Flow (Test)
        </button>
      </div>
    </div>
  );
};

export default EnrollmentFlowPage; 