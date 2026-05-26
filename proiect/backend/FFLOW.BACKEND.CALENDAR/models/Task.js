import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
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
        estimatedMinutes: {
            type: Number
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        manualOrder: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            required: true
        },
        location: {
            label: {
                type: String,
                trim: true
            },
            address: {
                type: String,
                trim: true
            }
        },
        completed: {
            type: Boolean,
            default: false
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
        collection: 'calendar.tasks'
    }
);

taskSchema.index({ owner: 1, date: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
