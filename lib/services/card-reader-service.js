/**
 * Card Reader Service
 * 
 * This service manages communication with the Arduino RFID card reader.
 * It handles:
 * - Serial port connection and reconnection
 * - Parsing card data and status messages
 * - Emitting events for card reads, status updates, and errors
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class CardReaderService extends EventEmitter {
  /**
   * Create a new CardReaderService
   * @param {Object} options - Configuration options
   * @param {string} options.path - Path to the serial port
   * @param {number} options.baudRate - Baud rate (default: 9600)
   * @param {boolean} options.autoOpen - Auto open the port (default: false)
   * @param {boolean} options.autoReconnect - Auto reconnect on disconnect (default: true)
   * @param {number} options.reconnectInterval - Reconnect interval in ms (default: 5000)
   * @param {number} options.maxReconnectAttempts - Max reconnect attempts (default: Infinity)
   */
  constructor(options = {}) {
    super();
    this.options = {
      baudRate: 9600,
      autoOpen: false,
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: Infinity,
      ...options
    };
    
    this.port = null;
    this.parser = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
  }
  
  /**
   * Initialize the connection to the card reader
   * @returns {Promise<void>} Resolves when connected
   */
  async init() {
    if (this.port) {
      await this.close();
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Create a new serial port
        this.port = new SerialPort({
          path: this.options.path,
          baudRate: this.options.baudRate,
          autoOpen: false
        });
        
        // Create a parser for the port
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
        
        // Setup event listeners
        this._setupEventListeners();
        
        // Open the port
        this.port.open((err) => {
          if (err) {
            reject(new Error(`Failed to open port: ${err.message}`));
            return;
          }
          
          // Wait a bit for the Arduino to initialize after connection
          setTimeout(() => {
            this.connected = true;
            this.emit('connected');
            resolve();
          }, 2000);
        });
      } catch (error) {
        reject(new Error(`Failed to initialize card reader: ${error.message}`));
      }
    });
  }
  
  /**
   * Close the connection to the card reader
   * @returns {Promise<void>} Resolves when closed
   */
  async close() {
    return new Promise((resolve) => {
      if (!this.port || !this.port.isOpen) {
        resolve();
        return;
      }
      
      // Clear any reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Close the port
      this.port.close((err) => {
        if (err) {
          this.emit('error', new Error(`Error closing port: ${err.message}`));
        }
        
        this.connected = false;
        this.port = null;
        this.parser = null;
        resolve();
      });
    });
  }
  
  /**
   * Send a command to the card reader
   * @param {string} command - The command to send
   * @returns {Promise<void>} Resolves when command is sent
   */
  async sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        reject(new Error('Port is not open'));
        return;
      }
      
      this.port.write(`${command}\n`, (err) => {
        if (err) {
          reject(new Error(`Failed to send command: ${err.message}`));
          return;
        }
        
        resolve();
      });
    });
  }
  
  /**
   * List available serial ports
   * @returns {Promise<Array>} List of available ports
   */
  static async listPorts() {
    return SerialPort.list();
  }
  
  /**
   * Setup internal event listeners
   * @private
   */
  _setupEventListeners() {
    if (!this.port || !this.parser) {
      return;
    }
    
    // Data event
    this.parser.on('data', (data) => {
      try {
        this._processData(data);
      } catch (error) {
        this.emit('error', new Error(`Error processing data: ${error.message}`));
      }
    });
    
    // Error event
    this.port.on('error', (error) => {
      this.emit('error', error);
    });
    
    // Close event
    this.port.on('close', () => {
      if (this.connected) {
        this.connected = false;
        this.emit('disconnected');
        
        // Auto reconnect if enabled
        if (this.options.autoReconnect) {
          this._reconnect();
        }
      }
    });
  }
  
  /**
   * Process data received from the card reader
   * @param {string} data - The data received
   * @private
   */
  _processData(data) {
    // Ignore empty data
    if (!data || data.trim() === '') {
      return;
    }
    
    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(data);
      
      // Determine message type and emit appropriate event
      if (parsedData.type === 'card') {
        this.emit('card', parsedData);
      } else if (parsedData.type === 'status') {
        this.emit('status', parsedData);
      } else {
        this.emit('message', parsedData);
      }
    } catch (error) {
      // If not JSON, emit as raw message
      this.emit('message', { type: 'raw', message: data });
    }
  }
  
  /**
   * Attempt to reconnect to the card reader
   * @private
   */
  _reconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectAttempts++;
    
    // Check max reconnect attempts
    if (this.options.maxReconnectAttempts !== Infinity && 
        this.reconnectAttempts > this.options.maxReconnectAttempts) {
      this.emit('error', new Error('Maximum reconnect attempts reached'));
      return;
    }
    
    this.emit('reconnecting', this.reconnectAttempts);
    
    // Schedule reconnect
    this.reconnectTimer = setTimeout(() => {
      this.init().catch((error) => {
        this.emit('error', error);
        this._reconnect();
      });
    }, this.options.reconnectInterval);
  }
}

module.exports = { CardReaderService }; 