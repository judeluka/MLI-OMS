const centresService = require('../services/centres.service');

const getAllCentres = async (req, res) => {
  try {
    const centres = await centresService.getAllCentres();
    res.status(200).json({ success: true, centres });
  } catch (err) {
    console.error('Error fetching centres:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch centres.' });
  }
};

const createCentre = async (req, res) => {
  try {
    const centre = await centresService.createCentre(req.body);
    res.status(201).json({ success: true, message: 'Centre created successfully.', centre });
  } catch (err) {
    console.error('Error creating centre:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create centre.' });
  }
};

const getCentreOccupancy = async (req, res) => {
  try {
    const occupancy = await centresService.getCentreOccupancy();
    res.status(200).json({ success: true, occupancy });
  } catch (err) {
    console.error('Error fetching centre occupancy:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch centre occupancy.' });
  }
};

const updateCentre = async (req, res) => {
  const { id } = req.params;
  
  try {
    const centre = await centresService.updateCentre(id, req.body);
    if (!centre) {
      return res.status(404).json({ success: false, message: 'Centre not found.' });
    }
    res.status(200).json({ success: true, message: 'Centre updated successfully.', centre });
  } catch (err) {
    console.error('Error updating centre:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update centre.' });
  }
};

const deleteCentre = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await centresService.deleteCentre(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Centre not found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting centre:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to delete centre.' });
  }
};

module.exports = {
  getAllCentres,
  createCentre,
  getCentreOccupancy,
  updateCentre,
  deleteCentre
}; 