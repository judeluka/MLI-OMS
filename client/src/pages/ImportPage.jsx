// src/pages/ImportPage.jsx
import React, { useState } from 'react';
import Papa from 'papaparse'; // Import PapaParse

// Import an icon for the import page (optional)
const UploadCloudIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.033M6.75 19.5h10.5" />
  </svg>
);

// Helper function to convert Excel serial date number to JavaScript Date object
const excelSerialToDate = (serial) => {
  if (isNaN(serial)) {
    return null;
  }
  // Excel base date for serial numbers is December 30, 1899 for the 1900 date system (Windows).
  // JavaScript's Date epoch is January 1, 1970.
  // The number 25569 represents 1970-01-01 in Excel serial numbers.
  // Excel has a bug where it considers 1900 a leap year.
  // This formula generally works for dates after 1900-03-01.
  // For dates before that, or if the Excel file uses the 1904 date system (Mac), adjustments are needed.
  // This version is a common approximation.
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
  // Subtract 1 if the serial number system treats Jan 1, 1900 as day 1.
  // Many systems treat Jan 1, 1900 as day 1, so (serial - 1) is often used.
  // If your serials are directly from Excel output, (serial - 2) might be needed due to the 1900 bug and 0-based vs 1-based day counting.
  // The most reliable is often (serial - 25569) * 86400 * 1000 and add to JS epoch, but this simpler one works for many cases.
  // Let's use a common conversion that subtracts the difference in days from JS epoch.
  // (serial - (25567 + 2)) days after Dec 30 1899. (25569 is Jan 1 1970)
  // A common formula: (serial - 25569) * 86400000 will give milliseconds from JS epoch.
  // However, a simpler approach for dates after 1900-02-28:
  const date = new Date(excelEpoch.getTime() + (serial -1) * 24 * 60 * 60 * 1000);
  
  if (isNaN(date.getTime())) {
      console.warn(`Could not convert Excel serial "${serial}" to a valid date.`);
      return null;
  }
  return date;
};


// Helper function to parse various date string formats to YYYY-MM-DD
const parseFlexibleDateToYMD = (dateInput) => {
  if (!dateInput || (typeof dateInput !== 'string' && typeof dateInput !== 'number')) {
    return null;
  }

  let dateObj = null;
  const stringValue = String(dateInput).trim();

  // 1. Try parsing DD-MM-YYYY or DD/MM/YYYY
  const dmyParts = stringValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyParts) {
    const day = parseInt(dmyParts[1], 10);
    const month = parseInt(dmyParts[2], 10); // Month is 1-indexed here
    const year = parseInt(dmyParts[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      dateObj = new Date(Date.UTC(year, month - 1, day)); // Use UTC to avoid timezone issues from string
    } else {
        console.warn(`Invalid date parts in DMY string: ${stringValue}`);
    }
  }

  // 2. If not DMY, try parsing YYYY-MM-DD or YYYY/MM/DD
  if (!dateObj) {
    const ymdParts = stringValue.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdParts) {
        const year = parseInt(ymdParts[1], 10);
        const month = parseInt(ymdParts[2], 10);
        const day = parseInt(ymdParts[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            dateObj = new Date(Date.UTC(year, month - 1, day));
        } else {
            console.warn(`Invalid date parts in YMD string: ${stringValue}`);
        }
    }
  }
  
  // 3. If not DMY or YMD string, try parsing as Excel serial number
  if (!dateObj && /^\d+$/.test(stringValue)) { 
    const serial = parseInt(stringValue, 10);
    if (!isNaN(serial) && serial > 0 && serial < 300000) { 
        dateObj = excelSerialToDate(serial);
    }
  } else if (!dateObj && typeof dateInput === 'number') { 
     if (dateInput > 0 && dateInput < 300000) { 
        dateObj = excelSerialToDate(dateInput);
    }
  }

  // 4. If we have a valid Date object, format it to YYYY-MM-DD using UTC methods
  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getUTCFullYear();
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  console.warn(`Date input "${dateInput}" could not be parsed into a valid YYYY-MM-DD format.`);
  return null;
};


