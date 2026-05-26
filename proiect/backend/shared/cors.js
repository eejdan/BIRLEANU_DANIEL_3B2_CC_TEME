const DEFAULT_ALLOWED_HEADERS = [
    'Authorization',
    'Content-Type'
];

const DEFAULT_ALLOWED_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
];

function createCorsMiddleware() {
    const allowedOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);
    const allowAnyOrigin = allowedOrigins.length === 0;

    return function corsMiddleware(req, res, next) {
        const origin = req.headers.origin;
        const allowOrigin = resolveAllowedOrigin(origin, allowedOrigins, allowAnyOrigin);

        if (allowOrigin) {
            res.setHeader('Access-Control-Allow-Origin', allowOrigin);
            res.setHeader('Vary', 'Origin');
        }

        res.setHeader('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS.join(', '));
        res.setHeader('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS.join(', '));

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        next();
    };
}

function parseAllowedOrigins(value) {
    return String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function resolveAllowedOrigin(origin, allowedOrigins, allowAnyOrigin) {
    if (!origin) {
        return null;
    }

    if (allowAnyOrigin) {
        return '*';
    }

    return allowedOrigins.includes(origin) ? origin : null;
}

export default createCorsMiddleware;
