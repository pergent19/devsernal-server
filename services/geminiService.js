const { GoogleGenerativeAI } = require('@google/generative-ai');
const NodeCache = require('node-cache');
const logger = require('../helpers/logger');
const truncateContent = require('../helpers/truncateContent');
const { getCachedResponse, setCachedResponse } = require('../helpers/cacheHelper');
const dotenv = require('dotenv');

dotenv.config();

// Initialize cache
// const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

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

  // const cacheKey = messages[messages.length - 1].content.trim().toLowerCase();
  // const cachedResponse = cache.get(cacheKey);
  // if (cachedResponse) {
  //   logger.info('Cache hit', { cacheKey });
  //   return cachedResponse;
  // } else {
  //   logger.info('Cache miss', { cacheKey });
  // }
    // Check cache first
  // Check cache first
  const cacheResult = getCachedResponse(messages);
  
  // If cache hit, return the response
  if (cacheResult && cacheResult.fromCache) {
    return cacheResult;
  }
  
  // Get cacheKey for logging (from cache miss result)
  const cacheKey = cacheResult?.cacheKey;

  try {

    const systemInstruction = {
      role: 'user',
      content: `You are DevBot, a helpful AI assistant specialized in technology and programming.

      🎯 **Your Expertise:**
      Programming languages, web/mobile development, databases, DevOps, cloud technologies, software engineering, algorithms, and AI/ML.

      📝 **Response Template:**
      For tech stack/architecture questions, use this format:
      **Frontend:** [Technology]
      **Backend:** [Technology]  
      **Database:** [Technology]
      **Other:** [Additional tools if needed]
      **and so on...**
      But not limited to these technologies and categories. You can also add other categories like cloud platforms, DevOps tools, etc.
      You can still answer questions that do not fit this template, but try to keep the response concise and relevant.

      Brief explanation (2-3 sentences max) covering why these choices work well together.

      For code questions: Provide concise code examples with brief explanations.
      For concept questions: Give clear, practical explanations in 2-3 sentences.

      🚫 **For Non-Tech Questions:**
      "I'm DevBot, your tech assistant! Please ask me about programming, software development, or technology topics instead. 🚀"`
    };

    const fullMessages = [systemInstruction, ...messages];
    
    const history = fullMessages.map((msg) => ({
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

    // cache.set(cacheKey, responseData);
    setCachedResponse(messages, responseData);
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