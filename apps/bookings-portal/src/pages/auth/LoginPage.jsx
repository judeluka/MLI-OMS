import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { validateEmail } from '../../utils';

const LoginPage = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');

    try {
      const result = await onLogin(data);
      if (!result.success) {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          Sign in to your agency portal
        </p>
      </div>

      {/* Demo credentials info */}
      <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-blue-900 mb-3">Demo Credentials</div>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="bg-white/60 rounded-lg px-3 py-2">
              <span className="font-medium">Email:</span> sarah.johnson@globaleducation.com
            </div>
            <div className="bg-white/60 rounded-lg px-3 py-2">
              <span className="font-medium">Password:</span> demo123
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
              }`}
              placeholder="Enter your email address"
              {...register('email', {
                required: 'Email is required',
                validate: (value) => validateEmail(value) || 'Please enter a valid email address'
              })}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          {errors.email && (
            <p className="text-sm font-medium text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-3">
          <label htmlFor="password" className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white pr-12 ${
                errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
              }`}
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm font-medium text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-lg transition-colors"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm font-semibold text-gray-700">
              Remember me for 30 days
            </label>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Login error */}
        {loginError && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-red-800">{loginError}</p>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Signing you in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in to CampPortal
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Additional info */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          Don't have an agency account?{' '}
          <a 
            href="mailto:partnerships@campportal.com" 
            className="text-primary-600 hover:text-primary-700 font-bold transition-colors underline decoration-primary-300 underline-offset-2"
          >
            Contact our partnerships team
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Secure login protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 