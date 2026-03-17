const express = require('express');
const {
    ensureDataFiles,
    getUsers,
    saveUsers,
    getUserData,
    saveUserData,
    getAdmins,
    getUserById,
    getUserDataByUserId,
    upsertUserData,
    deleteUserById,
    deleteUserDataByUserId
} = require('./dataStore');
const {
    hashPassword,
    verifyPassword,
    issueAccessToken,
    authenticate,
    requireAdmin,
    randomToken,
    hashToken
} = require('./auth');
const {
    validateEmail,
    validateEventPayload,
    parseDateOnly,
    isIsoDateTime,
    parseDurationSeconds,
    getDayName,
    getEventsForDate,
    findFirstAndNextEvents,
    buildReadingRecommendation
} = require('./helpers');
const {
    sendPasswordResetEmail,
    geocodeAddress,
    computeRouteEstimate,
    getWeatherForecast,
    fetchBooks,
    proxyTema1
} = require('./services');

ensureDataFiles();

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
const allowedOrigins = new Set(configuredOrigins.length ? configuredOrigins : defaultOrigins);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (!origin) {
        return next();
    }

    if (allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        if (!allowedOrigins.has(origin)) {
            return res.status(403).json({ success: false, message: 'Origin not allowed by CORS.' });
        }
        return res.status(204).end();
    }

    return next();
});

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    res.type('application/json');
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ success: true, service: 't2bk-backend' });
});

app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body || {};
        if (!validateEmail(email) || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password. Password must have at least 8 chars.'
            });
        }

        const users = getUsers();
        if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
            return res.status(409).json({ success: false, message: 'Email already in use.' });
        }

        const createdAt = new Date().toISOString();
        const newUser = {
            id: randomToken(8),
            email: email.toLowerCase(),
            name: typeof name === 'string' ? name.trim() : '',
            passwordHash: await hashPassword(password),
            createdAt,
            resetTokenHash: null,
            resetTokenExpiresAt: null
        };

        users.push(newUser);
        saveUsers(users);

        const freshUserData = getUserData();
        freshUserData.push({
            userId: newUser.id,
            home: null,
            wakeupWeekly: {
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
                sunday: null
            },
            wakeupOverrides: {},
            events: []
        });
        saveUserData(freshUserData);

        return res.status(201).json({
            success: true,
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
    } catch (error) {
        return next(error);
    }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (!validateEmail(email) || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid credentials payload.' });
        }

        const users = getUsers();
        const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const admins = getAdmins();
        const role = admins.includes(user.email.toLowerCase()) ? 'admin' : 'user';
        const accessToken = issueAccessToken({ sub: user.id, role });

        return res.status(200).json({
            success: true,
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role
            }
        });
    } catch (error) {
        return next(error);
    }
});

app.post('/api/auth/password-reset/request', async (req, res, next) => {
    try {
        const { email } = req.body || {};
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email.' });
        }

        const users = getUsers();
        const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (user) {
            const token = randomToken(32);
            user.resetTokenHash = hashToken(token);
            user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            saveUsers(users);
            await sendPasswordResetEmail(user.email, token);
        }

        return res.status(200).json({
            success: true,
            message: 'If the account exists, a password reset link was sent.'
        });
    } catch (error) {
        return next(error);
    }
});

app.post('/api/auth/password-reset/confirm', async (req, res, next) => {
    try {
        const { token, newPassword } = req.body || {};
        if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Invalid reset payload.' });
        }

        const users = getUsers();
        const tokenHash = hashToken(token);
        const user = users.find((item) => item.resetTokenHash === tokenHash);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset token.' });
        }

        if (!user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
            return res.status(400).json({ success: false, message: 'Reset token expired.' });
        }

        user.passwordHash = await hashPassword(newPassword);
        user.resetTokenHash = null;
        user.resetTokenExpiresAt = null;
        saveUsers(users);

        return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        return next(error);
    }
});

app.get('/api/me', authenticate, (req, res) => {
    const user = getUserById(req.user.id);
    const userData = getUserDataByUserId(req.user.id);
    return res.status(200).json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: req.user.role,
            home: userData.home,
            wakeupWeekly: userData.wakeupWeekly,
            wakeupOverrides: userData.wakeupOverrides
        }
    });
});

app.patch('/api/me/home', authenticate, async (req, res, next) => {
    try {
        const { address, lat, lng } = req.body || {};
        const data = getUserDataByUserId(req.user.id);

        if (typeof lat === 'number' && typeof lng === 'number') {
            data.home = { address: address || null, lat, lng };
        } else if (typeof address === 'string' && address.trim().length > 2) {
            const coords = await geocodeAddress(address.trim());
            data.home = { address: address.trim(), lat: coords.lat, lng: coords.lng };
        } else {
            return res.status(400).json({
                success: false,
                message: 'Provide either lat/lng or address.'
            });
        }

        upsertUserData(data);
        return res.status(200).json({ success: true, home: data.home });
    } catch (error) {
        return next(error);
    }
});

