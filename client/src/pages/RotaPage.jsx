import React from 'react';
import { Link } from 'react-router-dom';

// Icon for rota management
const ClipboardDocumentListIcon = ({ className = "w-10 h-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CentreCard = ({ name, path }) => (
  <Link 
    to={path} 
    className="block bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out group"
  >
    <div className="flex flex-col items-center text-center">
      <ClipboardDocumentListIcon className="w-16 h-16 text-sky-500 mb-4 group-hover:text-sky-600 transition-colors" />
      <h3 className="text-xl font-semibold text-slate-700 mb-2 group-hover:text-sky-700 transition-colors">
        {name}
      </h3>
      <p className="text-sm text-slate-500 mb-4">View and manage staff rota for {name}.</p>
      <span className="text-sm font-medium text-sky-600 group-hover:text-sky-700 transition-colors">
        Go to Rota &rarr;
      </span>
    </div>
  </Link>
);

function RotaPage() {
  const centres = [
    { name: 'ATU', path: '/rota/atu' },
    { name: 'UCD', path: '/rota/ucd' },
    { name: 'DCU', path: '/rota/dcu' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-semibold text-slate-800 mb-8">Staff Rota Management</h2>
      
      <p className="text-slate-600 mb-8 text-lg">
        Select a centre below to view and manage its staff rota. This section allows for planning,
        assigning staff, and overseeing the work schedule for each centre.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {centres.map((centre) => (
          <CentreCard key={centre.name} name={centre.name} path={centre.path} />
        ))}
      </div>

      {/* Future enhancements section */}
      <div className="mt-12 p-6 bg-slate-50 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Future Enhancements</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Staff availability management.</li>
            <li>Shift pattern templates.</li>
            <li>Cross-centre staff allocation.</li>
            <li>Leave and time-off tracking.</li>
        </ul>
      </div>
    </div>
  );
}

export default RotaPage; 