const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groups.controller');

// Group routes
router.post('/import', groupsController.importGroups);
router.get('/', groupsController.getAllGroups);
router.post('/', groupsController.createGroup);
router.get('/sales-grid-groups', groupsController.getSalesGridGroups);
router.get('/:groupId', groupsController.getGroupById);
router.put('/:groupId', groupsController.updateGroup);
router.delete('/:groupId', groupsController.deleteGroup);

// Group flights
router.post('/:groupId/flights', groupsController.addFlightToGroup);
router.delete('/:groupId/flights/:flightId', groupsController.removeFlightFromGroup);

// Group participants  
router.get('/:groupId/participants', groupsController.getGroupParticipants);

// Group transfers
router.get('/:groupId/transfers', groupsController.getGroupTransfers);
router.post('/:groupId/transfers', groupsController.assignTransferToGroup);
router.put('/:groupId/transfers/:assignmentId', groupsController.updateGroupTransferAssignment);
router.delete('/:groupId/transfers/:assignmentId', groupsController.removeTransferFromGroup);

module.exports = router; 