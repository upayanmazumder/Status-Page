const fs = require('fs');
const path = require('path');
const { format } = require('date-fns'); // Used to format dates easily

// Create a logs directory if it doesn't exist
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Function to get the log file path based on the current date
function getLogFilePath() {
    const date = format(new Date(), 'yyyy-MM-dd');
    return path.join(logDir, `${date}.log`);
}

// Colors for the console log based on log level
const colors = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[36m',  // Cyan
    reset: '\x1b[0m',  // Reset color
};

// Logger function
function log(level, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;

    // Write to the log file
    fs.appendFileSync(getLogFilePath(), logMessage);

    // Log only warnings and errors to the console with colors
    if (level === 'error' || level === 'warn') {
        const color = colors[level] || colors.reset;
        console.log(`${color}${logMessage}${colors.reset}`);
    }
}

// Logging functions for convenience
function info(message) {
    log('info', message);
}

function warn(message) {
    log('warn', message);
}

function error(message) {
    log('error', message);
}

module.exports = { info, warn, error };
