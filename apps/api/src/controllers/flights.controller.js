const flightsService = require('../services/flights.service');

const getAllFlights = async (req, res) => {
  try {
    const flights = await flightsService.getAllFlights();
    res.status(200).json({ success: true, flights });
  } catch (err) {
    console.error('Error fetching flights:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch flights.' });
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await flightsService.createFlight(req.body);
    res.status(201).json({ success: true, message: 'Flight created successfully.', flight });
  } catch (err) {
    console.error('Error creating flight:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create flight.' });
  }
};

const getFlightById = async (req, res) => {
  const { flightId } = req.params;
  
  try {
    const flight = await flightsService.getFlightById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }
    res.status(200).json({ success: true, flight });
  } catch (err) {
    console.error('Error fetching flight:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch flight.' });
  }
};

const updateFlight = async (req, res) => {
  const { flightId } = req.params;
  
  try {
    const flight = await flightsService.updateFlight(flightId, req.body);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found.' });
    }
    res.status(200).json({ success: true, message: 'Flight updated successfully.', flight });
  } catch (err) {
    console.error('Error updating flight:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update flight.' });
  }
};

const getFlightGroups = async (req, res) => {
  const { flightId } = req.params;
  
  try {
    const groups = await flightsService.getFlightGroups(flightId);
    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error('Error fetching flight groups:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch flight groups.' });
  }
};

module.exports = {
  getAllFlights,
  createFlight,
  getFlightById,
  updateFlight,
  getFlightGroups
}; 