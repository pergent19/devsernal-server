const logger = require('../helpers/logger');
const truncateContent = require('../helpers/truncateContent');
const { generateResponse } = require('../services/geminiService');

const chat = async (req, res) => {
  const messages = req.body.messages;

  logger.info('Received chat request', {
    messages: messages.map((msg) => ({
      role: msg.role,
      content: truncateContent(msg.content),
    })),
  });

  try {
    const responseData = await generateResponse(messages);
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate response', detail: error.message });
  }
};

module.exports = { chat };