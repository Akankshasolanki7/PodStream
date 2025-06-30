const mongoose = require('mongoose');

const podcasts = new mongoose.Schema({
    frontImage: {
        type: String,
        required: true,
    },
    audioFile: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "category",
        required: true
    },
    // Additional metadata for files
    frontImageMetadata: {
        publicId: String,
        width: Number,
        height: Number,
        format: String,
        size: Number
    },
    audioFileMetadata: {
        publicId: String,
        duration: Number,
        format: String,
        size: Number
    },
    // Analytics and engagement
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "user"
    }],
    comments: [{
        user: {
            type: mongoose.Types.ObjectId,
            ref: "user"
        },
        text: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Status and visibility
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [String],
    duration: Number, // in seconds
    fileSize: Number, // in bytes
}, {
    timestamps: true
});

// Add indexes for better performance
podcasts.index({ user: 1, createdAt: -1 });
podcasts.index({ category: 1, createdAt: -1 });
podcasts.index({ status: 1, isPublic: 1 });
podcasts.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model("podcasts", podcasts);