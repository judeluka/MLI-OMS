const express = require('express');
const router = express.Router();
const programmeController = require('../controllers/programme.controller');

// Programme routes
router.post('/programme-slot', programmeController.saveProgrammeSlot);
router.get('/groups/:groupId/programme', programmeController.getGroupProgramme);
router.get('/centres/:centreName/programme-slots', programmeController.getCentreProgrammeSlots);

module.exports = router; 