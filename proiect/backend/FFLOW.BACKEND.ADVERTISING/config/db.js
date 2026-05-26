import mongoose from 'mongoose';

let isConnected = false;

async function connectDB() {
    if (isConnected) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(uri, {
        maxPoolSize: 10
    });

    isConnected = true;
    return mongoose.connection;
}

export default connectDB;
