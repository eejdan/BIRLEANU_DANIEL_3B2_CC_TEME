import crypto from 'node:crypto';

function applyJwtTestEnv() {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_ISSUER = process.env.JWT_ISSUER || 'FFLOW.BACKEND.AUTH';
    process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'FFLOW.USERS';
    process.env.JWT_EXPIRATION_MINUTES = process.env.JWT_EXPIRATION_MINUTES || '60';
}

function createTestJwt(overrides = {}) {
    applyJwtTestEnv();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const payload = {
        sub: overrides.sub || '111111111111111111111111',
        name: overrides.name || 'Test User',
        email: overrides.email || 'user@example.com',
        plan: overrides.plan || 'free',
        iss: process.env.JWT_ISSUER,
        aud: process.env.JWT_AUDIENCE,
        iat: nowSeconds,
        exp: nowSeconds + Number(process.env.JWT_EXPIRATION_MINUTES) * 60
    };

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function createAuthHeader(overrides = {}) {
    return `Bearer ${createTestJwt(overrides)}`;
}

export { applyJwtTestEnv, createAuthHeader, createTestJwt };
