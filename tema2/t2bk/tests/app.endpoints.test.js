const fs = require('node:fs');
const request = require('supertest');
const { setupDataGuard } = require('./testDataGuard');

jest.mock('../src/services', () => ({
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    geocodeAddress: jest.fn().mockResolvedValue({ lat: 44.4268, lng: 26.1025 }),
    computeRouteEstimate: jest.fn().mockResolvedValue({ distanceMeters: 1200, durationSeconds: '1200s' }),
    getWeatherForecast: jest.fn().mockResolvedValue({
        summary: 'Sunny',
        temperatureC: 22,
        precipitationProbability: 10,
        severe: false
    }),
    fetchBooks: jest.fn().mockResolvedValue({ success: true, data: [{ id: 1, title: 'A' }] }),
    proxyTema1: jest.fn().mockResolvedValue({ success: true, data: [] })
}));

process.env.JWT_SECRET = 'test-secret';

const services = require('../src/services');
const { getUsers } = require('../src/dataStore');
const app = require('../src/app');

const guard = setupDataGuard();

beforeEach(() => {
    guard.reset();
    jest.clearAllMocks();
});

async function registerAndLogin(email = 'user@example.com', password = 'password123') {
    await request(app).post('/api/auth/register').send({ email, password, name: 'User' });
    const response = await request(app).post('/api/auth/login').send({ email, password });
    return response.body.accessToken;
}

async function createEvent(token, payload = {}) {
    return request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Event',
            startDateTime: '2026-03-20T09:00:00.000Z',
            endDateTime: '2026-03-20T10:00:00.000Z',
            location: 'Office',
            description: 'desc',
            recurrence: 'once',
            lat: 44.4,
            lng: 26.1,
            ...payload
        });
}

