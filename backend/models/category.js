const mongoose = require('mongoose');

const category = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    icon: {
        type: String, // URL to category icon
    },
    color: {
        type: String, // Hex color code for category
        default: '#4f46e5'
    },
    podcasts: [{
        type: mongoose.Types.ObjectId,
        ref: "podcasts"
    }],
    // Category metadata
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    // Analytics
    totalPodcasts: {
        type: Number,
        default: 0
    },
    totalViews: {
        type: Number,
        default: 0
    },
    // SEO fields
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    metaDescription: String,
    keywords: [String]
}, {
    timestamps: true
});

// Pre-save middleware to generate slug
category.pre('save', function(next) {
    if (this.isModified('categoryName') && !this.slug) {
        this.slug = this.categoryName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Add indexes
category.index({ categoryName: 1 });
category.index({ slug: 1 });
category.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("category", category);