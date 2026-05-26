import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        location: {
            address: {
                type: String,
                trim: true
            },
            latitude: Number,
            longitude: Number,
            label: {
                type: String,
                trim: true
            }
        },
        recurrence: {
            frequency: {
                type: String,
                enum: ['none', 'daily', 'weekly', 'monthly', 'yearly']
            },
            interval: {
                type: Number,
                default: 1
            },
            daysOfWeek: [String],
            endsAt: Date,
            until: Date,
            count: Number
        },
        alarm: {
            enabled: {
                type: Boolean,
                default: false
            },
            minutesBefore: Number,
            triggerAt: Date
        },
        completedAt: Date,
        failedAt: Date,
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'calendar.events'
    }
);

eventSchema.index({ owner: 1, startDate: 1, endDate: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
