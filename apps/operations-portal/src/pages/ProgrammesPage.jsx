// src/pages/ProgrammesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Optional: Icon for a scheduler or programme link
const CalendarDaysIcon = ({ className = "w-10 h-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12v-.008zM12 18h.008v.008H12v-.008zM9 15h.008v.008H9v-.008zM9 18h.008v.008H9v-.008zM15 15h.008v.008H15v-.008zM15 18h.008v.008H15v-.008zM6 15h.008v.008H6v-.008zM6 18h.008v.008H6v-.008z" />
  </svg>
);


const CentreCard = ({ name, path }) => (
  <Link 
    to={path} 
    className="block bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out group"
  >
    <div className="flex flex-col items-center text-center">
      <CalendarDaysIcon className="w-16 h-16 text-sky-500 mb-4 group-hover:text-sky-600 transition-colors" />
      <h3 className="text-xl font-semibold text-slate-700 mb-2 group-hover:text-sky-700 transition-colors">
        {name}
      </h3>
      <p className="text-sm text-slate-500 mb-4">View and manage the programme scheduler for {name}.</p>
      <span className="text-sm font-medium text-sky-600 group-hover:text-sky-700 transition-colors">
        Go to Scheduler &rarr;
      </span>
    </div>
  </Link>
);

function ProgrammesPage() {
  // Corrected paths to match the top-level scheduler route in App.jsx
  const centres = [
    { name: 'ATU', path: '/scheduler/atu' },
    { name: 'UCD', path: '/scheduler/ucd' },
    { name: 'DCU', path: '/scheduler/dcu' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-semibold text-slate-800 mb-8">Programmes & Schedulers</h2>
      
      <p className="text-slate-600 mb-8 text-lg">
        Select a centre below to view and manage its programme scheduler. This section will allow for planning,
        assigning activities, and overseeing the timetable for each centre.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {centres.map((centre) => (
          <CentreCard key={centre.name} name={centre.name} path={centre.path} />
        ))}
      </div>

      {/* You can add more general programme-related information or tools here later */}
      <div className="mt-12 p-6 bg-slate-50 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-slate-700 mb-3">Future Enhancements</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Overall programme templates.</li>
            <li>Resource allocation across centres.</li>
            <li>Master calendar view.</li>
        </ul>
      </div>
    </div>
  );
}

export default ProgrammesPage;
