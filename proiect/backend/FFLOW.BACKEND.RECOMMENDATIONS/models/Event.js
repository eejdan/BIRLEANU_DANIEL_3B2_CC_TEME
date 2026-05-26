import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        location: {
            label: String,
            address: String,
            latitude: Number,
            longitude: Number
        },
        recurrence: {
            frequency: String,
            interval: Number,
            daysOfWeek: [String],
            endsAt: Date,
            until: Date,
            count: Number
        },
        completedAt: Date,
        failedAt: Date,
        owner: mongoose.Schema.Types.ObjectId
    },
    {
        timestamps: true,
        collection: 'calendar.events'
    }
);

const Event = mongoose.models.RecommendationEvent || mongoose.model('RecommendationEvent', eventSchema);

export default Event;
