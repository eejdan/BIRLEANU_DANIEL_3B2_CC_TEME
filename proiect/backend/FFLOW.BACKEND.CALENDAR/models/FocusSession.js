import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        title: {
            type: String,
            trim: true,
            default: 'Focus session'
        },
        sessionType: {
            type: String,
            enum: ['focus', 'deep_work', 'pomodoro', 'study'],
            default: 'focus'
        },
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        },
        durationSeconds: {
            type: Number,
            required: true
        },
        source: {
            type: String,
            enum: ['timer', 'manual'],
            default: 'timer'
        }
    },
    {
        timestamps: true,
        collection: 'calendar.focussessions'
    }
);

focusSessionSchema.index({ owner: 1, startTime: -1 });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
