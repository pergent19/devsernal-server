require('dotenv').config();

try {
  const app = require('./app');
  const schedulePing = require('./cron/pingCron');
  const logger = require('./helpers/logger');

  const PORT = process.env.PORT || 3000;
  const ENVIRONMENT = process.env.NODE_ENV || 'development';

  if (ENVIRONMENT === 'production') {
    schedulePing(); // if this crashes, it can silently break the app
  }

  app.listen(PORT, () => {
    logger.info(`Server started`, { port: PORT, environment: ENVIRONMENT });
    console.log(`Server started on port ${PORT} in ${ENVIRONMENT} mode`);
  });

} catch (error) {
  console.error('🚨 Error starting server:', error);
}
