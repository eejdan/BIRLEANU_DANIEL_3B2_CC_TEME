import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
    {
        owner: mongoose.Schema.Types.ObjectId,
        status: String,
        plan: String,
        renewalDate: Date
    },
    {
        timestamps: true,
        collection: 'billing.subscriptions'
    }
);

const Subscription = mongoose.models.AdvertisingSubscription || mongoose.model('AdvertisingSubscription', subscriptionSchema);

export default Subscription;
