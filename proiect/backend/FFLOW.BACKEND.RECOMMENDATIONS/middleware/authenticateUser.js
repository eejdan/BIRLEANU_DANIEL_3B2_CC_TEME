import {
    buildAuthenticatedUser,
    parseBearerToken,
    verifyJwt
} from '../../shared/auth.js';

async function authenticateUser(req, res, next) {
    try {
        const token = parseBearerToken(req.headers.authorization);
        const payload = verifyJwt(token);
        req.user = buildAuthenticatedUser(payload);
        next();
    } catch (error) {
        next(error);
    }
}

export default authenticateUser;
