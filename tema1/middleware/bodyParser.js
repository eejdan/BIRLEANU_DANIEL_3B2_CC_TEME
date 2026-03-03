const http = require('http');

/**
 * Middleware to parse JSON request body
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {Function} next 
 */
const bodyParser = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                if (body.trim().length > 0) {
                    req.body = JSON.parse(body);
                } else {
                    req.body = {};
                }
                next();
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Bad Request',
                    message: 'Invalid JSON in request body'
                }));
            }
        });
        
        req.on('error', (error) => {
            console.error('Error reading request body:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: 'Error reading request body'
            }));
        });
    } else {
        req.body = {};
        next();
    }
};

module.exports = bodyParser;