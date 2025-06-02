import { mockUsers, mockCredentials } from '../data/mock/users.js';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate localStorage for session management
const SESSION_KEY = 'staff-portal-session';

export const authService = {
  // Login with email and password
  async login(email, password) {
    await delay(1000); // Simulate API call

    const credential = mockCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!credential) {
      throw new Error('Invalid email or password');
    }

    const user = mockUsers.find(u => u.id === credential.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      loginTime: new Date().toISOString()
    };

    // Store in localStorage (simulating session)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { user, session };
  },

  // Logout and clear session
  async logout() {
    await delay(500);
    localStorage.removeItem(SESSION_KEY);
    return { success: true };
  },

  // Get current session if exists
  getCurrentSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem(SESSION_KEY);
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getCurrentSession();
    return session !== null;
  },

  // Get current user data
  async getCurrentUser() {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session');
    }

    await delay(300);
    
    const user = mockUsers.find(u => u.id === session.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  // Request password reset (mock)
  async requestPasswordReset(email) {
    await delay(1500);
    
    const credential = mockCredentials.find(cred => cred.email === email);
    if (!credential) {
      throw new Error('Email not found');
    }

    // In real implementation, would send email
    return { 
      success: true, 
      message: 'Password reset instructions sent to your email' 
    };
  }
}; 