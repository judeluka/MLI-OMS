const express = require('express');
const router = express.Router();
const transfersController = require('../controllers/transfers.controller');

// Transfer routes
router.get('/', transfersController.getAllTransfers);
router.post('/', transfersController.createTransfer);
router.get('/transport-transfers', transfersController.getTransportTransfers);
router.get('/:id', transfersController.getTransferById);
router.put('/:id', transfersController.updateTransfer);
router.delete('/:id', transfersController.deleteTransfer);

module.exports = router; 