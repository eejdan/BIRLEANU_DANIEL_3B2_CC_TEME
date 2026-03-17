const jwt = require('jsonwebtoken');

describe('auth module', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('hashPassword and verifyPassword work for valid and invalid passwords', async () => {
        jest.doMock('../src/dataStore', () => ({ getUserById: jest.fn(), getAdmins: jest.fn(() => []) }));
        const auth = require('../src/auth');

        const hash = await auth.hashPassword('password123');
        expect(typeof hash).toBe('string');

        await expect(auth.verifyPassword('password123', hash)).resolves.toBe(true);
        await expect(auth.verifyPassword('wrong', hash)).resolves.toBe(false);
        await expect(auth.verifyPassword('password123', 'invalid')).resolves.toBe(false);
    });

    test('issueAccessToken returns signed token', () => {
        process.env.JWT_SECRET = 'test-secret';
        jest.doMock('../src/dataStore', () => ({ getUserById: jest.fn(), getAdmins: jest.fn(() => []) }));
        const auth = require('../src/auth');

        const token = auth.issueAccessToken({ sub: 'u1', role: 'user' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.sub).toBe('u1');
        expect(decoded.role).toBe('user');
    });

    test('authenticate handles missing and invalid bearer token', () => {
        const getUserById = jest.fn();
        const getAdmins = jest.fn(() => []);
        jest.doMock('../src/dataStore', () => ({ getUserById, getAdmins }));
        const auth = require('../src/auth');

        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        auth.authenticate({ headers: {} }, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);

        res.status.mockClear();
        res.json.mockClear();

        auth.authenticate({ headers: { authorization: 'Bearer invalid-token' } }, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('authenticate sets req.user and calls next for valid token; requireAdmin enforces role', () => {
        process.env.JWT_SECRET = 'test-secret';
        const getUserById = jest.fn(() => ({ id: 'u1', email: 'admin@example.com' }));
        const getAdmins = jest.fn(() => ['admin@example.com']);
        jest.doMock('../src/dataStore', () => ({ getUserById, getAdmins }));
        const auth = require('../src/auth');

        const token = jwt.sign({ sub: 'u1' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        auth.authenticate(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.role).toBe('admin');

        const adminNext = jest.fn();
        auth.requireAdmin({ user: { role: 'admin' } }, res, adminNext);
        expect(adminNext).toHaveBeenCalled();

        res.status.mockClear();
        auth.requireAdmin({ user: { role: 'user' } }, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('randomToken and hashToken produce expected format and deterministic hash', () => {
        jest.doMock('../src/dataStore', () => ({ getUserById: jest.fn(), getAdmins: jest.fn(() => []) }));
        const auth = require('../src/auth');

        const token = auth.randomToken(8);
        expect(token).toHaveLength(16);

        const hash1 = auth.hashToken('abc');
        const hash2 = auth.hashToken('abc');
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64);
    });
});
