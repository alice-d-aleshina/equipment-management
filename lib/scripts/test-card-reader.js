#!/usr/bin/env node

/**
 * Test script for the Arduino RFID card reader
 * 
 * This script connects to the Arduino card reader and logs all events.
 * It's useful for testing and debugging the card reader before integrating 
 * it with the main application.
 * 
 * Usage: node test-card-reader.js [port]
 *   - port: Optional serial port. If not provided, will list available ports
 */

const { SerialPort } = require('serialport');
const { CardReaderService } = require('../services/card-reader-service');
const chalk = require('chalk');

// Default configuration
const PORT = process.argv[2];
const BAUD_RATE = 9600;

// Main function
async function main() {
  console.log(chalk.cyan('Arduino RFID Card Reader Test'));
  console.log(chalk.cyan('=============================='));
  
  try {
    // If no port provided, list available ports
    if (!PORT) {
      const ports = await CardReaderService.listPorts();
      
      if (ports.length === 0) {
        console.log(chalk.red('No serial ports found.'));
        console.log('Make sure your Arduino is connected and try again.');
        process.exit(1);
      }
      
      console.log(chalk.yellow('\nAvailable serial ports:'));
      ports.forEach((port, i) => {
        console.log(`${i + 1}. ${port.path} - ${port.manufacturer || 'Unknown'}`);
      });
      
      console.log(chalk.yellow('\nRun the script with the desired port:'));
      console.log(`  node test-card-reader.js ${ports[0].path}`);
      process.exit(0);
    }
    
    // Initialize card reader
    console.log(`Connecting to port ${chalk.green(PORT)} at ${BAUD_RATE} baud...`);
    
    const cardReader = new CardReaderService({
      path: PORT,
      baudRate: BAUD_RATE,
      autoReconnect: true
    });
    
    // Setup event listeners
    setupEventListeners(cardReader);
    
    // Initialize connection
    await cardReader.init();
    console.log(chalk.green('Connection established.'));
    console.log(chalk.yellow('Waiting for events. Press Ctrl+C to exit.'));
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\nClosing connection...'));
      cardReader.close();
      console.log(chalk.green('Connection closed.'));
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Setup event listeners for the card reader
function setupEventListeners(cardReader) {
  // Card read event
  cardReader.on('card', (cardData) => {
    console.log('\n' + chalk.green('Card detected:'));
    console.log(`  ID: ${chalk.yellow(cardData.card_id)}`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);
  });
  
  // Status update event
  cardReader.on('status', (status) => {
    const statusColor = status.status === 'ready' ? chalk.green : chalk.red;
    console.log(`\nStatus: ${statusColor(status.status)}`);
    console.log(`  Message: ${status.message}`);
  });
  
  // Connection events
  cardReader.on('connected', () => {
    console.log(chalk.green('\nCard reader connected'));
  });
  
  cardReader.on('disconnected', () => {
    console.log(chalk.red('\nCard reader disconnected'));
  });
  
  cardReader.on('reconnecting', (attempt) => {
    console.log(chalk.yellow(`\nAttempting to reconnect (attempt ${attempt})...`));
  });
  
  // Error event
  cardReader.on('error', (error) => {
    console.error(chalk.red(`\nError: ${error.message}`));
  });
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`));
  process.exit(1);
}); 