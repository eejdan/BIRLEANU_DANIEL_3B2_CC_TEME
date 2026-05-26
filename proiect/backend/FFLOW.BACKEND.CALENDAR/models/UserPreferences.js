import mongoose from 'mongoose';

const wakeupTimesSchema = new mongoose.Schema(
    {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },
    {
        _id: false
    }
);

const userPreferencesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true
        },
        wakeupTimes: {
            type: wakeupTimesSchema,
            required: true
        }
    },
    {
        timestamps: true,
        collection: 'calendar.userpreferences'
    }
);

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;
