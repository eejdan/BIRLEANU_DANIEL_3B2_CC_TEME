import crypto from 'node:crypto';

class AuthHttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

function requireJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }

    return secret;
}

function parseBearerToken(authorizationHeader) {
    if (!authorizationHeader) {
        throw new AuthHttpError(401, 'Missing authorization header');
    }

    const [scheme, token] = String(authorizationHeader).split(' ');
    if (scheme !== 'Bearer' || !token) {
        throw new AuthHttpError(401, 'Invalid authorization header');
    }

    return token;
}

function verifyJwt(token) {
    const parts = String(token).split('.');
    if (parts.length !== 3) {
        throw new AuthHttpError(401, 'Invalid authentication token');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', requireJwtSecret())
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(encodedSignature), Buffer.from(expectedSignature))) {
        throw new AuthHttpError(401, 'Invalid authentication token');
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch (error) {
        throw new AuthHttpError(401, 'Invalid authentication token');
    }

    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new AuthHttpError(401, 'Authentication token expired or invalid');
    }

    const issuer = process.env.JWT_ISSUER || 'FFLOW.BACKEND.AUTH';
    const audience = process.env.JWT_AUDIENCE || 'FFLOW.USERS';

    if (payload.iss !== issuer || payload.aud !== audience) {
        throw new AuthHttpError(401, 'Authentication token expired or invalid');
    }

    return payload;
}

function buildAuthenticatedUser(payload) {
    return {
        id: payload.sub,
        _id: payload.sub,
        name: payload.name,
        email: payload.email,
        plan: payload.plan ?? 'free'
    };
}

export {
    AuthHttpError,
    buildAuthenticatedUser,
    parseBearerToken,
    verifyJwt
};
