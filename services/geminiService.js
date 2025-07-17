const { GoogleGenerativeAI } = require('@google/generative-ai');
const NodeCache = require('node-cache');
const logger = require('../helpers/logger');
const truncateContent = require('../helpers/truncateContent');
const dotenv = require('dotenv');

dotenv.config();

// Initialize cache
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Initialize GoogleGenerativeAI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  logger.error('GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const generateResponse = async (messages) => {
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Missing or invalid messages array');
  }

  const cacheKey = messages[messages.length - 1].content.trim().toLowerCase();
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    logger.info('Cache hit', { cacheKey });
    return cachedResponse;
  } else {
    logger.info('Cache miss', { cacheKey });
  }

  try {
    const history = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    logger.debug('Starting Gemini API chat', {
      history: history.map((msg) => ({
        role: msg.role,
        parts: msg.parts.map((part) => ({ text: truncateContent(part.text) })),
      })),
    });

    const start = Date.now();
    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();
    const duration = Date.now() - start;

    const responseData = {
      success: true,
      reply: text,
      timeStamp: new Date().toISOString(),
    };

    cache.set(cacheKey, responseData);
    logger.info('Cache set and response generated', {
      cacheKey,
      duration,
      reply: truncateContent(text),
    });

    return responseData;
  } catch (error) {
    logger.error('Gemini API error', { error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { generateResponse };