const fs = require('node:fs');
const request = require('supertest');
const { setupDataGuard } = require('./testDataGuard');

jest.mock('../src/services', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    geocodeAddress: jest.fn().mockResolvedValue({ lat: 44.4268, lng: 26.1025 }),
    computeRouteEstimate: jest.fn().mockResolvedValue({ distanceMeters: 1000, durationSeconds: '900s' }),
    getWeatherForecast: jest.fn().mockResolvedValue({
        summary: 'Cloudy',
        temperatureC: 21,
        precipitationProbability: 20,
        severe: false
    }),
    fetchBooks: jest.fn().mockResolvedValue({
        success: true,
        data: [
            { id: 1, title: 'Book One', author: 'Author A' },
            { id: 2, title: 'Book Two', author: 'Author B' }
        ]
    }),
    proxyTema1: jest.fn().mockResolvedValue({ success: true, data: [] })
}));

process.env.JWT_SECRET = 'test-secret';

const { getUsers } = require('../src/dataStore');
const services = require('../src/services');
const app = require('../src/app');

const guard = setupDataGuard();

function resetJsonFiles() {
    guard.reset();
}

beforeEach(() => {
    resetJsonFiles();
    jest.clearAllMocks();
});

async function registerAndLogin(email = 'user@example.com', password = 'password123') {
    await request(app).post('/api/auth/register').send({
        email,
        password,
        name: 'Test User'
    });

    const loginResponse = await request(app).post('/api/auth/login').send({
        email,
        password
    });

    return loginResponse.body.accessToken;
}

describe('Auth and user flows', () => {
    test('register creates user and login returns access token', async () => {
        const registerResponse = await request(app).post('/api/auth/register').send({
            email: 'user1@example.com',
            password: 'password123',
            name: 'User One'
        });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body.success).toBe(true);

        const loginResponse = await request(app).post('/api/auth/login').send({
            email: 'user1@example.com',
            password: 'password123'
        });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.success).toBe(true);
        expect(typeof loginResponse.body.accessToken).toBe('string');
    });

    test('register with duplicate email returns 409', async () => {
        await request(app).post('/api/auth/register').send({
            email: 'dup@example.com',
            password: 'password123'
        });

        const second = await request(app).post('/api/auth/register').send({
            email: 'dup@example.com',
            password: 'password123'
        });

        expect(second.status).toBe(409);
        expect(second.body.success).toBe(false);
    });

    test('password reset request is accepted and mail service called for existing user', async () => {
        await request(app).post('/api/auth/register').send({
            email: 'reset@example.com',
            password: 'password123'
        });

        const response = await request(app).post('/api/auth/password-reset/request').send({
            email: 'reset@example.com'
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(services.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    test('non-admin cannot access admin endpoint', async () => {
        const token = await registerAndLogin('normal@example.com');

        const response = await request(app)
            .delete('/api/admin/users/some-user-id')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    test('admin can remove user', async () => {
        await request(app).post('/api/auth/register').send({
            email: 'admin@example.com',
            password: 'password123'
        });
        await request(app).post('/api/auth/register').send({
            email: 'target@example.com',
            password: 'password123'
        });

        fs.writeFileSync(guard.paths.adminsPath, JSON.stringify({ admins: ['admin@example.com'] }, null, 2), 'utf8');

        const adminLogin = await request(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'password123'
        });
        const adminToken = adminLogin.body.accessToken;

        const users = getUsers();
        const target = users.find((user) => user.email === 'target@example.com');

        const removeResponse = await request(app)
            .delete(`/api/admin/users/${target.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(removeResponse.status).toBe(200);
        expect(removeResponse.body.success).toBe(true);
    });
});

describe('Schedule and recommendation flows', () => {
    test('creating and listing one-time events by date works', async () => {
        const token = await registerAndLogin('event@example.com');

        const createResponse = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Meeting',
                startDateTime: '2026-03-20T09:00:00.000Z',
                endDateTime: '2026-03-20T10:00:00.000Z',
                location: 'Office',
                description: 'Daily sync',
                recurrence: 'once',
                lat: 44.43,
                lng: 26.1
            });

        expect(createResponse.status).toBe(201);

        const listResponse = await request(app)
            .get('/api/events?date=2026-03-20')
            .set('Authorization', `Bearer ${token}`);

        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body.events)).toBe(true);
        expect(listResponse.body.events).toHaveLength(1);
    });

    test('wakeup weekly and override can be set and read', async () => {
        const token = await registerAndLogin('wakeup@example.com');

        const weeklyResponse = await request(app)
            .patch('/api/me/wakeup/weekly')
            .set('Authorization', `Bearer ${token}`)
            .send({ dayOfWeek: 'monday', time: '07:00' });

        expect(weeklyResponse.status).toBe(200);

        const overrideResponse = await request(app)
            .patch('/api/me/wakeup/override')
            .set('Authorization', `Bearer ${token}`)
            .send({ date: '2026-03-16', time: '06:30' });

        expect(overrideResponse.status).toBe(200);

        const getResponse = await request(app)
            .get('/api/me/wakeup?date=2026-03-16')
            .set('Authorization', `Bearer ${token}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.wakeupTime).toBe('06:30');
        expect(getResponse.body.source).toBe('override');
    });

    test('reading recommendations returns activity suggestion', async () => {
        const token = await registerAndLogin('read@example.com');

        const response = await request(app)
            .get('/api/recommendations/reading?date=2026-03-20')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.recommendation.suggestedActivity.title).toBe('Reading Activity');
        expect(services.fetchBooks).toHaveBeenCalledTimes(1);
    });

    test('weather upstream failure returns 502', async () => {
        const token = await registerAndLogin('weather@example.com');

        await request(app)
            .patch('/api/me/home')
            .set('Authorization', `Bearer ${token}`)
            .send({ lat: 44.43, lng: 26.1, address: 'Bucharest' });

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Office',
                startDateTime: '2026-03-20T09:00:00.000Z',
                endDateTime: '2026-03-20T10:00:00.000Z',
                location: 'HQ',
                recurrence: 'once',
                lat: 44.45,
                lng: 26.12
            });

        services.getWeatherForecast.mockRejectedValueOnce(
            Object.assign(new Error('Weather failed'), { type: 'external_api', provider: 'google_weather' })
        );

        const response = await request(app)
            .get('/api/weather?date=2026-03-20')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(502);
        expect(response.body.success).toBe(false);
    });
});
