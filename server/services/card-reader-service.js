let SerialPort;
let ReadlineParser;
let isSerialPortAvailable = true;

try {
  const serialport = require('serialport');
  SerialPort = serialport.SerialPort;
  ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
} catch (error) {
  console.warn('SerialPort module not available:', error.message);
  isSerialPortAvailable = false;
}

const { EventEmitter } = require('events');
const logger = require('../utils/logger');

/**
 * CardReaderService - Handles communication with the Arduino RFID card reader
 * This service manages the serial connection to the Arduino and processes
 * the card read events.
 */
class CardReaderService extends EventEmitter {
  constructor() {
    super();
    
    if (!isSerialPortAvailable) {
      this.mockImplementation();
      return;
    }
    
    this.port = null;
    this.parser = null;
    this.connected = false;
    this.lastStatus = { connected: false, message: 'Not connected' };
    this.statusInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
    this.autoConnect = true;
    this.cardData = {};
  }
  
  /**
   * Provide mock implementation when serialport is not available
   */
  mockImplementation() {
    console.log('Using mock implementation for CardReaderService');
    this.connected = false;
    this.lastStatus = { connected: false, message: 'SerialPort not available' };
    this.cardData = {};
    
    // Mock methods
    this.isConnected = () => false;
    this.getLastStatus = () => this.lastStatus;
    this.isCardPresent = () => false;
    this.getLastCardId = () => null;
    this.getLastCardType = () => null;
    this.getUptime = () => 0;
    this.connect = () => false;
    this.listPorts = async () => [];
    this.findAndConnect = async () => console.log('Mock: findAndConnect called');
    this.disconnect = () => console.log('Mock: disconnect called');
    this.resetReader = () => console.log('Mock: resetReader called');
    this.getStatus = () => this.lastStatus;
  }

  /**
   * Initialize the card reader service
   */
  init() {
    if (!isSerialPortAvailable) {
      logger.warn('Card reader service initialized in mock mode');
      return this;
    }
    
    logger.info('Initializing card reader service');
    
    // Try to find and connect to the Arduino
    if (this.autoConnect) {
      this.findAndConnect();
    }
    
    // Set up status checking interval
    this.statusInterval = setInterval(() => {
      this.checkStatus();
    }, 10000); // Check status every 10 seconds
    
    return this;
  }

  /**
   * Find available serial ports
   * @returns {Promise<Array>} List of available ports
   */
  async listPorts() {
    if (!isSerialPortAvailable) {
      return [];
    }
    
    try {
      const ports = await SerialPort.list();
      logger.info(`Found ${ports.length} serial ports`);
      return ports;
    } catch (error) {
      logger.error('Error listing serial ports:', error);
      return [];
    }
  }

  /**
   * Find the Arduino card reader and connect to it
   */
  async findAndConnect() {
    try {
      const ports = await this.listPorts();
      
      // Try to find Arduino by manufacturer or other identifiers
      // This is a simple example - you may need more sophisticated detection
      const arduinoPort = ports.find(port => 
        (port.manufacturer && port.manufacturer.includes('Arduino')) ||
        (port.vendorId && port.vendorId.toLowerCase().includes('2341'))
      );
      
      if (arduinoPort) {
        logger.info(`Found Arduino on port ${arduinoPort.path}`);
        this.connect(arduinoPort.path);
      } else {
        logger.warn('No Arduino device found. Available ports:', ports);
      }
    } catch (error) {
      logger.error('Error finding Arduino:', error);
    }
  }

