import User from '../models/User.js';
import { HttpError } from '../lib/http.js';
import { parseBearerToken, verifyJwt } from '../../shared/auth.js';

async function authenticateUser(req, res, next) {
    try {
        const token = parseBearerToken(req.headers.authorization);
        const payload = verifyJwt(token);
        const user = await User.findById(payload.sub);

        if (!user) {
            return next(new HttpError(401, 'Authenticated user not found'));
        }

        req.user = {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            createdAt: user.createdAt,
            document: user
        };

        next();
    } catch (error) {
        next(error);
    }
}

export default authenticateUser;
