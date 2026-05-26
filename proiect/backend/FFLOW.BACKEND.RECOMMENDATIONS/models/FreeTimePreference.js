import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        activityType: {
            type: String,
            required: true,
            trim: true
        },
        displayName: {
            type: String,
            required: true,
            trim: true
        },
        minimumDurationMinutes: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
);

const freeTimePreferenceSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true
        },
        activities: {
            type: [activitySchema],
            default: []
        }
    },
    {
        timestamps: true,
        collection: 'recommendations.freeTimePreferences'
    }
);

const FreeTimePreference = mongoose.model('FreeTimePreference', freeTimePreferenceSchema);

export default FreeTimePreference;
