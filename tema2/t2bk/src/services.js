const { URLSearchParams } = require('node:url');

const tema1ApiUrl = process.env.TEMA1_API_URL || 'http://localhost:3000';
const googleApiKey = process.env.GOOGLE_API_KEY || '';
const weatherApiUrl = process.env.GOOGLE_WEATHER_API_URL || '';
const mailgunApiKey = process.env.MAILGUN_API_KEY || '';
const mailgunDomain = process.env.MAILGUN_DOMAIN || '';
const mailgunFrom = process.env.MAILGUN_FROM || '';
const resetBaseUrl = process.env.PASSWORD_RESET_BASE_URL || 'http://localhost:5173/reset-password';

async function safeFetch(url, options = {}, providerName = 'external') {
    let response;
    try {
        response = await fetch(url, options);
    } catch (error) {
        const wrapped = new Error(`${providerName} request failed.`);
        wrapped.type = 'external_api';
        wrapped.provider = providerName;
        throw wrapped;
    }

    const text = await response.text();
    let payload;
    try {
        payload = text ? JSON.parse(text) : null;
    } catch (error) {
        payload = text;
    }

    if (!response.ok) {
        const wrapped = new Error(`${providerName} error: ${response.status}`);
        wrapped.type = 'external_api';
        wrapped.provider = providerName;
        wrapped.statusCode = response.status;
        wrapped.payload = payload;
        throw wrapped;
    }

    return payload;
}

async function sendPasswordResetEmail(email, resetToken) {
    if (!mailgunApiKey || !mailgunDomain || !mailgunFrom) {
        return;
    }
    const resetLink = `${resetBaseUrl}?token=${encodeURIComponent(resetToken)}`;
    const body = new URLSearchParams({
        from: mailgunFrom,
        to: email,
        subject: 'Password reset',
        text: `Reset your password here: ${resetLink}`
    });

    const auth = Buffer.from(`api:${mailgunApiKey}`).toString('base64');
    await safeFetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    }, 'mailgun').catch((error) => {
        console.error('Failed to send password reset email:', error);
    }).then(a => { console.log(a); });
    console.log('Password reset email sent (if configured).');
}

async function geocodeAddress(address) {
    if (!googleApiKey) {
        const error = new Error('GOOGLE_API_KEY is missing.');
        error.statusCode = 500;
        throw error;
    }
    const query = new URLSearchParams({
        address,
        key: googleApiKey
    });
    const payload = await safeFetch(`https://maps.googleapis.com/maps/api/geocode/json?${query.toString()}`, {}, 'google_geocode');
    const first = payload?.results?.[0]?.geometry?.location;
    if (!first || typeof first.lat !== 'number' || typeof first.lng !== 'number') {
        const error = new Error('Address could not be geocoded.');
        error.statusCode = 400;
        throw error;
    }
    return { lat: first.lat, lng: first.lng };
}

async function computeRouteEstimate(origin, destination, travelMode) {
    if (!googleApiKey) {
        const error = new Error('GOOGLE_API_KEY is missing.');
        error.statusCode = 500;
        throw error;
    }

    const payload = await safeFetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
        },
        body: JSON.stringify({
            origin: {
                location: {
                    latLng: {
                        latitude: origin.lat,
                        longitude: origin.lng
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.lat,
                        longitude: destination.lng
                    }
                }
            },
            travelMode,
            routingPreference: travelMode === 'DRIVE' ? 'TRAFFIC_AWARE' : undefined,
            languageCode: 'en-US',
            units: 'METRIC'
        })
    }, 'google_routes');

    const route = payload?.routes?.[0];
    if (!route) {
        const error = new Error('No route found.');
        error.statusCode = 404;
        throw error;
    }

    return {
        distanceMeters: route.distanceMeters,
        durationSeconds: route.duration
    };
}

async function getWeatherForecast(lat, lng, date) {
    if (!weatherApiUrl) {
        const error = new Error('GOOGLE_WEATHER_API_URL is missing.');
        error.statusCode = 500;
        throw error;
    }

    if (!/^https?:\/\//i.test(weatherApiUrl)) {
        const error = new Error('GOOGLE_WEATHER_API_URL must be a full http/https URL endpoint.');
        error.statusCode = 500;
        throw error;
    }

    const query = new URLSearchParams({
        'location.latitude': String(lat),
        'location.longitude': String(lng),
        days: '10',
        unitsSystem: 'METRIC',
        languageCode: 'en',
        key: googleApiKey
    });
    const payload = await safeFetch(`${weatherApiUrl}?${query.toString()}`, {}, 'google_weather');

    if (Array.isArray(payload?.forecastDays)) {
        const targetDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? date
            : null;

        const selectedDay = payload.forecastDays.find((day) => {
            const d = day?.displayDate;
            if (!d || typeof d.year !== 'number' || typeof d.month !== 'number' || typeof d.day !== 'number') {
                return false;
            }
            const dayStr = `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
            return targetDate ? dayStr === targetDate : true;
        }) || payload.forecastDays[0];

        const dayPart = selectedDay?.daytimeForecast || selectedDay?.nighttimeForecast || {};
        const conditionText =
            dayPart?.weatherCondition?.description?.text ||
            dayPart?.weatherCondition?.type ||
            'No summary';
        const maxTemp = selectedDay?.maxTemperature?.degrees ?? null;
        const precipProb =
            dayPart?.precipitation?.probability?.percent ??
            dayPart?.thunderstormProbability ??
            0;

        return {
            summary: conditionText,
            temperatureC: maxTemp,
            precipitationProbability: Number(precipProb) || 0,
            severe: Number(dayPart?.thunderstormProbability ?? 0) >= 60
        };
    }

    const forecast = payload?.forecast || payload?.dailyForecast || payload;
    return {
        summary: forecast?.summary || forecast?.condition || 'No summary',
        temperatureC: forecast?.temperatureC ?? forecast?.temperature ?? null,
        precipitationProbability:
            forecast?.precipitationProbability ?? forecast?.rainProbability ?? forecast?.precipitationChance ?? 0,
        severe: Boolean(forecast?.severe || forecast?.isSevere)
    };
}

async function proxyTema1(path, method = 'GET', body) {
    return safeFetch(`${tema1ApiUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    }, 'tema1_api');
}

async function fetchBooks() {
    return proxyTema1('/books', 'GET');
}

module.exports = {
    sendPasswordResetEmail,
    geocodeAddress,
    computeRouteEstimate,
    getWeatherForecast,
    fetchBooks,
    proxyTema1
};