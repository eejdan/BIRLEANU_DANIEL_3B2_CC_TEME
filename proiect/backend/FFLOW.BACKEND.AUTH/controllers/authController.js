import User from '../models/User.js';
import { createJwt, hashPassword, verifyPassword } from '../lib/crypto.js';
import { ensure, HttpError } from '../lib/http.js';
import { serializeAuthUserResponse, serializeLoginResponse } from '../lib/serializers.js';
import { parseLoginRequest, parseRegisterRequest } from '../lib/validation.js';

async function register(req, res) {
    const payload = parseRegisterRequest(req.body);

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
        throw new HttpError(409, 'Email address is already used');
    }

    const user = await User.create({
        name: payload.name,
        email: payload.email,
        passwordHash: hashPassword(payload.password),
        plan: 'free'
    });

    res.status(201).json(serializeAuthUserResponse(user, 'User account created successfully.'));
}

async function login(req, res) {
    const payload = parseLoginRequest(req.body);

    const user = await User.findOne({ email: payload.email });
    ensure(user, 401, 'Invalid email or password');

    const isValidPassword = verifyPassword(payload.password, user.passwordHash);
    ensure(isValidPassword, 401, 'Invalid email or password');

    const token = createJwt(user);
    res.status(200).json(serializeLoginResponse(token, user));
}

async function getCurrentUser(req, res) {
    const user = req.user?.document ?? req.user;
    ensure(user, 401, 'Unauthorized');

    res.status(200).json(serializeAuthUserResponse(user));
}

async function logout(req, res) {
    ensure(req.user, 401, 'Unauthorized');

    res.status(200).json({
        message: 'User logged out successfully.'
    });
}

export {
    getCurrentUser,
    login,
    logout,
    register
};
