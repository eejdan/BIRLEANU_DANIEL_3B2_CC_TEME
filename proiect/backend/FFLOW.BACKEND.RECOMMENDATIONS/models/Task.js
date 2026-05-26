import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        estimatedMinutes: Number,
        date: Date,
        priority: String,
        manualOrder: Number,
        completed: Boolean,
        completedAt: Date,
        failedAt: Date,
        location: {
            label: String,
            address: String,
            latitude: Number,
            longitude: Number
        },
        owner: mongoose.Schema.Types.ObjectId
    },
    {
        timestamps: true,
        collection: 'calendar.tasks'
    }
);

const Task = mongoose.models.RecommendationTask || mongoose.model('RecommendationTask', taskSchema);

export default Task;
