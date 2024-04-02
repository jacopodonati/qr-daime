const app = require('../../app');

exports.handler = async (event, context) => {
    return await app(event, context);
};