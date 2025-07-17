const truncateContent = (content, maxLength = 100) => {
  if (typeof content !== 'string') return content;
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

module.exports = truncateContent;