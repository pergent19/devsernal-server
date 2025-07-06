const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateContent = async (req, res) => {
  const messages = req.body.messages;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages array" });
  }

  try {
    // Convert your format to Gemini format
    const history = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Start a chat with full history (preserves memory)
    const chat = model.startChat({ history });

    // Get last user message (to send via sendMessage)
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      reply: text,
      timeStamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to generate response", detail: error.message });
  }
};

module.exports = generateContent;
