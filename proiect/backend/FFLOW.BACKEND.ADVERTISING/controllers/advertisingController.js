import Ad from '../models/Ad.js';
import AdInteraction from '../models/AdInteraction.js';
import { getPremiumAccess } from '../../shared/billingClient.js';
import { ensure } from '../lib/http.js';
import { buildAdEligibility, buildAdResponse, buildMessageResponse } from '../lib/serializers.js';
import { parseAdEventRequest } from '../lib/validation.js';

async function getEligibility(req, res) {
    const premiumAccess = await getPremiumAccess(req.headers.authorization);

    res.status(200).json(buildAdEligibility(premiumAccess ? { status: 'active' } : null));
}

async function getAd(req, res) {
    const premiumAccess = await getPremiumAccess(req.headers.authorization);
    ensure(!premiumAccess, 403, 'Premium users do not receive advertisements');

    let ad = await Ad.findOne({ active: true }).sort({ updatedAt: -1 });
    if (!ad) {
        ad = await Ad.create({
            title: 'Productivity tool discount',
            imageUrl: 'https://cdn.smarttime.example.com/ads/productivity-discount.png',
            targetUrl: 'https://smarttime.example.com/offers/productivity-discount',
            placement: 'dashboard_banner',
            active: true
        });
    }

    res.status(200).json(buildAdResponse(ad));
}

async function recordImpression(req, res) {
    const payload = parseAdEventRequest(req.body);

    await AdInteraction.create({
        ...payload,
        eventType: 'impression',
        owner: req.user.id
    });

    res.status(201).json(buildMessageResponse('Advertisement impression recorded successfully.'));
}

async function recordClick(req, res) {
    const payload = parseAdEventRequest(req.body);

    await AdInteraction.create({
        ...payload,
        eventType: 'click',
        owner: req.user.id
    });

    res.status(201).json(buildMessageResponse('Advertisement click recorded successfully.'));
}

export {
    getAd,
    getEligibility,
    recordClick,
    recordImpression
};
