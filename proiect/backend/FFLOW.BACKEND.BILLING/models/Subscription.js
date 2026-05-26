import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true
        },
        status: {
            type: String,
            enum: ['free', 'active', 'cancelled', 'past_due'],
            default: 'free'
        },
        plan: {
            type: String,
            default: null
        },
        selectedPlan: {
            type: String,
            default: null
        },
        renewalDate: Date,
        stripeCustomerId: String,
        stripeSubscriptionId: String,
        lastCheckoutSessionId: String,
        checkoutUrl: String
    },
    {
        timestamps: true,
        collection: 'billing.subscriptions'
    }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
