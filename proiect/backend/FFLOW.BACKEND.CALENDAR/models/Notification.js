import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        sourceType: {
            type: String,
            enum: ['event', 'wakeupOverride'],
            required: true
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        type: {
            type: String,
            enum: ['time_to_leave', 'go_to_bed', 'wake_up_alarm', 'event_alarm', 'alarm', 'wakeup'],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            trim: true
        },
        scheduledFor: {
            type: Date,
            required: true
        },
        dismissedAt: Date
    },
    {
        timestamps: true,
        collection: 'calendar.notifications'
    }
);

notificationSchema.index({ owner: 1, scheduledFor: 1 });
notificationSchema.index({ owner: 1, sourceType: 1, sourceId: 1 }, { unique: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
