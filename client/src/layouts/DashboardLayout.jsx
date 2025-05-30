// src/DashboardLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

// --- Icon Components (can be moved to separate files or a shared icons file) ---
const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);
const UsersIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const SettingsIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 1.255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 010-1.255c.007-.378-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const LogoutIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);
const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const ChevronLeftIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const GroupsIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-3.471-1.154c.138-.05.275-.105.412-.165M12 15c-2.485 0-4.5-2.015-4.5-4.5S9.515 6 12 6s4.5 2.015 4.5 4.5S14.485 15 12 15zm0 0v6m0-6H9m3 0h3" />
    </svg>
);
const ImportIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.033M6.75 19.5h10.5" />
    </svg>
);
// New Icon for Programmes/Scheduler (same as from ProgrammesPage.jsx)
const ProgrammesIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15V9m0 0l-2.25 2.25M12 9l2.25 2.25" />
  </svg>
);
// Add Rota icon
const RotaIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
// Add Activities icon
const ActivitiesIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
  </svg>
);
// Add Flights icon
const FlightsIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 19.5l19.5-7.5m0 0L12 4.5m9.75 7.5l-7.5 2.25m0 0l-2.25 7.5m2.25-7.5l-7.5-2.25" />
  </svg>
);
// Add Participants icon
const ParticipantsIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
// Add Transfers icon
const TransfersIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V5.625a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125v.75a1.5 1.5 0 001.5 1.5h4.5a1.5 1.5 0 001.5-1.5v-.75a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125V18.75a1.5 1.5 0 01-3 0V8.625a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v10.125z" />
  </svg>
);
// Add Sales Grid icon
const SalesGridIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 0A2.25 2.25 0 015.625 3.375h4.125a2.25 2.25 0 012.25 2.25v.75c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-.75a2.25 2.25 0 012.25-2.25h4.125A2.25 2.25 0 0121 5.625v12.75c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125v-.75c0-.621-.504-1.125-1.125-1.125h-2.25c-.621 0-1.125.504-1.125 1.125v.75z" />
  </svg>
);
// --- End of Icon Components ---


function DashboardLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  // Define base and active styles for icons and text
  const inactiveIconColor = "text-slate-400";
  const activeIconColor = "text-white";
  const inactiveTextColor = "text-slate-300";
  const activeTextColor = "text-white";
  const activeBgColor = "bg-slate-700";

  // Toggle button icon color: dimmer by default, white on hover
  const toggleButtonIconColorDefault = "text-slate-400";
  const toggleButtonIconColorHover = "hover:text-white";

  // Logout button text/icon color: dimmer by default, white on hover
  const logoutButtonColorDefault = "text-slate-400";
  const logoutButtonColorHover = "hover:text-white";


  const navItems = [
    { name: 'Overview', icon: HomeIcon, path: '/dashboard' },
    { name: 'Groups', icon: GroupsIcon, path: '/dashboard/groups' },
    { name: 'Participants', icon: ParticipantsIcon, path: '/dashboard/participants' },
    { name: 'Programmes', icon: ProgrammesIcon, path: '/dashboard/programmes' },
    { name: 'Rota', icon: RotaIcon, path: '/dashboard/rota' },
    { name: 'Activities', icon: ActivitiesIcon, path: '/dashboard/activities' },
    { name: 'Flights', icon: FlightsIcon, path: '/dashboard/flights' },
    { name: 'Import', icon: ImportIcon, path: '/dashboard/import' },
    { name: 'Users', icon: UsersIcon, path: '/dashboard/users' },
    { name: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
    { name: 'Transfers', icon: TransfersIcon, path: '/dashboard/transfers' },
    { name: 'Sales Grid', icon: SalesGridIcon, path: '/sales-grid' },
  ];

  const storedUser = localStorage.getItem('user');
  let userEmail = 'Guest';
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      userEmail = userData.email || 'User';
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* Collapsible Sidebar */}
      <nav className={`bg-slate-800 transition-all duration-300 ease-in-out ${isNavOpen ? 'w-64' : 'w-20'} flex flex-col fixed inset-y-0 left-0 z-30`}>
        {/* Logo and Toggle Button */}
        <div className={`flex items-center justify-between p-4 h-16 border-b border-slate-700 ${isNavOpen ? '' : 'justify-center'}`}>
          {isNavOpen && <span className="text-xl font-bold text-white">Admin Panel</span>}
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className={`p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 ${toggleButtonIconColorHover}`} // Apply hover for icon color change
            aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
          >
            {isNavOpen ? <ChevronLeftIcon className={`w-6 h-6 ${toggleButtonIconColorDefault}`} /> : <MenuIcon className={`w-6 h-6 ${toggleButtonIconColorDefault}`} />}
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="flex-grow pt-4">
          {navItems.map((item) => {
            // Active state logic: exact match for /dashboard, startsWith for others to handle nested routes
            const isActive = item.path === '/dashboard' 
                             ? location.pathname === item.path 
                             : location.pathname.startsWith(item.path);
            const IconComponent = item.icon;
            return (
              <li key={item.name} className="mb-2 group"> {/* Added group for group-hover */}
                <Link
                  to={item.path}
                  className={`flex items-center p-3 mx-2 rounded-md transition-colors duration-150 
                              ${isActive 
                                ? `${activeBgColor} ${activeTextColor}` 
                                : `${inactiveTextColor} hover:bg-slate-700 hover:text-white`
                              }`}
                  title={item.name}
                >
                  <span className="mr-3">
                    <IconComponent 
                      className={`w-6 h-6 transition-colors duration-150 
                                 ${isActive 
                                   ? activeIconColor 
                                   : `${inactiveIconColor} group-hover:text-white` 
                                 }`} 
                    />
                  </span>
                  {isNavOpen && <span className={`text-sm font-medium ${isActive ? activeTextColor : ''}`}>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout Button at the bottom of Navbar */}
        <div className="p-2 border-t border-slate-700">
            <button
                onClick={handleLogoutClick}
                className={`flex items-center w-full p-3 rounded-md hover:bg-slate-700 ${logoutButtonColorDefault} ${logoutButtonColorHover} transition-colors duration-150 ${isNavOpen ? '' : 'justify-center'}`}
                title="Logout"
            >
                <span className={`${isNavOpen ? 'mr-3' : ''}`}>
                  <LogoutIcon className={`w-6 h-6`} /> {/* Icon inherits color from button's text color */}
                </span>
                {isNavOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isNavOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white shadow p-4 sticky top-0 z-20">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-slate-700">
                    {/* Find the most specific match for the header title */}
                    {navItems.slice().reverse().find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
                </h1>
                <div className="text-sm text-slate-600">
                    Logged in as: <span className="font-medium text-slate-700">{userEmail}</span>
                </div>
            </div>
        </header>
        <div className="p-6 md:p-10">
            <Outlet />
        </div>
        <footer className="p-6 text-center text-sm text-slate-500 border-t border-slate-200">
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default DashboardLayout;