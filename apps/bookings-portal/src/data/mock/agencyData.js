export const agencyProfile = {
  id: 'agency-001',
  name: 'Global Education Partners',
  contactPerson: 'Sarah Johnson',
  email: 'sarah.johnson@globaleducation.com',
  phone: '+44 20 7123 4567',
  address: {
    street: '123 Oxford Street',
    city: 'London',
    country: 'United Kingdom',
    postalCode: 'W1D 2HX'
  },
  website: 'www.globaleducation.com',
  establishedYear: 2010,
  specializations: ['Summer Camps', 'Language Programs', 'University Preparation'],
  commissionRate: 15,
  preferredPaymentTerms: 'Net 30',
  totalStudentsPlaced: 1247,
  activeEnrollments: 5,
  upcomingArrivals: 23
};

export const existingEnrollments = [
  {
    id: 'ENR-2024-001',
    groupName: 'Madrid International School Summer Group',
    programId: 'intensive-english-dublin',
    programName: 'Intensive English Summer Camp',
    sessionId: 'ie-dub-jul1',
    startDate: '2024-07-01',
    endDate: '2024-07-14',
    location: 'Dublin Campus',
    numberOfStudents: 15,
    accommodationType: 'on-campus-twin',
    packageType: 'premium',
    status: 'confirmed',
    totalPrice: 28950,
    createdDate: '2024-05-15',
    leadTeacher: {
      name: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@madridschool.es',
      phone: '+34 91 123 4567'
    },
    specialRequests: 'One vegetarian student, two students require ground floor accommodation',
    paymentStatus: 'deposit_paid',
    documentsSubmitted: true
  },
  {
    id: 'ENR-2024-002',
    groupName: 'French Academy Language Immersion',
    programId: 'english-adventure-cork',
    programName: 'English with Adventure Sports Camp',
    sessionId: 'ea-cork-jul1',
    startDate: '2024-07-01',
    endDate: '2024-07-21',
    location: 'Cork Campus',
    numberOfStudents: 12,
    accommodationType: 'host-family-single',
    packageType: 'standard',
    status: 'confirmed',
    totalPrice: 22800,
    createdDate: '2024-05-22',
    leadTeacher: {
      name: 'Marie Dubois',
      email: 'marie.dubois@frenchacademy.fr',
      phone: '+33 1 45 67 89 10'
    },
    specialRequests: 'Students are all intermediate level, prefer active host families',
    paymentStatus: 'paid_in_full',
    documentsSubmitted: true
  },
  {
    id: 'ENR-2024-003',
    groupName: 'Berlin Youth Exchange Program',
    programId: 'english-arts-galway',
    programName: 'English & Creative Arts Camp',
    sessionId: 'ea-gal-jul22',
    startDate: '2024-07-22',
    endDate: '2024-08-04',
    location: 'Galway Campus',
    numberOfStudents: 8,
    accommodationType: 'on-campus-single',
    packageType: 'deluxe',
    status: 'pending_documents',
    totalPrice: 18400,
    createdDate: '2024-06-01',
    leadTeacher: {
      name: 'Hans Mueller',
      email: 'hans.mueller@berlinyouth.de',
      phone: '+49 30 123 456 78'
    },
    specialRequests: 'Focus on drama and theater activities, students are very creative',
    paymentStatus: 'pending',
    documentsSubmitted: false
  },
  {
    id: 'ENR-2024-004',
    groupName: 'Stockholm Business Academy',
    programId: 'business-english-dublin',
    programName: 'Future Leaders Business English',
    sessionId: 'bl-dub-jul29',
    startDate: '2024-07-29',
    endDate: '2024-08-11',
    location: 'Dublin Business Campus',
    numberOfStudents: 6,
    accommodationType: 'partner-hotel',
    packageType: 'premium',
    status: 'confirmed',
    totalPrice: 15600,
    createdDate: '2024-06-10',
    leadTeacher: {
      name: 'Erik Lindqvist',
      email: 'erik.lindqvist@stockholmbusiness.se',
      phone: '+46 8 123 456 78'
    },
    specialRequests: 'Students interested in tech startups and entrepreneurship',
    paymentStatus: 'deposit_paid',
    documentsSubmitted: true
  },
  {
    id: 'ENR-2024-005',
    groupName: 'Milan Arts Academy Summer',
    programId: 'english-arts-galway',
    programName: 'English & Creative Arts Camp',
    sessionId: 'ea-gal-aug5',
    startDate: '2024-08-05',
    endDate: '2024-08-18',
    location: 'Galway Campus',
    numberOfStudents: 10,
    accommodationType: 'host-family-twin',
    packageType: 'standard',
    status: 'draft',
    totalPrice: 17500,
    createdDate: '2024-06-15',
    leadTeacher: {
      name: 'Giulia Rossi',
      email: 'giulia.rossi@milanarts.it',
      phone: '+39 02 123 456 78'
    },
    specialRequests: 'Students specialize in visual arts, need art supply access',
    paymentStatus: 'not_started',
    documentsSubmitted: false
  }
];

export const dashboardStats = {
  totalActiveEnrollments: 5,
  totalStudentsEnrolled: 51,
  upcomingArrivals: 23,
  pendingDocuments: 2,
  recentActivity: [
    {
      id: 1,
      type: 'enrollment_confirmed',
      message: 'Stockholm Business Academy enrollment confirmed',
      timestamp: '2024-06-12T10:30:00Z'
    },
    {
      id: 2,
      type: 'payment_received',
      message: 'Payment received for French Academy Language Immersion',
      timestamp: '2024-06-10T14:15:00Z'
    },
    {
      id: 3,
      type: 'documents_required',
      message: 'Documents required for Berlin Youth Exchange Program',
      timestamp: '2024-06-08T09:45:00Z'
    },
    {
      id: 4,
      type: 'new_enrollment',
      message: 'New enrollment created: Milan Arts Academy Summer',
      timestamp: '2024-06-15T16:20:00Z'
    }
  ]
}; 