require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logInfo, logWarning, logError } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env, fallback to 3000
const dbDir = 'api/databases';
const dbConnections = {};

// Function to get a database connection for a website
function getDatabaseConnection(shortName) {
    const dbPath = path.join(dbDir, `${shortName}.db`);
    if (!dbConnections[shortName]) {
        dbConnections[shortName] = new sqlite3.Database(dbPath);
        logInfo(`Connected to database for ${shortName}`);
    }
    return dbConnections[shortName];
}

// Helper function to format the date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Helper function to calculate the start and end of a given day
function getStartAndEndOfDay(date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
}

// Route handlers
app.get('/', (req, res) => {
    // Retrieve routes from websites.json
    const websites = require('./websites.json');
    const availableRoutes = websites.map(website => `/${website.shortName}`);
    res.json({ availableRoutes });
});

const websites = require('./websites.json');
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
                                start: formatDate(currentDowntimeStart),
                                end: formatDate(new Date(row.Timestamp))
                            });
                            currentDowntimeStart = null;
                        }
                    }
                });

                if (currentDowntimeStart) {
                    downtimePeriods.push({
                        start: formatDate(currentDowntimeStart),
                        end: formatDate(endOfDay)
                    });
                    dayStatus = 'DOWN';
                }

                response.push({
                    date: dateStr,
                    status: dayStatus,
                    downtimePeriods: downtimePeriods.length ? downtimePeriods : null
                });
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