  /**
   * Connect to a specific serial port
   * @param {string} path - Path to the serial port
   */
  connect(path) {
    if (!isSerialPortAvailable) {
      logger.warn('Cannot connect - SerialPort module not available');
      return false;
    }
    
    if (this.connected) {
      this.disconnect();
    }

    logger.info(`Connecting to card reader on ${path}`);
    
    try {
      this.port = new SerialPort({
        path,
        baudRate: 9600,
        autoOpen: false
      });
      
      this.port.open(err => {
        if (err) {
          this.lastStatus = { 
            connected: false, 
            message: `Error opening port: ${err.message}` 
          };
          logger.error('Error opening serial port:', err);
          this.emit('error', err);
          return;
        }
        
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
        this.setupListeners();
        
        // Send initial command to verify connection
        setTimeout(() => {
          this.sendCommand('status');
        }, 1000);
      });
      
      return true;
    } catch (error) {
      this.lastStatus = { 
        connected: false, 
        message: `Connection error: ${error.message}` 
      };
      logger.error('Error connecting to serial port:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Disconnect from the serial port
   */
  disconnect() {
    if (this.port && this.port.isOpen) {
      logger.info('Disconnecting from card reader');
      this.port.close();
    }
    
    this.connected = false;
    this.lastStatus = { connected: false, message: 'Disconnected' };
    this.port = null;
    this.parser = null;
    this.emit('disconnected');
  }

  /**
   * Set up event listeners for the serial port
   */
  setupListeners() {
    if (!this.port || !this.parser) {
      return;
    }
    
    // Handle data received from Arduino
    this.parser.on('data', data => {
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(data.trim());
        this.handleMessage(jsonData);
      } catch (error) {
        // If not JSON, handle as plain text
        logger.debug(`Raw data from card reader: ${data}`);
      }
    });
    
    // Handle port opening
    this.port.on('open', () => {
      logger.info('Serial port opened');
      this.connected = true;
      this.lastStatus = { connected: true, message: 'Connected' };
      this.reconnectAttempts = 0;
      this.emit('connected');
    });
    
    // Handle port closing
    this.port.on('close', () => {
      logger.info('Serial port closed');
      this.connected = false;
      this.lastStatus = { connected: false, message: 'Port closed' };
      this.emit('disconnected');
      
      // Try to reconnect if not explicitly disconnected
      if (this.autoConnect) {
        this.scheduleReconnect();
      }
    });
    
    // Handle errors
    this.port.on('error', (error) => {
      logger.error('Serial port error:', error);
      this.lastStatus = { connected: false, message: `Error: ${error.message}` };
      this.emit('error', error);
      
      // Try to reconnect on error
      if (this.autoConnect) {
        this.scheduleReconnect();
      }
    });
  }

  /**
   * Handle messages received from the Arduino
   * @param {Object} message - The parsed JSON message
   */
  handleMessage(message) {
    logger.debug('Message from card reader:', message);
    
    // Handle different message types
    switch (message.type) {
      case 'status':
        this.updateStatus(message);
        break;
        
      case 'card_present':
        this.handleCardPresent(message);
        break;
        
      case 'card_removed':
        this.handleCardRemoved(message);
        break;
        
      case 'error':
        logger.error('Card reader error:', message.message);
        this.lastStatus = { 
          connected: true, 
          message: `Reader error: ${message.message}` 
        };
        this.emit('reader_error', message);
        break;
        
      default:
        logger.debug('Unknown message type:', message.type);
    }
  }

  /**
   * Update status based on Arduino message
   * @param {Object} message - Status message from Arduino
   */
  updateStatus(message) {
    this.connected = true;
    this.lastStatus = { 
      connected: true, 
      message: message.message || 'Connected',
      firmware: message.firmware,
      uptime: message.uptime
    };
    this.emit('status_updated', this.lastStatus);
  }

  /**
   * Handle card present event
   * @param {Object} message - Card data message
   */
  handleCardPresent(message) {
    // Store card data
    this.cardData = {
      id: message.card_id,
      type: message.card_type,
      timestamp: new Date().toISOString()
    };
    
    // Emit card scanned event
    this.emit('card_scanned', this.cardData);
    
    // Acknowledge the card read
    this.sendCommand('ack');
  }

  /**
   * Handle card removed event
   * @param {Object} message - Card removed message
   */
  handleCardRemoved(message) {
    this.emit('card_removed', this.cardData);
    this.cardData = {};
  }

  /**
   * Send a command to the Arduino
   * @param {string} command - Command to send
   * @param {Object} params - Optional parameters
   */
  sendCommand(command, params = {}) {
    if (!this.port || !this.port.isOpen) {
      logger.warn('Cannot send command - port not open');
      return false;
    }
    
    const commandObj = { 
      cmd: command,
      ...params
    };
    
    const commandStr = JSON.stringify(commandObj) + '\n';
    
    try {
      this.port.write(commandStr, err => {
        if (err) {
          logger.error(`Error sending command ${command}:`, err);
          return;
        }
        logger.debug(`Sent command: ${command}`);
      });
      return true;
    } catch (error) {
      logger.error(`Exception sending command ${command}:`, error);
      return false;
    }
  }

  /**
   * Check the status of the card reader
   */
  checkStatus() {
    if (this.connected) {
      this.sendCommand('status');
    } else if (this.autoConnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      logger.info(`Attempting to reconnect`);
      this.findAndConnect();
    }, delay);
  }

  /**
   * Reset the RFID reader
   */
  resetReader() {
    return this.sendCommand('reset');
  }

  /**
   * Get the current status of the card reader
   * @returns {Object} Status object
   */
  getStatus() {
    return this.lastStatus;
  }

  /**
   * Simulate a card scan (for testing purposes)
   * @param {string} cardId - The card ID to simulate
   */
  simulateCardScan(cardId) {
    const cardData = {
      id: cardId || `TEST${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      type: 'MIFARE',
      timestamp: new Date().toISOString()
    };
    
    this.cardData = cardData;
    this.emit('card_scanned', cardData);
    
    return cardData;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    
    this.disconnect();
    
    logger.info('Card reader service cleaned up');
  }

  /**
   * Check if the reader is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get the last status message
   * @returns {Object} Last status message
   */
  getLastStatus() {
    return this.lastStatus;
  }

  /**
   * Check if a card is present
   * @returns {boolean} True if a card is present
   */
  isCardPresent() {
    return !!this.cardData.id;
  }

  /**
   * Get the last read card ID
   * @returns {string|null} Card ID or null if no card
   */
  getLastCardId() {
    return this.cardData.id || null;
  }

  /**
   * Get the last read card type
   * @returns {string|null} Card type or null if no card
   */
  getLastCardType() {
    return this.cardData.type || null;
  }

  /**
   * Get uptime in seconds
   * @returns {number} Uptime in seconds or 0 if not connected
   */
  getUptime() {
    if (!this.lastStatus || !this.lastStatus.uptime) {
      return 0;
    }
    return this.lastStatus.uptime;
  }
}

// Create and export a singleton instance
const cardReaderService = new CardReaderService();
module.exports = cardReaderService; 