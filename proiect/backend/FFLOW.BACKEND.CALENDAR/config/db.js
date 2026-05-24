

import mongoose from 'mongoose';

async function connectDB() {
    mongoose.createConnection(uri, { maxPoolSize: 10 });
}

module.exports = connectDB;