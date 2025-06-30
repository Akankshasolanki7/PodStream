const router = require("express").Router();
const Podcast = require("../models/podcast");
const User = require("../models/user");
const Category = require("../models/category");
const authMiddleware = require("../middleware/authMiddleware");

// Get platform analytics (admin only)
router.get("/platform", authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user._id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        // Get overall platform stats
        const totalPodcasts = await Podcast.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalCategories = await Category.countDocuments();
        
        // Get total views and likes
        const viewsAndLikes = await Podcast.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalLikes: { $sum: { $size: "$likes" } },
                    totalComments: { $sum: { $size: "$comments" } }
                }
            }
        ]);

        const stats = viewsAndLikes[0] || { totalViews: 0, totalLikes: 0, totalComments: 0 };

        // Get monthly growth (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyGrowth = await Podcast.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    podcasts: { $sum: 1 },
                    views: { $sum: "$views" },
                    likes: { $sum: { $size: "$likes" } }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Get top categories
        const topCategories = await Category.aggregate([
            {
                $lookup: {
                    from: "podcasts",
                    localField: "_id",
                    foreignField: "category",
                    as: "podcastData"
                }
            },
            {
                $project: {
                    categoryName: 1,
                    podcastCount: { $size: "$podcastData" },
                    totalViews: { $sum: "$podcastData.views" },
                    totalLikes: { $sum: { $map: { input: "$podcastData", as: "podcast", in: { $size: "$$podcast.likes" } } } }
                }
            },
            {
                $sort: { podcastCount: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Get top creators
        const topCreators = await User.aggregate([
            {
                $lookup: {
                    from: "podcasts",
                    localField: "_id",
                    foreignField: "user",
                    as: "userPodcasts"
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    podcastCount: { $size: "$userPodcasts" },
                    totalViews: { $sum: "$userPodcasts.views" },
                    totalLikes: { $sum: { $map: { input: "$userPodcasts", as: "podcast", in: { $size: "$$podcast.likes" } } } }
                }
            },
            {
                $match: { podcastCount: { $gt: 0 } }
            },
            {
                $sort: { totalViews: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({
            overview: {
                totalPodcasts,
                totalUsers,
                totalCategories,
                ...stats
            },
            monthlyGrowth,
            topCategories,
            topCreators
        });
    } catch (error) {
        console.error('Platform analytics error:', error);
        res.status(500).json({ message: "Failed to fetch platform analytics", error: error.message });
    }
});

// Get podcast analytics for specific podcast
router.get("/podcast/:podcastId", authMiddleware, async (req, res) => {
    try {
        const { podcastId } = req.params;
        
        const podcast = await Podcast.findById(podcastId)
            .populate('user', 'username')
            .populate('category', 'categoryName')
            .populate('likes', 'username')
            .populate('comments.user', 'username');

        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        // Check if user owns the podcast or is admin
        const user = await User.findById(req.user._id);
        if (podcast.user._id.toString() !== req.user._id.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get engagement metrics
        const engagementRate = podcast.views > 0 ? 
            ((podcast.likes.length + podcast.comments.length) / podcast.views * 100).toFixed(2) : 0;

        // Get comments over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentComments = podcast.comments.filter(
            comment => comment.timestamp >= thirtyDaysAgo
        );

        // Group comments by day
        const commentsByDay = recentComments.reduce((acc, comment) => {
            const day = comment.timestamp.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            podcast: {
                id: podcast._id,
                title: podcast.title,
                description: podcast.description,
                user: podcast.user,
                category: podcast.category,
                createdAt: podcast.createdAt
            },
            metrics: {
                views: podcast.views || 0,
                likes: podcast.likes.length,
                comments: podcast.comments.length,
                engagementRate: parseFloat(engagementRate)
            },
            recentActivity: {
                recentComments: recentComments.slice(0, 10),
                commentsByDay
            },
            topLikers: podcast.likes.slice(0, 10)
        });
    } catch (error) {
        console.error('Podcast analytics error:', error);
        res.status(500).json({ message: "Failed to fetch podcast analytics", error: error.message });
    }
});

// Get trending podcasts
router.get("/trending", async (req, res) => {
    try {
        const { period = '7d', limit = 10 } = req.query;
        
        let dateFilter = new Date();
        switch (period) {
            case '1d':
                dateFilter.setDate(dateFilter.getDate() - 1);
                break;
            case '7d':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case '30d':
                dateFilter.setDate(dateFilter.getDate() - 30);
                break;
            default:
                dateFilter.setDate(dateFilter.getDate() - 7);
        }

        const trendingPodcasts = await Podcast.find({
            createdAt: { $gte: dateFilter },
            status: 'published',
            isPublic: true
        })
        .populate('user', 'username')
        .populate('category', 'categoryName')
        .sort({ views: -1, likes: -1 })
        .limit(parseInt(limit));

        // Calculate trend score (views + likes * 2 + comments * 3)
        const podcastsWithScore = trendingPodcasts.map(podcast => ({
            ...podcast.toObject(),
            trendScore: (podcast.views || 0) + 
                       (podcast.likes?.length || 0) * 2 + 
                       (podcast.comments?.length || 0) * 3
        }));

        // Sort by trend score
        podcastsWithScore.sort((a, b) => b.trendScore - a.trendScore);

        res.status(200).json({
            period,
            trending: podcastsWithScore
        });
    } catch (error) {
        console.error('Trending analytics error:', error);
        res.status(500).json({ message: "Failed to fetch trending podcasts", error: error.message });
    }
});

// Get category analytics
router.get("/categories", async (req, res) => {
    try {
        const categoryStats = await Category.aggregate([
            {
                $lookup: {
                    from: "podcasts",
                    localField: "_id",
                    foreignField: "category",
                    as: "podcasts"
                }
            },
            {
                $project: {
                    categoryName: 1,
                    description: 1,
                    color: 1,
                    podcastCount: { $size: "$podcasts" },
                    totalViews: { $sum: "$podcasts.views" },
                    totalLikes: { 
                        $sum: { 
                            $map: { 
                                input: "$podcasts", 
                                as: "podcast", 
                                in: { $size: "$$podcast.likes" } 
                            } 
                        } 
                    },
                    avgViews: { $avg: "$podcasts.views" },
                    recentPodcasts: {
                        $slice: [
                            {
                                $sortArray: {
                                    input: "$podcasts",
                                    sortBy: { createdAt: -1 }
                                }
                            },
                            3
                        ]
                    }
                }
            },
            {
                $sort: { podcastCount: -1 }
            }
        ]);

        res.status(200).json({ categories: categoryStats });
    } catch (error) {
        console.error('Category analytics error:', error);
        res.status(500).json({ message: "Failed to fetch category analytics", error: error.message });
    }
});

module.exports = router;
