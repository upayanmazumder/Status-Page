const express = require('express');
const logger = require('./logger');
const scheduler = require('./scheduler'); // Just require to start the job
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(routes);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
