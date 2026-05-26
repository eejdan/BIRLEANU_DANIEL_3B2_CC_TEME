import mongoose from 'mongoose';

const adInteractionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        adId: {
            type: String,
            required: true,
            trim: true
        },
        eventType: {
            type: String,
            enum: ['impression', 'click'],
            required: true
        },
        timestamp: {
            type: Date,
            required: true
        },
        placement: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: 'advertising.adInteractions'
    }
);

const AdInteraction = mongoose.model('AdInteraction', adInteractionSchema);

export default AdInteraction;
