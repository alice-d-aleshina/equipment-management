/**
 * Card reader controller
 * 
 * Handles API endpoints for interacting with the card reader service
 */
const CardReaderService = require('../services/card-reader-service');
const logger = require('../utils/logger');

// Singleton instance of the card reader service
const cardReaderService = new CardReaderService();

/**
 * Get the status of the card reader
 */
exports.getStatus = async (req, res) => {
  try {
    const status = {
      connected: cardReaderService.isConnected(),
      status: cardReaderService.getLastStatus(),
      cardPresent: cardReaderService.isCardPresent(),
      cardId: cardReaderService.getLastCardId(),
      cardType: cardReaderService.getLastCardType(),
      uptime: cardReaderService.getUptime(),
    };
    
    return res.json(status);
  } catch (error) {
    logger.error('Error getting card reader status', error);
    return res.status(500).json({ error: 'Failed to get card reader status' });
  }
};

/**
 * Get a list of available serial ports
 */
exports.getPorts = async (req, res) => {
  try {
    const ports = await cardReaderService.listPorts();
    return res.json(ports);
  } catch (error) {
    logger.error('Error listing serial ports', error);
    return res.status(500).json({ error: 'Failed to list serial ports' });
  }
};

/**
 * Connect to the card reader on a specific port
 */
exports.connect = async (req, res) => {
  try {
    const { port } = req.body;
    
    if (!port) {
      return res.status(400).json({ error: 'Port is required' });
    }
    
    // If already connected, disconnect first
    if (cardReaderService.isConnected()) {
      await cardReaderService.disconnect();
    }
    
    // Connect to the specified port
    const connected = await cardReaderService.connect(port);
    
    return res.json({
      connected,
      status: cardReaderService.getLastStatus()
    });
  } catch (error) {
    logger.error('Error connecting to card reader', error);
    return res.status(500).json({ error: `Failed to connect to card reader: ${error.message}` });
  }
};

/**
 * Disconnect from the card reader
 */
exports.disconnect = async (req, res) => {
  try {
    await cardReaderService.disconnect();
    
    return res.json({
      connected: false,
      status: 'Disconnected'
    });
  } catch (error) {
    logger.error('Error disconnecting from card reader', error);
    return res.status(500).json({ error: 'Failed to disconnect from card reader' });
  }
};

/**
 * Reset the card reader
 */
exports.resetReader = async (req, res) => {
  try {
    if (!cardReaderService.isConnected()) {
      return res.status(400).json({ error: 'Card reader is not connected' });
    }
    
    await cardReaderService.sendCommand('reset');
    
    return res.json({
      success: true,
      message: 'Reset command sent to card reader'
    });
  } catch (error) {
    logger.error('Error resetting card reader', error);
    return res.status(500).json({ error: 'Failed to reset card reader' });
  }
};

/**
 * Simulate a card scan
 */
exports.simulateScan = async (req, res) => {
  try {
    const { cardId } = req.body;
    
    if (!cardId) {
      return res.status(400).json({ error: 'Card ID is required' });
    }
    
    if (!cardReaderService.isConnected()) {
      return res.status(400).json({ error: 'Card reader is not connected' });
    }
    
    await cardReaderService.simulateCardScan(cardId);
    
    return res.json({
      success: true,
      message: 'Card scan simulated',
      cardId
    });
  } catch (error) {
    logger.error('Error simulating card scan', error);
    return res.status(500).json({ error: 'Failed to simulate card scan' });
  }
};

/**
 * Handle long polling for card reader events
 */
exports.events = async (req, res) => {
  try {
    // Set timeout for the request (30 seconds)
    req.setTimeout(30000);
    
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Function to send SSE
    const sendEvent = (eventType, data) => {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    // Send initial status
    sendEvent('status', {
      connected: cardReaderService.isConnected(),
      status: cardReaderService.getLastStatus(),
      cardPresent: cardReaderService.isCardPresent(),
      cardId: cardReaderService.getLastCardId(),
      cardType: cardReaderService.getLastCardType()
    });
    
    // Set up event listeners
    const statusListener = (status) => {
      sendEvent('status', { status });
    };
    
    const cardPresentListener = (cardData) => {
      sendEvent('card_present', cardData);
    };
    
    const cardRemovedListener = () => {
      sendEvent('card_removed', { timestamp: Date.now() });
    };
    
    const errorListener = (error) => {
      sendEvent('error', { message: error.message });
    };
    
    // Register event listeners
    cardReaderService.on('status', statusListener);
    cardReaderService.on('cardPresent', cardPresentListener);
    cardReaderService.on('cardRemoved', cardRemovedListener);
    cardReaderService.on('error', errorListener);
    
    // Handle client disconnect
    req.on('close', () => {
      // Remove event listeners
      cardReaderService.removeListener('status', statusListener);
      cardReaderService.removeListener('cardPresent', cardPresentListener);
      cardReaderService.removeListener('cardRemoved', cardRemovedListener);
      cardReaderService.removeListener('error', errorListener);
    });
  } catch (error) {
    logger.error('Error setting up event stream', error);
    return res.status(500).json({ error: 'Failed to set up event stream' });
  }
}; 