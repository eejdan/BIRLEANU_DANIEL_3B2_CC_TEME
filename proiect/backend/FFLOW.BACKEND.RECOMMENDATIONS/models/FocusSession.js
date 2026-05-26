import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
    {
        title: String,
        sessionType: String,
        startTime: Date,
        endTime: Date,
        durationSeconds: Number,
        source: String,
        owner: mongoose.Schema.Types.ObjectId
    },
    {
        timestamps: true,
        collection: 'calendar.focussessions'
    }
);

const FocusSession = mongoose.models.RecommendationFocusSession || mongoose.model('RecommendationFocusSession', focusSessionSchema);

export default FocusSession;
