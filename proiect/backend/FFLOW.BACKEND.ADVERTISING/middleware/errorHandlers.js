import { HttpError } from '../lib/http.js';

function notFoundHandler(req, res, next) {
    next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        next(error);
        return;
    }

    const status = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    if (status >= 500) {
        console.error(error);
    }

    res.status(status).json({
        message
    });
}

export { errorHandler, notFoundHandler };
