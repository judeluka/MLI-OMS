const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const groupRoutes = require('./groups.routes');
const programmeRoutes = require('./programme.routes');
const activityRoutes = require('./activities.routes');
const flightRoutes = require('./flights.routes');
const participantRoutes = require('./participants.routes');
const transferRoutes = require('./transfers.routes');
const agencyRoutes = require('./agencies.routes');
const centreRoutes = require('./centres.routes');
const staffRoutes = require('./staff.routes');

// Root route
router.get('/', (req, res) => {
  res.send('Server is running.');
});

// Use route modules
router.use('/', authRoutes);
router.use('/api/groups', groupRoutes);
router.use('/api', programmeRoutes);
router.use('/api/activities', activityRoutes);
router.use('/api/flights', flightRoutes);
router.use('/api/participants', participantRoutes);
router.use('/api/transfers', transferRoutes);
router.use('/api/agencies', agencyRoutes);
router.use('/api/centres', centreRoutes);
router.use('/api/staff', staffRoutes);

module.exports = router; 