const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { getUserById, getAdmins } = require('./dataStore');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

function verifyPassword(password, passwordHash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = String(passwordHash || '').split(':');
        if (!salt || !key) {
            resolve(false);
            return;
        }
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
        });
    });
}

function issueAccessToken(payload) {
    return jwt.sign(payload, jwtSecret, { expiresIn: '12h' });
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Missing bearer token.' });
    }

    const token = authHeader.slice('Bearer '.length);
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = getUserById(decoded.sub);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token user.' });
        }

        const isAdmin = getAdmins().includes(user.email.toLowerCase());
        req.user = {
            id: user.id,
            email: user.email,
            role: isAdmin ? 'admin' : 'user'
        };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    return next();
}

function randomToken(bytes = 24) {
    return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    hashPassword,
    verifyPassword,
    issueAccessToken,
    authenticate,
    requireAdmin,
    randomToken,
    hashToken
};