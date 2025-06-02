const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activities.controller');

// Activity routes
router.get('/', activitiesController.getAllActivities);
router.post('/', activitiesController.createActivity);
router.get('/:activityId', activitiesController.getActivityById);
router.put('/:activityId', activitiesController.updateActivity);
router.get('/:activityId/participation', activitiesController.getActivityParticipation);

module.exports = router; 