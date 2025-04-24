/**
 * Card reader API routes
 */
const express = require('express');
const router = express.Router();
const cardReaderController = require('../controllers/card-reader-controller');

// Get card reader status
router.get('/status', cardReaderController.getStatus);

// Get available serial ports
router.get('/ports', cardReaderController.getPorts);

// Connect to card reader
router.post('/connect', cardReaderController.connect);

// Disconnect from card reader
router.post('/disconnect', cardReaderController.disconnect);

// Reset card reader
router.post('/reset', cardReaderController.resetReader);

// Simulate card scan
router.post('/simulate-scan', cardReaderController.simulateScan);

// SSE endpoint for real-time events
router.get('/events', cardReaderController.events);

module.exports = router; 