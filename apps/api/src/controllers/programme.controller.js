const programmeService = require('../services/programme.service');

const saveProgrammeSlot = async (req, res) => {
  const { groupId, date, slotType, description, viewType } = req.body;
  
  if (!groupId || !date || !slotType || !viewType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: groupId, date, slotType, viewType.' 
    });
  }

  try {
    const result = await programmeService.saveProgrammeSlot(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error saving programme slot:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to save programme slot.' });
  }
};

const getGroupProgramme = async (req, res) => {
  const { groupId } = req.params;
  const { viewType = 'classes' } = req.query;
  
  try {
    const programme = await programmeService.getGroupProgramme(groupId, viewType);
    res.status(200).json({ success: true, programme });
  } catch (err) {
    console.error(`Error fetching programme for group ${groupId}:`, err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch group programme.' });
  }
};

const getCentreProgrammeSlots = async (req, res) => {
  const { centreName } = req.params;
  const { viewType = 'classes' } = req.query;
  
  if (!centreName) {
    return res.status(400).json({ success: false, message: 'Centre name is required.' });
  }

  try {
    const slots = await programmeService.getCentreProgrammeSlots(centreName, viewType);
    res.status(200).json({ success: true, slots });
  } catch (err) {
    console.error('Error fetching programme slots for centre:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch programme slots for centre.' });
  }
};

module.exports = {
  saveProgrammeSlot,
  getGroupProgramme,
  getCentreProgrammeSlots
}; 