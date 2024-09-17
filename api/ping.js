const axios = require('axios');
const logger = require('./logger');

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

module.exports = pingWebsite;
