import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    wakeupTimes: {
        monday: String, // "07:00" format
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },
    sleepTimes: {
        monday: String, // "23:00" format
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    }
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema, { 
    collection: 'calendar.userpreferences' 
});
export default UserPreferences;