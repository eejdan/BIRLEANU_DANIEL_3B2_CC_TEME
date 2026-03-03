const http = require('http');

/**
 * Logger middleware
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {Function} next 
 */
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};
module.exports = logger;