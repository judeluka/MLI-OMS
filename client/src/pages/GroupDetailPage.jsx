// src/pages/GroupDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Placeholder for ChevronLeftIcon - replace with actual SVG or library import
const ChevronLeftIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Edit Icon Component
const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

// Save Icon Component
const SaveIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// Cancel Icon Component
const CancelIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Delete Icon Component
const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// Placeholder for actual programme data from scheduler - this would also be fetched
// Or derived from classSchedule/activitySchedule if those are central
// For now, we'll keep this as a local placeholder.
// Key: 'YYYY-MM-DD-GroupId-Slot' (e.g., '2025-05-17-1-Morning')
// Value: Activity/Class name.
const groupProgrammeData = {
    '2025-05-16-1-Arrival': 'Check-in & Welcome Talk',
    '2025-05-17-1-Morning': 'English Class A1',
    '2025-05-17-1-Afternoon': 'Museum Visit',
    '2025-05-17-1-Evening': 'Movie Night',
    '2025-05-18-1-Morning': 'History Class B1',
    '2025-05-18-1-Afternoon': 'City Tour',
    '2025-05-18-1-Evening': 'Quiz Night',
    '2025-05-22-1-Departure': 'Check-out & Airport Transfer',

    '2025-05-20-2-Arrival': 'Arrival & Orientation',
    '2025-05-21-2-Morning': 'Language Workshop',
    '2025-05-21-2-Afternoon': 'Local Market Trip',
    '2025-05-21-2-Evening': 'Cultural Dinner',
};

// Tab configuration
const tabs = [
  { id: 'participants', name: 'Participants', icon: '👥' },
  { id: 'extras', name: 'Extras', icon: '🎁' },
  { id: 'flights', name: 'Flights', icon: '✈️' },
  { id: 'transfers', name: 'Transfers', icon: '🚌' },
  { id: 'programmes', name: 'Programmes', icon: '📅' }
];

