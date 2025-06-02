// src/pages/SchedulerPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

console.log('SchedulerPage mounted');

// Helper function to generate a range of dates
const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate || startDate > endDate) return [];
  const dates = [];
  let currentDate = new Date(startDate);
  const stopDate = new Date(endDate);
  // Normalize to UTC midnight to avoid timezone issues in loop
  currentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
  while (currentDate <= stopDate) {
    dates.push(new Date(currentDate)); // Store as Date objects
    currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Increment UTC date
  }
  return dates;
};

const STUDENTS_PER_TEACHER = 16;
const STUDENTS_PER_ACTIVITY_LEADER = 30;

// Initial placeholder data for classes and activities
const initialClassScheduleData = {
    '2025-05-17-Group Alpha': 'Morning',
    '2025-05-17-Group Beta': 'Double',
    '2025-05-21-Group Alpha': 'Afternoon',
    '2025-05-26-Group Gamma': 'Morning',
};
const initialActivityScheduleData = {
    '2025-05-17-Group Alpha': 'Museum Visit @ 14:00',
    '2025-05-20-Group Beta': 'City Tour @ 10:00',
    '2025-05-26-Group Gamma': 'Sports Day @ Full Day',
};

const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
);

// Define a list of color themes for agencies
const agencyColorThemes = [
    { agencyDisplayColor: 'bg-sky-700 text-white', groupHeaderColor: 'bg-sky-200 text-sky-800' },
    { agencyDisplayColor: 'bg-emerald-700 text-white', groupHeaderColor: 'bg-emerald-200 text-emerald-800' },
    { agencyDisplayColor: 'bg-purple-700 text-white', groupHeaderColor: 'bg-purple-200 text-purple-800' },
    { agencyDisplayColor: 'bg-amber-600 text-white', groupHeaderColor: 'bg-amber-200 text-amber-800' },
    { agencyDisplayColor: 'bg-pink-700 text-white', groupHeaderColor: 'bg-pink-200 text-pink-800' },
    { agencyDisplayColor: 'bg-indigo-700 text-white', groupHeaderColor: 'bg-indigo-200 text-indigo-800' },
];

