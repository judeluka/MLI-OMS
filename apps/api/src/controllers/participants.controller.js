const participantsService = require('../services/participants.service');

const getAllParticipants = async (req, res) => {
  try {
    const participants = await participantsService.getAllParticipants(req.query);
    res.status(200).json({ success: true, participants });
  } catch (err) {
    console.error('Error fetching participants:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch participants.' });
  }
};

const createParticipant = async (req, res) => {
  try {
    const participant = await participantsService.createParticipant(req.body);
    res.status(201).json({ success: true, message: 'Participant created successfully.', participant });
  } catch (err) {
    console.error('Error creating participant:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create participant.' });
  }
};

const getParticipantById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const participant = await participantsService.getParticipantById(id);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }
    res.status(200).json({ success: true, participant });
  } catch (err) {
    console.error('Error fetching participant:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch participant.' });
  }
};

const updateParticipant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const participant = await participantsService.updateParticipant(id, req.body);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }
    res.status(200).json({ success: true, message: 'Participant updated successfully.', participant });
  } catch (err) {
    console.error('Error updating participant:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update participant.' });
  }
};

const deleteParticipant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await participantsService.deleteParticipant(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting participant:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to delete participant.' });
  }
};

module.exports = {
  getAllParticipants,
  createParticipant,
  getParticipantById,
  updateParticipant,
  deleteParticipant
}; 