const transfersService = require('../services/transfers.service');

const getAllTransfers = async (req, res) => {
  try {
    const transfers = await transfersService.getAllTransfers();
    res.status(200).json({ success: true, transfers });
  } catch (err) {
    console.error('Error fetching transfers:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch transfers.' });
  }
};

const createTransfer = async (req, res) => {
  try {
    const transfer = await transfersService.createTransfer(req.body);
    res.status(201).json({ success: true, message: 'Transfer created successfully.', transfer });
  } catch (err) {
    console.error('Error creating transfer:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to create transfer.' });
  }
};

const getTransportTransfers = async (req, res) => {
  try {
    const transfers = await transfersService.getTransportTransfers();
    res.status(200).json({ success: true, transfers });
  } catch (err) {
    console.error('Error fetching transport transfers:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch transport transfers.' });
  }
};

const getTransferById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const transfer = await transfersService.getTransferById(id);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found.' });
    }
    res.status(200).json({ success: true, transfer });
  } catch (err) {
    console.error('Error fetching transfer:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch transfer.' });
  }
};

const updateTransfer = async (req, res) => {
  const { id } = req.params;
  
  try {
    const transfer = await transfersService.updateTransfer(id, req.body);
    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found.' });
    }
    res.status(200).json({ success: true, message: 'Transfer updated successfully.', transfer });
  } catch (err) {
    console.error('Error updating transfer:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update transfer.' });
  }
};

const deleteTransfer = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await transfersService.deleteTransfer(id);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Transfer not found.' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting transfer:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to delete transfer.' });
  }
};

module.exports = {
  getAllTransfers,
  createTransfer,
  getTransportTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer
}; 