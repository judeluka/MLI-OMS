const groupsService = require('../services/groups.service');

const importGroups = async (req, res) => {
  try {
    const result = await groupsService.importGroups(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in importGroups controller:', err.stack);
    res.status(500).json({ success: false, message: 'Import transaction failed.' });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await groupsService.getAllGroups();
    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error('Error fetching groups:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch groups.' });
  }
};

const getGroupById = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const group = await groupsService.getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    res.status(200).json({ success: true, group });
  } catch (err) {
    console.error('Error fetching group details:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch group details.' });
  }
};

const createGroup = async (req, res) => {
  const {
    groupName, agency, arrivalDate, departureDate,
    studentAllocation, leaderAllocation, centre,
    studentBookings, leaderBookings
  } = req.body;

  if (!groupName || !arrivalDate || !departureDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: GroupName, ArrivalDate, DepartureDate.' 
    });
  }

  try {
    const newGroup = await groupsService.createGroup(req.body);
    res.status(201).json({
      success: true,
      message: 'Group created successfully.',
      group: newGroup
    });
  } catch (err) {
    console.error('Error creating group:', err.stack);
    if (err.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        message: `Failed to create group. A group with the name "${groupName}" likely already exists.` 
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create group.' });
  }
};

const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const {
    groupName, agency, arrivalDate, departureDate,
    studentAllocation, leaderAllocation, centre,
    studentBookings, leaderBookings
  } = req.body;

  if (!groupName || !arrivalDate || !departureDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: GroupName, ArrivalDate, DepartureDate.' 
    });
  }
  
  if (isNaN(parseInt(groupId, 10))) {
    return res.status(400).json({ success: false, message: 'Invalid Group ID.' });
  }

  try {
    const updatedGroup = await groupsService.updateGroup(groupId, req.body);
    if (!updatedGroup) {
      return res.status(404).json({ success: false, message: 'Group not found or no changes made.' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Group updated successfully.',
      group: updatedGroup
    });
  } catch (err) {
    console.error('Error updating group:', err.stack);
    if (err.code === '23505') {
      return res.status(409).json({ 
        success: false, 
        message: `Failed to update group. Another group with the name "${groupName}" may already exist.` 
      });
    }
    res.status(500).json({ success: false, message: 'Failed to update group.' });
  }
};

const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  if (isNaN(parseInt(groupId, 10))) {
    return res.status(400).json({ success: false, message: 'Invalid Group ID.' });
  }

  try {
    const result = await groupsService.deleteGroup(groupId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error('Error deleting group:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to delete group.' });
  }
};

const addFlightToGroup = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const result = await groupsService.addFlightToGroup(groupId, req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding flight to group:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to add flight to group.' });
  }
};

const removeFlightFromGroup = async (req, res) => {
  const { groupId, flightId } = req.params;
  
  try {
    const result = await groupsService.removeFlightFromGroup(groupId, flightId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error removing flight from group:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to remove flight from group.' });
  }
};

const getGroupParticipants = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const participants = await groupsService.getGroupParticipants(groupId);
    res.status(200).json({ success: true, participants });
  } catch (err) {
    console.error('Error fetching group participants:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch group participants.' });
  }
};

const getGroupTransfers = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const transfers = await groupsService.getGroupTransfers(groupId);
    res.status(200).json({ success: true, transfers });
  } catch (err) {
    console.error('Error fetching group transfers:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch group transfers.' });
  }
};

const assignTransferToGroup = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const result = await groupsService.assignTransferToGroup(groupId, req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error assigning transfer to group:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to assign transfer to group.' });
  }
};

const updateGroupTransferAssignment = async (req, res) => {
  const { groupId, assignmentId } = req.params;
  
  try {
    const result = await groupsService.updateGroupTransferAssignment(groupId, assignmentId, req.body);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error updating group transfer assignment:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update transfer assignment.' });
  }
};

const removeTransferFromGroup = async (req, res) => {
  const { groupId, assignmentId } = req.params;
  
  try {
    const result = await groupsService.removeTransferFromGroup(groupId, assignmentId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error removing transfer from group:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to remove transfer from group.' });
  }
};

const getSalesGridGroups = async (req, res) => {
  try {
    const groups = await groupsService.getSalesGridGroups();
    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error('Error fetching sales grid groups:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch sales grid groups.' });
  }
};

module.exports = {
  importGroups,
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addFlightToGroup,
  removeFlightFromGroup,
  getGroupParticipants,
  getGroupTransfers,
  assignTransferToGroup,
  updateGroupTransferAssignment,
  removeTransferFromGroup,
  getSalesGridGroups
}; 