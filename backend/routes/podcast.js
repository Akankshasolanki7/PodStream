
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const Category = require("../models/category");
const User = require("../models/user");
const Podcast = require("../models/podcast");
const CloudStorageService = require("../services/cloudStorage");
const router = require("express").Router();
//adding podcast


router.post("/add-podcast", authMiddleware, upload, async (req, res) => {
    try {
        console.log('REQ.BODY:', req.body);
        console.log('REQ.FILES:', req.files);

        const { title, description, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ message: "Title, description, and category are required" });
        }

        // Check if files are uploaded
        if (!req.files || !req.files["frontImage"] || !req.files["audioFile"]) {
            return res.status(400).json({ message: "Both image and audio files are required" });
        }

        const frontImageFile = req.files["frontImage"][0];
        const audioFile = req.files["audioFile"][0];
        const { user } = req;

        // Find or create category
        let cat = await Category.findOne({ categoryName: category });
        if (!cat) {
            cat = new Category({ categoryName: category, podcasts: [] });
            await cat.save();
        }

        let frontImageUrl, audioFileUrl;
        let frontImageMetadata = {}, audioFileMetadata = {};

        // Upload files to cloud storage if configured, otherwise use local paths
        if (CloudStorageService.isConfigured()) {
            try {
                // Upload image
                const imageResult = await CloudStorageService.uploadFromPath(
                    frontImageFile.path,
                    `${Date.now()}-${frontImageFile.originalname}`,
                    'image'
                );
                frontImageUrl = imageResult.url;
                frontImageMetadata = {
                    publicId: imageResult.publicId,
                    width: imageResult.width,
                    height: imageResult.height,
                    format: imageResult.format,
                    size: imageResult.size
                };

                // Upload audio
                const audioResult = await CloudStorageService.uploadFromPath(
                    audioFile.path,
                    `${Date.now()}-${audioFile.originalname}`,
                    'audio'
                );
                audioFileUrl = audioResult.url;
                audioFileMetadata = {
                    publicId: audioResult.publicId,
                    duration: audioResult.duration,
                    format: audioResult.format,
                    size: audioResult.size
                };
            } catch (uploadError) {
                console.error('Cloud upload failed, using local paths:', uploadError);
                frontImageUrl = frontImageFile.path;
                audioFileUrl = audioFile.path;
            }
        } else {
            // Use local file paths if cloud storage not configured
            frontImageUrl = frontImageFile.path;
            audioFileUrl = audioFile.path;
        }

        const newPodcast = new Podcast({
            title,
            description,
            category: cat._id,
            frontImage: frontImageUrl,
            audioFile: audioFileUrl,
            user: user._id,
            frontImageMetadata,
            audioFileMetadata,
            fileSize: audioFile.size,
            tags: [], // Can be extracted from description or added later
        });

        await newPodcast.save();

        // Update category and user
        await Category.findByIdAndUpdate(cat._id, {
            $push: { podcasts: newPodcast._id },
        });

        await User.findByIdAndUpdate(user._id, {
            $push: { podcasts: newPodcast._id },
        });

        res.status(200).json({
            message: "Podcast added successfully",
            podcast: {
                id: newPodcast._id,
                title: newPodcast.title,
                description: newPodcast.description,
                frontImage: newPodcast.frontImage,
                audioFile: newPodcast.audioFile
            }
        });

    } catch (error) {
        console.error('Add podcast error:', error);
        return res.status(500).json({ message: "Failed to add podcast", error: error.message });
    }
})

// Get all podcasts with pagination and filtering
router.get("/get-podcasts", async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const query = { status: 'published', isPublic: true };

        // Add category filter
        if (category) {
            const cat = await Category.findOne({ categoryName: category });
            if (cat) {
                query.category = cat._id;
            }
        }

        // Add search filter
        if (search) {
            query.$text = { $search: search };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const podcasts = await Podcast.find(query)
            .populate('user', 'username email')
            .populate('category', 'categoryName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Podcast.countDocuments(query);

        res.status(200).json({
            data: podcasts,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get podcasts error:', error);
        res.status(500).json({ message: "Failed to fetch podcasts", error: error.message });
    }
});
//get-user podcasts
router.get("/get-user-podcasts",authMiddleware,async(req,res)=>{
    try{
        //  const user=req;
        //  const userid=user._id
         const userid = req.user._id;
         const data=await User.findById(userid).populate({
            path:"podcasts",
            populate:{path :"category"},
         })
         .select("-password");
         if(data && data.podcasts){
            data.podcasts.sort((a,b)=>new Date(b.createdAt)- new Date(a.createdAt))
         }
         return res.status(200).json({data:data.podcasts})
    }catch(error){
      return res.status(500).json({message:"Internal server error"})
    }
})
// Get podcast by ID with enhanced data
router.get("/get-podcast/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const podcast = await Podcast.findById(id)
            .populate('user', 'username email')
            .populate('category', 'categoryName')
            .populate('comments.user', 'username');

        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        // Increment view count
        await Podcast.findByIdAndUpdate(id, { $inc: { views: 1 } });

        res.status(200).json({ data: podcast });
    } catch (error) {
        console.error('Get podcast error:', error);
        res.status(500).json({ message: "Failed to fetch podcast", error: error.message });
    }
});
//get podcast by categories
router.get("/category/:cat",async(req,res)=>{
    try{
         const {cat}=req.params
         const categories=await  Category.find({categoryName:cat}).populate(
            {
                path:"podcasts",
                populate:{path:"category"},
            }
         )
         let podcasts=[];
        //  categories.forEach((categories)=>{
        //     podcasts=[...podcasts,... Category.podcasts];
        //  })
            categories.forEach((category) => {
      podcasts = [...podcasts, ...category.podcasts]; // ✅ fixed here
    });
         return res.status(200).json({data:podcasts})
    }catch(error){
      return res.status(500).json({message:"Internal server error"})
    }
})

// Like/Unlike podcast
router.post("/like-podcast/:id", authMiddleware, async (req, res) => {
    try {
        const podcastId = req.params.id;
        const userId = req.user._id;

        const podcast = await Podcast.findById(podcastId);
        if (!podcast) {
            return res.status(404).json({ message: "Podcast not found" });
        }

        const isLiked = podcast.likes.includes(userId);

        if (isLiked) {
            // Unlike
            await Podcast.findByIdAndUpdate(podcastId, { $pull: { likes: userId } });
            res.status(200).json({ message: "Podcast unliked", liked: false });
        } else {
            // Like
            await Podcast.findByIdAndUpdate(podcastId, { $push: { likes: userId } });
            res.status(200).json({ message: "Podcast liked", liked: true });
        }
    } catch (error) {
        console.error('Like podcast error:', error);
        res.status(500).json({ message: "Failed to like/unlike podcast", error: error.message });
    }
});

// Add comment to podcast
router.post("/add-comment/:id", authMiddleware, async (req, res) => {
    try {
        const podcastId = req.params.id;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const comment = {
            user: userId,
            text: text.trim(),
            timestamp: new Date()
        };

        await Podcast.findByIdAndUpdate(podcastId, { $push: { comments: comment } });

        res.status(200).json({ message: "Comment added successfully" });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
});

// Search podcasts
router.get("/search", async (req, res) => {
    try {
        const { q, category, limit = 10 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const query = {
            status: 'published',
            isPublic: true,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        if (category) {
            const cat = await Category.findOne({ categoryName: category });
            if (cat) {
                query.category = cat._id;
            }
        }

        const podcasts = await Podcast.find(query)
            .populate('user', 'username')
            .populate('category', 'categoryName')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({ data: podcasts });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

module.exports=router;