const fs = require('fs');
const path = require('path');

function logInfo(message) {
    const logMessage = `[INFO] - ${message}`;
    writeToLogFile(logMessage);
    console.log(logMessage);
}
  
function logWarning(message) {
    const logMessage = `[WARNING] - ${message}`;
    writeToLogFile(logMessage);
    console.warn(logMessage);
}
  
function logError(message, error) {
    const logMessage = `[ERROR] - ${message}: ${error}`;
    writeToLogFile(logMessage);
    console.error(logMessage);
}
  
function getCurrentTime() {
    const now = new Date();
    return now.toISOString();
}

function writeToLogFile(message) {
    const logDirectory = path.join(__dirname, 'logs');
    const currentDate = new Date();
    const logFileName = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}.log`;
    const logFilePath = path.join(logDirectory, logFileName);

    const logEntry = `[${getCurrentTime()}] ${message}\n`;

    try {
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory);
        }

        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error(`Failed to write to log file ${logFilePath}: ${err}`);
            }
        });
    } catch (err) {
        console.error(`Failed to create log directory ${logDirectory}: ${err}`);
    }
}

module.exports = {
    logInfo,
    logWarning,
    logError
};
