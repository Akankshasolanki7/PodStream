const router = require("express").Router();
const Podcast = require("../models/podcast");
const User = require("../models/user");
const Category = require("../models/category");

// Global search endpoint
router.get("/", async (req, res) => {
    try {
        const { q, type = 'all', limit = 10, page = 1 } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = q.trim();
        const searchLimit = parseInt(limit);
        const searchPage = parseInt(page);
        const skip = (searchPage - 1) * searchLimit;

        let results = {};

        // Search podcasts
        if (type === 'all' || type === 'podcasts') {
            const podcastQuery = {
                status: 'published',
                isPublic: true,
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchQuery, 'i')] } }
                ]
            };

            const podcasts = await Podcast.find(podcastQuery)
                .populate('user', 'username profile.avatar')
                .populate('category', 'categoryName color')
                .sort({ views: -1, createdAt: -1 })
                .limit(searchLimit)
                .skip(skip);

            const totalPodcasts = await Podcast.countDocuments(podcastQuery);

            results.podcasts = {
                data: podcasts,
                total: totalPodcasts,
                page: searchPage,
                totalPages: Math.ceil(totalPodcasts / searchLimit)
            };
        }

        // Search users
        if (type === 'all' || type === 'users') {
            const userQuery = {
                isActive: true,
                $or: [
                    { username: { $regex: searchQuery, $options: 'i' } },
                    { 'profile.firstName': { $regex: searchQuery, $options: 'i' } },
                    { 'profile.lastName': { $regex: searchQuery, $options: 'i' } },
                    { 'profile.bio': { $regex: searchQuery, $options: 'i' } }
                ]
            };

            const users = await User.find(userQuery)
                .select('username profile.firstName profile.lastName profile.avatar profile.bio podcasts followers')
                .populate('podcasts', 'title frontImage')
                .sort({ totalViews: -1, createdAt: -1 })
                .limit(searchLimit)
                .skip(skip);

            const totalUsers = await User.countDocuments(userQuery);

            results.users = {
                data: users,
                total: totalUsers,
                page: searchPage,
                totalPages: Math.ceil(totalUsers / searchLimit)
            };
        }

        // Search categories
        if (type === 'all' || type === 'categories') {
            const categoryQuery = {
                isActive: true,
                $or: [
                    { categoryName: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } },
                    { keywords: { $in: [new RegExp(searchQuery, 'i')] } }
                ]
            };

            const categories = await Category.find(categoryQuery)
                .populate('podcasts', 'title frontImage')
                .sort({ totalPodcasts: -1, categoryName: 1 })
                .limit(searchLimit)
                .skip(skip);

            const totalCategories = await Category.countDocuments(categoryQuery);

            results.categories = {
                data: categories,
                total: totalCategories,
                page: searchPage,
                totalPages: Math.ceil(totalCategories / searchLimit)
            };
        }

        res.status(200).json({
            query: searchQuery,
            type,
            results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

// Advanced search with filters
router.post("/advanced", async (req, res) => {
    try {
        const {
            query,
            filters = {},
            sortBy = 'relevance',
            limit = 20,
            page = 1
        } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = query.trim();
        const searchLimit = parseInt(limit);
        const searchPage = parseInt(page);
        const skip = (searchPage - 1) * searchLimit;

        // Build podcast search query
        let podcastQuery = {
            status: 'published',
            isPublic: true,
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        };

        // Apply filters
        if (filters.category) {
            const category = await Category.findOne({ categoryName: filters.category });
            if (category) {
                podcastQuery.category = category._id;
            }
        }

        if (filters.user) {
            const user = await User.findOne({ username: filters.user });
            if (user) {
                podcastQuery.user = user._id;
            }
        }

        if (filters.dateRange) {
            const { start, end } = filters.dateRange;
            if (start || end) {
                podcastQuery.createdAt = {};
                if (start) podcastQuery.createdAt.$gte = new Date(start);
                if (end) podcastQuery.createdAt.$lte = new Date(end);
            }
        }

        if (filters.minViews) {
            podcastQuery.views = { $gte: parseInt(filters.minViews) };
        }

        if (filters.tags && filters.tags.length > 0) {
            podcastQuery.tags = { $in: filters.tags.map(tag => new RegExp(tag, 'i')) };
        }

        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'relevance':
                // For relevance, we'll use a combination of text score and popularity
                sortOptions = { views: -1, createdAt: -1 };
                break;
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'most_viewed':
                sortOptions = { views: -1 };
                break;
            case 'most_liked':
                sortOptions = { likes: -1 };
                break;
            case 'title_asc':
                sortOptions = { title: 1 };
                break;
            case 'title_desc':
                sortOptions = { title: -1 };
                break;
            default:
                sortOptions = { views: -1, createdAt: -1 };
        }

        const podcasts = await Podcast.find(podcastQuery)
            .populate('user', 'username profile.avatar')
            .populate('category', 'categoryName color')
            .sort(sortOptions)
            .limit(searchLimit)
            .skip(skip);

        const totalPodcasts = await Podcast.countDocuments(podcastQuery);

        // Get aggregated data for filters
        const categoryAggregation = await Podcast.aggregate([
            { $match: { ...podcastQuery, category: { $exists: true } } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo.categoryName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const userAggregation = await Podcast.aggregate([
            { $match: { ...podcastQuery, user: { $exists: true } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $group: {
                    _id: '$userInfo.username',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            query: searchQuery,
            filters,
            sortBy,
            results: {
                podcasts: {
                    data: podcasts,
                    total: totalPodcasts,
                    page: searchPage,
                    totalPages: Math.ceil(totalPodcasts / searchLimit)
                }
            },
            aggregations: {
                categories: categoryAggregation,
                users: userAggregation
            }
        });
    } catch (error) {
        console.error('Advanced search error:', error);
        res.status(500).json({ message: "Advanced search failed", error: error.message });
    }
});

// Search suggestions/autocomplete
router.get("/suggestions", async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: "Query must be at least 2 characters" });
        }

        const searchQuery = q.trim();
        const searchLimit = parseInt(limit);

        // Get podcast title suggestions
        const podcastSuggestions = await Podcast.find({
            status: 'published',
            isPublic: true,
            title: { $regex: searchQuery, $options: 'i' }
        })
        .select('title')
        .limit(searchLimit)
        .sort({ views: -1 });

        // Get user suggestions
        const userSuggestions = await User.find({
            isActive: true,
            username: { $regex: searchQuery, $options: 'i' }
        })
        .select('username profile.avatar')
        .limit(searchLimit)
        .sort({ totalViews: -1 });

        // Get category suggestions
        const categorySuggestions = await Category.find({
            isActive: true,
            categoryName: { $regex: searchQuery, $options: 'i' }
        })
        .select('categoryName color')
        .limit(searchLimit)
        .sort({ totalPodcasts: -1 });

        res.status(200).json({
            query: searchQuery,
            suggestions: {
                podcasts: podcastSuggestions.map(p => ({ type: 'podcast', title: p.title, id: p._id })),
                users: userSuggestions.map(u => ({ type: 'user', title: u.username, id: u._id, avatar: u.profile?.avatar })),
                categories: categorySuggestions.map(c => ({ type: 'category', title: c.categoryName, id: c._id, color: c.color }))
            }
        });
    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({ message: "Failed to get suggestions", error: error.message });
    }
});

module.exports = router;
