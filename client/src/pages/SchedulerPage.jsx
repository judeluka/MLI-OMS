// src/pages/SchedulerPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

  const [classSchedule, setClassSchedule] = useState(initialClassScheduleData);
  const [activitySchedule, setActivitySchedule] = useState(initialActivityScheduleData);

  const [agencyGroupConfig, setAgencyGroupConfig] = useState([]);
  const [allGroupsFlat, setAllGroupsFlat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [schedulerStartDate, setSchedulerStartDate] = useState(null);
  const [schedulerEndDate, setSchedulerEndDate] = useState(null);

  // Fetch and process group data
  useEffect(() => {
    const fetchAndProcessGroups = async () => {
      setIsLoading(true);
      setError(null);
      setSchedulerStartDate(null);
      setSchedulerEndDate(null);
      setAgencyGroupConfig([]); 
      setAllGroupsFlat([]);   
      try {
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

          // 1. Create a flat list of groups for the centre and sort them globally by arrival date
          const globallySortedGroups = centreSpecificGroupsRaw
            .map(group => ({ 
                id: group.id,
                name: group.groupName,
                agencyName: group.agency || 'Unknown Agency',
                arrival: group.arrivalDate, // Expected YYYY-MM-DD
                departure: group.departureDate, // Expected YYYY-MM-DD
            }))
            .sort((a, b) => {
              if (!a.arrival && !b.arrival) return 0;
              if (!a.arrival) return 1; // Groups without arrival date go last
              if (!b.arrival) return -1; // Groups without arrival date go last
              return a.arrival.localeCompare(b.arrival); // Sort by YYYY-MM-DD string
            });
          
          setAllGroupsFlat(globallySortedGroups); // This list dictates the column order in tbody

          // 2. Reconstruct agencyGroupConfig for header rendering,
          //    respecting the global sort for group order within agencies
          //    and agency order based on their first appearing group in the sorted list.
          const agenciesForHeader = {}; 
          const agencyOrderForHeader = []; 
          const agencyColorMap = new Map(); 
          let colorIndex = 0;

          globallySortedGroups.forEach(group => {
              const agencyKey = group.agencyName;
              if (!agenciesForHeader[agencyKey]) {
                  // Assign colors when agency is first encountered
                  if (!agencyColorMap.has(agencyKey)) {
                      agencyColorMap.set(agencyKey, agencyColorThemes[colorIndex % agencyColorThemes.length]);
                      colorIndex++;
                  }
                  const theme = agencyColorMap.get(agencyKey);

                  agenciesForHeader[agencyKey] = {
                      agencyName: agencyKey,
                      agencyDisplayColor: theme.agencyDisplayColor,
                      groupHeaderColor: theme.groupHeaderColor,
                      groups: [] 
                  };
                  agencyOrderForHeader.push(agencyKey); // Store the order in which agencies appear
              }
              // Add the group to its agency. The group object itself is from the sorted list.
              agenciesForHeader[agencyKey].groups.push({
                  name: group.name,
                  id: group.id, // For unique key in header rendering
                  arrival: group.arrival, 
                  departure: group.departure
              });
          });

          // Create finalAgencyGroupConfig based on the order agencies appeared
          const finalAgencyGroupConfig = agencyOrderForHeader.map(agencyKey => agenciesForHeader[agencyKey]);
          setAgencyGroupConfig(finalAgencyGroupConfig);


          // --- Calculate dynamic date range based on globallySortedGroups ---
          if (globallySortedGroups.length > 0) {
            let minArrival = null;
            let maxDeparture = null;
            globallySortedGroups.forEach(group => {
              if (group.arrival) {
                const arrivalParts = group.arrival.split('-');
                const arrivalDate = new Date(Date.UTC(parseInt(arrivalParts[0]), parseInt(arrivalParts[1]) - 1, parseInt(arrivalParts[2])));
                if (!minArrival || arrivalDate < minArrival) minArrival = arrivalDate;
              }
              if (group.departure) {
                const departureParts = group.departure.split('-');
                const departureDate = new Date(Date.UTC(parseInt(departureParts[0]), parseInt(departureParts[1]) - 1, parseInt(departureParts[2])));
                if (!maxDeparture || departureDate > maxDeparture) maxDeparture = departureDate;
              }
            });
            if (minArrival && maxDeparture && minArrival <= maxDeparture) {
              setSchedulerStartDate(minArrival);
              setSchedulerEndDate(maxDeparture);
            } else { 
              const todayForFallback = new Date();
              setSchedulerStartDate(new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate())));
              const defaultEndDate = new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate()));
              defaultEndDate.setUTCDate(defaultEndDate.getUTCDate() + 6); 
              setSchedulerEndDate(defaultEndDate);
              console.warn("Could not determine valid date range from group data, defaulting to current week.");
            }
          } else { 
            const todayForFallback = new Date();
            setSchedulerStartDate(new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate())));
            const defaultEndDate = new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate()));
            defaultEndDate.setUTCDate(defaultEndDate.getUTCDate() + 6);
            setSchedulerEndDate(defaultEndDate);
          }
        } else {
          throw new Error(data.message || 'Fetched data is not in expected format.');
        }
      } catch (err) {
        console.error("Error fetching or processing groups:", err);
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

    if (centreName) fetchAndProcessGroups();
    else {
      setError("Centre name not specified in URL.");
      setIsLoading(false);
      const todayForFallback = new Date();
      setSchedulerStartDate(new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate())));
      const defaultEndDate = new Date(Date.UTC(todayForFallback.getUTCFullYear(), todayForFallback.getUTCMonth(), todayForFallback.getUTCDate()));
      defaultEndDate.setUTCDate(defaultEndDate.getUTCDate() + 6);
      setSchedulerEndDate(defaultEndDate);
    }
  }, [centreName]);


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

  const handleCellClick = (dateStr, groupName) => {
    const dataKey = `${dateStr}-${groupName}`;
    if (currentView === 'classes') {
      if (isWeekend(dateStr)) {
        alert("Classes cannot be scheduled on weekends."); return;
      }
      const groupInfo = allGroupsFlat.find(g => g.name === groupName);
      if (!groupInfo || !groupInfo.arrival || !groupInfo.departure || dateStr < groupInfo.arrival || dateStr > groupInfo.departure) {
        alert("Classes can only be scheduled between the group's arrival and departure dates."); return;
      }
      setClassSchedule(prev => ({ ...prev, [dataKey]: selectedClassType === 'None' ? '' : selectedClassType }));
    } else if (currentView === 'activities') {
      alert(`Activity cell clicked: ${groupName} - ${dateStr}.`);
    }
  };

  const formatDateDisplay = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  const formatDayOfWeek = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });

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
        </div>
      </div>

      <div className="flex-grow bg-white shadow-lg rounded-md overflow-auto"> 
        <div className="overflow-x-auto scheduler-table-container h-full"> 
          <table className="min-w-full border-collapse border border-slate-300 text-xs">
            <thead className="sticky top-0 z-30">
              <tr className="bg-slate-100">
                <th 
                    rowSpan="2" 
                    className="sticky left-0 z-40 bg-slate-200 px-2 py-2 text-left font-semibold text-slate-600 uppercase tracking-wider border-r border-b border-slate-300 align-middle"
                    style={{ minWidth: '100px' }}
                >
                  Date
                </th>
                {agencyGroupConfig.map(agency => (
                  <th
                    key={agency.agencyName}
                    colSpan={agency.groups.length}
                    className={`px-3 py-2 text-center font-bold uppercase tracking-wider border-r border-b border-slate-300 ${agency.agencyDisplayColor || 'bg-slate-600 text-white'}`}
                  >
                    {agency.agencyName}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50">
                {agencyGroupConfig.flatMap(agency => 
                  agency.groups.map(group => ( 
                    <th
                      key={group.id || group.name}
                      scope="col"
                      className={`px-3 py-2 text-center font-semibold uppercase tracking-wider border-r border-b border-slate-300 ${agency.groupHeaderColor || 'bg-slate-200 text-slate-700'}`}
                      style={{ minWidth: '120px' }}
                    >
                      {group.name}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dates.map((date, dateIndex) => {
                const currentDateStr = toYYYYMMDD(date);
                const isCurrentDateWeekend = isWeekend(date);
                const baseRowBgClass = 'bg-white'; 
                const weekendDateCellClass = isCurrentDateWeekend ? 'bg-slate-200 font-semibold' : 'bg-white'; 

                return (
                  <tr key={date.toISOString()} className={`${isCurrentDateWeekend ? 'bg-slate-100' : baseRowBgClass} hover:bg-sky-50/70 transition-colors`}>
                    <td className={`sticky left-0 z-20 px-2 py-2 whitespace-nowrap font-medium text-slate-600 border-r border-b border-slate-300 ${weekendDateCellClass}`}>
                      <div className="flex flex-col">
                          <span>{formatDateDisplay(date)}</span>
                          <span className={`${isCurrentDateWeekend ? 'text-sky-600' : 'text-slate-400'} text-[10px]`}>{formatDayOfWeek(date)}</span>
                      </div>
                    </td>
                    {allGroupsFlat.map((group) => { // allGroupsFlat is globally sorted by arrival
                      const groupName = group.name;
                      const groupStayDetails = group; 

                      let cellContent = '';
                      let cellBgClass = ''; 
                      let cellTextColor = 'text-slate-700'; 
                      let titleText = `Click to schedule for ${groupName} on ${formatDateDisplay(date)}`;
                      let isCellEditable = true;

                      if (currentView === 'classes') {
                          if (isCurrentDateWeekend) {
                              isCellEditable = false;
                              titleText = "Weekend - Not editable for classes";
                          } else if (groupStayDetails && groupStayDetails.arrival && groupStayDetails.departure && (currentDateStr < groupStayDetails.arrival || currentDateStr > groupStayDetails.departure)) {
                              isCellEditable = false;
                              titleText = "Group not present on this date";
                          } else if (!groupStayDetails || !groupStayDetails.arrival || !groupStayDetails.departure) { 
                              isCellEditable = false;
                              titleText = "Group has no scheduled stay info";
                          }
                      }

                      if (groupStayDetails && groupStayDetails.arrival && groupStayDetails.departure) {
                        if (groupStayDetails.arrival === currentDateStr) {
                          cellContent = "Arrival";
                          cellBgClass = 'bg-green-200'; cellTextColor = 'text-green-800 font-semibold';
                          titleText = `Arrival for ${groupName} on ${formatDateDisplay(date)}`;
                          isCellEditable = false; 
                        } else if (groupStayDetails.departure === currentDateStr) {
                          cellContent = "Departure";
                          cellBgClass = 'bg-red-200'; cellTextColor = 'text-red-800 font-semibold';
                          titleText = `Departure for ${groupName} on ${formatDateDisplay(date)}`;
                          isCellEditable = false; 
                        }
                      }
                      
                      if (!cellContent) { 
                        const dataKey = `${currentDateStr}-${groupName}`;
                        if (currentView === 'classes') {
                            const assignedClass = classSchedule[dataKey];
                            if (assignedClass) {
                                cellContent = assignedClass;
                                titleText = `Class: ${assignedClass}`;
                                switch (assignedClass) {
                                    case 'Morning': cellBgClass = 'bg-amber-100'; cellTextColor = 'text-amber-700 font-medium'; break;
                                    case 'Afternoon': cellBgClass = 'bg-sky-100'; cellTextColor = 'text-sky-700 font-medium'; break;
                                    case 'Double': cellBgClass = 'bg-indigo-100'; cellTextColor = 'text-indigo-700 font-medium'; break;
                                    default: cellContent = ''; break; 
                                }
                            }
                        } else if (currentView === 'activities') {
                            if (activitySchedule[dataKey]) {
                                cellContent = activitySchedule[dataKey];
                                titleText = `Activity: ${cellContent}`;
                            }
                        }
                      }
                      
                      const finalCursorClass = (currentView === 'classes' && isCellEditable) ? 'cursor-pointer' : 'cursor-default';

                      return (
                        <td
                          key={`${date.toISOString()}-${group.name}`}
                          className={`px-1 py-1 whitespace-normal border-r border-b border-slate-300 text-center hover:bg-sky-100/40 ${finalCursorClass} ${cellBgClass}`}
                          onClick={ (currentView === 'classes' && isCellEditable) ? () => handleCellClick(currentDateStr, groupName) : undefined }
                          title={titleText}
                        >
                          <div className={`min-h-[30px] flex items-center justify-center p-0.5 ${cellTextColor}`}>
                             {cellContent || <>&nbsp;</>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 flex-shrink-0">
        Note: In 'Classes View', click editable cells (non-weekend, within stay) to assign the selected class type.
      </p>
    </div>
  );
}

export default SchedulerPage;
