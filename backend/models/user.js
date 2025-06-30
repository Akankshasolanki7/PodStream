const mongoose = require('mongoose');

const user = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // Profile information
    profile: {
        firstName: String,
        lastName: String,
        bio: {
            type: String,
            maxlength: 500
        },
        avatar: String,
        website: String,
        location: String,
        dateOfBirth: Date
    },
    // User preferences
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        language: {
            type: String,
            default: 'en'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        }
    },
    // User activity
    podcasts: [{
        type: mongoose.Types.ObjectId,
        ref: "podcasts"
    }],
    likedPodcasts: [{
        type: mongoose.Types.ObjectId,
        ref: "podcasts"
    }],
    playlists: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        podcasts: [{
            type: mongoose.Types.ObjectId,
            ref: "podcasts"
        }],
        isPublic: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: "user"
    }],
    followers: [{
        type: mongoose.Types.ObjectId,
        ref: "user"
    }],
    // Account status
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'creator', 'admin'],
        default: 'user'
    },
    // Analytics
    totalViews: {
        type: Number,
        default: 0
    },
    totalLikes: {
        type: Number,
        default: 0
    },
    lastLoginAt: Date,
    // Verification tokens
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Add indexes for better performance
user.index({ email: 1 });
user.index({ username: 1 });
user.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
user.index({ isActive: 1, role: 1 });

module.exports = mongoose.model("user", user);