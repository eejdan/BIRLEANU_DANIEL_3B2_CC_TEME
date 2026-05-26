import mongoose from 'mongoose';

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true
        },
        targetUrl: {
            type: String,
            required: true,
            trim: true
        },
        placement: {
            type: String,
            required: true,
            trim: true
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: 'advertising.ads'
    }
);

const Ad = mongoose.model('Ad', adSchema);

export default Ad;
