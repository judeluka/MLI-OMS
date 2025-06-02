const agenciesService = require('../services/agencies.service');

const getAllAgencies = async (req, res) => {
  try {
    const agencies = await agenciesService.getAllAgencies();
    res.status(200).json({ success: true, agencies });
  } catch (err) {
    console.error('Error fetching agencies:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch agencies.' });
  }
};

module.exports = {
  getAllAgencies
}; 