/**
 * Simple logger utility for the equipment management system
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Default to INFO level in production, DEBUG in development
const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.DEBUG;

// Get configured log level from environment or use default
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || DEFAULT_LOG_LEVEL
  : DEFAULT_LOG_LEVEL;

/**
 * Format the log message with timestamp and level
 * @param {string} level The log level
 * @param {string} message The message to log
 * @param {any} data Optional data to include
 * @returns {string} Formatted log message
 */
function formatLog(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataString = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataString}`;
}

/**
 * Format an error for logging
 * @param {Error} error The error object
 * @returns {object} Formatted error object
 */
function formatError(error) {
  if (!error) return null;
  
  return {
    message: error.message,
    stack: error.stack,
    ...(error.cause && { cause: formatError(error.cause) }),
  };
}

/**
 * Log an error message
 * @param {string} message The message to log
 * @param {Error|any} error Optional error object or data
 */
function error(message, error) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
    if (error instanceof Error) {
      console.error(formatLog('ERROR', message, formatError(error)));
    } else {
      console.error(formatLog('ERROR', message, error));
    }
  }
}

/**
 * Log a warning message
 * @param {string} message The message to log
 * @param {any} data Optional data to include
 */
function warn(message, data) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
    console.warn(formatLog('WARN', message, data));
  }
}

/**
 * Log an info message
 * @param {string} message The message to log
 * @param {any} data Optional data to include
 */
function info(message, data) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
    console.info(formatLog('INFO', message, data));
  }
}

/**
 * Log a debug message
 * @param {string} message The message to log
 * @param {any} data Optional data to include
 */
function debug(message, data) {
  if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    console.debug(formatLog('DEBUG', message, data));
  }
}

module.exports = {
  error,
  warn,
  info,
  debug,
  LOG_LEVELS,
}; 