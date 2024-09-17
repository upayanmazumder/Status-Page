const express = require('express');
const mergeStatusPeriods = require('./mergeStatus');
const dbs = require('./db');
const logger = require('./logger');
const websites = require('../websites.json');

const router = express.Router();

websites.forEach(site => {
  router.get(`/api/${site.shortName}`, (req, res) => {
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
          status
        }));

        res.json(responseData);
      }
    );
  });
});

module.exports = router;
