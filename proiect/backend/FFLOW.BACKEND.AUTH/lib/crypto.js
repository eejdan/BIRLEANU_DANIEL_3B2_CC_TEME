import crypto from 'node:crypto';

import { HttpError } from './http.js';

function base64UrlEncode(value) {
    return Buffer.from(value).toString('base64url');
}

function parseSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }

    return secret;
}

function parseExpirationMinutes() {
    const parsed = Number(process.env.JWT_EXPIRATION_MINUTES);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPasswordHash) {
    const [salt, storedHash] = String(storedPasswordHash).split(':');
    if (!salt || !storedHash) {
        return false;
    }

    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(derivedHash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function createJwt(user) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const payload = {
        sub: String(user._id),
        name: user.name,
        email: user.email,
        plan: user.plan,
        iss: process.env.JWT_ISSUER || 'FFLOW.BACKEND.AUTH',
        aud: process.env.JWT_AUDIENCE || 'FFLOW.USERS',
        iat: nowSeconds,
        exp: nowSeconds + parseExpirationMinutes() * 60
    };

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', parseSecret())
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
    const parts = String(token).split('.');
    if (parts.length !== 3) {
        throw new HttpError(401, 'Invalid authentication token');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', parseSecret())
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(encodedSignature), Buffer.from(expectedSignature))) {
        throw new HttpError(401, 'Invalid authentication token');
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch (error) {
        throw new HttpError(401, 'Invalid authentication token');
    }

    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new HttpError(401, 'Authentication token expired or invalid');
    }

    const issuer = process.env.JWT_ISSUER || 'FFLOW.BACKEND.AUTH';
    const audience = process.env.JWT_AUDIENCE || 'FFLOW.USERS';

    if (payload.iss !== issuer || payload.aud !== audience) {
        throw new HttpError(401, 'Authentication token expired or invalid');
    }

    return payload;
}

export {
    createJwt,
    hashPassword,
    verifyJwt,
    verifyPassword
};
