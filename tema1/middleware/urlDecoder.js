const http = require('http');
const url = require('url');

/**
 * Middleware to decode the URL of the incoming request
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {Function} next 
 */
const urlDecoder = (req, res, next) => {
    const parsedUrl = url.parse(req.url, true);
    req.url = decodeURIComponent(parsedUrl.pathname);
    req.query = parsedUrl.query;
    next();
};

module.exports = urlDecoder