const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flights.controller');

// Flight routes
router.get('/', flightsController.getAllFlights);
router.post('/', flightsController.createFlight);
router.get('/:flightId', flightsController.getFlightById);
router.put('/:flightId', flightsController.updateFlight);
router.get('/:flightId/groups', flightsController.getFlightGroups);

module.exports = router; 