app.patch('/api/me/wakeup/weekly', authenticate, (req, res) => {
    const { dayOfWeek, time } = req.body || {};
    if (typeof dayOfWeek !== 'string' || typeof time !== 'string') {
        return res.status(400).json({ success: false, message: 'dayOfWeek and time are required.' });
    }

    const day = dayOfWeek.toLowerCase();
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
        return res.status(400).json({ success: false, message: 'Invalid dayOfWeek or time format HH:mm.' });
    }

    const data = getUserDataByUserId(req.user.id);
    data.wakeupWeekly[day] = time;
    upsertUserData(data);

    return res.status(200).json({ success: true, wakeupWeekly: data.wakeupWeekly });
});

app.patch('/api/me/wakeup/override', authenticate, (req, res) => {
    const { date, time } = req.body || {};
    if (!parseDateOnly(date) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
        return res.status(400).json({ success: false, message: 'Invalid date or time format.' });
    }

    const data = getUserDataByUserId(req.user.id);
    data.wakeupOverrides[date] = time;
    upsertUserData(data);

    return res.status(200).json({ success: true, wakeupOverrides: data.wakeupOverrides });
});

app.get('/api/me/wakeup', authenticate, (req, res) => {
    const { date } = req.query;
    if (!parseDateOnly(date)) {
        return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
    }

    const data = getUserDataByUserId(req.user.id);
    const override = data.wakeupOverrides[date];
    const dayName = getDayName(date);
    const weekly = data.wakeupWeekly[dayName];

    return res.status(200).json({
        success: true,
        date,
        wakeupTime: override || weekly || null,
        source: override ? 'override' : 'weekly'
    });
});

app.post('/api/events', authenticate, (req, res) => {
    const validation = validateEventPayload(req.body || {});
    if (!validation.ok) {
        return res.status(400).json({ success: false, message: validation.message });
    }

    const event = {
        id: randomToken(8),
        title: req.body.title.trim(),
        startDateTime: req.body.startDateTime,
        endDateTime: req.body.endDateTime,
        location: req.body.location.trim(),
        description: typeof req.body.description === 'string' ? req.body.description.trim() : '',
        recurrence: req.body.recurrence,
        lat: typeof req.body.lat === 'number' ? req.body.lat : null,
        lng: typeof req.body.lng === 'number' ? req.body.lng : null
    };

    const data = getUserDataByUserId(req.user.id);
    data.events.push(event);
    upsertUserData(data);

    return res.status(201).json({ success: true, event });
});

app.get('/api/events', authenticate, (req, res) => {
    const { date } = req.query;
    const data = getUserDataByUserId(req.user.id);

    if (!date) {
        return res.status(200).json({ success: true, events: data.events });
    }

    if (!parseDateOnly(date)) {
        return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
    }

    const events = getEventsForDate(data.events, date);
    return res.status(200).json({ success: true, date, events });
});

app.patch('/api/events/:eventId', authenticate, (req, res) => {
    const { eventId } = req.params;
    const updates = req.body || {};
    const data = getUserDataByUserId(req.user.id);

    const index = data.events.findIndex((event) => event.id === eventId);
    if (index < 0) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const mergedEvent = { ...data.events[index], ...updates };
    const validation = validateEventPayload(mergedEvent);
    if (!validation.ok) {
        return res.status(400).json({ success: false, message: validation.message });
    }

    data.events[index] = mergedEvent;
    upsertUserData(data);
    return res.status(200).json({ success: true, event: mergedEvent });
});

app.delete('/api/events/:eventId', authenticate, (req, res) => {
    const { eventId } = req.params;
    const data = getUserDataByUserId(req.user.id);
    const originalLength = data.events.length;
    data.events = data.events.filter((event) => event.id !== eventId);

    if (data.events.length === originalLength) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    upsertUserData(data);
    return res.status(200).json({ success: true, deletedEventId: eventId });
});

app.get('/api/commute-estimates', authenticate, async (req, res, next) => {
    try {
        const { date, currentEventId } = req.query;
        if (!parseDateOnly(date)) {
            return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
        }

        const data = getUserDataByUserId(req.user.id);
        if (!data.home || typeof data.home.lat !== 'number' || typeof data.home.lng !== 'number') {
            return res.status(400).json({ success: false, message: 'Home location not set.' });
        }

        const events = getEventsForDate(data.events, date)
            .filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number')
            .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

        if (events.length === 0) {
            return res.status(200).json({ success: true, date, firstActivity: null, nextFromCurrent: null });
        }

        const first = events[0];
        const firstByCar = await computeRouteEstimate(data.home, first, 'DRIVE');
        const firstByWalk = await computeRouteEstimate(data.home, first, 'WALK');

        let nextFromCurrent = null;
        if (currentEventId) {
            const pair = findFirstAndNextEvents(events, currentEventId);
            if (pair && pair.current && pair.next) {
                nextFromCurrent = {
                    fromEventId: pair.current.id,
                    toEventId: pair.next.id,
                    car: await computeRouteEstimate(pair.current, pair.next, 'DRIVE'),
                    walk: await computeRouteEstimate(pair.current, pair.next, 'WALK')
                };
            }
        }

        return res.status(200).json({
            success: true,
            date,
            firstActivity: {
                eventId: first.id,
                car: firstByCar,
                walk: firstByWalk
            },
            nextFromCurrent
        });
    } catch (error) {
        return next(error);
    }
});

