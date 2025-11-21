// Simple UUID v4 generator using crypto
const crypto = require('crypto');

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Alias for uuidv4 compatibility
const uuidv4 = generateUUID;

module.exports = { generateUUID, uuidv4 };
