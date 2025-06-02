const express = require('express');
const router = express.Router();
const centresController = require('../controllers/centres.controller');

// Centre routes
router.get('/', centresController.getAllCentres);
router.post('/', centresController.createCentre);
router.get('/occupancy', centresController.getCentreOccupancy);
router.put('/:id', centresController.updateCentre);
router.delete('/:id', centresController.deleteCentre);

module.exports = router; 