function SchedulerPage() {
  const { centreName } = useParams();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState('classes');
  const [selectedClassType, setSelectedClassType] = useState('Morning');
  const classTypes = ['None', 'Morning', 'Afternoon', 'Double'];

  // Persistent slot state
  const [programmeSlots, setProgrammeSlots] = useState({}); // { 'YYYY-MM-DD-GroupId': { Morning: '...', Afternoon: '...', ... } }

  const [chronologicalGroups, setChronologicalGroups] = useState([]);
  const [agencyColorMap, setAgencyColorMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [schedulerStartDate, setSchedulerStartDate] = useState(null);
  const [schedulerEndDate, setSchedulerEndDate] = useState(null);

  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');

  // Fetch and process group data and slots
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);
      setSchedulerStartDate(null);
      setSchedulerEndDate(null);
      setChronologicalGroups([]);
      setProgrammeSlots({});
      try {
        // 1. Fetch groups
        const response = await fetch('http://localhost:5000/api/groups');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.groups)) {
          const centreSpecificGroupsRaw = data.groups.filter(
            group => group.centre && group.centre.toLowerCase() === centreName.toLowerCase()
          );
          // Sort groups chronologically by arrival date
          const sortedGroups = centreSpecificGroupsRaw
            .map(group => ({
              id: group.id,
              name: group.groupName,
              agencyName: group.agency || 'Unknown Agency',
              arrival: group.arrivalDate,
              departure: group.departureDate,
              studentCount: group.studentAllocation || 16,
            }))
            .filter(group => group.arrival && group.departure)
            .sort((a, b) => a.arrival.localeCompare(b.arrival));
          // Create color map for agencies
          const colorMap = new Map();
          let colorIndex = 0;
          sortedGroups.forEach(group => {
            if (!colorMap.has(group.agencyName)) {
              colorMap.set(group.agencyName, agencyColorThemes[colorIndex % agencyColorThemes.length]);
              colorIndex++;
            }
          });
          setAgencyColorMap(colorMap);
          setChronologicalGroups(sortedGroups);
          // Calculate date range
          if (sortedGroups.length > 0) {
            const firstArrival = new Date(sortedGroups[0].arrival + 'T00:00:00Z');
            const lastDeparture = new Date(Math.max(...sortedGroups.map(g => new Date(g.departure + 'T00:00:00Z'))));
            setSchedulerStartDate(firstArrival);
            setSchedulerEndDate(lastDeparture);
          } else {
            const todayForFallback = new Date();
            setSchedulerStartDate(new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate())));
            const defaultEndDate = new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate()));
            defaultEndDate.setUTCDate(defaultEndDate.getUTCDate() + 6);
            setSchedulerEndDate(defaultEndDate);
          }
          // 2. Fetch programme slots for this centre and view
          const slotViewType = currentView === 'activities' ? 'classes' : currentView;
          const slotRes = await fetch(`http://localhost:5000/api/centres/${centreName}/programme-slots?viewType=${slotViewType}`);
          const slotData = await slotRes.json();
          console.log('Fetched programme slots:', slotData); // Debug fetch
          if (slotData.success && slotData.slots) {
            setProgrammeSlots(slotData.slots);
          } else {
            setProgrammeSlots({});
          }
        } else {
          throw new Error(data.message || 'Fetched data is not in expected format.');
        }
      } catch (err) {
        console.error("Error fetching or processing groups/slots:", err);
        setError(err.message);
        const todayForFallback = new Date();
        setSchedulerStartDate(new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate())));
        const defaultEndDate = new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate()));
        defaultEndDate.setUTCDate(defaultEndDate.getUTCDate() + 6);
        setSchedulerEndDate(defaultEndDate);
      } finally {
        setIsLoading(false);
      }
    };
    if (centreName) fetchAll();
    else {
      setError("Centre name not specified in URL.");
      setIsLoading(false);
    }
  }, [centreName, currentView]);

  // Fetch activities when switching to activities view
  useEffect(() => {
    if (currentView === 'activities') {
      const fetchActivities = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/activities');
          const data = await response.json();
          if (data.success) {
            setActivities(data.activities);
            if (data.activities.length > 0) setSelectedActivity(data.activities[0].name);
          }
        } catch (err) {
          setActivities([]);
        }
      };
      fetchActivities();
    }
  }, [currentView]);

  const dates = useMemo(() => {
    if (schedulerStartDate && schedulerEndDate) {
      return getDatesInRange(schedulerStartDate, schedulerEndDate);
    }
    return [];
  }, [schedulerStartDate, schedulerEndDate]);

  const handleBackClick = () => navigate('/dashboard/programmes');
  const handleViewChange = (event) => setCurrentView(event.target.value);
  const handleClassTypeChange = (event) => setSelectedClassType(event.target.value);

  const toYYYYMMDD = (date) => {
    const d = new Date(date);
    const month = `${d.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${d.getUTCDate()}`.padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${year}-${month}-${day}`;
  };
  
  const isWeekend = (dateInput) => {
    const date = (typeof dateInput === 'string' && dateInput.includes('-')) 
                 ? new Date(dateInput + 'T00:00:00Z') 
                 : new Date(dateInput);
    const day = date.getUTCDay();
    return day === 0 || day === 6;
  };

  // --- Persistent Cell Click Handler ---
  const handleCellClick = async (dateStr, groupName, event, session) => {
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    const group = chronologicalGroups.find(g => g.name === groupName);
    if (!group) return;
    const groupId = group.id;
    const dataKey = `${dateStr}-${groupId}`;
    if (currentView === 'classes') {
      if (isWeekend(dateStr)) {
        alert("Classes cannot be scheduled on weekends."); return;
      }
      if (!group.arrival || !group.departure || dateStr < group.arrival || dateStr > group.departure) {
        alert("Classes can only be scheduled between the group's arrival and departure dates."); return;
      }
      const slotType = 'CLASS_DAY_SLOT';
      const newValue = selectedClassType === 'None' ? '' : selectedClassType;
      try {
        setIsLoading(true);
        console.log('About to send fetch for programme-slot', { groupId, dateStr, slotType, newValue, currentView });
        const response = await fetch('http://localhost:5000/api/programme-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            date: dateStr,
            slotType,
            description: newValue,
            viewType: currentView
          })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error('Failed to save: ' + errText);
        }
        console.log('Fetch for programme-slot succeeded');
        setProgrammeSlots(prev => {
          const updated = { ...prev };
          if (!updated[dataKey]) updated[dataKey] = {};
          if (newValue) {
            updated[dataKey][slotType] = newValue;
          } else {
            delete updated[dataKey][slotType];
          }
          return updated;
        });
      } catch (err) {
        console.error('Error in handleCellClick:', err);
        alert('Failed to save: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    } else if (currentView === 'activities') {
      if (selectedActivity === '') {
        // Allow clearing on any date
        const slotType = session === 'morning' ? 'ACTIVITY_MORNING' : 'ACTIVITY_AFTERNOON';
        try {
          setIsLoading(true);
          const response = await fetch('http://localhost:5000/api/programme-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groupId,
              date: dateStr,
              slotType,
              description: '',
              viewType: 'activities'
            })
          });
          if (!response.ok) {
            const errText = await response.text();
            throw new Error('Failed to clear: ' + errText);
          }
          setProgrammeSlots(prev => {
            const updated = { ...prev };
            if (updated[dataKey]) delete updated[dataKey][slotType];
            return updated;
          });
        } catch (err) {
          alert('Failed to clear: ' + (err.message || err));
        } finally {
          setIsLoading(false);
        }
        return;
      }
      // Prevent scheduling outside of group stay
      if (!group.arrival || !group.departure || dateStr < group.arrival || dateStr > group.departure) {
        alert("Activities can only be scheduled between the group's arrival and departure dates.");
        return;
      }
      // session: 'morning' or 'afternoon'
      const slotType = session === 'morning' ? 'ACTIVITY_MORNING' : 'ACTIVITY_AFTERNOON';
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/programme-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            date: dateStr,
            slotType,
            description: selectedActivity,
            viewType: 'activities'
          })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error('Failed to save: ' + errText);
        }
        setProgrammeSlots(prev => {
          const updated = { ...prev };
          if (!updated[dataKey]) updated[dataKey] = {};
          updated[dataKey][slotType] = selectedActivity;
          return updated;
        });
      } catch (err) {
        alert('Failed to save: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDateDisplay = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  const formatDayOfWeek = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });

  // Group the chronological groups by their agencies while maintaining order
  const getGroupedHeaders = () => {
    const headers = [];
    let currentAgency = null;
    let currentGroups = [];

    chronologicalGroups.forEach((group) => {
      if (currentAgency !== group.agencyName) {
        if (currentGroups.length > 0) {
          headers.push({
            agencyName: currentAgency,
            groups: currentGroups,
            theme: agencyColorMap.get(currentAgency)
          });
        }
        currentAgency = group.agencyName;
        currentGroups = [group];
      } else {
        currentGroups.push(group);
      }
    });

    if (currentGroups.length > 0) {
      headers.push({
        agencyName: currentAgency,
        groups: currentGroups,
        theme: agencyColorMap.get(currentAgency)
      });
    }

    return headers;
  };

  // Calculate required teachers for a given date
  const calculateTeachers = (date) => {
    const currentDateStr = toYYYYMMDD(date);
    let morningStudents = 0;
    let afternoonStudents = 0;
    chronologicalGroups.forEach(group => {
      if (currentDateStr >= group.arrival && currentDateStr <= group.departure) {
        const dataKey = `${currentDateStr}-${group.id}`;
        const slotObj = programmeSlots[dataKey] || {};
        const assignedClass = slotObj['CLASS_DAY_SLOT'];
        const studentCount = group.studentCount || 16;
        if (assignedClass === 'Morning' || assignedClass === 'Double') {
          morningStudents += studentCount;
        }
        if (assignedClass === 'Afternoon' || assignedClass === 'Double') {
          afternoonStudents += studentCount;
        }
      }
    });
    return {
      morning: Math.ceil(morningStudents / STUDENTS_PER_TEACHER),
      afternoon: Math.ceil(afternoonStudents / STUDENTS_PER_TEACHER)
    };
  };

  // Calculate required activity leaders for a given date
  const calculateActivityLeaders = (date) => {
    const currentDateStr = toYYYYMMDD(date);
    let morningTotal = 0;
    let afternoonTotal = 0;
    chronologicalGroups.forEach(group => {
      if (currentDateStr >= group.arrival && currentDateStr <= group.departure) {
        const dataKey = `${currentDateStr}-${group.id}`;
        const slotObj = programmeSlots[dataKey] || {};
        const morningActivity = slotObj['ACTIVITY_MORNING'];
        const afternoonActivity = slotObj['ACTIVITY_AFTERNOON'];
        const studentCount = group.studentCount || 16;
        const leaderCount = Math.ceil(studentCount / 16) || 1; // Assuming 1 leader per 16 students
        const totalCount = studentCount + leaderCount;

        if (morningActivity && morningActivity !== 'Lessons') {
          morningTotal += totalCount;
        }
        if (afternoonActivity && afternoonActivity !== 'Lessons') {
          afternoonTotal += totalCount;
        }
      }
    });
    return {
      morning: Math.ceil(morningTotal / STUDENTS_PER_ACTIVITY_LEADER),
      afternoon: Math.ceil(afternoonTotal / STUDENTS_PER_ACTIVITY_LEADER)
    };
  };

  if (isLoading) {
    return <div className="p-4 text-center text-slate-700">Loading scheduler data for {centreName ? centreName.toUpperCase() : 'Unknown Centre'}...</div>;
  }
  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md shadow">Error: {error}</div>;
  }
  if (centreName && dates.length === 0 && !isLoading && !error) {
     return (
        <div className="p-4">
             <button onClick={handleBackClick} className="flex items-center mb-4 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md shadow-sm transition-colors">
                <ArrowLeftIcon className="mr-1.5" /> Back
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mt-2 mb-4">
                Scheduler: {centreName ? centreName.toUpperCase() : 'Centre'}
            </h2>
            <p className="text-slate-600">No groups found for this centre, or no valid arrival/departure dates to define a schedule range.</p>
        </div>
    );
  }

  const groupedHeaders = getGroupedHeaders();

  return (
    <div className="p-2 sm:p-4 flex flex-col h-screen"> 
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0"> 
        <div className="mb-3 sm:mb-0">
            <button onClick={handleBackClick} className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md shadow-sm transition-colors">
                <ArrowLeftIcon className="mr-1.5" /> Back
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mt-2">
                Scheduler: {centreName ? centreName.toUpperCase() : 'Centre'}
            </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                Range: {dates.length > 0 ? `${formatDateDisplay(dates[0])} - ${formatDateDisplay(dates[dates.length - 1])}` : 'N/A'}
            </span>
            <div className="relative">
                <label htmlFor="viewSwitcher" className="sr-only">Select View</label>
                <select id="viewSwitcher" value={currentView} onChange={handleViewChange} className="appearance-none block w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs sm:text-sm border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    <option value="classes">Classes View</option>
                    <option value="activities">Activities View</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700"><ChevronDownIcon className="w-4 h-4" /></div>
            </div>
            {currentView === 'classes' && (
              <div className="relative">
                <label htmlFor="classTypeSwitcher" className="sr-only">Select Class Type</label>
                <select id="classTypeSwitcher" value={selectedClassType} onChange={handleClassTypeChange} className="appearance-none block w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs sm:text-sm border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    {classTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700"><ChevronDownIcon className="w-4 h-4" /></div>
              </div>
            )}
            {currentView === 'activities' && (
              <div className="relative">
                <label htmlFor="activityTypeSwitcher" className="sr-only">Select Activity</label>
                <select
                  id="activityTypeSwitcher"
                  value={selectedActivity}
                  onChange={e => setSelectedActivity(e.target.value)}
                  className="appearance-none block w-full sm:w-auto pl-3 pr-8 py-1.5 text-xs sm:text-sm border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Clear Selected</option>
                  {activities.map(activity => (
                    <option key={activity.name} value={activity.name}>{activity.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700"><ChevronDownIcon className="w-4 h-4" /></div>
              </div>
            )}
        </div>
      </div>

      <div className="flex-grow bg-white shadow-lg rounded-md overflow-auto"> 
        <div className="overflow-x-auto scheduler-table-container h-full"> 
          <table className="min-w-full border-collapse border border-slate-300 text-xs" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-30">
              <tr className="bg-slate-100">
                <th 
                  rowSpan={currentView === 'activities' ? 1 : 2}
                  className="sticky left-0 z-40 bg-slate-200 px-2 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                  style={{ minWidth: '100px' }}
                >
                  Date
                </th>
                {currentView === 'activities' && (
                  <>
                    <th
                      rowSpan={1}
                      className="sticky left-[100px] z-40 bg-slate-200 px-2 py-2 text-center font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                      style={{ minWidth: '80px' }}
                    >
                      Session
                    </th>
                    <th
                      rowSpan={1}
                      className="sticky left-[180px] z-40 bg-slate-200 px-2 py-2 text-center font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                      style={{ minWidth: '80px' }}
                    >
                      Leaders Needed
                    </th>
                  </>
                )}
                {currentView === 'classes' && (
                  <>
                    <th
                      rowSpan="2"
                      className="sticky left-[100px] z-40 bg-slate-200 px-2 py-2 text-center font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                      style={{ minWidth: '80px' }}
                    >
                      Teacher AM
                    </th>
                    <th
                      rowSpan="2"
                      className="sticky left-[180px] z-40 bg-slate-200 px-2 py-2 text-center font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                      style={{ minWidth: '80px' }}
                    >
                      Teacher PM
                    </th>
                  </>
                )}
                {groupedHeaders.map((header, index) => (
                  <th
                    key={`${header.agencyName}-${index}`}
                    colSpan={header.groups.length}
                    className={`px-3 py-2 text-center font-bold uppercase tracking-wider border-r border-b border-slate-300 ${header.theme.agencyDisplayColor}`}
                    style={{ minWidth: `${header.groups.length * 120}px` }}
                  >
                    {header.agencyName}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50">
                {currentView === 'activities' && (
                  <>
                    {/* Empty ths for Date, Session, Leaders Needed sticky columns */}
                    <th className="sticky left-0 z-30 bg-slate-50 px-2 py-2 border-r border-b border-slate-300" style={{ minWidth: '100px' }}></th>
                    <th className="sticky left-[100px] z-30 bg-slate-50 px-2 py-2 border-r border-b border-slate-300" style={{ minWidth: '80px' }}></th>
                    <th className="sticky left-[180px] z-30 bg-slate-50 px-2 py-2 border-r border-b border-slate-300" style={{ minWidth: '80px' }}></th>
                  </>
                )}
                {currentView === 'classes' && (
                  <>
                    {/* No empty ths needed for classes view */}
                  </>
                )}
                {chronologicalGroups.map((group) => {
                  const theme = agencyColorMap.get(group.agencyName);
                  return (
                    <th
                      key={group.id}
                      scope="col"
                      className={`px-3 py-2 text-center font-semibold uppercase tracking-wider border-r border-b border-slate-300 ${theme.groupHeaderColor}`}
                      style={{ minWidth: '120px' }}
                    >
                      <Link 
                        to={`/dashboard/groups/${group.id}`}
                        className="hover:text-sky-700 transition-colors block"
                        title={`View details for ${group.name}`}
                      >
                        {group.name}
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dates.map((date) => {
                const currentDateStr = toYYYYMMDD(date);
                const isCurrentDateWeekend = isWeekend(date);
                const baseRowBgClass = 'bg-white';
                const weekendDateCellClass = isCurrentDateWeekend ? 'bg-slate-200 font-semibold' : 'bg-white';
                const teachers = calculateTeachers(date);
                const activityLeaders = calculateActivityLeaders(date);

                if (currentView === 'activities') {
                  // For activities view, render two rows per date, with date cell spanning both rows, and session/leaders columns per row
                  return (
                    <React.Fragment key={date.toISOString()}>
                      {/* Morning Row */}
                      <tr className={`${isCurrentDateWeekend ? 'bg-slate-100' : baseRowBgClass} hover:bg-sky-50/70 transition-colors`}>
                        <td
                          className={`sticky left-0 z-20 px-2 py-2 whitespace-nowrap font-medium text-slate-600 border-r border-b border-slate-300 ${weekendDateCellClass}`}
                          rowSpan={2}
                        >
                          <div className="flex flex-col">
                            <span>{formatDateDisplay(date)}</span>
                            <span className={`${isCurrentDateWeekend ? 'text-sky-600' : 'text-slate-400'} text-[10px]`}>{formatDayOfWeek(date)}</span>
                          </div>
                        </td>
                        <td className={`sticky left-[100px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass}`}>Morning</td>
                        <td className={`sticky left-[180px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass} ${calculateActivityLeaders(date).morning > 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                          {calculateActivityLeaders(date).morning || 0}
                        </td>
                        {chronologicalGroups.map((group) => {
                          const dataKey = `${currentDateStr}-${group.id}`;
                          const slotObj = programmeSlots[dataKey] || {};
                          const assignedActivity = slotObj['ACTIVITY_MORNING'];
                          let cellContent = assignedActivity || '';
                          let cellBgClass = '';
                          let cellTextColor = 'text-slate-700';
                          let titleText = `Morning activity for ${group.name} on ${formatDateDisplay(date)}`;
                          let isCellEditable = true;

                          // Arrival/Departure highlight
                          if (currentDateStr === group.arrival) {
                            cellBgClass = 'bg-green-200';
                            cellTextColor = 'text-green-800 font-semibold';
                            titleText = `Arrival for ${group.name} on ${formatDateDisplay(date)}`;
                            isCellEditable = false;
                          } else if (currentDateStr === group.departure) {
                            cellBgClass = 'bg-red-200';
                            cellTextColor = 'text-red-800 font-semibold';
                            titleText = `Departure for ${group.name} on ${formatDateDisplay(date)}`;
                            isCellEditable = false;
                          } else if (!cellContent) {
                            const assignedClass = slotObj['CLASS_DAY_SLOT'];
                            if (assignedClass === 'Morning' || assignedClass === 'Double') {
                              cellContent = 'Lessons';
                              cellBgClass = 'bg-amber-100';
                              cellTextColor = 'text-amber-700 font-medium';
                              titleText = `Morning Lessons for ${group.name}`;
                              isCellEditable = false;
                            }
                          } else {
                            cellBgClass = 'bg-emerald-100';
                            cellTextColor = 'text-emerald-700 font-medium';
                          }

                          return (
                            <td
                              key={`${date.toISOString()}-${group.name}-morning`}
                              className={`px-1 py-1 whitespace-normal border-r border-b border-slate-300 text-center ${isCellEditable ? 'cursor-pointer' : 'cursor-default'} ${cellBgClass}`}
                              title={titleText}
                              onClick={isCellEditable ? (e) => handleCellClick(currentDateStr, group.name, e, 'morning') : undefined}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                      </tr>
                      {/* Afternoon Row */}
                      <tr className={`${isCurrentDateWeekend ? 'bg-slate-100' : baseRowBgClass} hover:bg-sky-50/70 transition-colors`}>
                        <td className={`sticky left-[100px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass}`}>Afternoon</td>
                        <td className={`sticky left-[180px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass} ${calculateActivityLeaders(date).afternoon > 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                          {calculateActivityLeaders(date).afternoon || 0}
                        </td>
                        {chronologicalGroups.map((group) => {
                          const dataKey = `${currentDateStr}-${group.id}`;
                          const slotObj = programmeSlots[dataKey] || {};
                          const assignedActivity = slotObj['ACTIVITY_AFTERNOON'];
                          let cellContent = assignedActivity || '';
                          let cellBgClass = '';
                          let cellTextColor = 'text-slate-700';
                          let titleText = `Afternoon activity for ${group.name} on ${formatDateDisplay(date)}`;
                          let isCellEditable = true;

                          // Arrival/Departure highlight
                          if (currentDateStr === group.arrival) {
                            cellBgClass = 'bg-green-200';
                            cellTextColor = 'text-green-800 font-semibold';
                            titleText = `Arrival for ${group.name} on ${formatDateDisplay(date)}`;
                            isCellEditable = false;
                          } else if (currentDateStr === group.departure) {
                            cellBgClass = 'bg-red-200';
                            cellTextColor = 'text-red-800 font-semibold';
                            titleText = `Departure for ${group.name} on ${formatDateDisplay(date)}`;
                            isCellEditable = false;
                          } else if (!cellContent) {
                            const assignedClass = slotObj['CLASS_DAY_SLOT'];
                            if (assignedClass === 'Afternoon' || assignedClass === 'Double') {
                              cellContent = 'Lessons';
                              cellBgClass = 'bg-sky-100';
                              cellTextColor = 'text-sky-700 font-medium';
                              titleText = `Afternoon Lessons for ${group.name}`;
                              isCellEditable = false;
                            }
                          } else {
                            cellBgClass = 'bg-emerald-100';
                            cellTextColor = 'text-emerald-700 font-medium';
                          }

                          return (
                            <td
                              key={`${date.toISOString()}-${group.name}-afternoon`}
                              className={`px-1 py-1 whitespace-normal border-r border-b border-slate-300 text-center ${isCellEditable ? 'cursor-pointer' : 'cursor-default'} ${cellBgClass}`}
                              title={titleText}
                              onClick={isCellEditable ? (e) => handleCellClick(currentDateStr, group.name, e, 'afternoon') : undefined}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                } else {
                  // Original classes view code
                  return (
                    <tr key={date.toISOString()} className={`${isCurrentDateWeekend ? 'bg-slate-100' : baseRowBgClass} hover:bg-sky-50/70 transition-colors`}>
                      <td className={`sticky left-0 z-20 px-2 py-2 whitespace-nowrap font-medium text-slate-600 border-r border-b border-slate-300 ${weekendDateCellClass}`}>
                        <div className="flex flex-col">
                          <span>{formatDateDisplay(date)}</span>
                          <span className={`${isCurrentDateWeekend ? 'text-sky-600' : 'text-slate-400'} text-[10px]`}>{formatDayOfWeek(date)}</span>
                        </div>
                      </td>
                      {currentView === 'classes' && (
                        <>
                          <td className={`sticky left-[100px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass} ${teachers.morning > 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                            {isCurrentDateWeekend ? '-' : teachers.morning || 0}
                          </td>
                          <td className={`sticky left-[180px] z-20 px-2 py-2 text-center font-medium border-r border-b border-slate-300 ${weekendDateCellClass} ${teachers.afternoon > 0 ? 'text-sky-600' : 'text-slate-400'}`}>
                            {isCurrentDateWeekend ? '-' : teachers.afternoon || 0}
                          </td>
                        </>
                      )}
                      {chronologicalGroups.map((group) => {
                        const dataKey = `${currentDateStr}-${group.id}`;
                        const slotObj = programmeSlots[dataKey] || {};
                        const assignedClass = currentView === 'classes' ? slotObj['CLASS_DAY_SLOT'] : undefined;
                        let cellContent = '';
                        let cellBgClass = '';
                        let cellTextColor = 'text-slate-700';
                        let titleText = `Click to schedule for ${group.name} on ${formatDateDisplay(date)}`;
                        let isCellEditable = true;

                        if (currentView === 'classes') {
                          if (isCurrentDateWeekend) {
                            isCellEditable = false;
                            titleText = "Weekend - Not editable for classes";
                          } else if (currentDateStr < group.arrival || currentDateStr > group.departure) {
                            isCellEditable = false;
                            titleText = "Group not present on this date";
                          }
                        }

                        // Check for arrival/departure
                        if (currentDateStr === group.arrival) {
                          cellContent = "Arrival";
                          cellBgClass = 'bg-green-200';
                          cellTextColor = 'text-green-800 font-semibold';
                          titleText = `Arrival for ${group.name} on ${formatDateDisplay(date)}`;
                          isCellEditable = false;
                        } else if (currentDateStr === group.departure) {
                          cellContent = "Departure";
                          cellBgClass = 'bg-red-200';
                          cellTextColor = 'text-red-800 font-semibold';
                          titleText = `Departure for ${group.name} on ${formatDateDisplay(date)}`;
                          isCellEditable = false;
                        } else if (currentView === 'classes') {
                          if (assignedClass) {
                            cellContent = assignedClass;
                            titleText = `Class: ${assignedClass}`;
                            switch (assignedClass) {
                              case 'Morning':
                                cellBgClass = 'bg-amber-100';
                                cellTextColor = 'text-amber-700 font-medium';
                                break;
                              case 'Afternoon':
                                cellBgClass = 'bg-sky-100';
                                cellTextColor = 'text-sky-700 font-medium';
                                break;
                              case 'Double':
                                cellBgClass = 'bg-indigo-100';
                                cellTextColor = 'text-indigo-700 font-medium';
                                break;
                              default:
                                break;
                            }
                          }
                        }

                        const finalCursorClass = (currentView === 'classes' && isCellEditable) ? 'cursor-pointer' : 'cursor-default';

                        return (
                          <td
                            key={`${date.toISOString()}-${group.name}`}
                            className={`px-1 py-1 whitespace-normal border-r border-b border-slate-300 text-center hover:bg-sky-100/40 ${finalCursorClass} ${cellBgClass}`}
                            onClick={isCellEditable ? (e) => handleCellClick(currentDateStr, group.name, e, undefined) : undefined}
                            title={titleText}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 flex-shrink-0">
        Note: In 'Classes View', click editable cells (non-weekend, within stay) to assign the selected class type.
        {currentView === 'classes' && ' Teacher counts show required teachers (1:16 ratio).'}
      </p>
    </div>
  );
}

export default SchedulerPage;
