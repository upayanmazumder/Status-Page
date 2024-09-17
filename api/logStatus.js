const logger = require('./logger');

// Log website status
const logWebsiteStatus = (site, status, dbs) => {
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

module.exports = logWebsiteStatus;
