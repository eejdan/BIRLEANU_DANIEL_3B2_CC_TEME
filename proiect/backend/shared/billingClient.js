class BillingHttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

function resolveBillingServiceUrl() {
    return (process.env.BILLING_SERVICE_URL || 'http://localhost:3003').replace(/\/+$/, '');
}

async function getPremiumAccess(authorizationHeader) {
    const response = await fetch(`${resolveBillingServiceUrl()}/billing/premium-access`, {
        method: 'GET',
        headers: {
            Authorization: authorizationHeader
        }
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new BillingHttpError(
            response.status === 401 ? 401 : 502,
            payload?.message || 'Unable to validate premium access through Billing'
        );
    }

    return Boolean(payload?.premiumAccess);
}

export { BillingHttpError, getPremiumAccess };
