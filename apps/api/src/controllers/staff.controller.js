const staffService = require('../services/staff.service');

const getAllStaff = async (req, res) => {
  try {
    const staff = await staffService.getAllStaff();
    res.status(200).json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch staff.' });
  }
};

const createStaff = async (req, res) => {
  try {
    const staff = await staffService.createStaff(req.body);
    res.status(201).json({ success: true, message: 'Staff created successfully.', staff });
  } catch (err) {
    console.error('Error creating staff:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create staff.' });
  }
};

const getAccommodationAssignments = async (req, res) => {
  try {
    const assignments = await staffService.getAccommodationAssignments();
    res.status(200).json({ success: true, assignments });
  } catch (err) {
    console.error('Error fetching accommodation assignments:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch accommodation assignments.' });
  }
};

const getStaffById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const staff = await staffService.getStaffById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }
    res.status(200).json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch staff.' });
  }
};

const updateStaff = async (req, res) => {
  const { id } = req.params;
  
  try {
    const staff = await staffService.updateStaff(id, req.body);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }
    res.status(200).json({ success: true, message: 'Staff updated successfully.', staff });
  } catch (err) {
    console.error('Error updating staff:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update staff.' });
  }
};

const deleteStaff = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await staffService.deleteStaff(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting staff:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to delete staff.' });
  }
};

const getStaffAccommodationAssignments = async (req, res) => {
  const { id } = req.params;
  
  try {
    const assignments = await staffService.getStaffAccommodationAssignments(id);
    res.status(200).json({ success: true, assignments });
  } catch (err) {
    console.error('Error fetching staff accommodation assignments:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch staff accommodation assignments.' });
  }
};

const getStaffWorkAssignments = async (req, res) => {
  const { id } = req.params;
  
  try {
    const assignments = await staffService.getStaffWorkAssignments(id);
    res.status(200).json({ success: true, assignments });
  } catch (err) {
    console.error('Error fetching staff work assignments:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch staff work assignments.' });
  }
};

const getStaffDocuments = async (req, res) => {
  const { id } = req.params;
  
  try {
    const documents = await staffService.getStaffDocuments(id);
    res.status(200).json({ success: true, documents });
  } catch (err) {
    console.error('Error fetching staff documents:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch staff documents.' });
  }
};

const createStaffWorkAssignment = async (req, res) => {
  const { id } = req.params;
  
  try {
    const assignment = await staffService.createStaffWorkAssignment(id, req.body);
    res.status(201).json({ success: true, message: 'Work assignment created successfully.', assignment });
  } catch (err) {
    console.error('Error creating staff work assignment:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create staff work assignment.' });
  }
};

const createStaffAccommodationAssignment = async (req, res) => {
  const { id } = req.params;
  
  try {
    const assignment = await staffService.createStaffAccommodationAssignment(id, req.body);
    res.status(201).json({ success: true, message: 'Accommodation assignment created successfully.', assignment });
  } catch (err) {
    console.error('Error creating staff accommodation assignment:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create staff accommodation assignment.' });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  getAccommodationAssignments,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffAccommodationAssignments,
  getStaffWorkAssignments,
  getStaffDocuments,
  createStaffWorkAssignment,
  createStaffAccommodationAssignment
}; 