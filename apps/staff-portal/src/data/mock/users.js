export const mockUsers = [
  {
    id: 'user-001',
    email: 'sarah.johnson@summercamp.ie',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Activity Coordinator',
    department: 'Programs',
    startDate: '2024-06-15',
    onboardingStatus: 'in-progress',
    profileCompleted: false,
    contractSigned: false,
    documentsUploaded: 0,
    policiesAcknowledged: 0,
    profileData: null,
    emergencyContact: null,
    bankDetails: null
  },
  {
    id: 'user-002',
    email: 'james.murphy@summercamp.ie',
    firstName: 'James',
    lastName: 'Murphy',
    role: 'Sports Instructor',
    department: 'Sports',
    startDate: '2024-06-20',
    onboardingStatus: 'completed',
    profileCompleted: true,
    contractSigned: true,
    documentsUploaded: 3,
    policiesAcknowledged: 5,
    profileData: {
      dateOfBirth: '1995-03-15',
      phoneNumber: '+353 87 123 4567',
      address: {
        street: '123 Main Street',
        city: 'Dublin',
        county: 'Dublin',
        postcode: 'D02 XY45',
        country: 'Ireland'
      }
    },
    emergencyContact: {
      name: 'Mary Murphy',
      relationship: 'Mother',
      phoneNumber: '+353 87 987 6543'
    },
    bankDetails: {
      accountName: 'James Murphy',
      iban: 'IE29 AIBK 9311 5212 3456 78',
      bic: 'AIBKIE2D'
    }
  }
];

export const mockCredentials = [
  {
    email: 'sarah.johnson@summercamp.ie',
    password: 'welcome123',
    userId: 'user-001'
  },
  {
    email: 'james.murphy@summercamp.ie',
    password: 'welcome123',
    userId: 'user-002'
  }
]; 