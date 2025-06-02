import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// Icon components
const ChevronLeftIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const SaveIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

function ParticipantFormPage() {
  const { participantId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(participantId);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    sex: '',
    participant_type: 'student',
    group_id: '',
    nationality: '',
    passport_number: '',
    passport_issue_date: '',
    passport_expiry_date: '',
    dietary_allergies: '',
    medical_issues: '',
    test_score: ''
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [availableGroups, setAvailableGroups] = useState([]);

  // Fetch participant data if editing
  useEffect(() => {
    if (isEditing) {
      fetchParticipant();
    }
    fetchGroups();
  }, [participantId, isEditing]);

  const fetchParticipant = async () => {
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
        const participant = data.participant;
        setFormData({
          first_name: participant.first_name || '',
          last_name: participant.last_name || '',
          date_of_birth: participant.date_of_birth || '',
          sex: participant.sex || '',
          participant_type: participant.participant_type || 'student',
          group_id: participant.group_id || '',
          nationality: participant.nationality || '',
          passport_number: participant.passport_number || '',
          passport_issue_date: participant.passport_issue_date || '',
          passport_expiry_date: participant.passport_expiry_date || '',
          dietary_allergies: participant.dietary_allergies || '',
          medical_issues: participant.medical_issues || '',
          test_score: participant.test_score !== null ? participant.test_score.toString() : ''
        });
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

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableGroups(data.groups || []);
        }
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.participant_type) {
      errors.participant_type = 'Participant type is required';
    }

    if (formData.test_score && (isNaN(formData.test_score) || formData.test_score < 0 || formData.test_score > 50)) {
      errors.test_score = 'Test score must be between 0 and 50';
    }

    if (formData.passport_issue_date && formData.passport_expiry_date) {
      const issueDate = new Date(formData.passport_issue_date);
      const expiryDate = new Date(formData.passport_expiry_date);
      if (issueDate >= expiryDate) {
        errors.passport_expiry_date = 'Expiry date must be after issue date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        test_score: formData.test_score ? parseInt(formData.test_score, 10) : null,
        group_id: formData.group_id ? parseInt(formData.group_id, 10) : null
      };

      // Remove empty strings and convert to null
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      const url = isEditing 
        ? `http://localhost:5000/api/participants/${participantId}`
        : 'http://localhost:5000/api/participants';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.join(', '));
        }
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} participant`);
      }

      // Navigate to participant detail page
      const participantId = data.participant.id;
      navigate(`/dashboard/participants/${participantId}`, {
        state: { message: `Participant ${isEditing ? 'updated' : 'created'} successfully!` }
      });

    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} participant:`, err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Form field component
  const FormField = ({ label, name, type = "text", required = false, options = null, placeholder = "", className = "" }) => (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm ${
            validationErrors[name] ? 'border-red-500' : ''
          }`}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          rows={4}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm ${
            validationErrors[name] ? 'border-red-500' : ''
          }`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm ${
            validationErrors[name] ? 'border-red-500' : ''
          }`}
          required={required}
        />
      )}
      {validationErrors[name] && (
        <p className="text-red-500 text-sm mt-1">{validationErrors[name]}</p>
      )}
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

  if (error && isEditing) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Section */}
      <div className="bg-slate-800 text-white shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <Link 
              to={isEditing ? `/dashboard/participants/${participantId}` : "/dashboard/participants"}
              className="inline-flex items-center px-3 py-2 text-base font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 mb-4 sm:mb-0"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Back to Participant' : 'Back to All Participants'}
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              {isEditing ? 'Edit Participant' : 'Add New Participant'}
            </h1>
            <p className="text-slate-300 text-lg">
              {isEditing ? 'Update participant information' : 'Enter participant details'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="First Name"
                  name="first_name"
                  required
                  placeholder="Enter first name"
                />
                <FormField
                  label="Last Name"
                  name="last_name"
                  required
                  placeholder="Enter last name"
                />
                <FormField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                />
                <FormField
                  label="Sex"
                  name="sex"
                  type="select"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' }
                  ]}
                />
                <FormField
                  label="Participant Type"
                  name="participant_type"
                  type="select"
                  required
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'leader', label: 'Leader' }
                  ]}
                />
                <FormField
                  label="Nationality"
                  name="nationality"
                  placeholder="Enter nationality"
                />
                <FormField
                  label="Test Score"
                  name="test_score"
                  type="number"
                  placeholder="0-50"
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Group Assignment */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Group Assignment</h2>
              <FormField
                label="Group"
                name="group_id"
                type="select"
                options={availableGroups.map(group => ({
                  value: group.id.toString(),
                  label: group.groupName
                }))}
                className="max-w-md"
              />
            </div>

            {/* Passport Information */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Passport Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Passport Number"
                  name="passport_number"
                  placeholder="Enter passport number"
                />
                <FormField
                  label="Issue Date"
                  name="passport_issue_date"
                  type="date"
                />
                <FormField
                  label="Expiry Date"
                  name="passport_expiry_date"
                  type="date"
                />
              </div>
            </div>

            {/* Health & Dietary Information */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Health & Dietary Information</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  label="Dietary Allergies"
                  name="dietary_allergies"
                  type="textarea"
                  placeholder="List any dietary allergies or restrictions..."
                />
                <FormField
                  label="Medical Issues"
                  name="medical_issues"
                  type="textarea"
                  placeholder="List any medical conditions or issues..."
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                to={isEditing ? `/dashboard/participants/${participantId}` : "/dashboard/participants"}
                className="px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors duration-150"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-blue-600 text-white font-semibold text-base rounded-lg shadow-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out inline-flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Participant' : 'Create Participant'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ParticipantFormPage; 