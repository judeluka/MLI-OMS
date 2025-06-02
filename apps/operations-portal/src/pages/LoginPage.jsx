// src/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// The onLoginSuccess function will be passed as a prop from App.jsx
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for login errors
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const navigate = useNavigate(); // Initialize useNavigate

  // Icons (can be moved to separate files or a library)
  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
  const LockClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );

  // Handles the form submission event
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic client-side validation
    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    try {
      // API call to your server's /login endpoint
      // Ensure your server is running and accessible (e.g., http://localhost:5000)
      const response = await fetch('http://localhost:5000/login', { // Ensure port matches your server.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password in the request body
      });

      const data = await response.json(); // Parse JSON response from the server

      if (response.ok && data.success) {
        // Login was successful
        console.log('Login successful:', data);

        // Store user data or token if needed (e.g., in localStorage)
        // This is a simple way to store the user object.
        // In a real application, you would typically store a JWT (JSON Web Token).
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Set a simple flag indicating the user is authenticated
        localStorage.setItem('isAuthenticated', 'true');

        onLoginSuccess(); // Call the callback from App.jsx to update the global auth state
        navigate('/dashboard'); // Redirect to the dashboard route
      } else {
        // Login failed (e.g., invalid credentials, server error)
        setError(data.message || 'Login failed. Please try again.');
        console.error('Login failed:', data.message);
      }
    } catch (err) {
      // Handle network errors or other issues with the fetch call
      console.error('Login request error:', err);
      setError('An error occurred during login. Please check your connection and try again.');
    } finally {
      setIsLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    // Main container for the login page
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col justify-center items-center p-4 font-sans">
      {/* Login card */}
      <div className="bg-white shadow-2xl rounded-xl p-8 md:p-12 w-full max-w-md transform transition-all duration-500 hover:scale-105">
        {/* Header section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600 text-sm">Please enter your credentials to access your account.</p>
        </div>

        {/* Display error messages if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
              <MailIcon />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 sm:text-sm transition duration-150 ease-in-out"
              disabled={isLoading} // Disable input field when loading
            />
          </div>

          {/* Password input field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 sm:text-sm transition duration-150 ease-in-out"
              disabled={isLoading} // Disable input field when loading
            />
          </div>

          {/* Remember me and Forgot password section */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                // checked={rememberMe} // You would need a state for this if you implement it
                // onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded transition duration-150 ease-in-out"
                disabled={isLoading} // Disable checkbox when loading
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                Remember me
              </label>
            </div>
            <div className="font-medium text-slate-600 hover:text-slate-500 transition duration-150 ease-in-out">
              <a href="#">Forgot your password?</a> {/* Placeholder link */}
            </div>
          </div>

          {/* Login button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition duration-150 ease-in-out active:bg-slate-900 transform hover:scale-105 active:scale-100 disabled:opacity-50"
              disabled={isLoading} // Disable button when loading
            >
              {isLoading ? (
                // Simple loading spinner
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Sign up link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Not a member?{' '}
          <a href="#" className="font-medium text-slate-600 hover:text-slate-500 transition duration-150 ease-in-out">
            Create an account {/* Placeholder link */}
          </a>
        </p>
      </div>
      {/* Optional Footer */}
      <footer className="mt-12 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        <p>
          <a href="#" className="hover:text-slate-300">Privacy Policy</a> &middot; <a href="#" className="hover:text-slate-300">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

export default LoginPage;
