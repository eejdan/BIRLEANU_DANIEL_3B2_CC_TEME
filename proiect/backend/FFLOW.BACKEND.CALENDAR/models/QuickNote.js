import mongoose from 'mongoose';

const quickNoteSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        timerDurationSeconds: {
            type: Number,
            default: 0
        },
        timerLabel: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        collection: 'calendar.quicknotes'
    }
);

quickNoteSchema.index({ owner: 1, date: -1, createdAt: -1 });

const QuickNote = mongoose.model('QuickNote', quickNoteSchema);

export default QuickNote;
