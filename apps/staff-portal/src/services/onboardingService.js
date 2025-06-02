import { mockUsers } from '../data/mock/users.js';
import { onboardingSteps, requiredDocuments, companyPolicies } from '../data/mock/onboarding.js';
import { mockContract } from '../data/mock/contracts.js';
import { authService } from './authService.js';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key for onboarding data
const ONBOARDING_DATA_KEY = 'staff-portal-onboarding';

export const onboardingService = {
  // Get onboarding status and progress for current user
  async getOnboardingStatus(userId) {
    await delay(500);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const steps = onboardingSteps.map(step => ({
      ...step,
      completed: this.isStepCompleted(userId, step.id),
      canAccess: this.canAccessStep(userId, step.id)
    }));

    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.completed).length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    return {
      user,
      steps,
      progress: {
        total: totalSteps,
        completed: completedSteps,
        percentage: progressPercentage
      },
      isComplete: completedSteps === totalSteps
    };
  },

  // Check if a specific step is completed
  isStepCompleted(userId, stepId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return false;

    switch (stepId) {
      case 'personal-profile':
        return user.profileCompleted;
      case 'contract-review':
        return user.contractSigned;
      case 'document-upload':
        return user.documentsUploaded >= 3;
      case 'policies-review':
        return user.policiesAcknowledged >= 5;
      case 'role-information':
        return user.onboardingStatus === 'completed';
      default:
        return false;
    }
  },

  // Check if user can access a step (sequential access)
  canAccessStep(userId, stepId) {
    const stepIndex = onboardingSteps.findIndex(s => s.id === stepId);
    if (stepIndex === 0) return true; // First step always accessible

    // Check if previous step is completed
    const previousStep = onboardingSteps[stepIndex - 1];
    return previousStep ? this.isStepCompleted(userId, previousStep.id) : false;
  },

  // Submit personal profile data
  async submitPersonalProfile(userId, profileData) {
    await delay(1000);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update mock user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      profileCompleted: true,
      profileData: profileData.personalInfo,
      emergencyContact: profileData.emergencyContact,
      bankDetails: profileData.bankDetails
    };

    // Store in localStorage for persistence during session
    this.saveOnboardingData(userId, 'personalProfile', profileData);

    return { success: true, message: 'Profile updated successfully' };
  },

  // Get contract content for user
  async getContractContent(userId) {
    await delay(700);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Replace placeholders with user data
    let content = mockContract.content;
    const replacements = {
      '[STAFF_NAME]': `${user.firstName} ${user.lastName}`,
      '[ROLE_TITLE]': user.role,
      '[DEPARTMENT]': user.department,
      '[START_DATE]': user.startDate
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      ...mockContract,
      content,
      personalizedFor: user
    };
  },

  // Submit contract signature
  async submitContractSignature(userId, signatureData) {
    await delay(800);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      contractSigned: true
    };

    this.saveOnboardingData(userId, 'contractSignature', signatureData);

    return { success: true, message: 'Contract signed successfully' };
  },

  // Get required documents list
  async getRequiredDocuments() {
    await delay(300);
    return requiredDocuments;
  },

  // Upload document (mock)
  async uploadDocument(userId, documentType, file) {
    await delay(2000); // Simulate upload time

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Simulate upload validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size exceeds 5MB limit');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF, JPG, or PNG files only.');
    }

    // Update user's document count
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].documentsUploaded = Math.min(
        mockUsers[userIndex].documentsUploaded + 1,
        3
      );
    }

    // Store document info
    const uploadedDocs = this.getOnboardingData(userId, 'uploadedDocuments') || [];
    uploadedDocs.push({
      type: documentType,
      filename: file.name,
      size: file.size,
      uploadDate: new Date().toISOString()
    });
    this.saveOnboardingData(userId, 'uploadedDocuments', uploadedDocs);

    return { 
      success: true, 
      message: 'Document uploaded successfully',
      documentId: `doc_${Date.now()}`
    };
  },

  // Get company policies
  async getCompanyPolicies() {
    await delay(400);
    return companyPolicies;
  },

  // Acknowledge policy
  async acknowledgePolicy(userId, policyId) {
    await delay(500);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update acknowledged policies count
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].policiesAcknowledged = Math.min(
        mockUsers[userIndex].policiesAcknowledged + 1,
        5
      );
    }

    // Store acknowledgment
    const acknowledged = this.getOnboardingData(userId, 'acknowledgedPolicies') || [];
    if (!acknowledged.includes(policyId)) {
      acknowledged.push(policyId);
      this.saveOnboardingData(userId, 'acknowledgedPolicies', acknowledged);
    }

    return { success: true, message: 'Policy acknowledged' };
  },

  // Complete role information step
  async completeRoleInformation(userId) {
    await delay(600);

    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex].onboardingStatus = 'completed';

    return { success: true, message: 'Onboarding completed successfully!' };
  },

  // Helper methods for localStorage persistence during session
  saveOnboardingData(userId, key, data) {
    const allData = JSON.parse(localStorage.getItem(ONBOARDING_DATA_KEY) || '{}');
    if (!allData[userId]) allData[userId] = {};
    allData[userId][key] = data;
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(allData));
  },

  getOnboardingData(userId, key) {
    const allData = JSON.parse(localStorage.getItem(ONBOARDING_DATA_KEY) || '{}');
    return allData[userId]?.[key] || null;
  }
}; 