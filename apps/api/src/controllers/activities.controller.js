const activitiesService = require('../services/activities.service');

const getAllActivities = async (req, res) => {
  try {
    const activities = await activitiesService.getAllActivities();
    res.status(200).json({ success: true, activities });
  } catch (err) {
    console.error('Error fetching activities:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch activities.' });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = await activitiesService.createActivity(req.body);
    res.status(201).json({ success: true, message: 'Activity created successfully.', activity });
  } catch (err) {
    console.error('Error creating activity:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create activity.' });
  }
};

const getActivityById = async (req, res) => {
  const { activityId } = req.params;
  
  try {
    const activity = await activitiesService.getActivityById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    res.status(200).json({ success: true, activity });
  } catch (err) {
    console.error('Error fetching activity:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch activity.' });
  }
};

const updateActivity = async (req, res) => {
  const { activityId } = req.params;
  
  try {
    const activity = await activitiesService.updateActivity(activityId, req.body);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    res.status(200).json({ success: true, message: 'Activity updated successfully.', activity });
  } catch (err) {
    console.error('Error updating activity:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update activity.' });
  }
};

const getActivityParticipation = async (req, res) => {
  const { activityId } = req.params;
  
  try {
    const participation = await activitiesService.getActivityParticipation(activityId);
    res.status(200).json({ success: true, participation });
  } catch (err) {
    console.error('Error fetching activity participation:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch activity participation.' });
  }
};

module.exports = {
  getAllActivities,
  createActivity,
  getActivityById,
  updateActivity,
  getActivityParticipation
}; 