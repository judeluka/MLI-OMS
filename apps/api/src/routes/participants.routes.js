const express = require('express');
const router = express.Router();
const participantsController = require('../controllers/participants.controller');

// Participant routes
router.get('/', participantsController.getAllParticipants);
router.post('/', participantsController.createParticipant);
router.get('/:id', participantsController.getParticipantById);
router.put('/:id', participantsController.updateParticipant);
router.delete('/:id', participantsController.deleteParticipant);

module.exports = router; 