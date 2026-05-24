import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    estimatedTime: {
        type: Number,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema, { 
    collection: 'calendar.tasks' 
});

export default Task;