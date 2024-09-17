const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const websites = require('../websites.json');

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

module.exports = dbs;
