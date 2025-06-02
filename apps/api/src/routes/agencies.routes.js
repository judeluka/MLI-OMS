const express = require('express');
const router = express.Router();
const agenciesController = require('../controllers/agencies.controller');

// Agency routes
router.get('/', agenciesController.getAllAgencies);

module.exports = router; 