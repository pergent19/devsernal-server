const NodeCache = require('node-cache');
const crypto = require('crypto');
const logger = require('./logger');
const truncateContent = require('./truncateContent');

const cache = new NodeCache({ 
  stdTTL: 1800,
  checkperiod: 300,
  useClones: false,
  maxKeys: 1000
});

// Simple patterns that don't need context
const SIMPLE_PATTERNS = [
  // Greetings
  /^(hi|hello|hey|good morning|good afternoon|good evening)[!.]*$/i,
  
  // Basic responses
  /^(thanks?|thank you|ok|okay|sure|yes|no)[!.]*$/i,
  
  // Simple questions
  /^(what is \w+\?*|who are you\?*|help\?*)$/i
];

// Check if message is a simple pattern
const isSimplePattern = (content) => {
  const normalized = content.trim().toLowerCase();
  return SIMPLE_PATTERNS.some(pattern => pattern.test(normalized));
};

// Generate cache key with smart logic
const generateCacheKey = (messages) => {
  const lastMessage = messages[messages.length - 1];
  const lastContent = lastMessage.content.trim();
  
  // For simple patterns, use just the normalized content
  if (isSimplePattern(lastContent)) {
    const normalized = lastContent
      .toLowerCase()
      .replace(/[!.?]+$/, '') // Remove ending punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    return `simple_${crypto.createHash('md5').update(normalized).digest('hex')}`;
  }
  
  // For complex questions, use conversation context (your original logic)
  const contextMessages = messages.slice(-3);
  const conversationFlow = contextMessages.map(msg => {
    const normalizedContent = msg.content
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
    return `${msg.role}:${normalizedContent}`;
  }).join('|');
  
  return `context_${crypto.createHash('md5').update(conversationFlow).digest('hex')}`;
};

// Enhanced similarity for simple patterns
const calculateSimilarity = (str1, str2) => {
  // For simple greetings, be more flexible
  if (isSimplePattern(str1) && isSimplePattern(str2)) {
    const normalized1 = str1.toLowerCase().replace(/[!.?]+$/, '').trim();
    const normalized2 = str2.toLowerCase().replace(/[!.?]+$/, '').trim();
    
    // Direct match for simple patterns
    if (normalized1 === normalized2) return 1.0;
    
    // Check for greeting variations
    const greetings = ['hi', 'hello', 'hey'];
    if (greetings.includes(normalized1) && greetings.includes(normalized2)) {
      return 0.9; // High similarity for different greetings
    }
  }
  
  // Original Jaccard similarity for complex content
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

const findSimilarCachedResponse = (currentMessage) => {
  const currentContent = currentMessage.toLowerCase().trim();
  const cacheKeys = cache.keys();
  
  for (const key of cacheKeys) {
    const cachedData = cache.get(key);
    if (cachedData && cachedData.originalQuestion) {
      const similarity = calculateSimilarity(currentContent, cachedData.originalQuestion);
      if (similarity > 0.8) {
        logger.info('Similar question found in cache', { 
          similarity, 
          cacheType: key.startsWith('simple_') ? 'simple_pattern' : 'context_aware',
          currentQuestion: truncateContent(currentContent, 50),
          cachedQuestion: truncateContent(cachedData.originalQuestion, 50)
        });
        return cachedData;
      }
    }
  }
  return null;
};

const getCachedResponse = (messages) => {
  const lastMessage = messages[messages.length - 1];
  const cacheKey = generateCacheKey(messages);
  
  // Try exact match first
  let cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    const cacheType = cacheKey.startsWith('simple_') ? 'simple_pattern' : 'context_aware';
    logger.info('Exact cache hit', { cacheKey, cacheType });
    return {
      ...cachedResponse,
      fromCache: true,
      cacheType: 'exact',
      cacheKey
    };
  }
  
  // Try similar match
  cachedResponse = findSimilarCachedResponse(lastMessage.content);
  if (cachedResponse) {
    return {
      ...cachedResponse,
      fromCache: true,
      cacheType: 'similar',
      cacheKey
    };
  }
  
  logger.info('Cache miss', { cacheKey });
  return { cacheKey, hit: false };
};

const setCachedResponse = (messages, responseData) => {
  const cacheKey = generateCacheKey(messages);
  const lastMessage = messages[messages.length - 1];
  
  const cacheData = {
    ...responseData,
    originalQuestion: lastMessage.content.toLowerCase().trim(),
    metadata: {
      ...responseData.metadata,
      cacheKey,
      isSimplePattern: isSimplePattern(lastMessage.content)
    }
  };
  
  // Different TTL based on pattern type
  const ttl = isSimplePattern(lastMessage.content) ? 7200 : 1800; // 2 hours for simple, 30 min for complex
  cache.set(cacheKey, cacheData, ttl);
  
  const cacheType = cacheKey.startsWith('simple_') ? 'simple_pattern' : 'context_aware';
  logger.info('Response cached', {
    cacheKey,
    cacheType,
    ttl,
    cacheStats: cache.getStats()
  });
};

const getCacheStats = () => ({
  stats: cache.getStats(),
  keys: cache.keys().length,
  simplePatterns: cache.keys().filter(key => key.startsWith('simple_')).length,
  contextAware: cache.keys().filter(key => key.startsWith('context_')).length,
  timestamp: new Date().toISOString()
});

const clearCache = () => {
  cache.flushAll();
  logger.info('Cache cleared');
};

module.exports = {
  getCachedResponse,
  setCachedResponse,
  getCacheStats,
  clearCache
};