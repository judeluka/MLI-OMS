import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to get sort icon
const SortIcon = ({ direction }) => {
  if (!direction) return <span className="ml-1 text-slate-400">↕</span>;
  return direction === 'ascending' ? <span className="ml-1 text-slate-600">▲</span> : <span className="ml-1 text-slate-600">▼</span>;
};

// Helper to generate dates for the programme table
const getProgrammeDates = (arrivalStr, departureStr) => {
    if (!arrivalStr || !departureStr) return [];
    const dates = [];
    
    const startParts = arrivalStr.split('-');
    const endParts = departureStr.split('-');

    if (startParts.length !== 3 || endParts.length !== 3) return []; // Invalid format

    let currentDate = new Date(Date.UTC(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2])));
    let stopDate = new Date(Date.UTC(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2])));

    if (isNaN(currentDate.getTime()) || isNaN(stopDate.getTime())) return []; // Invalid date objects

    while (currentDate <= stopDate) {
        dates.push(new Date(currentDate)); // Store as Date objects (which are UTC timestamps internally)
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return dates;
};

function GroupProgrammePage() {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [programmeData, setProgrammeData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch group details and programme data
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setError("Group ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setGroupInfo(null);
      setProgrammeData({});

      try {
        // Fetch group metadata
        const groupResponse = await fetch(`http://localhost:5000/api/groups/${groupId}`);
        if (!groupResponse.ok) {
          const errData = await groupResponse.json().catch(() => ({ message: `Failed to fetch group details: ${groupResponse.status}` }));
          throw new Error(errData.message);
        }
        const groupDataResult = await groupResponse.json();
        if (groupDataResult.success && groupDataResult.group) {
          setGroupInfo(groupDataResult.group);
        } else {
          throw new Error(groupDataResult.message || 'Could not retrieve group details.');
        }

        // Fetch programme data for both classes and activities
        const [classesResponse, activitiesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/groups/${groupId}/programme?viewType=classes`),
          fetch(`http://localhost:5000/api/groups/${groupId}/programme?viewType=activities`)
        ]);

        if (!classesResponse.ok || !activitiesResponse.ok) {
          throw new Error('Failed to fetch programme data');
        }

        const [classesResult, activitiesResult] = await Promise.all([
          classesResponse.json(),
          activitiesResponse.json()
        ]);

        // Combine both types of programme data
        const combinedProgramme = {
          ...(classesResult.success ? classesResult.programme : {}),
          ...(activitiesResult.success ? activitiesResult.programme : {})
        };

        setProgrammeData(combinedProgramme);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  // Memoize programme dates based on fetched groupInfo
  const programmeDates = useMemo(() => 
    groupInfo?.arrivalDate && groupInfo?.departureDate 
        ? getProgrammeDates(groupInfo.arrivalDate, groupInfo.departureDate) 
        : [], 
  [groupInfo?.arrivalDate, groupInfo?.departureDate]);

  // Formats Date object to Weekday, DD Month YYYY (UTC)
  const formatDateForProgrammeHeader = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); // Shortened weekday
  };
  
  // Formats Date object to YYYY-MM-DD (UTC)
  const toYYYYMMDD = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return null;
    const month = `${dateObj.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${dateObj.getUTCDate()}`.padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    return `${year}-${month}-${day}`;
  };

  const programmeTableHeaders = [
    "Date", "Breakfast", "Morning Activity", "Lunch", "Afternoon Activity", "Dinner"
  ];

  // Helper function to get activity text based on slot type and value
  const getActivityText = (dateStr, slotType, value) => {
    if (!value) return '-';
    
    // Map scheduler values to programme display values
    const activityMap = {
      'Morning': 'Lessons',
      'Afternoon': 'Lessons',
      'Double': 'Full Day Lessons',
      'Arrival': 'Check-in & Welcome Talk',
      'Departure': 'Check-out & Airport Transfer'
    };

    return activityMap[value] || value;
  };

  // Helper function to check if a date is a weekend
  const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // PDF Export Handler
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 15;
    let y = margin;

    // Title
    doc.setFontSize(16);
    doc.text('Programme Schedule', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(11);
    doc.text(`Group: ${groupInfo.groupName || 'N/A'} | Client: ${groupInfo.agency || 'N/A'}`, 105, y, { align: 'center' });
    y += 6;
    doc.text(`Arrival: ${groupInfo.arrivalDate || '-'} | Departure: ${groupInfo.departureDate || '-'}`, 105, y, { align: 'center' });
    y += 8;

    // Table headers
    const headers = [[
      'Date',
      'Breakfast',
      'Morning Activity',
      'Lunch',
      'Afternoon Activity',
      'Dinner',
    ]];

    // Table rows with meta for coloring and colspans
    const rows = programmeDates.map((date) => {
      const dateStrYYYYMMDD = toYYYYMMDD(date);
      const isArrivalDay = dateStrYYYYMMDD === groupInfo.arrivalDate;
      const isDepartureDay = dateStrYYYYMMDD === groupInfo.departureDate;
      const isWeekendDay = isWeekend(date);
      const morningActivity = getActivityText(dateStrYYYYMMDD, 'Morning', programmeData[`${dateStrYYYYMMDD}-CLASS_DAY_SLOT`] || programmeData[`${dateStrYYYYMMDD}-ACTIVITY_MORNING`]);
      const afternoonActivity = getActivityText(dateStrYYYYMMDD, 'Afternoon', programmeData[`${dateStrYYYYMMDD}-CLASS_DAY_SLOT`] || programmeData[`${dateStrYYYYMMDD}-ACTIVITY_AFTERNOON`]);
      const fullDayActivity = isWeekendDay ? (morningActivity !== '-' ? morningActivity : afternoonActivity) : null;
      const dateDisplay = formatDateForProgrammeHeader(date);
      let row;
      if (isWeekendDay) {
        row = [
          { content: dateDisplay },
          { content: 'Breakfast' },
          { content: fullDayActivity || 'Free Time', colSpan: 3, styles: { halign: 'center' } },
          { content: '', colSpan: 0 },
          { content: '', colSpan: 0 },
          { content: 'Dinner' }
        ];
      } else {
        row = [
          { content: dateDisplay },
          { content: 'Breakfast' },
          { content: morningActivity },
          { content: 'Lunch' },
          { content: afternoonActivity },
          { content: 'Dinner' }
        ];
      }
      return {
        row,
        isArrivalDay,
        isDepartureDay,
        isWeekendDay
      };
    });

    // Use autoTable to add the table
    autoTable(doc, {
      startY: y,
      head: headers,
      body: rows.map(r => r.row),
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [220, 220, 220], halign: 'center', valign: 'middle' },
      margin: { left: margin, right: margin },
      tableWidth: 180,
      didParseCell: function (data) {
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const rowMeta = rows[rowIndex];
          // Arrival day: light green
          if (rowMeta.isArrivalDay) {
            data.cell.styles.fillColor = [212, 237, 218];
          }
          // Departure day: light red
          if (rowMeta.isDepartureDay) {
            data.cell.styles.fillColor = [248, 215, 218];
          }
          // Center align all cells
          data.cell.styles.halign = 'center';
        }
      },
      didDrawPage: (data) => {
        // Optionally, add footer or page numbers here
      },
    });

    doc.save(`Programme_${groupInfo.groupName || 'Group'}.pdf`);
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-700">Loading programme details...</div>;
  }
  if (error) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-md shadow" role="alert">Error: {error}</div>;
  }
  if (!groupInfo) { 
    return <div className="p-6 text-center text-slate-700">Group not found or could not be loaded.</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-semibold text-slate-800">
          Programme for Group: <span className="text-sky-600">{groupInfo.groupName || 'N/A'}</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-sm transition-colors"
          >
            Print Programme
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
          >
            Export as PDF
          </button>
          <Link 
            to={`/dashboard/groups/${groupId}`}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-md shadow-sm transition-colors"
          >
            &larr; Back to Group Details
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 print:shadow-none print:p-0">
        <div className="print:block print:mb-4">
          <h1 className="text-xl font-semibold text-slate-800 print:text-lg">
            Programme Schedule
          </h1>
          <p className="text-sm text-slate-500">
            Group: {groupInfo.groupName || 'N/A'} | Client: {groupInfo.agency || 'N/A'}
          </p>
          <p className="text-sm text-slate-500">
            Arrival: {groupInfo.arrivalDate} | Departure: {groupInfo.departureDate}
          </p>
        </div>

        {programmeDates.length > 0 ? (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="min-w-full w-full divide-y divide-slate-200 border border-slate-300 text-sm print:text-xs">
              <thead className="bg-slate-100 print:bg-white">
                <tr>
                  {programmeTableHeaders.map(header => (
                    <th 
                      key={header} 
                      className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-300 last:border-r-0 text-center print:border-slate-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {programmeDates.map((date) => { 
                  const dateStrYYYYMMDD = toYYYYMMDD(date); 
                  const isArrivalDay = dateStrYYYYMMDD === groupInfo.arrivalDate;
                  const isDepartureDay = dateStrYYYYMMDD === groupInfo.departureDate;
                  const isWeekendDay = isWeekend(date);
                  
                  // Get activities from programme data
                  const morningActivity = getActivityText(dateStrYYYYMMDD, 'Morning', programmeData[`${dateStrYYYYMMDD}-CLASS_DAY_SLOT`] || programmeData[`${dateStrYYYYMMDD}-ACTIVITY_MORNING`]);
                  const afternoonActivity = getActivityText(dateStrYYYYMMDD, 'Afternoon', programmeData[`${dateStrYYYYMMDD}-CLASS_DAY_SLOT`] || programmeData[`${dateStrYYYYMMDD}-ACTIVITY_AFTERNOON`]);

                  // For weekends, combine morning and afternoon activities into a full day activity
                  const fullDayActivity = isWeekendDay ? (morningActivity !== '-' ? morningActivity : afternoonActivity) : null;

                  return (
                    <tr key={dateStrYYYYMMDD} className={`${isArrivalDay ? 'bg-green-50 print:bg-white' : isDepartureDay ? 'bg-red-50 print:bg-white' : 'bg-white'} hover:bg-slate-50 print:hover:bg-white`}>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 font-medium text-slate-700 print:border-slate-400">{formatDateForProgrammeHeader(date)}</td>
                      <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 text-slate-600 text-center print:border-slate-400">Breakfast</td>
                      {isWeekendDay ? (
                        <>
                          <td 
                            colSpan="3" 
                            className={`px-3 py-2 border-r border-slate-300 text-slate-600 text-center bg-slate-100 print:bg-white print:border-slate-400`}
                          >
                            {fullDayActivity || 'Free Time'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className={`px-3 py-2 border-r border-slate-300 text-slate-600 text-center ${isArrivalDay ? 'text-green-700 font-semibold print:text-slate-700' : ''} print:border-slate-400`}>
                            {morningActivity}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap border-r border-slate-300 text-slate-600 text-center print:border-slate-400">Lunch</td>
                          <td className={`px-3 py-2 border-r border-slate-300 text-slate-600 text-center ${isDepartureDay ? 'text-red-700 font-semibold print:text-slate-700' : ''} print:border-slate-400`}>
                            {afternoonActivity}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-slate-600 text-center print:border-slate-400">Dinner</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">Programme dates not available for this group, or group arrival/departure not set.</p>
        )}
      </div>

      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .programme-table {
              width: 100%;
              table-layout: fixed;
            }
            
            thead {
              display: table-header-group;
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            /* Hide elements that shouldn't print */
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default GroupProgrammePage; 