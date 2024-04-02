const app = require('../../app');

const handler = async (event) => {
    try {
        return await app(event, context);
    } catch (error) {
      return { statusCode: 500, body: error.toString() }
    }
  }
  
  module.exports = { handler }
  