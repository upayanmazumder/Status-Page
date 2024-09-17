const schedule = require('node-schedule');
const pingWebsite = require('./ping');
const logWebsiteStatus = require('./logStatus');
const dbs = require('./db');
const websites = require('../websites.json');

// Schedule a job to ping every website every 5 minutes
schedule.scheduleJob('*/5 * * * *', async () => {
  for (const site of websites) {
    const status = await pingWebsite(site);
    logWebsiteStatus(site, status, dbs);
  }
});
