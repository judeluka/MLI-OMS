import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useEnrollmentStore = create(
  persist(
    (set, get) => ({
      // Current step in the enrollment process (1-5)
      currentStep: 1,
      
      // Enrollment form data
      enrollmentData: {
        // Step 1: Program & Session Selection
        programId: '',
        sessionId: '',
        numberOfStudents: 1,
        
        // Step 2: Accommodation & Package
        accommodationType: '',
        packageType: '',
        
        // Step 3: Agency & Group Details
        groupName: '',
        leadTeacher: {
          name: '',
          email: '',
          phone: ''
        },
        specialRequests: '',
        
        // Step 4: Student Information (simplified)
        studentsInfo: [],
        
        // Calculated pricing
        pricing: null
      },
      
      // Navigation methods
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 5) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      goToStep: (step) => {
        if (step >= 1 && step <= 5) {
          set({ currentStep: step });
        }
      },
      
      // Data update methods
      updateProgramSelection: (data) => {
        set((state) => ({
          enrollmentData: {
            ...state.enrollmentData,
            programId: data.programId || state.enrollmentData.programId,
            sessionId: data.sessionId || state.enrollmentData.sessionId,
            numberOfStudents: data.numberOfStudents || state.enrollmentData.numberOfStudents
          }
        }));
      },
      
      updateAccommodationSelection: (data) => {
        set((state) => ({
          enrollmentData: {
            ...state.enrollmentData,
            accommodationType: data.accommodationType || state.enrollmentData.accommodationType,
            packageType: data.packageType || state.enrollmentData.packageType
          }
        }));
      },
      
      updateGroupDetails: (data) => {
        set((state) => ({
          enrollmentData: {
            ...state.enrollmentData,
            groupName: data.groupName || state.enrollmentData.groupName,
            leadTeacher: {
              ...state.enrollmentData.leadTeacher,
              ...data.leadTeacher
            },
            specialRequests: data.specialRequests !== undefined ? data.specialRequests : state.enrollmentData.specialRequests
          }
        }));
      },
      
      updateStudentsInfo: (studentsInfo) => {
        set((state) => ({
          enrollmentData: {
            ...state.enrollmentData,
            studentsInfo
          }
        }));
      },
      
      updatePricing: (pricing) => {
        set((state) => ({
          enrollmentData: {
            ...state.enrollmentData,
            pricing
          }
        }));
      },
      
      // Validation methods
      isStepValid: (step) => {
        const { enrollmentData } = get();
        
        switch (step) {
          case 1:
            return enrollmentData.programId && 
                   enrollmentData.sessionId && 
                   enrollmentData.numberOfStudents > 0;
          
          case 2:
            return enrollmentData.accommodationType && 
                   enrollmentData.packageType;
          
          case 3:
            return enrollmentData.groupName && 
                   enrollmentData.leadTeacher.name && 
                   enrollmentData.leadTeacher.email;
          
          case 4:
            // For now, just check if we have the right number of student placeholders
            return enrollmentData.studentsInfo.length === enrollmentData.numberOfStudents;
          
          case 5:
            // Final review step - all previous steps should be valid
            return get().isStepValid(1) && 
                   get().isStepValid(2) && 
                   get().isStepValid(3) && 
                   get().isStepValid(4);
          
          default:
            return false;
        }
      },
      
      // Get completed steps
      getCompletedSteps: () => {
        const completedSteps = [];
        for (let i = 1; i <= 5; i++) {
          if (get().isStepValid(i)) {
            completedSteps.push(i);
          } else {
            break; // Stop at first invalid step
          }
        }
        return completedSteps;
      },
      
      // Reset the enrollment flow
      resetEnrollment: () => {
        set({
          currentStep: 1,
          enrollmentData: {
            programId: '',
            sessionId: '',
            numberOfStudents: 1,
            accommodationType: '',
            packageType: '',
            groupName: '',
            leadTeacher: {
              name: '',
              email: '',
              phone: ''
            },
            specialRequests: '',
            studentsInfo: [],
            pricing: null
          }
        });
      },
      
      // Get enrollment summary for final step
      getEnrollmentSummary: () => {
        const { enrollmentData } = get();
        return {
          isComplete: get().isStepValid(5),
          totalSteps: 5,
          completedSteps: get().getCompletedSteps().length,
          data: enrollmentData
        };
      }
    }),
    {
      name: 'enrollment-store', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        enrollmentData: state.enrollmentData
      }) // only persist these fields
    }
  )
);

export default useEnrollmentStore; 