describe('General and auth negative routes', () => {
    test('health route works', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.service).toBe('t2bk-backend');
    });

    test('unknown route returns 404', async () => {
        const response = await request(app).get('/api/nope');
        expect(response.status).toBe(404);
    });

    test('protected route without token returns 401', async () => {
        const response = await request(app).get('/api/me');
        expect(response.status).toBe(401);
    });

    test('login invalid payload returns 400', async () => {
        const response = await request(app).post('/api/auth/login').send({ email: 'x' });
        expect(response.status).toBe(400);
    });

    test('password reset request invalid email returns 400', async () => {
        const response = await request(app).post('/api/auth/password-reset/request').send({ email: 'bad' });
        expect(response.status).toBe(400);
    });

    test('password reset request for unknown user is accepted and does not send email', async () => {
        const response = await request(app).post('/api/auth/password-reset/request').send({ email: 'none@example.com' });
        expect(response.status).toBe(200);
        expect(services.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('password reset confirm invalid token returns 400', async () => {
        const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({ token: 'invalid-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(400);
    });

    test('password reset confirm expired token returns 400', async () => {
        await request(app).post('/api/auth/register').send({ email: 'exp@example.com', password: 'password123' });
        await request(app).post('/api/auth/password-reset/request').send({ email: 'exp@example.com' });

        const users = getUsers();
        users[0].resetTokenExpiresAt = new Date(Date.now() - 1000).toISOString();
        fs.writeFileSync(guard.paths.usersPath, JSON.stringify(users, null, 2), 'utf8');

        const response = await request(app)
            .post('/api/auth/password-reset/confirm')
            .send({ token: 'wrong-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(400);
    });
});

describe('Profile, wakeup, events and transport routes', () => {
    test('me route returns profile details', async () => {
        const token = await registerAndLogin('me@example.com');
        const response = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.user.email).toBe('me@example.com');
    });

    test('set home by address uses geocode', async () => {
        const token = await registerAndLogin('home@example.com');
        const response = await request(app)
            .patch('/api/me/home')
            .set('Authorization', `Bearer ${token}`)
            .send({ address: 'Bucharest, Romania' });

        expect(response.status).toBe(200);
        expect(services.geocodeAddress).toHaveBeenCalledTimes(1);
        expect(response.body.home.lat).toBe(44.4268);
    });

    test('set home invalid payload returns 400', async () => {
        const token = await registerAndLogin('homebad@example.com');
        const response = await request(app)
            .patch('/api/me/home')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(response.status).toBe(400);
    });

    test('wakeup weekly invalid time returns 400', async () => {
        const token = await registerAndLogin('wkbad@example.com');
        const response = await request(app)
            .patch('/api/me/wakeup/weekly')
            .set('Authorization', `Bearer ${token}`)
            .send({ dayOfWeek: 'monday', time: '70:00' });
        expect(response.status).toBe(400);
    });

    test('events create invalid payload returns 400', async () => {
        const token = await registerAndLogin('eventbad@example.com');
        const response = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'x' });
        expect(response.status).toBe(400);
    });

    test('events patch/delete not found return 404', async () => {
        const token = await registerAndLogin('event404@example.com');
        const patchResponse = await request(app)
            .patch('/api/events/not-found')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated' });

        const deleteResponse = await request(app)
            .delete('/api/events/not-found')
            .set('Authorization', `Bearer ${token}`);

        expect(patchResponse.status).toBe(404);
        expect(deleteResponse.status).toBe(404);
    });

    test('events patch validates payload and delete succeeds', async () => {
        const token = await registerAndLogin('eventedit@example.com');
        const create = await createEvent(token);
        const eventId = create.body.event.id;

        const invalidPatch = await request(app)
            .patch(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ endDateTime: '2026-03-20T08:00:00.000Z' });
        expect(invalidPatch.status).toBe(400);

        const del = await request(app)
            .delete(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(del.status).toBe(200);
    });

    test('commute estimates with no home returns 400', async () => {
        const token = await registerAndLogin('commute1@example.com');
        const response = await request(app)
            .get('/api/commute-estimates?date=2026-03-20')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(400);
    });

    test('commute estimates and walk prediction success paths', async () => {
        const token = await registerAndLogin('commute2@example.com');

        await request(app)
            .patch('/api/me/home')
            .set('Authorization', `Bearer ${token}`)
            .send({ lat: 44.43, lng: 26.1 });

        const first = await createEvent(token, {
            title: 'E1',
            startDateTime: '2026-03-20T09:00:00.000Z',
            endDateTime: '2026-03-20T10:00:00.000Z'
        });
        const second = await createEvent(token, {
            title: 'E2',
            startDateTime: '2026-03-20T11:00:00.000Z',
            endDateTime: '2026-03-20T12:00:00.000Z',
            lat: 44.45,
            lng: 26.15
        });

        const commute = await request(app)
            .get(`/api/commute-estimates?date=2026-03-20&currentEventId=${first.body.event.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(commute.status).toBe(200);
        expect(commute.body.firstActivity).not.toBeNull();

        services.getWeatherForecast.mockResolvedValueOnce({
            summary: 'Storm',
            temperatureC: 19,
            precipitationProbability: 95,
            severe: true
        });

        const walkPrediction = await request(app)
            .get(`/api/walk-prediction?date=2026-03-20&currentEventId=${first.body.event.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(walkPrediction.status).toBe(200);
        expect(walkPrediction.body.canWalk).toBe(false);
        expect(second.status).toBe(201);
    });

    test('weather invalid date returns 400 and recommendations invalid date returns 400', async () => {
        const token = await registerAndLogin('weatherbad@example.com');

        const weather = await request(app)
            .get('/api/weather?date=not-a-date')
            .set('Authorization', `Bearer ${token}`);

        const recommendation = await request(app)
            .get('/api/recommendations/reading?date=nope')
            .set('Authorization', `Bearer ${token}`);

        expect(weather.status).toBe(400);
        expect(recommendation.status).toBe(400);
    });
});

describe('Admin tema1 proxy routes and error handlers', () => {
    async function adminToken() {
        await request(app).post('/api/auth/register').send({ email: 'admin@example.com', password: 'password123' });
        fs.writeFileSync(guard.paths.adminsPath, JSON.stringify({ admins: ['admin@example.com'] }, null, 2), 'utf8');
        const response = await request(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'password123'
        });
        return response.body.accessToken;
    }

    test('non-admin admin-books access returns 403', async () => {
        const token = await registerAndLogin('plain@example.com');
        const response = await request(app)
            .get('/api/admin/books')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(403);
    });

    test('all admin proxy endpoints call proxyTema1 with expected params', async () => {
        const token = await adminToken();

        const reqs = await Promise.all([
            request(app).get('/api/admin/books').set('Authorization', `Bearer ${token}`),
            request(app).post('/api/admin/books').set('Authorization', `Bearer ${token}`).send({ title: 'B' }),
            request(app).put('/api/admin/books/1').set('Authorization', `Bearer ${token}`).send({ title: 'B2' }),
            request(app).delete('/api/admin/books/1').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/admin/authors').set('Authorization', `Bearer ${token}`),
            request(app).post('/api/admin/authors').set('Authorization', `Bearer ${token}`).send({ name: 'A' }),
            request(app).put('/api/admin/authors/1').set('Authorization', `Bearer ${token}`).send({ name: 'A2' }),
            request(app).delete('/api/admin/authors/1').set('Authorization', `Bearer ${token}`)
        ]);

        expect(reqs[0].status).toBe(200);
        expect(reqs[1].status).toBe(201);
        expect(reqs[2].status).toBe(200);
        expect(reqs[3].status).toBe(200);
        expect(reqs[4].status).toBe(200);
        expect(reqs[5].status).toBe(201);
        expect(reqs[6].status).toBe(200);
        expect(reqs[7].status).toBe(200);

        expect(services.proxyTema1).toHaveBeenCalledWith('/books', 'GET');
        expect(services.proxyTema1).toHaveBeenCalledWith('/books', 'POST', { title: 'B' });
        expect(services.proxyTema1).toHaveBeenCalledWith('/books/1', 'PUT', { title: 'B2' });
        expect(services.proxyTema1).toHaveBeenCalledWith('/books/1', 'DELETE');
        expect(services.proxyTema1).toHaveBeenCalledWith('/authors', 'GET');
        expect(services.proxyTema1).toHaveBeenCalledWith('/authors', 'POST', { name: 'A' });
        expect(services.proxyTema1).toHaveBeenCalledWith('/authors/1', 'PUT', { name: 'A2' });
        expect(services.proxyTema1).toHaveBeenCalledWith('/authors/1', 'DELETE');
    });

    test('statusCode error returns provided status and generic error returns 500', async () => {
        const token = await adminToken();

        services.proxyTema1.mockRejectedValueOnce(Object.assign(new Error('bad request'), { statusCode: 418 }));
        const statusErrorResponse = await request(app)
            .get('/api/admin/books')
            .set('Authorization', `Bearer ${token}`);

        services.proxyTema1.mockRejectedValueOnce(new Error('boom'));
        const internalErrorResponse = await request(app)
            .get('/api/admin/books')
            .set('Authorization', `Bearer ${token}`);

        expect(statusErrorResponse.status).toBe(418);
        expect(internalErrorResponse.status).toBe(500);
    });
});
