import { HttpError } from './http.js';

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function parseRequiredString(value, fieldName) {
    if (!isNonEmptyString(value)) {
        throw new HttpError(400, `${fieldName} is required`);
    }

    return value.trim();
}

function parseEmail(value, fieldName) {
    const email = parseRequiredString(value, fieldName).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new HttpError(400, `${fieldName} must be a valid email address`);
    }

    return email;
}

function parsePassword(value, fieldName) {
    const password = parseRequiredString(value, fieldName);
    if (password.length < 8) {
        throw new HttpError(400, `${fieldName} must be at least 8 characters long`);
    }

    return password;
}

function parseRegisterRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    return {
        name: parseRequiredString(body.name, 'name'),
        email: parseEmail(body.email, 'email'),
        password: parsePassword(body.password, 'password')
    };
}

function parseLoginRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    return {
        email: parseEmail(body.email, 'email'),
        password: parseRequiredString(body.password, 'password')
    };
}

function parseBearerToken(authorizationHeader) {
    if (!authorizationHeader) {
        return null;
    }

    const [scheme, token] = String(authorizationHeader).split(' ');
    if (scheme !== 'Bearer' || !token) {
        throw new HttpError(401, 'Invalid authorization header');
    }

    return token;
}

export {
    parseBearerToken,
    parseLoginRequest,
    parseRegisterRequest
};
