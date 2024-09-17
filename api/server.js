const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Load the websites JSON
const websites = require('../websites.json');
const app = express();
const PORT = process.env.PORT || 3000;

// Create databases directory if it doesn't exist
const dbDir = path.join(__dirname, 'databases');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
  logger.info('Databases directory created');
}

// Create or open the SQLite databases
const dbs = {};
websites.forEach(site => {
  const dbPath = path.join(dbDir, `${site.shortName}.db`);
  dbs[site.shortName] = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      logger.error(`Error opening database for ${site.shortName}: ${err.message}`);
    } else {
      logger.info(`Connected to SQLite database for ${site.shortName}`);
      // Create table if not exists
      dbs[site.shortName].run(`
        CREATE TABLE IF NOT EXISTS status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT,
          status TEXT
        )
      `);
      logger.info(`Table created for ${site.shortName}`);
    }
  });
});

// Function to ping a website
const pingWebsite = async (site) => {
  try {
    const response = await axios.get(`https://${site.domain}`, { timeout: 5000 });
    if (response.status === 200) {
      return 'UP';
    }
  } catch (error) {
    logger.warn(`Ping failed for ${site.domain}: ${error.message}`);
    return 'DOWN';
  }
  return 'DOWN';
};

// Log website status
const logWebsiteStatus = (site, status) => {
  const db = dbs[site.shortName];
  const timestamp = new Date().toISOString();

  db.run('INSERT INTO status (timestamp, status) VALUES (?, ?)', [timestamp, status], (err) => {
    if (err) {
      logger.error(`Error logging status for ${site.shortName}: ${err.message}`);
    } else {
      logger.info(`${site.shortName}: ${status} at ${timestamp}`);
    }
  });
};

// Merge consecutive UP/DOWN periods into ranges
const mergeStatusPeriods = (statuses) => {
  const merged = [];
  let start = null;
  let currentStatus = null;

  statuses.forEach(({ timestamp, status }) => {
    if (!start) {
      start = timestamp;
      currentStatus = status;
    } else if (status !== currentStatus) {
      merged.push({ start, end: timestamp, status: currentStatus });
      start = timestamp;
      currentStatus = status;
    }
  });

  if (start) {
    merged.push({ start, end: new Date().toISOString(), status: currentStatus });
  }

  return merged;
};

// Schedule a job to ping every website every 5 minutes
schedule.scheduleJob('*/5 * * * *', async () => {
  for (const site of websites) {
    const status = await pingWebsite(site);
    logWebsiteStatus(site, status);
  }
});

// API routes for each website
websites.forEach(site => {
  app.get(`/api/${site.shortName}`, (req, res) => {
    const db = dbs[site.shortName];

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyDaysAgoUTC = sixtyDaysAgo.toISOString();

    db.all(
      'SELECT timestamp, status FROM status WHERE timestamp >= ? ORDER BY timestamp ASC',
      [sixtyDaysAgoUTC],
      (err, rows) => {
        if (err) {
          logger.error(`Error fetching data for ${site.shortName}: ${err.message}`);
          return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
          return res.json({ message: 'No data available' });
        }

        // Merge consecutive statuses into ranges
        const mergedData = mergeStatusPeriods(rows);

        const responseData = mergedData.map(({ start, end, status }) => ({
          start: new Date(start).toUTCString(),
          end: new Date(end).toUTCString(),
          status: status
        }));

        res.json(responseData);
      }
    );
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
