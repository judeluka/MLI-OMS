const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20"></div>
        
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-white"/>
          </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-secondary-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <div className="text-2xl font-bold text-white">CP</div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CampPortal</h1>
            <p className="text-blue-200">Agency Partner Access</p>
          </div>

          {/* Two-Column Layout */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column - Branding & Information */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="text-white space-y-8">
                {/* Brand Header */}
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6">
                    <div className="text-3xl font-bold text-white">CP</div>
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    CampPortal
                  </h1>
                  <p className="text-xl text-blue-200 font-medium">
                    Your gateway to exceptional English language summer camps
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Easy Group Enrollment</h3>
                      <p className="text-blue-200 leading-relaxed">Streamlined process for enrolling student groups in our summer camps with intuitive workflows.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Real-time Management</h3>
                      <p className="text-blue-200 leading-relaxed">Track enrollments, payments, and student progress with live updates and comprehensive dashboards.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Comprehensive Support</h3>
                      <p className="text-blue-200 leading-relaxed">Access to documents, resources, and dedicated support team for seamless operations.</p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-blue-300 font-medium">
                    Trusted by 200+ education agencies worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="lg:col-span-7">
              <div className="relative">
                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
                  {/* Decorative Element */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 blur-xl"></div>
                  
                  {children}
                </div>

                {/* Support Info */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-blue-200 leading-relaxed">
                    Need help? Contact our support team at{' '}
                    <a 
                      href="mailto:support@campportal.com" 
                      className="text-white hover:text-blue-200 font-medium transition-colors underline decoration-blue-300"
                    >
                      support@campportal.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Features Preview */}
          <div className="lg:hidden mt-12 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-white">
                <div className="w-10 h-10 bg-primary-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-blue-200">Easy Enrollment</p>
              </div>
              <div className="text-white">
                <div className="w-10 h-10 bg-secondary-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-blue-200">Live Tracking</p>
              </div>
              <div className="text-white">
                <div className="w-10 h-10 bg-accent-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13" />
                  </svg>
                </div>
                <p className="text-sm text-blue-200">Full Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 