function ImportPage() {
  const [csvData, setCsvData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedGroups, setParsedGroups] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // Add state for flights import
  const [flightCsvData, setFlightCsvData] = useState('');
  const [flightFileName, setFlightFileName] = useState('');
  const [parsedFlights, setParsedFlights] = useState([]);
  const [flightError, setFlightError] = useState('');
  const [flightSuccessMessage, setFlightSuccessMessage] = useState('');
  const [flightIsLoading, setFlightIsLoading] = useState(false);
  const [flightImportSummary, setFlightImportSummary] = useState(null);

  const groupColumns = [
    { name: 'Agency', example: 'Agency Alpha', notes: 'Name of the agency. (Optional)' },
    { name: 'GroupName', example: 'Summer Camp A', notes: 'Unique name for the group. (Mandatory)' },
    { name: 'ArrivalDate', example: 'DD-MM-YYYY or Excel Number (e.g., 45833)', notes: 'Date of arrival. (Mandatory, will be converted)' },
    { name: 'DepartureDate', example: 'DD-MM-YYYY or Excel Number', notes: 'Date of departure. (Mandatory, will be converted)' },
    { name: 'StudentAllocation', example: '50', notes: 'Number of allocated student spots. (Optional, defaults to 0)' },
    { name: 'LeaderAllocation', example: '5', notes: 'Number of allocated leader spots. (Optional, defaults to 0)' },
    { name: 'StudentBookings', example: '45', notes: 'Number of confirmed student bookings. (Optional, defaults to 0)' },
    { name: 'LeaderBookings', example: '5', notes: 'Number of confirmed leader bookings. (Optional, defaults to 0)' },
    { name: 'Centre', example: 'Mountain View Centre', notes: 'Name of the centre. (Optional)' },
    { name: 'FlightArrivalTime', example: 'HH:MM (e.g., 14:00)', notes: 'Flight arrival time (24-hour format). (Optional)' },
    { name: 'FlightDepartureTime', example: 'HH:MM (e.g., 10:00)', notes: 'Flight departure time (24-hour format). (Optional)' },
  ];

  const flightColumns = [
    { name: 'flight_type', example: 'arrival', notes: 'Type of flight: arrival or departure. (Mandatory)' },
    { name: 'flight_date', example: '2024-07-01', notes: 'Date of flight (YYYY-MM-DD). (Mandatory)' },
    { name: 'flight_time', example: '14:00', notes: 'Time of flight (24-hour, HH:MM). (Mandatory)' },
    { name: 'flight_code', example: 'BA123', notes: 'Flight code. (Mandatory)' },
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setSuccessMessage('');
      setParsedGroups([]);
      setImportSummary(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = (event) => {
    setCsvData(event.target.value);
    setFileName('');
    setError('');
    setSuccessMessage('');
    setParsedGroups([]);
    setImportSummary(null);
  };

  const processImport = () => {
    if (!csvData.trim()) {
      setError('No CSV data provided. Please paste data or upload a file.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setParsedGroups([]);
    setImportSummary(null);

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, 
      complete: (results) => {
        setIsLoading(false);
        if (results.errors.length) {
          console.error("CSV Parsing Errors:", results.errors);
          setError(`Error parsing CSV: ${results.errors.map(err => err.message).join(', ')}`);
          return;
        }
        
        const providedHeaders = results.meta.fields.map(h => h.trim().toLowerCase());
        const mandatoryHeaders = ['groupname', 'arrivaldate', 'departuredate']; 
        const missingMandatoryHeaders = mandatoryHeaders.filter(mh => !providedHeaders.includes(mh));

        if (missingMandatoryHeaders.length > 0) {
            setError(`Missing required columns in CSV: ${missingMandatoryHeaders.join(', ')}. Please ensure your CSV headers include at least GroupName, ArrivalDate, and DepartureDate (case-insensitive).`);
            return;
        }
        
        let parsingErrors = [];
        const validGroups = results.data.map((row, rowIndex) => {
            const group = {};
            let rowHasError = false;

            groupColumns.forEach(col => {
                const csvHeader = Object.keys(row).find(k => k.trim().toLowerCase() === col.name.toLowerCase());
                let value = csvHeader ? String(row[csvHeader]).trim() : null;
                const camelCaseKey = col.name.charAt(0).toLowerCase() + col.name.slice(1);

                if (camelCaseKey === 'arrivalDate' || camelCaseKey === 'departureDate') {
                    const parsedDate = parseFlexibleDateToYMD(value);
                    if (value && value.trim() !== '' && !parsedDate) { 
                        parsingErrors.push(`Row ${rowIndex + 2}: Invalid date format for ${col.name} ("${value}"). Expected DD-MM-YYYY, YYYY-MM-DD, or Excel serial number.`);
                        rowHasError = true;
                    }
                    group[camelCaseKey] = parsedDate;
                } else if (['studentAllocation', 'leaderAllocation', 'studentBookings', 'leaderBookings'].includes(camelCaseKey)) {
                    if (value === '' || value === null) {
                        group[camelCaseKey] = null;
                    } else {
                        const numValue = parseInt(value, 10);
                        if (isNaN(numValue)) {
                            parsingErrors.push(`Row ${rowIndex + 2}: Invalid number for ${col.name} ("${value}").`);
                            rowHasError = true;
                            group[camelCaseKey] = null;
                        } else {
                            group[camelCaseKey] = numValue;
                        }
                    }
                } else {
                    group[camelCaseKey] = value === '' ? null : value;
                }
            });
            return rowHasError ? null : group; 
        }).filter(group => group && group.groupName && group.groupName.trim() !== '');
        
        if (parsingErrors.length > 0) {
            setError(`Data parsing issues found:\n${parsingErrors.join('\n')}`);
            return; 
        }

        if (validGroups.length === 0) {
            setError("No valid group data found after parsing. Check content, headers, and date formats.");
            return;
        }

        setParsedGroups(validGroups);
        setSuccessMessage(`Successfully parsed ${validGroups.length} groups. Review below and confirm to save to database.`);
        console.log('Parsed Groups for Backend:', validGroups);
      },
      error: (error) => {
        setIsLoading(false);
        console.error("PapaParse Error:", error);
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleConfirmImport = async () => {
    if (parsedGroups.length === 0) {
        setError("No groups to import. Please process a CSV first.");
        return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setImportSummary(null);

    try {
      const response = await fetch('http://localhost:5000/api/import/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedGroups),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(result.message || `Import process completed!`);
        setImportSummary({
            importedCount: result.successfullyImportedCount,
            totalProcessed: result.totalProcessed,
            skippedCount: result.skippedCount,
            errors: result.errors || []
        });
        setParsedGroups([]);
      } else {
        setError(result.message || "Failed to import groups. Check server logs for more details.");
        if (result.errors && result.errors.length > 0) {
            setImportSummary({
                importedCount: result.successfullyImportedCount || 0,
                totalProcessed: result.totalProcessed || parsedGroups.length,
                skippedCount: result.skippedCount || 0,
                errors: result.errors
            });
        }
      }
    } catch (err) {
      console.error('Import request error:', err);
      setError("An error occurred while communicating with the server: " + err.message + ". Ensure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Flights Import Handlers ---
  const handleFlightFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFlightFileName(file.name);
      setFlightError('');
      setFlightSuccessMessage('');
      setParsedFlights([]);
      setFlightImportSummary(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlightCsvData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFlightPaste = (event) => {
    setFlightCsvData(event.target.value);
    setFlightFileName('');
    setFlightError('');
    setFlightSuccessMessage('');
    setParsedFlights([]);
    setFlightImportSummary(null);
  };

  const processFlightImport = () => {
    if (!flightCsvData.trim()) {
      setFlightError('No CSV data provided. Please paste data or upload a file.');
      return;
    }
    setFlightIsLoading(true);
    setFlightError('');
    setFlightSuccessMessage('');
    setParsedFlights([]);
    setFlightImportSummary(null);

    Papa.parse(flightCsvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        setFlightIsLoading(false);
        if (results.errors.length) {
          setFlightError(`Error parsing CSV: ${results.errors.map(err => err.message).join(', ')}`);
          return;
        }
        const providedHeaders = results.meta.fields.map(h => h.trim().toLowerCase());
        const mandatoryHeaders = ['flight_type', 'flight_date', 'flight_time', 'flight_code'];
        const missingMandatoryHeaders = mandatoryHeaders.filter(mh => !providedHeaders.includes(mh));
        if (missingMandatoryHeaders.length > 0) {
          setFlightError(`Missing required columns in CSV: ${missingMandatoryHeaders.join(', ')}. Please ensure your CSV headers include all mandatory columns (case-insensitive).`);
          return;
        }
        let parsingErrors = [];
        const validFlights = results.data.map((row, rowIndex) => {
          const flight = {};
          let rowHasError = false;
          flightColumns.forEach(col => {
            const csvHeader = Object.keys(row).find(k => k.trim().toLowerCase() === col.name.toLowerCase());
            let value = csvHeader ? String(row[csvHeader]).trim() : null;
            if (!value) {
              parsingErrors.push(`Row ${rowIndex + 2}: Missing value for ${col.name}.`);
              rowHasError = true;
            }
            flight[col.name] = value;
          });
          return rowHasError ? null : flight;
        }).filter(flight => flight && flight.flight_type && flight.flight_date && flight.flight_time && flight.flight_code);
        if (parsingErrors.length > 0) {
          setFlightError(`Data parsing issues found:\n${parsingErrors.join('\n')}`);
          return;
        }
        if (validFlights.length === 0) {
          setFlightError('No valid flight data found after parsing. Check content, headers, and formats.');
          return;
        }
        setParsedFlights(validFlights);
        setFlightSuccessMessage(`Successfully parsed ${validFlights.length} flights. Review below and confirm to save to database.`);
      },
      error: (error) => {
        setFlightIsLoading(false);
        setFlightError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const handleConfirmFlightImport = async () => {
    if (parsedFlights.length === 0) {
      setFlightError('No flights to import. Please process a CSV first.');
      return;
    }
    setFlightIsLoading(true);
    setFlightError('');
    setFlightSuccessMessage('');
    setFlightImportSummary(null);
    let importedCount = 0;
    let errors = [];
    for (let i = 0; i < parsedFlights.length; i++) {
      const flight = parsedFlights[i];
      try {
        const response = await fetch('http://localhost:5000/api/flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flight),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          importedCount++;
        } else {
          errors.push({ row: i + 2, error: result.message || 'Unknown error' });
        }
      } catch (err) {
        errors.push({ row: i + 2, error: err.message });
      }
    }
    setFlightImportSummary({ importedCount, totalProcessed: parsedFlights.length, errors });
    if (importedCount > 0) {
      setFlightSuccessMessage(`Successfully imported ${importedCount} flights.`);
      setParsedFlights([]);
      setFlightCsvData('');
      setFlightFileName('');
    }
    if (errors.length > 0) {
      setFlightError(`Some flights could not be imported. See details below.`);
    }
    setFlightIsLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Import Groups</h2>

      {/* Instructions Section */}
      <div className="mb-8 p-6 bg-slate-50 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">CSV Import Instructions for Groups</h3>
        <p className="text-sm text-slate-600 mb-4">
          Prepare a CSV file (or paste CSV data). The first row must be the header row. 
          Mandatory columns: <strong>GroupName, ArrivalDate, DepartureDate</strong>. Column names are case-insensitive.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 mb-4">
          {groupColumns.map(col => (
            <li key={col.name}>
              <strong>{col.name}</strong>: {col.notes} (Example: <em>{col.example}</em>)
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500">
            Dates can be in DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, or Excel serial number format. Times HH:MM (24-hour). Numeric fields should be numbers. Empty optional fields will be treated as NULL.
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm" role="alert" dangerouslySetInnerHTML={{ __html: error.replace(/\n/g, '<br />') }}></div>}
      {successMessage && !error && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm" role="alert">{successMessage}</div>}
      
      {/* Display Import Summary from Backend */}
      {importSummary && (
        <div className={`mb-4 p-4 border rounded-md text-sm ${importSummary.errors && importSummary.errors.length > 0 && importSummary.successfullyImportedCount < importSummary.totalProcessed - (importSummary.skippedCount || 0) ? 'bg-yellow-50 border-yellow-300' : 'bg-sky-50 border-sky-300'}`}>
            <h4 className="font-semibold text-slate-700 mb-2">Import Process Summary:</h4>
            <p>Total groups in file: {importSummary.totalProcessed}</p>
            {importSummary.skippedCount > 0 && <p className="text-orange-600">Skipped due to missing mandatory fields: {importSummary.skippedCount}</p>}
            <p className="text-green-600">Successfully imported to database: {importSummary.importedCount}</p>
            
            {importSummary.errors && importSummary.errors.length > 0 && (
                <>
                    <p className="mt-2 font-medium text-red-600">Errors encountered for specific groups ({importSummary.errors.length}):</p>
                    <ul className="list-disc list-inside pl-5 text-red-500 text-xs max-h-32 overflow-y-auto">
                        {importSummary.errors.map((err, index) => (
                            <li key={index}>Group "{err.groupName || 'N/A'}": {err.error}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
      )}


      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Paste CSV Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <label htmlFor="csvPasteArea" className="block text-sm font-medium text-slate-700 mb-2">
            Paste CSV Data Here:
          </label>
          <textarea
            id="csvPasteArea"
            rows="10"
            className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50"
            placeholder={groupColumns.map(c => c.name).join(',')}
            value={csvData}
            onChange={handlePaste}
            disabled={isLoading && parsedGroups.length > 0} 
          ></textarea>
        </div>

        {/* Upload CSV File */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-center items-center">
          <label
            htmlFor="csvUpload"
            className={`relative rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 ${isLoading && parsedGroups.length > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div className="flex flex-col items-center justify-center p-6 border-2 border-slate-300 border-dashed rounded-md hover:border-sky-400 transition-colors">
                <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                <span className="mt-2 block text-sm text-slate-600">
                    {fileName ? `Selected: ${fileName}` : 'Click to upload a CSV file'}
                </span>
                <span className="text-xs text-slate-500">(or drag and drop)</span>
            </div>
            <input id="csvUpload" name="csvUpload" type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} disabled={isLoading && parsedGroups.length > 0} />
          </label>
          {fileName && <p className="mt-2 text-sm text-slate-500">File: {fileName}</p>}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={processImport}
          disabled={isLoading || !csvData.trim() || parsedGroups.length > 0}
          className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && !parsedGroups.length ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          Process CSV & Preview
        </button>
      </div>

      {/* Preview Section (if data is parsed) */}
      {parsedGroups.length > 0 && !error && (
        <div className="mt-8 p-6 bg-slate-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Parsed Groups Preview (First 5 Rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-200">
                <tr>
                  {groupColumns.map(col => <th key={col.name} className="px-4 py-2 text-left font-medium text-slate-600">{col.name}</th>)}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {parsedGroups.slice(0, 5).map((group, index) => (
                  <tr key={index}>
                    {groupColumns.map(col => {
                        const camelCaseKey = col.name.charAt(0).toLowerCase() + col.name.slice(1);
                        return (
                            <td key={`${index}-${col.name}`} className="px-4 py-2 whitespace-nowrap text-slate-700">
                                {String(group[camelCaseKey] === undefined || group[camelCaseKey] === null ? '' : group[camelCaseKey])}
                            </td>
                        );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedGroups.length > 5 && <p className="text-xs text-slate-500 mt-2">Showing first 5 of {parsedGroups.length} parsed groups.</p>}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleConfirmImport}
              disabled={isLoading}
              className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Importing...' : `Confirm & Import ${parsedGroups.length} Groups`}
            </button>
          </div>
        </div>
      )}

      {/* --- Flights Import Section --- */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Import Flights</h2>
        <div className="mb-8 p-6 bg-slate-50 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">CSV Import Instructions for Flights</h3>
          <p className="text-sm text-slate-600 mb-4">
            Prepare a CSV file (or paste CSV data). The first row must be the header row. 
            Mandatory columns: <strong>flight_type, flight_date, flight_time, flight_code</strong>. Column names are case-insensitive.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 mb-4">
            {flightColumns.map(col => (
              <li key={col.name}>
                <strong>{col.name}</strong>: {col.notes} (Example: <em>{col.example}</em>)
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500">
            Dates must be in YYYY-MM-DD format. Times HH:MM (24-hour). All fields are mandatory.
          </p>
        </div>
        {flightError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm" role="alert" dangerouslySetInnerHTML={{ __html: flightError.replace(/\n/g, '<br />') }}></div>}
        {flightSuccessMessage && !flightError && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm" role="alert">{flightSuccessMessage}</div>}
        {flightImportSummary && (
          <div className={`mb-4 p-4 border rounded-md text-sm ${flightImportSummary.errors && flightImportSummary.errors.length > 0 && flightImportSummary.importedCount < flightImportSummary.totalProcessed ? 'bg-yellow-50 border-yellow-300' : 'bg-sky-50 border-sky-300'}`}>
            <h4 className="font-semibold text-slate-700 mb-2">Import Process Summary:</h4>
            <p>Total flights in file: {flightImportSummary.totalProcessed}</p>
            <p className="text-green-600">Successfully imported to database: {flightImportSummary.importedCount}</p>
            {flightImportSummary.errors && flightImportSummary.errors.length > 0 && (
              <>
                <p className="mt-2 font-medium text-red-600">Errors encountered for specific rows ({flightImportSummary.errors.length}):</p>
                <ul className="list-disc list-inside pl-5 text-red-500 text-xs max-h-32 overflow-y-auto">
                  {flightImportSummary.errors.map((err, index) => (
                    <li key={index}>Row {err.row}: {err.error}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <label htmlFor="flightCsvPasteArea" className="block text-sm font-medium text-slate-700 mb-2">
              Paste CSV Data Here:
            </label>
            <textarea
              id="flightCsvPasteArea"
              rows="10"
              className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:bg-slate-50"
              placeholder={flightColumns.map(c => c.name).join(',')}
              value={flightCsvData}
              onChange={handleFlightPaste}
              disabled={flightIsLoading && parsedFlights.length > 0}
            ></textarea>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-center items-center">
            <label
              htmlFor="flightCsvUpload"
              className={`relative rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 ${flightIsLoading && parsedFlights.length > 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="flex flex-col items-center justify-center p-6 border-2 border-slate-300 border-dashed rounded-md hover:border-sky-400 transition-colors">
                <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                <span className="mt-2 block text-sm text-slate-600">
                  {flightFileName ? `Selected: ${flightFileName}` : 'Click to upload a CSV file'}
                </span>
                <span className="text-xs text-slate-500">(or drag and drop)</span>
              </div>
              <input id="flightCsvUpload" name="flightCsvUpload" type="file" className="sr-only" accept=".csv" onChange={handleFlightFileUpload} disabled={flightIsLoading && parsedFlights.length > 0} />
            </label>
            {flightFileName && <p className="mt-2 text-sm text-slate-500">File: {flightFileName}</p>}
          </div>
        </div>
        <div className="flex justify-end mb-6">
          <button
            onClick={processFlightImport}
            disabled={flightIsLoading || !flightCsvData.trim() || parsedFlights.length > 0}
            className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {flightIsLoading && !parsedFlights.length ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Process CSV & Preview
          </button>
        </div>
        {parsedFlights.length > 0 && !flightError && (
          <div className="mt-8 p-6 bg-slate-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Parsed Flights Preview (First 5 Rows)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-200">
                  <tr>
                    {flightColumns.map(col => <th key={col.name} className="px-4 py-2 text-left font-medium text-slate-600">{col.name}</th>)}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {parsedFlights.slice(0, 5).map((flight, index) => (
                    <tr key={index}>
                      {flightColumns.map(col => (
                        <td key={`${index}-${col.name}`} className="px-4 py-2 whitespace-nowrap text-slate-700">
                          {String(flight[col.name] === undefined || flight[col.name] === null ? '' : flight[col.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedFlights.length > 5 && <p className="text-xs text-slate-500 mt-2">Showing first 5 of {parsedFlights.length} parsed flights.</p>}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleConfirmFlightImport}
                disabled={flightIsLoading}
                className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {flightIsLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {flightIsLoading ? 'Importing...' : `Confirm & Import ${parsedFlights.length} Flights`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportPage;
