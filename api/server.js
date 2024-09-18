// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const schedule = require('node-schedule');
const { logInfo, logWarning, logError } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env, fallback to 3000
const dbDir = path.join(__dirname, 'databases');
const dbConnections = {};

// Ensure the 'databases' folder exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    logInfo(`Created 'databases' directory`);
}

// Function to get a database connection for a website
function getDatabaseConnection(shortName) {
    const dbPath = path.join(dbDir, `${shortName}.db`);
    if (!dbConnections[shortName]) {
        dbConnections[shortName] = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                logError(`Failed to connect to database for ${shortName}`, err);
            } else {
                logInfo(`Connected to database for ${shortName}`);
            }
        });
    }
    return dbConnections[shortName];
}

// Function to initialize a database (create schema if not exists)
function initializeDatabase(shortName) {
    const db = getDatabaseConnection(shortName);
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                Timestamp TEXT NOT NULL,
                Status TEXT NOT NULL,
                Ping INTEGER
            )
        `, (err) => {
            if (err) {
                logError(`Failed to create schema for ${shortName}`, err);
            } else {
                logInfo(`Schema initialized for ${shortName}`);
            }
        });
    });
}

// Initialize databases for all websites on server start
const websites = require('./websites.json');
websites.forEach(website => {
    const { shortName } = website;
    initializeDatabase(shortName);
});

// Helper function to format the date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Function to ping a website and log its status
async function pingWebsite(website) {
    const { shortName, domain } = website;
    const db = getDatabaseConnection(shortName);
    const timestamp = new Date().toISOString();

    try {
        const response = await axios.get(domain);
        const pingTime = response.elapsedTime || 0; // Optional: track ping time if available
        const status = response.status === 200 ? 'online' : 'offline';

        // Insert status into the database
        db.run(`
            INSERT INTO status (Timestamp, Status, Ping)
            VALUES (?, ?, ?)
        `, [timestamp, status, pingTime], (err) => {
            if (err) {
                logError(`Failed to insert status for ${shortName}`, err);
            } else {
                logInfo(`Logged status for ${shortName}: ${status}`);
            }
        });
    } catch (error) {
        db.run(`
            INSERT INTO status (Timestamp, Status, Ping)
            VALUES (?, ?, ?)
        `, [timestamp, 'offline', 0], (err) => {
            if (err) {
                logError(`Failed to log offline status for ${shortName}`, err);
            } else {
                logWarning(`Website ${shortName} is offline`);
            }
        });
    }
}

// Schedule ping checks every 5 minutes
schedule.scheduleJob('*/5 * * * *', () => {
    websites.forEach(website => {
        pingWebsite(website);
    });
    logInfo('Scheduled ping check executed');
});

// Helper function to calculate the start and end of a given day
function getStartAndEndOfDay(date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
}

// Route to list all websites and their status for the past 60 days
websites.forEach(website => {
    const { shortName } = website;

    app.get(`/${shortName}`, async (req, res) => {
        const db = getDatabaseConnection(shortName);
        const today = new Date();
        let response = [];

        try {
            // Get status data for the past 60 days
            for (let i = 0; i < 60; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const { startOfDay, endOfDay } = getStartAndEndOfDay(date);
                const dateStr = formatDate(date);

                // Fetch the status for this specific day
                const rows = await new Promise((resolve, reject) => {
                    db.all(`
                        SELECT Timestamp, Status, Ping
                        FROM status
                        WHERE Timestamp BETWEEN ? AND ?
                        ORDER BY Timestamp
                    `, [startOfDay.toISOString(), endOfDay.toISOString()], (err, rows) => {
                        if (err) {
                            const errorMessage = `Failed to fetch data from database for ${shortName} on ${dateStr}`;
                            logError(errorMessage, err);
                            reject(err);
                        }
                        resolve(rows);
                    });
                });

                if (rows.length === 0) {
                    // No data available for this day, set status to 0
                    response.push({
                        date: dateStr,
                        status: 0,
                        downtimePeriods: null
                    });
                } else {
                    // Analyze the fetched data to determine UP/DOWN status and downtime periods
                    let dayStatus = 'UP';
                    let downtimePeriods = [];
                    let currentDowntimeStart = null;

                    rows.forEach(row => {
                        if (row.Status === 'offline') {
                            if (!currentDowntimeStart) {
                                currentDowntimeStart = new Date(row.Timestamp);
                            }
                        } else {
                            if (currentDowntimeStart) {
                                downtimePeriods.push({
                                    start: currentDowntimeStart.toISOString(),
                                    end: new Date(row.Timestamp).toISOString()
                                });
                                currentDowntimeStart = null;
                            }
                        }
                    });

                    if (currentDowntimeStart) {
                        downtimePeriods.push({
                            start: currentDowntimeStart.toISOString(),
                            end: endOfDay.toISOString()
                        });
                        dayStatus = 'DOWN';
                    }

                    response.push({
                        date: dateStr,
                        status: dayStatus,
                        downtimePeriods: downtimePeriods.length ? downtimePeriods : null
                    });
                }
            }

            // Return response with website details and status data
            res.json({
                shortName,
                domain: website.domain,
                longName: website.longName,
                description: website.description,
                data: response
            });
        } catch (error) {
            logError(`Failed to process ${shortName}`, error);
            res.status(500).json({ error: `Failed to process ${shortName}` });
        }
    });
});

// Start server
app.listen(PORT, () => {
    logInfo(`Server is running on port ${PORT}`);
});
