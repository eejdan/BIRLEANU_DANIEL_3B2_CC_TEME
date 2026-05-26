import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import createApp from '../app.js';
import { hashPassword } from '../lib/crypto.js';
import User from '../models/User.js';
import { applyJwtTestEnv, createAuthHeader } from '../../shared/testAuth.js';

function createUserDocument(overrides = {}) {
    return {
        _id: overrides._id ?? '507f1f77bcf86cd799439021',
        name: overrides.name ?? 'Daniel',
        email: overrides.email ?? 'user@example.com',
        passwordHash: overrides.passwordHash ?? hashPassword('StrongPassword123!'),
        plan: overrides.plan ?? 'free',
        createdAt: overrides.createdAt ?? new Date('2026-05-25T00:00:00.000Z'),
        toObject() {
            return {
                _id: this._id,
                name: this.name,
                email: this.email,
                passwordHash: this.passwordHash,
                plan: this.plan,
                createdAt: this.createdAt
            };
        }
    };
}

describe('auth api', () => {
    let app;

    beforeEach(() => {
        app = createApp();
        applyJwtTestEnv();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('GET /health returns ok', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    test('POST /auth/register creates a user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);
        jest.spyOn(User, 'create').mockResolvedValue(createUserDocument());

        const response = await request(app)
            .post('/auth/register')
            .send({
                name: 'Daniel',
                email: 'user@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe('user@example.com');
        expect(response.body.message).toBe('User account created successfully.');
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            email: 'user@example.com',
            plan: 'free'
        }));
    });

    test('POST /auth/register rejects duplicate email', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(createUserDocument());

        const response = await request(app)
            .post('/auth/register')
            .send({
                name: 'Daniel',
                email: 'user@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Email address is already used');
    });

    test('POST /auth/login returns a token for valid credentials', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(createUserDocument());

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'user@example.com',
                password: 'StrongPassword123!'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        expect(response.body.user.email).toBe('user@example.com');
    });

    test('POST /auth/login rejects invalid credentials', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'user@example.com',
                password: 'WrongPassword123!'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });

    test('GET /auth/me requires a token', async () => {
        const response = await request(app).get('/auth/me');

        expect(response.status).toBe(401);
    });

    test('GET /auth/me returns the authenticated user for a valid token', async () => {
        jest.spyOn(User, 'findById').mockResolvedValue(createUserDocument());

        const response = await request(app)
            .get('/auth/me')
            .set('Authorization', createAuthHeader({
                sub: '507f1f77bcf86cd799439021',
                email: 'user@example.com',
                name: 'Daniel'
            }));

        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe('user@example.com');
    });
});
