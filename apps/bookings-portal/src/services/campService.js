import { 
  campPrograms, 
  accommodationTypes, 
  packageOptions, 
  basePricing 
} from '../data/mock/campPrograms.js';

import { 
  agencyProfile, 
  existingEnrollments, 
  dashboardStats 
} from '../data/mock/agencyData.js';

// Simulate network delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Camp Programs API
export const campService = {
  // Fetch all available camp programs
  async fetchCampPrograms() {
    await delay();
    return {
      success: true,
      data: campPrograms
    };
  },

  // Fetch a specific camp program by ID
  async fetchCampProgram(programId) {
    await delay();
    const program = campPrograms.find(p => p.id === programId);
    return {
      success: !!program,
      data: program || null
    };
  },

  // Fetch available sessions for a program
  async fetchProgramSessions(programId) {
    await delay();
    const program = campPrograms.find(p => p.id === programId);
    return {
      success: !!program,
      data: program?.sessions || []
    };
  },

  // Check availability for specific session and number of students
  async checkSessionAvailability(sessionId, numberOfStudents) {
    await delay();
    
    // Find the session across all programs
    let sessionFound = null;
    for (const program of campPrograms) {
      const session = program.sessions.find(s => s.id === sessionId);
      if (session) {
        sessionFound = { ...session, programId: program.id };
        break;
      }
    }

    if (!sessionFound) {
      return { success: false, data: null };
    }

    const available = sessionFound.availableSpaces >= numberOfStudents;
    return {
      success: true,
      data: {
        available,
        availableSpaces: sessionFound.availableSpaces,
        requestedSpaces: numberOfStudents,
        status: sessionFound.status
      }
    };
  },

  // Fetch accommodation options
  async fetchAccommodationTypes() {
    await delay();
    return {
      success: true,
      data: accommodationTypes
    };
  },

  // Fetch package options
  async fetchPackageOptions() {
    await delay();
    return {
      success: true,
      data: packageOptions
    };
  },

  // Calculate pricing for a specific enrollment
  async calculatePricing(programId, duration, accommodationType, packageType, numberOfStudents) {
    await delay();
    
    const program = campPrograms.find(p => p.id === programId);
    const accommodation = accommodationTypes.find(a => a.id === accommodationType);
    const packageOption = packageOptions.find(p => p.id === packageType);
    const pricing = basePricing[programId];

    if (!program || !accommodation || !packageOption || !pricing) {
      return { success: false, data: null };
    }

    // Get base program price based on duration
    let baseProgramPrice = 0;
    if (duration === 1) baseProgramPrice = pricing.oneWeek || 0;
    else if (duration === 2) baseProgramPrice = pricing.twoWeeks || 0;
    else if (duration === 3) baseProgramPrice = pricing.threeWeeks || 0;
    else if (duration === 4) baseProgramPrice = pricing.fourWeeks || 0;

    const accommodationPrice = accommodation.pricePerWeek * duration;
    const packagePrice = packageOption.priceModifier * numberOfStudents;
    
    const totalPerStudent = baseProgramPrice + accommodationPrice + packagePrice;
    const totalPrice = totalPerStudent * numberOfStudents;

    return {
      success: true,
      data: {
        baseProgramPrice,
        accommodationPrice,
        packagePrice,
        totalPerStudent,
        totalPrice,
        numberOfStudents,
        breakdown: {
          program: baseProgramPrice * numberOfStudents,
          accommodation: accommodationPrice * numberOfStudents,
          package: packagePrice
        }
      }
    };
  }
};

// Enrollment Management API
export const enrollmentService = {
  // Fetch agency dashboard data
  async fetchDashboardData() {
    await delay();
    return {
      success: true,
      data: dashboardStats
    };
  },

  // Fetch all enrollments for the agency
  async fetchEnrollments(filters = {}) {
    await delay();
    let enrollments = [...existingEnrollments];

    // Apply filters
    if (filters.status) {
      enrollments = enrollments.filter(e => e.status === filters.status);
    }
    if (filters.program) {
      enrollments = enrollments.filter(e => e.programId === filters.program);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      enrollments = enrollments.filter(e => 
        e.groupName.toLowerCase().includes(searchLower) ||
        e.programName.toLowerCase().includes(searchLower) ||
        e.leadTeacher.name.toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      data: enrollments
    };
  },

  // Fetch a specific enrollment
  async fetchEnrollment(enrollmentId) {
    await delay();
    const enrollment = existingEnrollments.find(e => e.id === enrollmentId);
    return {
      success: !!enrollment,
      data: enrollment || null
    };
  },

  // Create a new enrollment
  async createEnrollment(enrollmentData) {
    await delay(1200); // Longer delay for creation
    
    // Generate a new enrollment ID
    const newId = `ENR-2024-${String(existingEnrollments.length + 1).padStart(3, '0')}`;
    
    const newEnrollment = {
      id: newId,
      ...enrollmentData,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'not_started',
      documentsSubmitted: false
    };

    // Simulate adding to the list (in real app, this would be stored in database)
    existingEnrollments.push(newEnrollment);

    return {
      success: true,
      data: newEnrollment
    };
  },

  // Update an existing enrollment
  async updateEnrollment(enrollmentId, updates) {
    await delay();
    const enrollmentIndex = existingEnrollments.findIndex(e => e.id === enrollmentId);
    
    if (enrollmentIndex === -1) {
      return { success: false, error: 'Enrollment not found' };
    }

    existingEnrollments[enrollmentIndex] = {
      ...existingEnrollments[enrollmentIndex],
      ...updates
    };

    return {
      success: true,
      data: existingEnrollments[enrollmentIndex]
    };
  }
};

// Agency Profile API
export const agencyService = {
  // Fetch agency profile
  async fetchProfile() {
    await delay();
    return {
      success: true,
      data: agencyProfile
    };
  },

  // Update agency profile
  async updateProfile(updates) {
    await delay();
    const updatedProfile = { ...agencyProfile, ...updates };
    return {
      success: true,
      data: updatedProfile
    };
  }
};

// Authentication API (Mock)
export const authService = {
  // Mock login
  async login(credentials) {
    await delay();
    
    // Simple mock validation
    if (credentials.email === 'sarah.johnson@globaleducation.com' && 
        credentials.password === 'demo123') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: agencyProfile
        }
      };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };
  },

  // Mock logout
  async logout() {
    await delay(200);
    return { success: true };
  },

  // Check if user is authenticated
  async checkAuth() {
    await delay(300);
    const token = localStorage.getItem('authToken');
    return {
      success: !!token,
      data: token ? agencyProfile : null
    };
  }
}; 