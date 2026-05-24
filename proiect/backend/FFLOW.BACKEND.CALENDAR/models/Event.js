import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    datetimeStart: {
        type: Date,
        required: false
    },
    datetimeEnd: {
        type: Date,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema, { 
    collection: 'calendar.events' 
});

export default Event;
