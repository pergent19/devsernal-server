const app = require('./app');
const schedulePing = require('./cron/pingCron');
const logger = require('./helpers/logger');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

try {
  if (ENVIRONMENT === 'production') {
    schedulePing();
  }

  app.listen(PORT, () => {
    logger.info(`Server started`, { port: PORT, environment: ENVIRONMENT });
  });
} catch (err) {
  logger.error('Server failed to start', { error: err.message });
  process.exit(1);
}
