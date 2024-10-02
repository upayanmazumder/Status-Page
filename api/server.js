require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const http = require('http');
const cloudscraper = require('cloudscraper');
const schedule = require('node-schedule');
const { logInfo, logWarning, logError } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;
const dbDir = path.join(__dirname, 'databases');
const dbConnections = {};

// Ensure the 'databases' directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    logInfo(`Created 'databases' directory`);
}

// Function to get a database connection for a website
const getDatabaseConnection = (shortName) => {
    if (!dbConnections[shortName]) {
        const dbPath = path.join(dbDir, `${shortName}.db`);
        dbConnections[shortName] = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) logError(`Failed to connect to database for ${shortName}`, err);
            else logInfo(`Connected to database for ${shortName}`);
        });
    }
    return dbConnections[shortName];
};

// Function to initialize a database (create schema if not exists)
const initializeDatabase = (shortName) => {
    const db = getDatabaseConnection(shortName);
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                Timestamp TEXT NOT NULL,
                Status TEXT NOT NULL,
                Ping INTEGER
            )`, (err) => {
            if (err) logError(`Failed to create schema for ${shortName}`, err);
            else logInfo(`Schema initialized for ${shortName}`);
        });
    });
};

// Load websites and initialize their databases
const websites = require('./websites.json');
websites.forEach(({ shortName }) => initializeDatabase(shortName));

// Helper to format dates as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// Function to ping a website and log its status
const pingWebsite = async (website) => {
    const { shortName, domain } = website;
    const db = getDatabaseConnection(shortName);
    const timestamp = new Date().toISOString();

    const options = {
        uri: `https://${domain}`,
        method: 'GET',
        resolveWithFullResponse: true,
        timeout: 15000, // Timeout of 15 seconds
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    };

    try {
        const startTime = Date.now();
        const response = await cloudscraper(options);
        const pingTime = Date.now() - startTime;
        const status = (response.statusCode >= 200 && response.statusCode < 400) ? 'online' : 'offline';

        db.run(`INSERT INTO status (Timestamp, Status, Ping) VALUES (?, ?, ?)`, [timestamp, status, pingTime], (err) => {
            if (err) logError(`Failed to log status for ${shortName}`, err);
            else logInfo(`Website ${shortName} is ${status}, Ping: ${pingTime}ms`);
        });
    } catch (error) {
        // Log specific error for offline status
        logError(`Ping failed for ${shortName}: ${error.message || 'Unknown error'}`);

        db.run(`INSERT INTO status (Timestamp, Status, Ping) VALUES (?, ?, ?)`, [timestamp, 'offline', 0], (err) => {
            if (err) logError(`Failed to log offline status for ${shortName}`, err);
            else logWarning(`Website ${shortName} is offline, Error: ${error.message || 'Unknown error'}`);
        });
    }
};

// Schedule ping checks every 1 minute
schedule.scheduleJob('*/1 * * * *', () => {
    websites.forEach(pingWebsite);
    logInfo('Scheduled ping check executed');
});

// Route to list all websites and their status for the past 60 days
websites.forEach(({ shortName, domain, longName, description }) => {
    app.get(`/sites/${shortName}`, async (req, res) => {
        const db = getDatabaseConnection(shortName);
        const today = new Date();
        let response = [];

        try {
            for (let i = 0; i < 60; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = formatDate(date);

                const { startOfDay, endOfDay } = getStartAndEndOfDay(date);

                // Fetch status data from the database for this day
                const rows = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT Timestamp, Status, Ping
                        FROM status
                        WHERE Timestamp BETWEEN ? AND ?
                        ORDER BY Timestamp`, [startOfDay.toISOString(), endOfDay.toISOString()], (err, rows) => {
                        if (err) {
                            logError(`Failed to fetch data for ${shortName} on ${dateStr}`, err);
                            reject(err);
                        }
                        resolve(rows);
                    });
                });

                if (!rows.length) {
                    response.push({ date: dateStr, status: 0, downtimePeriods: null });
                } else {
                    let dayStatus = 'UP';
                    let downtimePeriods = [];
                    let currentDowntimeStart = null;

                    rows.forEach(({ Status, Timestamp }) => {
                        if (Status === 'offline' && !currentDowntimeStart) {
                            currentDowntimeStart = new Date(Timestamp);
                        } else if (Status !== 'offline' && currentDowntimeStart) {
                            downtimePeriods.push({ start: currentDowntimeStart.toISOString(), end: new Date(Timestamp).toISOString() });
                            currentDowntimeStart = null;
                        }
                    });

                    if (currentDowntimeStart) {
                        downtimePeriods.push({ start: currentDowntimeStart.toISOString(), end: endOfDay.toISOString() });
                        dayStatus = 'DOWN';
                    }

                    response.push({ date: dateStr, status: dayStatus, downtimePeriods: downtimePeriods.length ? downtimePeriods : null });
                }
            }

            res.json({ shortName, domain, longName, description, data: response });
        } catch (error) {
            logError(`Failed to process ${shortName}`, error);
            res.status(500).json({ error: `Failed to process ${shortName}` });
        }
    });
});

// Utility to get the start and end of a day in UTC
const getStartAndEndOfDay = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
};

// Start the server
http.createServer(app).listen(PORT, () => {
    logInfo(`Server is running on port ${PORT}`);
});
