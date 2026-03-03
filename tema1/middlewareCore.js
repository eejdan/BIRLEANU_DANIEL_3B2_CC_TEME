const http = require('http');
const url = require('url');

const { RouteMapper } = require('./router');
const booksController = require('./booksController');
const authorsController = require('./authorsController');

const { logger, urlDecoder, bodyParser } = require('./middleware/middleware');

// Initialize router and register routes
const router = new RouteMapper();

// Books routes (2 routes per HTTP method)
router.get('/books', booksController.getAllBooks);           // Collection
router.get('/books/:id', booksController.getBookById);       // Resource
router.post('/books', booksController.createBook);           // Collection
router.put('/books/:id', booksController.updateBook);        // Resource
router.delete('/books/:id', booksController.deleteBook);     // Resource

// Authors routes (2 routes per HTTP method)
router.get('/authors', authorsController.getAllAuthors);     // Collection
router.get('/authors/:id', authorsController.getAuthorById); // Resource
router.post('/authors', authorsController.createAuthor);     // Collection
router.put('/authors/:id', authorsController.updateAuthor);  // Resource
router.delete('/authors/:id', authorsController.deleteAuthor); // Resource

/**
 * Middleware to match routes and execute handlers
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const routeHandler = (req, res) => {
    const matchedRoute = router.match(req.url, req.method);
    
    if (!matchedRoute) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Not Found',
            message: `Route ${req.method} ${req.url} not found`
        }));
        return;
    }
    
    // Attach params to request object
    req.params = matchedRoute.params;
    
    // Execute the route handler
    try {
        matchedRoute.handler(req, res);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        }));
    }
};
const pipeline = [logger, urlDecoder, bodyParser];

/**
 * Main request pipeline that processes all incoming requests
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const requestPipeline = (req, res) => {

    for(let i = 0; i < pipeline.length -1; i++) {
        pipeline[i](req, res, () => {});
    }
    routeHandler(req, res);
    /* 
        logger(req, res, () => {
            urlDecoder(req, res, () => {
                bodyParser(req, res, () => {
                    routeHandler(req, res);
                });
            });
        }); 
    */
};

module.exports = { requestPipeline };