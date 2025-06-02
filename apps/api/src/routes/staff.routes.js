const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

// Staff routes
router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.get('/accommodation-assignments', staffController.getAccommodationAssignments);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);
router.get('/:id/accommodation-assignments', staffController.getStaffAccommodationAssignments);
router.get('/:id/work-assignments', staffController.getStaffWorkAssignments);
router.get('/:id/documents', staffController.getStaffDocuments);
router.post('/:id/work-assignments', staffController.createStaffWorkAssignment);
router.post('/:id/accommodation-assignments', staffController.createStaffAccommodationAssignment);

module.exports = router; 