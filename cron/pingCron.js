const cron = require('node-cron');
const axios = require('axios');
const logger = require('../helpers/logger');
require('dotenv').config();

const PING_URL = process.env.PING_URL || 'http://localhost:3000';

const schedulePing = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const response = await axios.get(`${PING_URL}/ping`);
      logger.info('Ping successful', { status: response.status });
    } catch (error) {
      logger.error('Ping failed', { error: error.message });
    }
  });
};

module.exports = schedulePing;
