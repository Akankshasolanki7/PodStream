const mongoose = require("mongoose");

// Configure mongoose settings
mongoose.set('strictQuery', false);

// Track connection state
let isConnected = false;

const connectDB = async () => {
    // If already connected, return
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        // Enhanced connection options for serverless
        const options = {
            serverSelectionTimeoutMS: 15000, // 15 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            connectTimeoutMS: 15000, // 15 seconds connection timeout
            maxPoolSize: 3, // Reduce pool size for serverless
            minPoolSize: 1, // Minimum connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            retryWrites: true,
            retryReads: true,
        };

        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        await mongoose.connect(process.env.MONGO_URI, options);
        isConnected = true;
        console.log("✅ MongoDB connected successfully");

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
            isConnected = true;
        });

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        isConnected = false;
        throw error; // Re-throw for proper error handling
    }
};

// Export the connection function for use in serverless functions
module.exports = { connectDB, isConnected: () => isConnected };

// Initialize connection
connectDB().catch(console.error);