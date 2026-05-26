import Subscription from '../models/Subscription.js';

async function findSubscription(query) {
    return Subscription.findOne(query);
}

async function upsertCheckoutSubscription(owner, payload) {
    return Subscription.findOneAndUpdate(
        { owner },
        {
            owner,
            plan: null,
            renewalDate: null,
            ...payload
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );
}

export {
    findSubscription,
    upsertCheckoutSubscription
};
