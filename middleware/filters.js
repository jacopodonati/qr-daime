const striptags = require('striptags');
const he = require('he');

const filters = {
  sanitize: (text) => {
    let sanitizedText = striptags(text);
    sanitizedText = he.decode(sanitizedText);
    return sanitizedText;
  }
};

module.exports = filters;
