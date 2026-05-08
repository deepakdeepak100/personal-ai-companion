const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // fast fail
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Local MongoDB connection failed (${error.message}). Attempting to start In-Memory Database...`);
        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
            console.log('WARNING: Data will be lost when the server restarts.');
        } catch (memError) {
            console.error(`In-Memory DB Error: ${memError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