app.get('/api/weather', authenticate, async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!parseDateOnly(date)) {
            return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
        }

        const data = getUserDataByUserId(req.user.id);
        if (!data.home || typeof data.home.lat !== 'number' || typeof data.home.lng !== 'number') {
            return res.status(400).json({ success: false, message: 'Home location not set.' });
        }

        const weather = await getWeatherForecast(data.home.lat, data.home.lng, date);
        return res.status(200).json({ success: true, date, weather });
    } catch (error) {
        return next(error);
    }
});

app.get('/api/walk-prediction', authenticate, async (req, res, next) => {
    try {
        const { date, currentEventId } = req.query;
        if (!parseDateOnly(date)) {
            return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
        }

        const data = getUserDataByUserId(req.user.id);
        if (!data.home || typeof data.home.lat !== 'number' || typeof data.home.lng !== 'number') {
            return res.status(400).json({ success: false, message: 'Home location not set.' });
        }

        const events = getEventsForDate(data.events, date)
            .filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number')
            .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
        if (events.length === 0) {
            return res.status(200).json({ success: true, prediction: null, reason: 'No events found.' });
        }

        let origin = data.home;
        let destination = events[0];
        if (currentEventId) {
            const pair = findFirstAndNextEvents(events, currentEventId);
            if (pair && pair.current && pair.next) {
                origin = pair.current;
                destination = pair.next;
            }
        }

        const walkEstimate = await computeRouteEstimate(origin, destination, 'WALK');
        const weather = await getWeatherForecast(origin.lat, origin.lng, date);

        const precipitationProbability = Number(weather.precipitationProbability ?? 0);
        const walkMinutes = Math.ceil(parseDurationSeconds(walkEstimate.durationSeconds) / 60);
        const severe = Boolean(weather.severe);
        const canWalk = !severe && precipitationProbability <= 40 && walkMinutes <= 45;

        return res.status(200).json({
            success: true,
            canWalk,
            factors: {
                walkMinutes,
                precipitationProbability,
                severe
            },
            route: walkEstimate,
            weather
        });
    } catch (error) {
        return next(error);
    }
});

app.get('/api/recommendations/reading', authenticate, async (req, res, next) => {
    try {
        const { date } = req.query;
        if (date && !parseDateOnly(date)) {
            return res.status(400).json({ success: false, message: 'date query must be YYYY-MM-DD.' });
        }

        const books = await fetchBooks();
        const data = getUserDataByUserId(req.user.id);
        const recommendation = buildReadingRecommendation(books, data.events, date || new Date().toISOString().slice(0, 10));
        return res.status(200).json({ success: true, recommendation });
    } catch (error) {
        return next(error);
    }
});

app.delete('/api/admin/users/:userId', authenticate, requireAdmin, (req, res) => {
    const { userId } = req.params;
    const deletedUser = deleteUserById(userId);
    deleteUserDataByUserId(userId);

    if (!deletedUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, deletedUserId: userId });
});

app.get('/api/admin/books', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1('/books', 'GET');
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.post('/api/admin/books', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1('/books', 'POST', req.body || {});
        return res.status(201).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.put('/api/admin/books/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1(`/books/${req.params.id}`, 'PUT', req.body || {});
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.delete('/api/admin/books/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1(`/books/${req.params.id}`, 'DELETE');
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.get('/api/admin/authors', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1('/authors', 'GET');
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.post('/api/admin/authors', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1('/authors', 'POST', req.body || {});
        return res.status(201).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.put('/api/admin/authors/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1(`/authors/${req.params.id}`, 'PUT', req.body || {});
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.delete('/api/admin/authors/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const payload = await proxyTema1(`/authors/${req.params.id}`, 'DELETE');
        return res.status(200).json(payload);
    } catch (error) {
        return next(error);
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (error && error.type === 'external_api') {
        return res.status(502).json({
            success: false,
            message: error.message,
            provider: error.provider,
            upstreamStatusCode: error.statusCode || null,
            upstreamError: error.payload || null
        });
    }

    if (error && error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Internal server error.' });
});

module.exports = app;