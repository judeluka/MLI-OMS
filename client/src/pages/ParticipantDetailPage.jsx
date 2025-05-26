import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// Icon components
const ChevronLeftIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not provided';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'Unknown';
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  } catch (e) {
    return 'Unknown';
  }
};

function ParticipantDetailPage() {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch participant details
  useEffect(() => {
    const fetchParticipant = async () => {
      if (!participantId) {
        setError("Participant ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:5000/api/participants/${participantId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch participant: ${response.status}` }));
          throw new Error(errorData.message);
        }
        
        const data = await response.json();
        if (data.success && data.participant) {
          setParticipant(data.participant);
        } else {
          throw new Error(data.message || 'Could not retrieve participant details.');
        }
      } catch (err) {
        console.error("Error fetching participant:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipant();
  }, [participantId]);

  // Handle delete participant
  const handleDelete = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete ${participant.first_name} ${participant.last_name}? This action cannot be undone.`
    );

    if (!confirmation) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete participant');
      }

      // Navigate back to participants list
      navigate('/dashboard/participants', { 
        state: { message: `Participant "${participant.first_name} ${participant.last_name}" deleted successfully.` }
      });
    } catch (err) {
      console.error('Error deleting participant:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Detail item component
  const DetailItem = ({ label, value, className = "" }) => (
    <div className={`bg-white p-4 rounded-lg border border-slate-200 ${className}`}>
      <dt className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-slate-800">
        {value || <span className="text-slate-400 italic font-normal">Not provided</span>}
      </dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-3 text-slate-700 text-lg">Loading participant details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md relative max-w-md text-center" role="alert">
          <strong className="font-bold block text-lg">Error!</strong>
          <span className="block sm:inline mt-1">{error}</span>
          <Link 
            to="/dashboard/participants" 
            className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors"
          >
            &larr; Back to All Participants
          </Link>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg shadow-md relative max-w-md text-center" role="alert">
          <strong className="font-bold block text-lg">Not Found!</strong>
          <span className="block sm:inline mt-1">Participant not found or could not be loaded.</span>
          <Link 
            to="/dashboard/participants" 
            className="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md shadow-sm transition-colors"
          >
            &larr; Back to All Participants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Section */}
      <div className="bg-slate-800 text-white shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header with Back Button and Action Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <Link 
              to="/dashboard/participants" 
              className="inline-flex items-center px-3 py-2 text-base font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 mb-4 sm:mb-0"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to All Participants
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                to={`/dashboard/participants/${participantId}/edit`}
                className="inline-flex items-center px-4 py-2 text-base font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150"
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Details
              </Link>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <DeleteIcon className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Participant Name as Main Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {participant.first_name} {participant.last_name}
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                participant.participant_type === 'student' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {participant.participant_type === 'student' ? 'Student' : 'Leader'}
              </span>
              {participant.group_name && (
                <Link 
                  to={`/dashboard/groups/${participant.group_id}`}
                  className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  {participant.group_name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Date of Birth" value={formatDate(participant.date_of_birth)} />
              <DetailItem label="Age" value={calculateAge(participant.date_of_birth)} />
              <DetailItem label="Sex" value={participant.sex} />
              <DetailItem label="Nationality" value={participant.nationality} />
              <DetailItem label="Test Score" value={participant.test_score !== null ? `${participant.test_score}/50` : null} />
            </div>
          </div>

          {/* Passport Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Passport Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Passport Number" value={participant.passport_number} />
              <DetailItem label="Issue Date" value={formatDate(participant.passport_issue_date)} />
              <DetailItem label="Expiry Date" value={formatDate(participant.passport_expiry_date)} />
            </div>
          </div>

          {/* Health & Dietary Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Health & Dietary Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <dt className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Dietary Allergies</dt>
                <dd className="text-base text-slate-800">
                  {participant.dietary_allergies ? (
                    <div className="whitespace-pre-wrap">{participant.dietary_allergies}</div>
                  ) : (
                    <span className="text-slate-400 italic">No dietary allergies reported</span>
                  )}
                </dd>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <dt className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Medical Issues</dt>
                <dd className="text-base text-slate-800">
                  {participant.medical_issues ? (
                    <div className="whitespace-pre-wrap">{participant.medical_issues}</div>
                  ) : (
                    <span className="text-slate-400 italic">No medical issues reported</span>
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* Group Information */}
          {participant.group_name && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Group Assignment</h2>
              <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{participant.group_name}</h3>
                    <p className="text-slate-600 mt-1">Assigned to this group</p>
                  </div>
                  <Link 
                    to={`/dashboard/groups/${participant.group_id}`}
                    className="inline-flex items-center px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                  >
                    View Group Details
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParticipantDetailPage; 