function buildAdEligibility(subscriptionDocument) {
    const subscription = subscriptionDocument?.toObject ? subscriptionDocument.toObject() : subscriptionDocument;
    const shouldShowAds = subscription?.status !== 'active';

    return {
        shouldShowAds,
        reason: shouldShowAds ? 'User has a free account.' : 'User has an active premium subscription.'
    };
}

function buildAdResponse(adDocument) {
    const ad = adDocument?.toObject ? adDocument.toObject() : adDocument;

    return {
        adId: String(ad._id),
        title: ad.title,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        placement: ad.placement
    };
}

function buildMessageResponse(message) {
    return { message };
}

export {
    buildAdEligibility,
    buildAdResponse,
    buildMessageResponse
};
