const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { logInfo, logWarning, logError } = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;
const dbDir = 'api/databases';
const dbConnections = {};

// Function to check website status
async function checkWebsiteStatus(domain) {
    try {
        const startTime = Date.now();
        const response = await axios.get(`http://${domain}`, { timeout: 5000 });
        const endTime = Date.now();
        const ping = endTime - startTime;

        if (response.status === 200) {
            logInfo(`Website ${domain} is online with ping ${ping} ms.`);
            return { status: 'online', ping };
        } else {
            logWarning(`Website ${domain} returned status ${response.status}.`);
            return { status: 'offline', ping: null };
        }
    } catch (error) {
        logError(`Website ${domain} is offline`, error);
        return { status: 'offline', ping: null };
    }
}

// Function to get a database connection for a website
function getDatabaseConnection(shortName) {
    const dbPath = path.join(dbDir, `${shortName}.db`);
    if (!dbConnections[shortName]) {
        dbConnections[shortName] = new sqlite3.Database(dbPath);
        logInfo(`Connected to database for ${shortName}`);
    }
    return dbConnections[shortName];
}

// Ensure the databases directory exists
try {
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logInfo(`Created directory ${dbDir}.`);
    }
} catch (error) {
    logError(`Failed to create directory ${dbDir}`, error);
    process.exit(1);
}

// Function to process each website
async function processWebsites() {
    const websites = require('./websites.json');
    const promises = websites.map(async (website) => {
        const db = getDatabaseConnection(website.shortName);

        try {
            await new Promise((resolve, reject) => {
                db.serialize(async () => {
                    db.run(`
                        CREATE TABLE IF NOT EXISTS status (
                            Timestamp TEXT,
                            Status TEXT,
                            Ping INTEGER
                        )
                    `, (err) => {
                        if (err) {
                            logError(`Failed to create table in database for ${website.shortName}`, err);
                            reject(err);
                            return;
                        } else {
                            logInfo(`Created table in database for ${website.shortName}.`);
                        }
                    });

                    const { status, ping } = await checkWebsiteStatus(website.domain);
                    const timestamp = new Date().toISOString();

                    db.run(`
                        INSERT INTO status (Timestamp, Status, Ping)
                        VALUES (?, ?, ?)
                    `, [timestamp, status, ping], (err) => {
                        if (err) {
                            logError(`Failed to insert status into database for ${website.shortName}`, err);
                            reject(err);
                            return;
                        } else {
                            logInfo(`Inserted status for ${website.domain} into database for ${website.shortName}.`);
                        }
                    });

                    db.all(`
                        SELECT Timestamp, Status, Ping
                        FROM status
                        ORDER BY Timestamp DESC
                    `, (err, rows) => {
                        if (err) {
                            logError(`Failed to fetch data from database for ${website.shortName}`, err);
                            reject(err);
                            return;
                        }

                        logInfo(`Retrieved data for ${website.shortName}`);
                        resolve();
                    });
                });
            });
        } catch (error) {
            logError(`Failed to process ${website.shortName}`, error);
        }
    });

    try {
        await Promise.all(promises);
        logInfo('All websites processed successfully.');
    } catch (err) {
        logError('Error processing websites', err);
    }
}

// Route handlers
app.get('/', (req, res) => {
    const availableRoutes = ['/'];

    // Add routes for each website defined in websites.json
    const websites = require('./websites.json');
    websites.forEach(website => {
        availableRoutes.push(`/${website.shortName}`);
    });

    res.json({ availableRoutes });
});

const websites = require('./websites.json');
websites.forEach(website => {
    const { shortName } = website;

    app.get(`/${shortName}`, (req, res) => {
        const db = getDatabaseConnection(shortName);

        db.all(`
            SELECT Timestamp, Status, Ping
            FROM status
            ORDER BY Timestamp DESC
        `, (err, rows) => {
            if (err) {
                const errorMessage = `Failed to fetch data from database for ${shortName}`;
                logError(errorMessage, err);
                return res.status(500).json({ error: 'Failed to fetch data from database' });
            }

            if (!rows || rows.length === 0) {
                const warningMessage = `No data found for website ${shortName}`;
                logWarning(warningMessage);
                return res.status(404).json({ error: 'No data found for website' });
            }

            const infoMessage = `Retrieved data for ${shortName}`;
            logInfo(infoMessage);
            res.json({ shortName, data: rows });
        });
    });

});

// Start server and periodic website status check
app.listen(PORT, () => {
    logInfo(`Server is running on http://localhost:${PORT}`);

    // Initial website status check
    processWebsites().then(() => {
        logInfo('Initial website status check completed.');
    }).catch((error) => {
        logError('Initial website status check failed', error);
    });

    // Periodic website status check (every minute)
    setInterval(() => {
        processWebsites().then(() => {
            logInfo('Periodic website status check completed.');
        }).catch((error) => {
            logError('Periodic website status check failed', error);
        });
    }, 60000);
});
