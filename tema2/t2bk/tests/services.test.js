describe('services module', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.resetModules();
        global.fetch = jest.fn();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('sendPasswordResetEmail skips when mailgun config missing', async () => {
        const services = require('../src/services');
        await services.sendPasswordResetEmail('u@example.com', 'token');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('sendPasswordResetEmail sends mail when configured', async () => {
        process.env.MAILGUN_API_KEY = 'key';
        process.env.MAILGUN_DOMAIN = 'example.com';
        process.env.MAILGUN_FROM = 'noreply@example.com';

        global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ id: 'ok' }) });
        const services = require('../src/services');

        await services.sendPasswordResetEmail('u@example.com', 'abc');
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch.mock.calls[0][0]).toContain('api.mailgun.net/v3/example.com/messages');
    });

    test('geocodeAddress throws when key missing and returns coords when response is valid', async () => {
        let services = require('../src/services');
        await expect(services.geocodeAddress('Bucharest')).rejects.toMatchObject({ statusCode: 500 });

        jest.resetModules();
        process.env.GOOGLE_API_KEY = 'google-key';
        global.fetch.mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify({ results: [{ geometry: { location: { lat: 1, lng: 2 } } }] })
        });

        services = require('../src/services');
        await expect(services.geocodeAddress('Bucharest')).resolves.toEqual({ lat: 1, lng: 2 });
    });

    test('computeRouteEstimate returns mapped route and handles missing route', async () => {
        process.env.GOOGLE_API_KEY = 'google-key';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            text: async () => JSON.stringify({ routes: [{ distanceMeters: 123, duration: '456s' }] })
        });

        let services = require('../src/services');
        await expect(services.computeRouteEstimate({ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, 'WALK')).resolves.toEqual({
            distanceMeters: 123,
            durationSeconds: '456s'
        });

        jest.resetModules();
        process.env.GOOGLE_API_KEY = 'google-key';
        global.fetch.mockResolvedValue({ ok: true, text: async () => JSON.stringify({ routes: [] }) });
        services = require('../src/services');
        await expect(services.computeRouteEstimate({ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, 'WALK')).rejects.toMatchObject({
            statusCode: 404
        });
    });

    test('getWeatherForecast maps forecast payload and checks required endpoint', async () => {
        let services = require('../src/services');
        await expect(services.getWeatherForecast(1, 2, '2026-03-20')).rejects.toMatchObject({ statusCode: 500 });

        jest.resetModules();
        process.env.GOOGLE_API_KEY = 'google-key';
        process.env.GOOGLE_WEATHER_API_URL = 'https://weather.example.com';
        global.fetch.mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify({
                forecast: {
                    condition: 'Rain',
                    temperature: 18,
                    rainProbability: 70,
                    isSevere: true
                }
            })
        });

        services = require('../src/services');
        await expect(services.getWeatherForecast(1, 2, '2026-03-20')).resolves.toEqual({
            summary: 'Rain',
            temperatureC: 18,
            precipitationProbability: 70,
            severe: true
        });
    });

    test('proxyTema1 and fetchBooks call tema1 endpoint and propagate external errors', async () => {
        process.env.TEMA1_API_URL = 'http://localhost:3000';
        global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ ok: 1 }) });

        let services = require('../src/services');
        await expect(services.proxyTema1('/books', 'GET')).resolves.toEqual({ ok: 1 });

        jest.resetModules();
        process.env.TEMA1_API_URL = 'http://localhost:3000';
        global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true }) });
        services = require('../src/services');
        await expect(services.fetchBooks()).resolves.toEqual({ success: true });

        jest.resetModules();
        process.env.TEMA1_API_URL = 'http://localhost:3000';
        global.fetch.mockResolvedValueOnce({ ok: false, status: 502, text: async () => 'bad gateway' });
        services = require('../src/services');
        await expect(services.proxyTema1('/books', 'GET')).rejects.toMatchObject({ type: 'external_api' });
    });
});