function GroupDetailPage() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('participants');
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  
  // Flight management state - keeping only what's needed for the new system
  const [existingFlights, setExistingFlights] = useState([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [flightSubmitError, setFlightSubmitError] = useState(null);

  // Separate modal states
  const [isSelectFlightModalOpen, setIsSelectFlightModalOpen] = useState(false);
  const [isCreateFlightModalOpen, setIsCreateFlightModalOpen] = useState(false);

  // Flight selection confirmation and feedback
  const [selectedFlightForConfirmation, setSelectedFlightForConfirmation] = useState(null);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [flightAddSuccess, setFlightAddSuccess] = useState(null);

  // New flight creation state
  const [newFlightData, setNewFlightData] = useState({
    flight_type: '',
    flight_date: '',
    flight_time: '',
    flight_code: ''
  });
  const [isCreatingFlight, setIsCreatingFlight] = useState(false);
  const [newFlightError, setNewFlightError] = useState(null);

  // Participants state
  const [participants, setParticipants] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

  // Date mismatch detection state
  const [dateMismatches, setDateMismatches] = useState([]);
  const [showDateMismatchWarning, setShowDateMismatchWarning] = useState(false);

  // Transfers state
  const [assignedTransfers, setAssignedTransfers] = useState([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [transfersError, setTransfersError] = useState(null);
  const [availableTransfers, setAvailableTransfers] = useState([]);
  const [isLoadingAvailableTransfers, setIsLoadingAvailableTransfers] = useState(false);
  
  // Transfer assignment modal state
  const [isAssignTransferModalOpen, setIsAssignTransferModalOpen] = useState(false);
  const [selectedTransferForAssignment, setSelectedTransferForAssignment] = useState(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    pax_count_for_group: '',
    assignment_notes: ''
  });
  const [isAssigningTransfer, setIsAssigningTransfer] = useState(false);
  const [assignmentError, setAssignmentError] = useState(null);
  
  // Transfer assignment edit state
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);

  // Function to check for date mismatches in this group
  const checkGroupDateMismatches = () => {
    if (!groupInfo) return;

    const mismatches = [];
    const groupArrivalDate = new Date(groupInfo.arrivalDate);
    const groupDepartureDate = new Date(groupInfo.departureDate);

    // Check arrival flights
    if (groupInfo.arrivalFlights && groupInfo.arrivalFlights.length > 0) {
      for (const flight of groupInfo.arrivalFlights) {
        const flightDate = new Date(flight.flight_date);
        if (flightDate.toDateString() !== groupArrivalDate.toDateString()) {
          mismatches.push({
            type: 'arrival',
            flightCode: flight.flight_code,
            flightDate: flight.flight_date,
            groupDate: groupInfo.arrivalDate,
            flightId: flight.flight_id
          });
        }
      }
    }

    // Check departure flights
    if (groupInfo.departureFlights && groupInfo.departureFlights.length > 0) {
      for (const flight of groupInfo.departureFlights) {
        const flightDate = new Date(flight.flight_date);
        if (flightDate.toDateString() !== groupDepartureDate.toDateString()) {
          mismatches.push({
            type: 'departure',
            flightCode: flight.flight_code,
            flightDate: flight.flight_date,
            groupDate: groupInfo.departureDate,
            flightId: flight.flight_id
          });
        }
      }
    }

    setDateMismatches(mismatches);
    setShowDateMismatchWarning(mismatches.length > 0);
  };

  // Fetch participants for this group
  const fetchParticipants = async () => {
    setIsLoadingParticipants(true);
    setParticipantsError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/participants`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch participants: ${response.status}` }));
        throw new Error(errorData.message);
      }
      
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants || []);
      } else {
        throw new Error(data.message || 'Failed to fetch participants');
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setParticipantsError(err.message);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Fetch assigned transfers for this group
  const fetchAssignedTransfers = async () => {
    setIsLoadingTransfers(true);
    setTransfersError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/transfers`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch transfers: ${response.status}` }));
        throw new Error(errorData.message);
      }
      
      const data = await response.json();
      if (data.success) {
        setAssignedTransfers(data.transfers || []);
      } else {
        throw new Error(data.message || 'Failed to fetch transfers');
      }
    } catch (err) {
      console.error('Error fetching assigned transfers:', err);
      setTransfersError(err.message);
      setAssignedTransfers([]);
    } finally {
      setIsLoadingTransfers(false);
    }
  };

  // Fetch available transfers for assignment
  const fetchAvailableTransfers = async () => {
    setIsLoadingAvailableTransfers(true);
    try {
      const response = await fetch('http://localhost:5000/api/transfers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableTransfers(data.transfers || []);
        }
      }
    } catch (err) {
      console.error('Error fetching available transfers:', err);
    } finally {
      setIsLoadingAvailableTransfers(false);
    }
  };

  // Handle opening assign transfer modal
  const handleOpenAssignTransferModal = () => {
    setIsAssignTransferModalOpen(true);
    setAssignmentError(null);
    setAssignmentFormData({ pax_count_for_group: '', assignment_notes: '' });
    fetchAvailableTransfers();
  };

  // Handle closing assign transfer modal
  const handleCloseAssignTransferModal = () => {
    setIsAssignTransferModalOpen(false);
    setSelectedTransferForAssignment(null);
    setAssignmentFormData({ pax_count_for_group: '', assignment_notes: '' });
    setAssignmentError(null);
  };

  // Handle transfer selection for assignment
  const handleSelectTransferForAssignment = (transfer) => {
    setSelectedTransferForAssignment(transfer);
  };

  // Handle assignment form changes
  const handleAssignmentFormChange = (e) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle assigning transfer to group
  const handleAssignTransfer = async (e) => {
    e.preventDefault();
    if (!selectedTransferForAssignment) return;

    setIsAssigningTransfer(true);
    setAssignmentError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: selectedTransferForAssignment.id,
          pax_count_for_group: parseInt(assignmentFormData.pax_count_for_group, 10),
          assignment_notes: assignmentFormData.assignment_notes
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        handleCloseAssignTransferModal();
        fetchAssignedTransfers();
      } else {
        setAssignmentError(data.message || 'Failed to assign transfer');
      }
    } catch (err) {
      setAssignmentError('Failed to assign transfer');
    } finally {
      setIsAssigningTransfer(false);
    }
  };

  // Handle editing assignment
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormData({
      pax_count_for_group: assignment.pax_count_for_group.toString(),
      assignment_notes: assignment.assignment_notes || ''
    });
    setIsEditAssignmentModalOpen(true);
    setAssignmentError(null);
  };

  // Handle updating assignment
  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;

    setIsAssigningTransfer(true);
    setAssignmentError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/transfers/${editingAssignment.assignment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pax_count_for_group: parseInt(assignmentFormData.pax_count_for_group, 10),
          assignment_notes: assignmentFormData.assignment_notes
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsEditAssignmentModalOpen(false);
        setEditingAssignment(null);
        setAssignmentFormData({ pax_count_for_group: '', assignment_notes: '' });
        fetchAssignedTransfers();
      } else {
        setAssignmentError(data.message || 'Failed to update assignment');
      }
    } catch (err) {
      setAssignmentError('Failed to update assignment');
    } finally {
      setIsAssigningTransfer(false);
    }
  };

  // Handle unassigning transfer
  const handleUnassignTransfer = async (assignmentId) => {
    if (!confirm('Are you sure you want to unassign this transfer from the group?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/transfers/${assignmentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (response.ok && data.success) {
        fetchAssignedTransfers();
      } else {
        setTransfersError(data.message || 'Failed to unassign transfer');
      }
    } catch (err) {
      setTransfersError('Failed to unassign transfer');
    }
  };

  // Fetch group details
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setError("Group ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setGroupInfo(null);

      try {
        // Fetch group metadata
        const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
        if (!groupResponse.ok) {
          const errData = await groupResponse.json().catch(() => ({ message: `Failed to fetch group details: ${groupResponse.status}` }));
          throw new Error(errData.message);
        }
        const groupDataResult = await groupResponse.json();
        if (groupDataResult.success && groupDataResult.group) {
          setGroupInfo(groupDataResult.group);
          // Initialize edit form data
          setEditFormData(groupDataResult.group);
        } else {
          throw new Error(groupDataResult.message || 'Could not retrieve group details.');
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
    fetchParticipants();
    fetchAssignedTransfers();
    fetchAvailableTransfers();
  }, [groupId]);

  // Check for date mismatches whenever groupInfo changes
  useEffect(() => {
    if (groupInfo) {
      checkGroupDateMismatches();
    }
  }, [groupInfo]);

  // Fetch existing flights for the modal
  const fetchExistingFlights = async () => {
    setIsLoadingFlights(true);
    try {
      const response = await fetch('http://localhost:5000/api/flights');
      const data = await response.json();
      if (data.success) {
        setExistingFlights(data.flights);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  // Handle flight selection (show confirmation first)
  const handleFlightSelection = (flight) => {
    setSelectedFlightForConfirmation(flight);
  };

  // Confirm and add selected flight
  const handleConfirmFlightSelection = async () => {
    if (!selectedFlightForConfirmation) return;
    
    setIsAddingFlight(true);
    setFlightSubmitError(null);
    
    try {
      // Prepare ALL flights (existing + new one) since the API replaces all flights
      const allFlights = [
        // Include all existing arrival flights
        ...(groupInfo?.arrivalFlights || []).map(f => ({
          flight_type: f.flight_type,
          flight_date: f.flight_date,
          flight_time: f.flight_time,
          flight_code: f.flight_code,
          isExisting: true,
          flight_id: f.flight_id
        })),
        // Include all existing departure flights
        ...(groupInfo?.departureFlights || []).map(f => ({
          flight_type: f.flight_type,
          flight_date: f.flight_date,
          flight_time: f.flight_time,
          flight_code: f.flight_code,
          isExisting: true,
          flight_id: f.flight_id
        })),
        // Add the new flight
        {
          flight_type: selectedFlightForConfirmation.flight_type,
          flight_date: selectedFlightForConfirmation.flight_date,
          flight_time: selectedFlightForConfirmation.flight_time,
          flight_code: selectedFlightForConfirmation.flight_code,
          isExisting: true,
          flight_id: selectedFlightForConfirmation.id
        }
      ];

      // Now associate all flights with the group
      const associateResponse = await fetch(`http://localhost:5000/api/groups/${groupId}/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flights: allFlights }),
      });

      if (!associateResponse.ok) {
        const errorData = await associateResponse.json();
        throw new Error(errorData.message || 'Failed to add flight to group');
      }

      // Refresh group data to get updated flights
      const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        if (groupData.success && groupData.group) {
          setGroupInfo(groupData.group);
          setEditFormData(groupData.group);
        }
      }

      // Show success feedback
      setFlightAddSuccess(selectedFlightForConfirmation);
      setSelectedFlightForConfirmation(null);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setFlightAddSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error adding flight to group:', err);
      setFlightSubmitError(err.message);
    } finally {
      setIsAddingFlight(false);
    }
  };

  // Cancel flight selection
  const handleCancelFlightSelection = () => {
    setSelectedFlightForConfirmation(null);
  };

  // Select existing flight (old function - now just calls handleFlightSelection)
  const handleSelectExistingFlight = (existingFlight) => {
    handleFlightSelection(existingFlight);
  };

  // Open select existing flight modal
  const handleOpenSelectFlightModal = () => {
    setIsSelectFlightModalOpen(true);
    setFlightSubmitError(null);
    fetchExistingFlights();
  };

  // Close select flight modal
  const handleCloseSelectFlightModal = () => {
    setIsSelectFlightModalOpen(false);
    setFlightSubmitError(null);
    setSelectedFlightForConfirmation(null);
    setFlightAddSuccess(null);
  };

  // Open create new flight modal
  const handleOpenCreateFlightModal = () => {
    setIsCreateFlightModalOpen(true);
    setNewFlightError(null);
    setNewFlightData({ flight_type: '', flight_date: '', flight_time: '', flight_code: '' });
  };

  // Close create flight modal
  const handleCloseCreateFlightModal = () => {
    setIsCreateFlightModalOpen(false);
    setNewFlightError(null);
    setNewFlightData({ flight_type: '', flight_date: '', flight_time: '', flight_code: '' });
  };

  // Handle new flight form changes
  const handleNewFlightChange = (e) => {
    const { name, value } = e.target;
    setNewFlightData(prev => ({ ...prev, [name]: value }));
  };

  // Handle creating a new flight
  const handleCreateNewFlight = async (e) => {
    e.preventDefault();
    setIsCreatingFlight(true);
    setNewFlightError(null);

    try {
      // First create the flight
      const response = await fetch('http://localhost:5000/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlightData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Prepare ALL flights (existing + new one) since the API replaces all flights
        const allFlights = [
          // Include all existing arrival flights
          ...(groupInfo?.arrivalFlights || []).map(f => ({
            flight_type: f.flight_type,
            flight_date: f.flight_date,
            flight_time: f.flight_time,
            flight_code: f.flight_code,
            isExisting: true,
            flight_id: f.flight_id
          })),
          // Include all existing departure flights
          ...(groupInfo?.departureFlights || []).map(f => ({
            flight_type: f.flight_type,
            flight_date: f.flight_date,
            flight_time: f.flight_time,
            flight_code: f.flight_code,
            isExisting: true,
            flight_id: f.flight_id
          })),
          // Add the new flight
          {
            flight_type: data.flight.flight_type,
            flight_date: data.flight.flight_date,
            flight_time: data.flight.flight_time,
            flight_code: data.flight.flight_code,
            isExisting: true,
            flight_id: data.flight.id
          }
        ];

        // Now associate all flights with the group
        const associateResponse = await fetch(`http://localhost:5000/api/groups/${groupId}/flights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ flights: allFlights }),
        });

        if (!associateResponse.ok) {
          const errorData = await associateResponse.json();
          throw new Error(errorData.message || 'Failed to add flight to group');
        }

        // Refresh group data to get updated flights
        const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          if (groupData.success && groupData.group) {
            setGroupInfo(groupData.group);
            setEditFormData(groupData.group);
          }
        }

        // Close the modal and reset form
        setIsCreateFlightModalOpen(false);
        setNewFlightData({ flight_type: '', flight_date: '', flight_time: '', flight_code: '' });
      } else {
        setNewFlightError(data.message || 'Failed to create flight');
      }
    } catch (err) {
      setNewFlightError('Failed to create flight');
    } finally {
      setIsCreatingFlight(false);
    }
  };

  // Format date for display
  const formatFlightDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format time for display
  const formatFlightTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Remove seconds if present
  };

  // Formats YYYY-MM-DD to DD MMM YYYY (UTC)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return <span className="text-slate-500 italic">Not set</span>;
    try {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS months 0-indexed
            const day = parseInt(parts[2], 10);
            const date = new Date(Date.UTC(year, month, day));
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
        }
        return dateString;
    } catch (e) { return dateString; }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit mode - reset form data
      setEditFormData(groupInfo);
      setEditError(null);
    }
    setIsEditMode(!isEditMode);
  };

  // Handle form field changes
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setEditError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save changes');
      }

      const result = await response.json();
      if (result.success && result.group) {
        setGroupInfo(result.group);
        setEditFormData(result.group);
        setIsEditMode(false);
      } else {
        throw new Error(result.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove individual flight association
  const handleRemoveFlightAssociation = async (flightId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/flights/${flightId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove flight');
      }

      // Refresh group data
      const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        if (groupData.success && groupData.group) {
          setGroupInfo(groupData.group);
          setEditFormData(groupData.group);
        }
      }
    } catch (err) {
      console.error('Error removing flight:', err);
      // You might want to show an error message to the user here
    }
  };

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      return 'N/A';
    }
  };

  const renderParticipantsTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">Group Participants</h3>
          <p className="text-base text-slate-600 mt-1">
            {participants.length > 0 
              ? `${participants.length} participant${participants.length !== 1 ? 's' : ''} in this group`
              : 'Manage students and leaders in this group'
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchParticipants}
            disabled={isLoadingParticipants}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${isLoadingParticipants ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            to="/dashboard/participants/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Participant
          </Link>
        </div>
      </div>
      
      {isLoadingParticipants ? (
        <div className="px-6 py-12 text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600">Loading participants...</p>
        </div>
      ) : participantsError ? (
        <div className="px-6 py-12 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-slate-800">Error Loading Participants</p>
            <p className="text-sm text-slate-600 mt-1">{participantsError}</p>
          </div>
          <button
            onClick={fetchParticipants}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : participants.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Test Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {participants.map((participant, index) => (
                <tr key={participant.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-600">
                            {participant.first_name?.[0]}{participant.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {participant.first_name} {participant.last_name}
                        </div>
                        {participant.nationality && (
                          <div className="text-sm text-slate-500">{participant.nationality}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      participant.participant_type === 'student' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {participant.participant_type === 'student' ? 'Student' : 'Leader'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {calculateAge(participant.date_of_birth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                    {participant.test_score !== null ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        participant.test_score >= 40 ? 'bg-green-100 text-green-800' :
                        participant.test_score >= 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {participant.test_score}/50
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <Link 
                        to={`/dashboard/participants/${participant.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/dashboard/participants/${participant.id}/edit`}
                        className="text-amber-600 hover:text-amber-800 font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-lg font-medium text-slate-600">No participants in this group</p>
            <p className="text-base text-slate-500 mt-1 mb-4">
              Add participants to this group to see them listed here
            </p>
            <Link
              to="/dashboard/participants/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Participant
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  // Render Extras Tab Content
  const renderExtrasTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Programme Extras</h3>
        <p className="text-base text-slate-600 mt-1">Additional services and activities booked for this group</p>
      </div>
      <div className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-lg font-medium text-slate-600">No extras configured</p>
          <p className="text-base text-slate-500 mt-1">Extra services and activities will be displayed here</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Add Extras
          </button>
        </div>
      </div>
    </div>
  );

  // Render Flights Tab Content
  const renderFlightsTab = () => (
    <div className="space-y-6">
      {/* Flight Management Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Manage Flight Details</h3>
          <p className="text-base text-slate-600 mb-6">
            Add arrival and departure flights for this group
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleOpenSelectFlightModal}
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Select Existing Flight
            </button>
            <button
              onClick={handleOpenCreateFlightModal}
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Flight
            </button>
          </div>
        </div>
      </div>

      {/* Current Flight Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Current Flight Information</h3>
          <p className="text-base text-slate-600 mt-1">View all flights associated with this group</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arrival Flights */}
            <div className="bg-slate-50 p-6 rounded-lg shadow border border-slate-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🛬</span>
                <h4 className="text-xl font-semibold text-slate-700">Arrival Flights</h4>
              </div>
              {groupInfo?.arrivalFlights && groupInfo.arrivalFlights.length > 0 ? (
                <div className="space-y-4">
                  {groupInfo.arrivalFlights.map((flight, index) => (
                    <div key={flight.flight_id || index} className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Flight Code:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{flight.flight_code}</dd>
                          </div>
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Date:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{formatFlightDate(flight.flight_date)}</dd>
                          </div>
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Time:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{formatFlightTime(flight.flight_time)}</dd>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFlightAssociation(flight.flight_id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove flight"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-center text-slate-600 italic text-sm">
                    No arrival flights have been added yet.
                  </p>
                </div>
              )}
            </div>

            {/* Departure Flights */}
            <div className="bg-slate-50 p-6 rounded-lg shadow border border-slate-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🛫</span>
                <h4 className="text-xl font-semibold text-slate-700">Departure Flights</h4>
              </div>
              {groupInfo?.departureFlights && groupInfo.departureFlights.length > 0 ? (
                <div className="space-y-4">
                  {groupInfo.departureFlights.map((flight, index) => (
                    <div key={flight.flight_id || index} className="bg-white p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Flight Code:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{flight.flight_code}</dd>
                          </div>
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Date:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{formatFlightDate(flight.flight_date)}</dd>
                          </div>
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-slate-500 font-medium">Time:</dt>
                            <dd className="text-sm text-slate-800 font-semibold">{formatFlightTime(flight.flight_time)}</dd>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFlightAssociation(flight.flight_id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove flight"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <p className="text-center text-slate-600 italic text-sm">
                    No departure flights have been added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Select Existing Flight Modal */}
      {isSelectFlightModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">Select Existing Flight</h3>
              <button
                onClick={handleCloseSelectFlightModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Display */}
            {flightSubmitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-sm">Error: {flightSubmitError}</p>
              </div>
            )}

            {/* Success Feedback */}
            {flightAddSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium">
                    Flight {flightAddSuccess.flight_code} ({flightAddSuccess.flight_type}) has been successfully added to this group!
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Dialog */}
            {selectedFlightForConfirmation && (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">Confirm Flight Selection</h4>
                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-lg text-slate-800">
                      {selectedFlightForConfirmation.flight_code}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedFlightForConfirmation.flight_type === 'arrival' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedFlightForConfirmation.flight_type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatFlightDate(selectedFlightForConfirmation.flight_date)}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatFlightTime(selectedFlightForConfirmation.flight_time)}
                    </div>
                  </div>
                </div>
                <p className="text-blue-700 mb-4">
                  Are you sure you want to add this flight to <strong>{groupInfo?.groupName}</strong>?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleConfirmFlightSelection}
                    disabled={isAddingFlight}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAddingFlight ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      'Yes, Add Flight'
                    )}
                  </button>
                  <button
                    onClick={handleCancelFlightSelection}
                    disabled={isAddingFlight}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Existing Flights List */}
            {!selectedFlightForConfirmation && (
              <>
                {isLoadingFlights ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600">Loading flights...</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50">
                    {existingFlights.length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {existingFlights.map(flight => (
                            <button
                              key={flight.id}
                              onClick={() => handleFlightSelection(flight)}
                              className="p-4 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-150 group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold text-lg text-slate-800 group-hover:text-blue-800">
                                  {flight.flight_code}
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  flight.flight_type === 'arrival' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {flight.flight_type}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600 space-y-2">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatFlightDate(flight.flight_date)}
                                </div>
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatFlightTime(flight.flight_time)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <p className="text-lg font-medium">No existing flights available</p>
                        <p className="text-sm mt-1">Create a new flight instead</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Create New Flight Modal */}
      {isCreateFlightModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">Create New Flight</h3>
              <button
                onClick={handleCloseCreateFlightModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* New Flight Form */}
            <form onSubmit={handleCreateNewFlight} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flight Type</label>
                  <select
                    name="flight_type"
                    value={newFlightData.flight_type}
                    onChange={handleNewFlightChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="arrival">Arrival</option>
                    <option value="departure">Departure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flight Code</label>
                  <input
                    type="text"
                    name="flight_code"
                    value={newFlightData.flight_code}
                    onChange={handleNewFlightChange}
                    placeholder="e.g., BA123"
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flight Date</label>
                  <input
                    type="date"
                    name="flight_date"
                    value={newFlightData.flight_date}
                    onChange={handleNewFlightChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Flight Time</label>
                  <input
                    type="time"
                    name="flight_time"
                    value={newFlightData.flight_time}
                    onChange={handleNewFlightChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                    required
                  />
                </div>
              </div>

              {newFlightError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <p className="text-sm">{newFlightError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateFlightModal}
                  className="px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFlight}
                  className="px-8 py-3 bg-green-600 text-white font-semibold text-base rounded-lg shadow-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
                >
                  {isCreatingFlight ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create & Add Flight'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Render Programmes Tab Content
  const renderProgrammesTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Programme Schedule</h3>
        <p className="text-base text-slate-600 mt-1">View the complete programme schedule for this group, including all activities, classes, and meals</p>
      </div>
      <div className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h4 className="text-xl font-semibold text-slate-700 mb-2">Complete Programme Schedule</h4>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto text-base">
            Access detailed daily schedules, class timetables, activity bookings, and meal arrangements for this group.
          </p>
          <Link 
            to={`/dashboard/groups/${groupId}/programme`}
            className="inline-flex items-center px-8 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
          >
            View Full Programme
          </Link>
        </div>
      </div>
    </div>
  );

  // Render Transfers Tab Content
  const renderTransfersTab = () => (
    <div className="space-y-6">
      {/* Transfer Management Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Airport Transfers</h3>
          <p className="text-base text-slate-600 mb-6">
            Manage airport transfers and transportation for this group
          </p>
          <button
            onClick={handleOpenAssignTransferModal}
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Assign Transfer
          </button>
        </div>
      </div>

      {/* Assigned Transfers */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Assigned Transfers</h3>
            <p className="text-base text-slate-600 mt-1">
              {assignedTransfers.length > 0 
                ? `${assignedTransfers.length} transfer${assignedTransfers.length !== 1 ? 's' : ''} assigned to this group`
                : 'Manage transfers assigned to this group'
              }
            </p>
          </div>
          <button
            onClick={fetchAssignedTransfers}
            disabled={isLoadingTransfers}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${isLoadingTransfers ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {isLoadingTransfers ? (
          <div className="px-6 py-12 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600">Loading transfers...</p>
          </div>
        ) : transfersError ? (
          <div className="px-6 py-12 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium text-slate-800">Error Loading Transfers</p>
              <p className="text-sm text-slate-600 mt-1">{transfersError}</p>
            </div>
            <button
              onClick={fetchAssignedTransfers}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : assignedTransfers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Flight</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Pax Count</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {assignedTransfers.map((transfer, index) => (
                  <tr key={transfer.assignment_id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transfer.type === 'arrival' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {transfer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div>
                        <div className="font-medium">{formatFlightDate(transfer.transfer_date)}</div>
                        <div className="text-slate-500">{formatFlightTime(transfer.transfer_time)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div>
                        <div className="font-medium">{transfer.origin_location}</div>
                        <div className="text-slate-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {transfer.destination_location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {transfer.flight_code ? (
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                          {transfer.flight_code}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div>
                        <div className="font-medium">{transfer.pax_count_for_group}</div>
                        {transfer.capacity && (
                          <div className="text-slate-500 text-xs">of {transfer.capacity} total</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleEditAssignment(transfer)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleUnassignTransfer(transfer.assignment_id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Unassign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">🚌</div>
              <p className="text-lg font-medium text-slate-600">No transfers assigned</p>
              <p className="text-base text-slate-500 mt-1 mb-4">
                Assign transfers to this group to see them listed here
              </p>
              <button
                onClick={handleOpenAssignTransferModal}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Assign First Transfer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Transfer Modal */}
      {isAssignTransferModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">Assign Transfer to Group</h3>
              <button
                onClick={handleCloseAssignTransferModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {assignmentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-sm">{assignmentError}</p>
              </div>
            )}

            {selectedTransferForAssignment ? (
              <form onSubmit={handleAssignTransfer} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Selected Transfer</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransferForAssignment.type === 'arrival' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedTransferForAssignment.type}
                      </span>
                    </div>
                    <div><span className="font-medium">Date:</span> {formatFlightDate(selectedTransferForAssignment.transfer_date)}</div>
                    <div><span className="font-medium">Time:</span> {formatFlightTime(selectedTransferForAssignment.transfer_time)}</div>
                    <div><span className="font-medium">Capacity:</span> {selectedTransferForAssignment.capacity || 'N/A'}</div>
                    <div className="col-span-2">
                      <span className="font-medium">Route:</span> {selectedTransferForAssignment.origin_location} → {selectedTransferForAssignment.destination_location}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Passenger Count *</label>
                    <input
                      type="number"
                      name="pax_count_for_group"
                      value={assignmentFormData.pax_count_for_group}
                      onChange={handleAssignmentFormChange}
                      min="1"
                      max={selectedTransferForAssignment.capacity || 999}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Notes</label>
                  <textarea
                    name="assignment_notes"
                    value={assignmentFormData.assignment_notes}
                    onChange={handleAssignmentFormChange}
                    rows={3}
                    placeholder="Optional notes for this assignment..."
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedTransferForAssignment(null)}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Back to Selection
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigningTransfer}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAssigningTransfer ? 'Assigning...' : 'Assign Transfer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Select a Transfer</h4>
                {isLoadingAvailableTransfers ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600">Loading available transfers...</p>
                  </div>
                ) : availableTransfers.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {availableTransfers.map(transfer => (
                        <button
                          key={transfer.id}
                          onClick={() => handleSelectTransferForAssignment(transfer)}
                          className="p-4 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-150 group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transfer.type === 'arrival' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {transfer.type}
                            </span>
                            {transfer.flight_code && (
                              <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                                {transfer.flight_code}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="font-medium text-slate-800">
                              {formatFlightDate(transfer.transfer_date)} at {formatFlightTime(transfer.transfer_time)}
                            </div>
                            <div className="text-slate-600">
                              {transfer.origin_location} → {transfer.destination_location}
                            </div>
                            {transfer.capacity && (
                              <div className="text-slate-500 text-xs">
                                Capacity: {transfer.capacity} passengers
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-500 mb-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium text-slate-600">No available transfers</p>
                      <p className="text-sm text-slate-500 mt-1">Create transfers in the admin panel first</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {isEditAssignmentModalOpen && editingAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">Edit Transfer Assignment</h3>
              <button
                onClick={() => setIsEditAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {assignmentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="text-sm">{assignmentError}</p>
              </div>
            )}

            <form onSubmit={handleUpdateAssignment} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Transfer Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      editingAssignment.type === 'arrival' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {editingAssignment.type}
                    </span>
                  </div>
                  <div><span className="font-medium">Date:</span> {formatFlightDate(editingAssignment.transfer_date)}</div>
                  <div><span className="font-medium">Time:</span> {formatFlightTime(editingAssignment.transfer_time)}</div>
                  <div><span className="font-medium">Capacity:</span> {editingAssignment.capacity || 'N/A'}</div>
                  <div className="col-span-2">
                    <span className="font-medium">Route:</span> {editingAssignment.origin_location} → {editingAssignment.destination_location}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Passenger Count *</label>
                  <input
                    type="number"
                    name="pax_count_for_group"
                    value={assignmentFormData.pax_count_for_group}
                    onChange={handleAssignmentFormChange}
                    min="1"
                    max={editingAssignment.capacity || 999}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Notes</label>
                <textarea
                  name="assignment_notes"
                  value={assignmentFormData.assignment_notes}
                  onChange={handleAssignmentFormChange}
                  rows={3}
                  placeholder="Optional notes for this assignment..."
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditAssignmentModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningTransfer}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAssigningTransfer ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Main render function
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-slate-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Group</h2>
            <p className="text-slate-600 mb-6">{error}</p>
          </div>
          <Link
            to="/dashboard/groups"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Group not found</p>
          <Link
            to="/dashboard/groups"
            className="mt-4 inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/groups"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Groups
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{groupInfo.groupName}</h1>
                <p className="text-lg text-slate-600 mt-1">
                  {formatDateForDisplay(groupInfo.arrivalDate)} - {formatDateForDisplay(groupInfo.departureDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditMode ? (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit Group
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
                  >
                    <CancelIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Mismatch Warning */}
        {showDateMismatchWarning && dateMismatches.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Date Mismatch Warning</h3>
                <div className="text-sm text-yellow-700">
                  <p className="mb-2">The following flights have dates that don't match the group's arrival/departure dates:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {dateMismatches.map((mismatch, index) => (
                      <li key={index}>
                        <strong>{mismatch.flightCode}</strong> ({mismatch.type}): 
                        Flight date is {formatDateForDisplay(mismatch.flightDate)}, 
                        but group {mismatch.type} date is {formatDateForDisplay(mismatch.groupDate)}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setShowDateMismatchWarning(false)}
                  className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Error */}
        {editError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{editError}</p>
            </div>
          </div>
        )}

        {/* Group Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Group Information</h2>
          </div>
          <div className="p-6">
            {isEditMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={editFormData.groupName || ''}
                    onChange={(e) => handleEditChange('groupName', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={editFormData.arrivalDate || ''}
                    onChange={(e) => handleEditChange('arrivalDate', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={editFormData.departureDate || ''}
                    onChange={(e) => handleEditChange('departureDate', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Students</label>
                  <input
                    type="number"
                    value={editFormData.numberOfStudents || ''}
                    onChange={(e) => handleEditChange('numberOfStudents', parseInt(e.target.value) || 0)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of Leaders</label>
                  <input
                    type="number"
                    value={editFormData.numberOfLeaders || ''}
                    onChange={(e) => handleEditChange('numberOfLeaders', parseInt(e.target.value) || 0)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Programme</label>
                  <input
                    type="text"
                    value={editFormData.programme || ''}
                    onChange={(e) => handleEditChange('programme', e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Group Name</dt>
                  <dd className="mt-1 text-sm text-slate-900">{groupInfo.groupName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Arrival Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">{formatDateForDisplay(groupInfo.arrivalDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Departure Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">{formatDateForDisplay(groupInfo.departureDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Number of Students</dt>
                  <dd className="mt-1 text-sm text-slate-900">{groupInfo.numberOfStudents}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Number of Leaders</dt>
                  <dd className="mt-1 text-sm text-slate-900">{groupInfo.numberOfLeaders}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Programme</dt>
                  <dd className="mt-1 text-sm text-slate-900">{groupInfo.programme}</dd>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'participants' && renderParticipantsTab()}
            {activeTab === 'extras' && renderExtrasTab()}
            {activeTab === 'flights' && renderFlightsTab()}
            {activeTab === 'transfers' && renderTransfersTab()}
            {activeTab === 'programmes' && renderProgrammesTab()}
          </div>
        </div>

        {/* Flight Selection Modal */}
        {isSelectFlightModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-slate-800">Select Existing Flight</h3>
                <button
                  onClick={handleCloseSelectFlightModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {flightSubmitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <p className="text-sm">{flightSubmitError}</p>
                </div>
              )}

              {flightAddSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  <p className="text-sm">{flightAddSuccess}</p>
                </div>
              )}

              {selectedFlightForConfirmation ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Confirm Flight Selection</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Flight Code:</span> {selectedFlightForConfirmation.flight_code}</div>
                      <div><span className="font-medium">Type:</span> {selectedFlightForConfirmation.flight_type}</div>
                      <div><span className="font-medium">Date:</span> {formatFlightDate(selectedFlightForConfirmation.flight_date)}</div>
                      <div><span className="font-medium">Time:</span> {formatFlightTime(selectedFlightForConfirmation.flight_time)}</div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleCancelFlightSelection}
                      className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmFlightSelection}
                      disabled={isAddingFlight}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isAddingFlight ? 'Adding...' : 'Confirm Selection'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Available Flights</h4>
                  {isLoadingFlights ? (
                    <div className="text-center py-12">
                      <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-slate-600">Loading flights...</p>
                    </div>
                  ) : existingFlights.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {existingFlights.map(flight => (
                          <button
                            key={flight.id}
                            onClick={() => handleSelectExistingFlight(flight)}
                            className="p-4 text-left bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-150 group"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-lg text-slate-800 group-hover:text-blue-800">
                                {flight.flight_code}
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                flight.flight_type === 'arrival' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {flight.flight_type}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                              <div><span className="font-medium">Date:</span> {formatFlightDate(flight.flight_date)}</div>
                              <div><span className="font-medium">Time:</span> {formatFlightTime(flight.flight_time)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-slate-500 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-slate-600">No flights available</p>
                        <p className="text-sm text-slate-500 mt-1">Create a new flight or check back later</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Flight Modal */}
        {isCreateFlightModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-slate-800">Create New Flight</h3>
                <button
                  onClick={handleCloseCreateFlightModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {newFlightError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <p className="text-sm">{newFlightError}</p>
                </div>
              )}

              <form onSubmit={handleCreateNewFlight} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Flight Type *</label>
                    <select
                      name="flight_type"
                      value={newFlightData.flight_type}
                      onChange={handleNewFlightChange}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="arrival">Arrival</option>
                      <option value="departure">Departure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Flight Code *</label>
                    <input
                      type="text"
                      name="flight_code"
                      value={newFlightData.flight_code}
                      onChange={handleNewFlightChange}
                      placeholder="e.g., BA123"
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Flight Date *</label>
                    <input
                      type="date"
                      name="flight_date"
                      value={newFlightData.flight_date}
                      onChange={handleNewFlightChange}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Flight Time *</label>
                    <input
                      type="time"
                      name="flight_time"
                      value={newFlightData.flight_time}
                      onChange={handleNewFlightChange}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCloseCreateFlightModal}
                    className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFlight}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isCreatingFlight ? 'Creating...' : 'Create Flight'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetailPage;
