// Simple serverless function without Express routing
module.exports = async (req, res) => {
    try {
        // Get the origin from the request
        const origin = req.headers.origin;
        const allowedOrigins = [
            'https://frontend-khaki-ten-90.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5000'
        ];

        // Set CORS headers based on origin
        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            // Fallback for development or unknown origins
            res.setHeader('Access-Control-Allow-Origin', '*');
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, User-Agent');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');

        // Additional headers for better compatibility
        res.setHeader('Vary', 'Origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Handle preflight requests immediately
        if (req.method === 'OPTIONS') {
            console.log('Handling OPTIONS preflight request');
            res.status(200).end();
            return;
        }

    // Load environment variables
    require("dotenv").config();

    // Initialize database connection for all requests except health checks
    const url = req.url || '/';
    const method = req.method;

    console.log(`Request: ${method} ${url}`);

    // Initialize database connection early for non-health endpoints
    if (!url.includes('/health') && !url.includes('/db-test') && url !== '/') {
        try {
            const { connectDB } = require("../conn/conn");
            await connectDB();
        } catch (dbError) {
            console.error('Database connection failed:', dbError);
            res.status(500).json({
                error: 'Database connection failed',
                message: 'Unable to connect to database. Please try again later.'
            });
            return;
        }
    }

    // Health check
    if (url === '/' || url === '/api/v1/health') {
        res.status(200).json({
            message: 'Podstream API is running!',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development',
            mongo_uri_exists: !!process.env.MONGO_URI,
            jwt_secret_exists: !!process.env.JWT_SECRET,
            url: url,
            method: method
        });
        return;
    }

    // Database connection test endpoint
    if (url === '/api/v1/db-test' && method === 'GET') {
        try {
            const { connectDB } = require("../conn/conn");
            await connectDB();

            // Try a simple database operation
            const mongoose = require('mongoose');
            const dbState = mongoose.connection.readyState;
            const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];

            res.status(200).json({
                message: 'Database connection test',
                connectionState: stateNames[dbState] || 'unknown',
                mongoUri: process.env.MONGO_URI ? 'configured' : 'missing',
                timestamp: new Date().toISOString()
            });
            return;
        } catch (error) {
            res.status(500).json({
                error: 'Database test failed',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            return;
        }
    }

    // Fix database schema endpoint
    if (url === '/api/v1/fix-schema' && method === 'POST') {
        try {
            const { connectDB } = require("../conn/conn");
            await connectDB();

            const mongoose = require('mongoose');

            // Drop the unique index on frontImage if it exists
            try {
                await mongoose.connection.db.collection('podcasts').dropIndex('frontImage_1');
                console.log('Dropped frontImage unique index');
            } catch (error) {
                console.log('frontImage index may not exist:', error.message);
            }

            res.status(200).json({
                message: 'Database schema fixed',
                action: 'Removed unique constraint on frontImage field',
                timestamp: new Date().toISOString()
            });
            return;
        } catch (error) {
            res.status(500).json({
                error: 'Schema fix failed',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            return;
        }
    }

    // Ensure database connection
    const { connectDB } = require("../conn/conn");

    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI not found in environment variables');
        res.status(503).json({
            error: 'Database not configured',
            message: 'Service temporarily unavailable'
        });
        return;
    }

    try {
        await connectDB();
        console.log('Database connection established');
    } catch (dbError) {
        console.error('Database connection failed:', dbError.message);
        res.status(503).json({
            error: 'Database connection failed',
            message: 'Service temporarily unavailable. Please try again later.'
        });
        return;
    }

    // Import required modules
    const bcrypt = require("bcryptjs");
    const jwt = require('jsonwebtoken');
    const CloudStorageService = require('../services/cloudStorage');

    // Import models
    let User, Category, Podcast;
    try {
        User = require('../models/user');
        Category = require('../models/category');
        Podcast = require('../models/podcast');
        console.log('Models loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error.message);
        res.status(500).json({error: 'Failed to load models'});
        return;
    }

    // Parse request body for POST requests with size limit handling
    let body = {};
    if (method === 'POST') {
        if (req.body) {
            body = req.body;
        } else {
            // Parse body manually with size limit
            try {
                let rawBody = '';
                let totalSize = 0;
                const maxSize = 4.5 * 1024 * 1024; // 4.5MB limit for Vercel

                await new Promise((resolve, reject) => {
                    req.on('data', chunk => {
                        totalSize += chunk.length;
                        if (totalSize > maxSize) {
                            reject(new Error('Payload too large'));
                            return;
                        }
                        rawBody += chunk.toString();
                    });

                    req.on('end', () => {
                        if (rawBody) {
                            try {
                                body = JSON.parse(rawBody);
                            } catch (parseError) {
                                console.error('JSON parse error:', parseError);
                                // Handle form data or other content types
                                body = { rawData: rawBody };
                            }
                        }
                        resolve();
                    });

                    req.on('error', reject);
                });
            } catch (error) {
                console.error('Error parsing request body:', error);
                if (error.message === 'Payload too large') {
                    res.status(413).json({
                        error: 'Payload Too Large',
                        message: 'File size exceeds 4.5MB limit. Please use smaller files or implement cloud storage.',
                        maxSize: '4.5MB'
                    });
                    return;
                }
            }
        }
    }

    // Handle sign-up endpoint
    if (url === '/api/v1/sign-up') {
        if (method !== 'POST') {
            res.status(405).json({
                error: 'Method Not Allowed',
                message: `This endpoint only accepts POST requests, received ${method}`,
                expectedMethod: 'POST',
                receivedMethod: method
            });
            return;
        }
        try {
            const {username, email, password} = body;
            if (!username || !email || !password) {
                res.status(400).json({message: 'All fields are required'});
                return;
            }
            if (username.length < 5) {
                res.status(400).json({message: 'Username must have five characters'});
                return;
            }
            if (password.length < 6) {
                res.status(400).json({message: 'Password must have 6 characters'});
                return;
            }

            const existingEmail = await User.findOne({email: email});
            const existingUsername = await User.findOne({username: username});
            if (existingEmail || existingUsername) {
                res.status(400).json({message: 'Username or Email already exist'});
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);
            const newUser = new User({username, email, password: hashedPass});
            await newUser.save();
            res.status(200).json({message: "Account created"});
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Handle sign-in endpoint - add GET method for debugging
    if (url === '/api/v1/sign-in') {
        if (method === 'GET') {
            res.status(405).json({
                error: 'Method Not Allowed',
                message: 'This endpoint only accepts POST requests',
                expectedMethod: 'POST',
                receivedMethod: 'GET'
            });
            return;
        }

        if (method !== 'POST') {
            res.status(405).json({
                error: 'Method Not Allowed',
                message: `This endpoint only accepts POST requests, received ${method}`,
                expectedMethod: 'POST',
                receivedMethod: method
            });
            return;
        }
        try {
            const {email, password} = body;
            if (!email || !password) {
                res.status(400).json({message: 'All fields are required'});
                return;
            }

            // Handle admin login with root/root
            if (email === 'root' && password === 'root') {
                // Create or find admin user
                let adminUser = await User.findOne({email: 'root'});
                if (!adminUser) {
                    const hashedPassword = await bcrypt.hash('root', 12);
                    adminUser = new User({
                        username: 'root',
                        email: 'root',
                        password: hashedPassword,
                        role: 'admin',
                        isVerified: true,
                        profile: {
                            firstName: 'Admin',
                            lastName: 'User'
                        }
                    });
                    await adminUser.save();
                }

                const token = jwt.sign(
                    {id: adminUser._id, email: adminUser.email, role: 'admin'},
                    process.env.JWT_SECRET,
                    {expiresIn: "30d"}
                );

                res.setHeader('Set-Cookie', `podcasterUserToken=${token}; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; ${process.env.NODE_ENV === "production" ? "Secure;" : ""} SameSite=None`);

                res.status(200).json({
                    id: adminUser._id,
                    username: adminUser.username,
                    email: adminUser.email,
                    role: 'admin',
                    message: 'Admin sign-in successfully'
                });
                return;
            }

            // Regular user login
            const existingUser = await User.findOne({email: email});
            if (!existingUser) {
                res.status(400).json({message: 'Invalid credentials'});
                return;
            }

            const isMatch = await bcrypt.compare(password, existingUser.password);
            if (!isMatch) {
                res.status(400).json({message: 'Invalid credentials'});
                return;
            }

            const token = jwt.sign(
                {id: existingUser._id, email: existingUser.email, role: existingUser.role || 'user'},
                process.env.JWT_SECRET,
                {expiresIn: "30d"}
            );

            res.setHeader('Set-Cookie', `podcasterUserToken=${token}; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; ${process.env.NODE_ENV === "production" ? "Secure;" : ""} SameSite=None`);

            res.status(200).json({
                id: existingUser._id,
                username: existingUser.username,
                email: email,
                role: existingUser.role || 'user',
                message: 'sign-in successfully'
            });
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Logout route
    if (url === '/api/v1/logout' && method === 'POST') {
        try {
            res.setHeader('Set-Cookie', 'podcasterUserToken=; HttpOnly; Max-Age=0; Path=/');
            res.status(200).json({message: "Logged-out"});
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Helper function to extract token from cookies
    const extractToken = (cookieHeader) => {
        if (!cookieHeader) return null;
        const cookies = cookieHeader.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'podcasterUserToken') {
                return value;
            }
        }
        return null;
    };

    // Check cookie route
    if (url === '/api/v1/check-cookie' && method === 'GET') {
        try {
            const token = extractToken(req.headers.cookie);

            if (token) {
                // Verify token is valid
                try {
                    jwt.verify(token, process.env.JWT_SECRET);
                    res.status(200).json({message: true});
                } catch (jwtError) {
                    res.status(200).json({message: false});
                }
            } else {
                res.status(200).json({message: false});
            }
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // User details route
    if (url === '/api/v1/user-details' && method === 'GET') {
        try {
            const token = extractToken(req.headers.cookie);

            console.log('Cookie header:', req.headers.cookie);
            console.log('Extracted token:', token ? 'Token found' : 'No token');

            if (!token) {
                res.status(401).json({
                    message: 'Unauthorized - No token found',
                    debug: {
                        cookieHeader: req.headers.cookie,
                        hasJwtSecret: !!process.env.JWT_SECRET
                    }
                });
                return;
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Token decoded successfully for user:', decoded.email);
            } catch (jwtError) {
                console.log('JWT verification failed:', jwtError.message);
                res.status(401).json({
                    message: 'Unauthorized - Invalid token',
                    error: jwtError.message
                });
                return;
            }

            const existingUser = await User.findOne({email: decoded.email}).select("-password");

            if (!existingUser) {
                res.status(404).json({message: 'User not found'});
                return;
            }

            res.status(200).json({data: existingUser});
            return;
        } catch (error) {
            console.error('User details error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Helper function to fix file URLs
    const fixFileUrls = (podcast) => {
        return {
            ...podcast.toObject(),
            frontImage: podcast.frontImage || "https://via.placeholder.com/300x300/4f46e5/ffffff?text=Podcast+Image",
            audioFile: podcast.audioFile || "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
        };
    };

    // Get all podcasts with pagination and filtering
    if (url.startsWith('/api/v1/get-podcasts') && method === 'GET') {
        try {
            const urlParts = url.split('?');
            const urlParams = new URLSearchParams(urlParts[1] || '');

            // Validate and sanitize pagination parameters
            let page = parseInt(urlParams.get('page')) || 1;
            let limit = parseInt(urlParams.get('limit')) || 10;

            // Ensure reasonable limits
            page = Math.max(1, page);
            limit = Math.max(1, Math.min(100, limit)); // Max 100 items per page

            const category = urlParams.get('category');
            const search = urlParams.get('search');
            const sortBy = urlParams.get('sortBy') || 'createdAt';
            const sortOrder = urlParams.get('sortOrder') || 'desc';

            // Validate sortBy field to prevent injection
            const allowedSortFields = ['createdAt', 'title', 'views', 'likes'];
            const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
            const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

            const query = { status: { $ne: 'archived' } }; // Show published and draft

            // Add category filter
            if (category) {
                const cat = await Category.findOne({ categoryName: category });
                if (cat) {
                    query.category = cat._id;
                }
            }

            // Add search filter
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const sortOptions = {};
            sortOptions[validSortBy] = validSortOrder === 'desc' ? -1 : 1;

            const podcasts = await Podcast.find(query)
                .populate('user', 'username email')
                .populate('category', 'categoryName')
                .sort(sortOptions)
                .limit(limit)
                .skip((page - 1) * limit)
                .exec();

            const total = await Podcast.countDocuments(query);
            const fixedPodcasts = podcasts.map(fixFileUrls);

            res.status(200).json({
                data: fixedPodcasts,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            });
            return;
        } catch (error) {
            console.error('Get podcasts error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Get podcast by ID
    if (url.startsWith('/api/v1/get-podcast/') && method === 'GET') {
        try {
            const id = url.split('/api/v1/get-podcast/')[1];
            const podcast = await Podcast.findById(id)
                .populate("category")
                .populate('user', 'username email')
                .populate('comments.user', 'username');

            if (!podcast) {
                res.status(404).json({message: 'Podcast not found'});
                return;
            }

            // Increment view count
            await Podcast.findByIdAndUpdate(id, { $inc: { views: 1 } });

            const fixedPodcast = fixFileUrls(podcast);
            res.status(200).json({data: fixedPodcast});
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Get podcasts by category
    if (url.startsWith('/api/v1/category/') && method === 'GET') {
        try {
            const cat = url.split('/api/v1/category/')[1];
            const categories = await Category.find({categoryName: cat}).populate({
                path: "podcasts",
                populate: {path: "category"}
            });
            res.status(200).json({data: categories});
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Get user podcasts
    if (url === '/api/v1/get-user-podcasts' && method === 'GET') {
        try {
            const token = extractToken(req.headers.cookie);

            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const podcasts = await Podcast.find({user: decoded.id}).populate("category").sort({createdAt: -1});
            const fixedPodcasts = podcasts.map(fixFileUrls);
            res.status(200).json({data: fixedPodcasts});
            return;
        } catch (error) {
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Like/Unlike podcast
    if (url.startsWith('/api/v1/like-podcast/') && method === 'POST') {
        try {
            const token = extractToken(req.headers.cookie);
            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            const podcastId = url.split('/api/v1/like-podcast/')[1];

            // Validate podcast ID
            if (!podcastId || podcastId.length !== 24) {
                res.status(400).json({message: 'Invalid podcast ID'});
                return;
            }

            const podcast = await Podcast.findById(podcastId);
            if (!podcast) {
                res.status(404).json({message: 'Podcast not found'});
                return;
            }

            const isLiked = podcast.likes.includes(userId);

            if (isLiked) {
                // Unlike
                await Podcast.findByIdAndUpdate(podcastId, { $pull: { likes: userId } });
                res.status(200).json({message: 'Podcast unliked', liked: false});
            } else {
                // Like
                await Podcast.findByIdAndUpdate(podcastId, { $push: { likes: userId } });
                res.status(200).json({message: 'Podcast liked', liked: true});
            }
            return;
        } catch (error) {
            console.error('Like podcast error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Add comment to podcast
    if (url.startsWith('/api/v1/add-comment/') && method === 'POST') {
        try {
            const token = extractToken(req.headers.cookie);
            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            const podcastId = url.split('/api/v1/add-comment/')[1];

            if (!body.text || body.text.trim().length === 0) {
                res.status(400).json({message: 'Comment text is required'});
                return;
            }

            const comment = {
                user: userId,
                text: body.text.trim(),
                timestamp: new Date()
            };

            await Podcast.findByIdAndUpdate(podcastId, { $push: { comments: comment } });
            res.status(200).json({message: 'Comment added successfully'});
            return;
        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Get all categories
    if ((url === '/api/v1/categories' || url === '/api/v1/get-categories') && method === 'GET') {
        try {
            const categories = await Category.find().sort({categoryName: 1});
            res.status(200).json({data: categories});
            return;
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Serve uploaded files (images and audio)
    if (url.startsWith('/uploads/') && method === 'GET') {
        try {
            const fs = require('fs');
            const path = require('path');
            const mime = require('mime-types');

            // Extract file path from URL
            const filePath = url.replace('/uploads/', '');
            const fullPath = path.join(process.cwd(), 'uploads', filePath);

            // Check if file exists
            if (!fs.existsSync(fullPath)) {
                res.status(404).json({
                    error: 'File not found',
                    message: `File ${filePath} does not exist`,
                    path: fullPath
                });
                return;
            }

            // Get file stats and mime type
            const stats = fs.statSync(fullPath);
            const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

            // Set appropriate headers
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            res.setHeader('Accept-Ranges', 'bytes');

            // Handle range requests for audio/video
            const range = req.headers.range;
            if (range && (mimeType.startsWith('audio/') || mimeType.startsWith('video/'))) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
                const chunksize = (end - start) + 1;

                res.status(206);
                res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
                res.setHeader('Content-Length', chunksize);

                const stream = fs.createReadStream(fullPath, { start, end });
                stream.pipe(res);
            } else {
                // Serve entire file
                const stream = fs.createReadStream(fullPath);
                stream.pipe(res);
            }
            return;
        } catch (error) {
            console.error('File serving error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to serve file',
                details: error.message
            });
            return;
        }
    }

    // Get signed upload URL for direct client uploads
    if (url === '/api/v1/get-upload-url' && method === 'POST') {
        try {
            const token = extractToken(req.headers.cookie);

            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const { fileType = 'image' } = body;
            const CloudStorageService = require('../services/cloudStorage');

            if (!CloudStorageService.isConfigured()) {
                res.status(503).json({
                    message: 'Cloud storage not configured. Using local storage.',
                    useLocal: true
                });
                return;
            }

            const folder = fileType === 'image' ? 'images' : 'audio';
            const uploadData = CloudStorageService.generateSignedUploadUrl(folder, fileType);

            res.status(200).json({
                uploadUrl: uploadData.url,
                uploadParams: uploadData.params,
                message: 'Upload URL generated successfully'
            });
            return;
        } catch (error) {
            console.error('Upload URL generation error:', error);
            res.status(500).json({
                error: error.message,
                message: 'Failed to generate upload URL'
            });
            return;
        }
    }

    // Direct file upload endpoint (fallback for when cloud storage fails)
    if (url === '/api/v1/upload-file' && method === 'POST') {
        try {
            const token = extractToken(req.headers.cookie);

            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            // Return placeholder URLs as fallback
            const fileType = body.fileType || 'image';
            const uniqueId = Date.now() + Math.random().toString(36).substring(2, 11);

            let placeholderUrl;
            if (fileType === 'image') {
                placeholderUrl = `https://via.placeholder.com/300x300/4f46e5/ffffff?text=Podcast+${uniqueId}`;
            } else {
                placeholderUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";
            }

            res.status(200).json({
                url: placeholderUrl,
                message: 'File uploaded successfully (placeholder)',
                fileType: fileType
            });
            return;
        } catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({
                error: error.message,
                message: 'Failed to upload file. Please try again.'
            });
            return;
        }
    }

    // Get signed upload URL for direct client uploads
    if (url === '/api/v1/get-upload-url' && method === 'POST') {
        try {
            const token = extractToken(req.headers.cookie);

            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const { fileType = 'image' } = body;

            // Check if Cloudinary is configured
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                res.status(503).json({
                    message: 'Cloud storage not configured. Using local storage.',
                    useLocal: true
                });
                return;
            }

            const CloudStorageService = require('../services/cloudStorage');
            const folder = fileType === 'image' ? 'images' : 'audio';
            const uploadData = CloudStorageService.generateSignedUploadUrl(folder, fileType);

            res.status(200).json({
                uploadUrl: uploadData.url,
                uploadParams: uploadData.params,
                message: 'Upload URL generated successfully'
            });
            return;
        } catch (error) {
            console.error('Upload URL generation error:', error);
            res.status(500).json({
                error: error.message,
                message: 'Failed to generate upload URL'
            });
            return;
        }
    }

    // Add podcast with cloud storage URLs
    if (url === '/api/v1/add-podcast' && method === 'POST') {
        try {
            // Ensure database connection
            const { connectDB } = require("../conn/conn");
            await connectDB();

            const token = extractToken(req.headers.cookie);

            if (!token) {
                res.status(401).json({message: 'Unauthorized'});
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Extract data from request body
            const {title, description, category, frontImageUrl, audioFileUrl, tags} = body;

            // Validate required fields
            if (!title || !description || !category) {
                res.status(400).json({message: 'Title, description, and category are required'});
                return;
            }

            // Validate field lengths and content
            if (title.trim().length < 3) {
                res.status(400).json({message: 'Title must be at least 3 characters long'});
                return;
            }

            if (description.trim().length < 10) {
                res.status(400).json({message: 'Description must be at least 10 characters long'});
                return;
            }

            // Validate URLs if provided
            if (frontImageUrl && !frontImageUrl.startsWith('http')) {
                res.status(400).json({message: 'Invalid image URL'});
                return;
            }

            if (audioFileUrl && !audioFileUrl.startsWith('http')) {
                res.status(400).json({message: 'Invalid audio URL'});
                return;
            }

            // Find or create category with timeout
            let categoryDoc;
            try {
                categoryDoc = await Promise.race([
                    Category.findOne({categoryName: category}),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Category query timeout')), 5000)
                    )
                ]);
            } catch (error) {
                if (error.message === 'Category query timeout') {
                    res.status(500).json({message: 'Database query timeout. Please try again.'});
                    return;
                }
                throw error;
            }

            if (!categoryDoc) {
                categoryDoc = new Category({categoryName: category, podcasts: []});
                await categoryDoc.save();
            }

            // Create unique placeholder URLs to avoid duplicate key errors
            const uniqueId = Date.now() + Math.random().toString(36).substring(2, 11);
            const defaultImage = `https://via.placeholder.com/300x300/4f46e5/ffffff?text=Podcast+${uniqueId}`;
            const defaultAudio = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

            // Create podcast with cloud storage URLs or unique placeholders
            const newPodcast = new Podcast({
                title: title.trim(),
                description: description.trim(),
                category: categoryDoc._id,
                user: decoded.id,
                frontImage: frontImageUrl || defaultImage,
                audioFile: audioFileUrl || defaultAudio,
                tags: tags && Array.isArray(tags) ? tags : []
            });

            await newPodcast.save();

            // Add podcast to category
            categoryDoc.podcasts.push(newPodcast._id);
            await categoryDoc.save();

            res.status(200).json({
                message: "Podcast added successfully",
                note: "File uploads require cloud storage implementation",
                podcast: {
                    id: newPodcast._id,
                    title: newPodcast.title,
                    description: newPodcast.description
                }
            });
            return;
        } catch (error) {
            console.error('Add podcast error:', error);
            res.status(500).json({error: error.message});
            return;
        }
    }

    // Default 404 response
    res.status(404).json({
        error: 'Not Found',
        path: url,
        method: method,
        message: 'The requested endpoint does not exist',
        availableEndpoints: [
            'GET /',
            'GET /api/v1/health',
            'POST /api/v1/sign-up',
            'POST /api/v1/sign-in',
            'POST /api/v1/logout',
            'GET /api/v1/check-cookie',
            'GET /api/v1/user-details',
            'GET /api/v1/get-podcasts',
            'GET /api/v1/get-podcast/:id',
            'GET /api/v1/category/:cat',
            'GET /api/v1/get-user-podcasts',
            'GET /api/v1/categories',
            'GET /api/v1/get-categories',
            'POST /api/v1/get-upload-url',
            'POST /api/v1/like-podcast/:id',
            'POST /api/v1/add-comment/:id',
            'POST /api/v1/add-podcast',
            'GET /uploads/:filename'
        ]
    });

    } catch (error) {
        // Ensure CORS headers are set even on error
        const origin = req.headers.origin;
        const allowedOrigins = [
            'https://frontend-khaki-ten-90.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5000'
        ];

        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin, User-Agent');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        console.error('Serverless function error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};


