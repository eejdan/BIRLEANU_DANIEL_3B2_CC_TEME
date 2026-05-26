import mongoose from 'mongoose';

const wakeupOverrideSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        date: {
            type: Date,
            required: true
        },
        wakeupTime: {
            type: String,
            required: true
        },
        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: 'calendar.wakeupoverrides'
    }
);

wakeupOverrideSchema.index({ owner: 1, date: 1 });

const WakeupOverride = mongoose.model('WakeupOverride', wakeupOverrideSchema);

export default WakeupOverride;
